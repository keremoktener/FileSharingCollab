package com.filesharing.backend.service;

import com.filesharing.backend.model.User;

public interface UserService {
    User createUser(String username, String email, String password);
    User getUserById(Long id);
    User getUserByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
} 