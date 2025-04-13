package com.filesharing.backend.service;

import com.filesharing.backend.dto.FolderDto;
import com.filesharing.backend.dto.CreateFolderRequest;
import com.filesharing.backend.exception.ResourceNotFoundException;
import com.filesharing.backend.model.Folder;
import com.filesharing.backend.model.User;
import com.filesharing.backend.repository.FolderRepository;
import com.filesharing.backend.repository.FileRepository;
import com.filesharing.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private FileRepository fileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public FolderDto createFolder(CreateFolderRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Folder folder = Folder.builder()
                .name(request.getName())
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();
        
        // If parentId is provided, set the parent folder
        if (request.getParentId() != null) {
            Folder parent = folderRepository.findByIdAndOwnerAndDeletedFalse(request.getParentId(), owner)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
            folder.setParent(parent);
        }
        
        Folder savedFolder = folderRepository.save(folder);
        return convertToDto(savedFolder);
    }
    
    @Transactional(readOnly = true)
    public List<FolderDto> getFoldersByUser(Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Folder> folders = folderRepository.findByOwnerAndDeletedFalse(owner);
        return folders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FolderDto> getSubfolders(Long folderId, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Folder parent = folderRepository.findByIdAndOwnerAndDeletedFalse(folderId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        
        List<Folder> subfolders = folderRepository.findByOwnerAndParentAndDeletedFalse(owner, parent);
        return subfolders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FolderDto> getRootFolders(Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Folder> rootFolders = folderRepository.findByOwnerAndParentAndDeletedFalse(owner, null);
        return rootFolders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteFolder(Long folderId, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Folder folder = folderRepository.findByIdAndOwnerAndDeletedFalse(folderId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
        
        LocalDateTime now = LocalDateTime.now();
        
        // Soft delete all files in the folder
        fileRepository.softDeleteByFolderAndOwner(folderId, owner, now);
        
        // Soft delete the folder
        folder.setDeleted(true);
        folder.setDeletedAt(now);
        folderRepository.save(folder);
        
        // Recursively soft delete all subfolders
        List<Folder> subfolders = folderRepository.findByOwnerAndParentAndDeletedFalse(owner, folder);
        for (Folder subfolder : subfolders) {
            deleteFolder(subfolder.getId(), userId);
        }
    }
    
    private FolderDto convertToDto(Folder folder) {
        int fileCount = folderRepository.countFilesByFolderId(folder.getId());
        int subfolderCount = folderRepository.countSubfoldersByFolderId(folder.getId());
        
        return FolderDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .createdAt(folder.getCreatedAt())
                .fileCount(fileCount)
                .subfolderCount(subfolderCount)
                .build();
    }
} 