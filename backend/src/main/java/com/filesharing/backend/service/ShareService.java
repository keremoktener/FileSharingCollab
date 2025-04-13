package com.filesharing.backend.service;

import com.filesharing.backend.dto.SharedItemDto;
import com.filesharing.backend.dto.ShareItemRequest;
import com.filesharing.backend.exception.ForbiddenException;
import com.filesharing.backend.exception.ResourceNotFoundException;
import com.filesharing.backend.model.*;
import com.filesharing.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareService {

    @Autowired
    private SharedItemRepository sharedItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileRepository fileRepository;
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Transactional
    public SharedItemDto shareItem(ShareItemRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Validate that we're sharing either a file or a folder, not both or neither
        if ((request.getFileId() == null && request.getFolderId() == null) || 
            (request.getFileId() != null && request.getFolderId() != null)) {
            throw new IllegalArgumentException("Must provide either fileId or folderId, not both or neither");
        }
        
        SharedItem sharedItem = SharedItem.builder()
                .owner(owner)
                .access(request.getAccess())
                .publicLink(UUID.randomUUID().toString())
                .expiryDate(request.getExpiryDate())
                .createdAt(LocalDateTime.now())
                .build();
        
        // Find the user to share with if email is provided
        if (request.getUserEmail() != null && !request.getUserEmail().isEmpty()) {
            User sharedWith = userRepository.findByEmail(request.getUserEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User with email " + request.getUserEmail() + " not found"));
            
            // Cannot share with yourself
            if (sharedWith.getId().equals(userId)) {
                throw new IllegalArgumentException("Cannot share with yourself");
            }
            
            sharedItem.setSharedWith(sharedWith);
        }
        
        // Set file or folder
        if (request.getFileId() != null) {
            FileEntity file = fileRepository.findByIdAndOwnerAndDeletedFalse(request.getFileId(), owner)
                    .orElseThrow(() -> new ResourceNotFoundException("File not found"));
            sharedItem.setFile(file);
        } else {
            Folder folder = folderRepository.findByIdAndOwnerAndDeletedFalse(request.getFolderId(), owner)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
            sharedItem.setFolder(folder);
        }
        
        SharedItem savedItem = sharedItemRepository.save(sharedItem);
        return convertToDto(savedItem);
    }
    
    @Transactional(readOnly = true)
    public List<SharedItemDto> getSharedByMe(Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<SharedItem> sharedItems = sharedItemRepository.findByOwner(owner);
        return sharedItems.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SharedItemDto> getSharedWithMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<SharedItem> sharedItems = sharedItemRepository.findBySharedWith(user);
        return sharedItems.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void revokeSharing(Long sharedItemId, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        SharedItem sharedItem = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Shared item not found"));
        
        // Only the owner can revoke sharing
        if (!sharedItem.getOwner().getId().equals(owner.getId())) {
            throw new ForbiddenException("Only the owner can revoke sharing");
        }
        
        sharedItemRepository.delete(sharedItem);
    }
    
    @Transactional(readOnly = true)
    public SharedItemDto getPublicSharedItem(String publicLink) {
        SharedItem sharedItem = sharedItemRepository.findByPublicLinkAndNotExpired(publicLink, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Shared item not found or expired"));
        
        return convertToDto(sharedItem);
    }
    
    @Transactional(readOnly = true)
    public Long getOwnerIdByPublicLink(String publicLink) {
        SharedItem sharedItem = sharedItemRepository.findByPublicLinkAndNotExpired(publicLink, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Shared item not found or expired"));
        
        return sharedItem.getOwner().getId();
    }
    
    @Transactional(readOnly = true)
    public boolean hasAccessToFile(Long fileId, Long userId, AccessType minimumAccess) {
        // Check if user is the owner
        FileEntity file = fileRepository.findFileWithAccess(fileId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found or you don't have access"));
        
        // If user is the owner, they have full access
        if (file.getOwner().getId().equals(userId)) {
            return true;
        }
        
        // Check shared item access level
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        SharedItem sharedItem = sharedItemRepository.findByFileIdAndSharedWith(fileId, user)
                .orElseThrow(() -> new ForbiddenException("You don't have access to this file"));
        
        // Check if the shared item has at least the minimum required access level
        return sharedItem.getAccess().ordinal() >= minimumAccess.ordinal();
    }
    
    @Transactional(readOnly = true)
    public boolean hasAccessToFolder(Long folderId, Long userId, AccessType minimumAccess) {
        // Check if user is the owner
        Folder folder = folderRepository.findFolderWithAccess(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found or you don't have access"));
        
        // If user is the owner, they have full access
        if (folder.getOwner().getId().equals(userId)) {
            return true;
        }
        
        // Check shared item access level
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        SharedItem sharedItem = sharedItemRepository.findByFolderIdAndSharedWith(folderId, user)
                .orElseThrow(() -> new ForbiddenException("You don't have access to this folder"));
        
        // Check if the shared item has at least the minimum required access level
        return sharedItem.getAccess().ordinal() >= minimumAccess.ordinal();
    }
    
    private SharedItemDto convertToDto(SharedItem item) {
        return SharedItemDto.builder()
                .id(item.getId())
                .ownerName(item.getOwner().getUsername())
                .sharedWithEmail(item.getSharedWith() != null ? item.getSharedWith().getEmail() : null)
                .fileId(item.getFile() != null ? item.getFile().getId() : null)
                .fileName(item.getFile() != null ? item.getFile().getFileName() : null)
                .folderId(item.getFolder() != null ? item.getFolder().getId() : null)
                .folderName(item.getFolder() != null ? item.getFolder().getName() : null)
                .access(item.getAccess())
                .publicLink(item.getPublicLink())
                .expiryDate(item.getExpiryDate())
                .createdAt(item.getCreatedAt())
                .isFolder(item.getFolder() != null)
                .build();
    }
} 