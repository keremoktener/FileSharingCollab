package com.filesharing.backend.controller;

import com.filesharing.backend.dto.SharedItemDto;
import com.filesharing.backend.dto.ShareItemRequest;
import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.security.UserDetailsImpl;
import com.filesharing.backend.service.ShareService;
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
@RequestMapping("/api/share")
public class ShareController {

    @Autowired
    private ShareService shareService;
    
    @Autowired
    private FileService fileService;
    
    @PostMapping
    public ResponseEntity<SharedItemDto> shareItem(
            @RequestBody ShareItemRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        SharedItemDto sharedItem = shareService.shareItem(request, userDetails.getId());
        return ResponseEntity.ok(sharedItem);
    }
    
    @GetMapping("/by-me")
    public ResponseEntity<List<SharedItemDto>> getSharedByMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<SharedItemDto> sharedItems = shareService.getSharedByMe(userDetails.getId());
        return ResponseEntity.ok(sharedItems);
    }
    
    @GetMapping("/with-me")
    public ResponseEntity<List<SharedItemDto>> getSharedWithMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<SharedItemDto> sharedItems = shareService.getSharedWithMe(userDetails.getId());
        return ResponseEntity.ok(sharedItems);
    }
    
    @DeleteMapping("/{sharedItemId}")
    public ResponseEntity<?> revokeSharing(
            @PathVariable Long sharedItemId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        shareService.revokeSharing(sharedItemId, userDetails.getId());
        return ResponseEntity.ok().body("Sharing revoked successfully");
    }
} 