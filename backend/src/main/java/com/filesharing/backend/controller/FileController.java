package com.filesharing.backend.controller;

import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.model.FileEntity;
import com.filesharing.backend.security.UserDetailsImpl;
import com.filesharing.backend.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        
        FileEntity savedFile = fileService.saveFile(file, userDetails.getId());
        
        FileDto fileDto = FileDto.builder()
                .id(savedFile.getId())
                .fileName(savedFile.getFileName())
                .fileType(savedFile.getFileType())
                .fileSize(savedFile.getFileSize())
                .uploadDate(savedFile.getUploadDate())
                .build();
        
        return ResponseEntity.ok().body(fileDto);
    }

    @GetMapping
    public ResponseEntity<List<FileDto>> getAllFiles(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<FileDto> files = fileService.getAllFilesByUser(userDetails.getId());
        return ResponseEntity.ok().body(files);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        
        Resource resource = fileService.loadFileAsResource(id, userDetails.getId());
        String filename = resource.getFilename();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        
        Resource resource = fileService.viewFileAsResource(id, userDetails.getId());
        String contentType = determineContentType(resource.getFilename());
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        fileService.softDeleteFile(id, userDetails.getId());
        return ResponseEntity.ok().body("File deleted successfully");
    }
    
    // Helper method to determine content type
    private String determineContentType(String filename) {
        if (filename == null) {
            return "application/octet-stream";
        }
        
        String lowercaseName = filename.toLowerCase();
        
        if (lowercaseName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowercaseName.endsWith(".png")) {
            return "image/png";
        } else if (lowercaseName.endsWith(".jpg") || lowercaseName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowercaseName.endsWith(".gif")) {
            return "image/gif";
        } else if (lowercaseName.endsWith(".txt")) {
            return "text/plain";
        } else if (lowercaseName.endsWith(".html") || lowercaseName.endsWith(".htm")) {
            return "text/html";
        } else if (lowercaseName.endsWith(".mp4")) {
            return "video/mp4";
        } else if (lowercaseName.endsWith(".mp3")) {
            return "audio/mpeg";
        } else {
            return "application/octet-stream";
        }
    }
} 