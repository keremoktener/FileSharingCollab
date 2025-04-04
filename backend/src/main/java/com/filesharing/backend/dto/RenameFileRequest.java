package com.filesharing.backend.dto;

public class RenameFileRequest {
    private String newName;
    
    public RenameFileRequest() {}
    
    public String getNewName() {
        return newName;
    }
    
    public void setNewName(String newName) {
        this.newName = newName;
    }
} 