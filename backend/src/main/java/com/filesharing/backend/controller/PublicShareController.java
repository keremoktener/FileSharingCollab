package com.filesharing.backend.controller;

import com.filesharing.backend.dto.SharedItemDto;
import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.dto.FolderDto;
import com.filesharing.backend.model.AccessType;
import com.filesharing.backend.exception.ResourceNotFoundException;
import com.filesharing.backend.service.ShareService;
import com.filesharing.backend.service.FileService;
import com.filesharing.backend.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicShareController {

    @Autowired
    private ShareService shareService;
    
    @Autowired
    private FileService fileService;
    
    @Autowired
    private FolderService folderService;
    
    @GetMapping("/{publicLink}")
    public ResponseEntity<SharedItemDto> getPublicSharedItem(@PathVariable String publicLink) {
        SharedItemDto sharedItem = shareService.getPublicSharedItem(publicLink);
        return ResponseEntity.ok(sharedItem);
    }
    
    @GetMapping("/{publicLink}/download")
    public ResponseEntity<Resource> downloadPublicItem(@PathVariable String publicLink) throws IOException {
        SharedItemDto sharedItem = shareService.getPublicSharedItem(publicLink);
        
        Resource resource;
        String filename;
        
        // For public shares, we need the owner's ID
        Long ownerId = shareService.getOwnerIdByPublicLink(publicLink);
        
        if (sharedItem.isFolder()) {
            // Download folder as ZIP
            resource = fileService.createFolderDownloadZip(sharedItem.getFolderId(), ownerId);
            filename = sharedItem.getFolderName() + ".zip";
        } else {
            // Download single file
            resource = fileService.loadFileAsResource(sharedItem.getFileId(), ownerId);
            filename = sharedItem.getFileName();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }
} 