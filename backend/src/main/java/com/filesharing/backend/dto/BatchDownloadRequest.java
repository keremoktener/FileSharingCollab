package com.filesharing.backend.dto;

import java.util.List;

public class BatchDownloadRequest {
    private List<Long> fileIds;
    
    public BatchDownloadRequest() {}
    
    public List<Long> getFileIds() {
        return fileIds;
    }
    
    public void setFileIds(List<Long> fileIds) {
        this.fileIds = fileIds;
    }
} 