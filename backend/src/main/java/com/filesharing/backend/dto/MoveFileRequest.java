package com.filesharing.backend.dto;

public class MoveFileRequest {
    private Long folderId;
    
    public MoveFileRequest() {}
    
    public Long getFolderId() {
        return folderId;
    }
    
    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }
}

