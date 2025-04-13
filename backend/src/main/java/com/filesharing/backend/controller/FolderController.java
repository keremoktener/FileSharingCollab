package com.filesharing.backend.controller;

import com.filesharing.backend.dto.FolderDto;
import com.filesharing.backend.dto.CreateFolderRequest;
import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.security.UserDetailsImpl;
import com.filesharing.backend.service.FolderService;
import com.filesharing.backend.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;
    
    @Autowired
    private FileService fileService;
    
    @PostMapping
    public ResponseEntity<FolderDto> createFolder(
            @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        FolderDto folder = folderService.createFolder(request, userDetails.getId());
        return ResponseEntity.ok(folder);
    }
    
    @GetMapping
    public ResponseEntity<List<FolderDto>> getAllFolders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<FolderDto> folders = folderService.getFoldersByUser(userDetails.getId());
        return ResponseEntity.ok(folders);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<FolderDto>> getRootFolders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<FolderDto> rootFolders = folderService.getRootFolders(userDetails.getId());
        return ResponseEntity.ok(rootFolders);
    }
    
    @GetMapping("/{folderId}/subfolders")
    public ResponseEntity<List<FolderDto>> getSubfolders(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<FolderDto> subfolders = folderService.getSubfolders(folderId, userDetails.getId());
        return ResponseEntity.ok(subfolders);
    }
    
    @GetMapping("/{folderId}/files")
    public ResponseEntity<List<FileDto>> getFilesInFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<FileDto> files = fileService.getFilesByFolder(folderId, userDetails.getId());
        return ResponseEntity.ok(files);
    }
    
    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        folderService.deleteFolder(folderId, userDetails.getId());
        return ResponseEntity.ok().body("Folder deleted successfully");
    }
    
    @GetMapping("/{folderId}/download")
    public ResponseEntity<Resource> downloadFolderAsZip(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        
        Resource zipResource = fileService.createFolderDownloadZip(folderId, userDetails.getId());
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"folder.zip\"")
                .body(zipResource);
    }
} 