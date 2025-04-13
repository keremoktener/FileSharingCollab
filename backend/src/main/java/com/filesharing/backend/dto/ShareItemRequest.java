package com.filesharing.backend.dto;

import com.filesharing.backend.model.AccessType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareItemRequest {
    private Long fileId; // Optional, null if sharing folder
    private Long folderId; // Optional, null if sharing file
    private String userEmail; // Optional, null for public sharing
    private AccessType access;
    private boolean isPublic; // Whether to generate a public link
    private LocalDateTime expiryDate; // Optional, null for no expiry
} 