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
                .owner(owner)
                .build();
        
        return fileRepository.save(fileEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileDto> getAllFilesByUser(Long userId) {
        User owner = userService.getUserById(userId);
        List<FileEntity> files = fileRepository.findByOwner(owner);
        
        return files.stream()
                .map(file -> FileDto.builder()
                        .id(file.getId())
                        .fileName(file.getFileName())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .uploadDate(file.getUploadDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long fileId, Long userId) throws IOException {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        
        if (!file.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this file");
        }
        
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
    public void deleteFile(Long fileId, Long userId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
        
        if (!file.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this file");
        }
        
        try {
            // Delete the file from the filesystem
            Path filePath = Paths.get(file.getFilePath());
            Files.deleteIfExists(filePath);
            
            // Delete the file metadata from the database
            fileRepository.delete(file);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file", e);
        }
    }
} 