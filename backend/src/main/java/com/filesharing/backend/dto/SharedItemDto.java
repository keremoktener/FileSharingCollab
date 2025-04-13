package com.filesharing.backend.dto;

import com.filesharing.backend.model.AccessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedItemDto {
    private Long id;
    private String ownerName;
    private String sharedWithEmail; // Email of user shared with, null if public
    private Long fileId;
    private String fileName;
    private Long folderId;
    private String folderName;
    private AccessType access;
    private String publicLink;
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;
    private boolean isFolder; // To differentiate between file and folder shares
} 