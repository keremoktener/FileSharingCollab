package com.filesharing.backend.service.impl;

import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.exception.ResourceNotFoundException;
import com.filesharing.backend.model.FileEntity;
import com.filesharing.backend.model.User;
import com.filesharing.backend.repository.FileRepository;
import com.filesharing.backend.service.FileService;
import com.filesharing.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileServiceImpl implements FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public FileEntity saveFile(MultipartFile file, Long userId) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Generate a unique filename
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Save the file to the upload directory
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Save file metadata to database
        User owner = userService.getUserById(userId);
        
        FileEntity fileEntity = FileEntity.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .uploadDate(LocalDateTime.now())
                .deleted(false)
                .owner(owner)
                .build();
        
        return fileRepository.save(fileEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileDto> getAllFilesByUser(Long userId) {
        User owner = userService.getUserById(userId);
        List<FileEntity> files = fileRepository.findByOwnerAndDeletedFalse(owner);
        
        return files.stream()
                .map(file -> FileDto.builder()
                        .id(file.getId())
                        .fileName(file.getFileName())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .uploadDate(file.getUploadDate())
                        .deleted(file.isDeleted())
                        .deletedAt(file.getDeletedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long fileId, Long userId) throws IOException {
        User owner = userService.getUserById(userId);
        FileEntity file = fileRepository.findByIdAndOwnerAndDeletedFalse(fileId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        
        try {
            Path filePath = Paths.get(file.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + file.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + file.getFileName());
        }
    }

    @Override
    @Transactional
    public void softDeleteFile(Long fileId, Long userId) {
        User owner = userService.getUserById(userId);
        FileEntity file = fileRepository.findByIdAndOwnerAndDeletedFalse(fileId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        
        // Mark file as deleted in database using soft delete
        fileRepository.softDeleteByIdAndOwner(fileId, owner, LocalDateTime.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Resource viewFileAsResource(Long fileId, Long userId) throws IOException {
        // Similar to loadFileAsResource but could be optimized for viewing in browser
        User owner = userService.getUserById(userId);
        FileEntity file = fileRepository.findByIdAndOwnerAndDeletedFalse(fileId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        
        try {
            Path filePath = Paths.get(file.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + file.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + file.getFileName());
        }
    }
} 