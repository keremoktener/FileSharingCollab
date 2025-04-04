package com.filesharing.backend.service;

import com.filesharing.backend.dto.FileDto;
import com.filesharing.backend.model.FileEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService {
    FileEntity saveFile(MultipartFile file, Long userId) throws IOException;
    List<FileDto> getAllFilesByUser(Long userId);
    Resource loadFileAsResource(Long fileId, Long userId) throws IOException;
    void softDeleteFile(Long fileId, Long userId);
    Resource viewFileAsResource(Long fileId, Long userId) throws IOException;
} 