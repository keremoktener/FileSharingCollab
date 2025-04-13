package com.filesharing.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderDto {
    private Long id;
    private String name;
    private Long parentId;
    private LocalDateTime createdAt;
    private Integer fileCount; // Count of files in this folder
    private Integer subfolderCount; // Count of subfolders
} 