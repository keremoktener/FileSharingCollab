package com.filesharing.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFolderRequest {
    private String name;
    private Long parentId; // Optional, null for root folder
} 