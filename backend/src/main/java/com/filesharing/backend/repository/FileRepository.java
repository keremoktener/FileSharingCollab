package com.filesharing.backend.repository;

import com.filesharing.backend.model.FileEntity;
import com.filesharing.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByOwner(User owner);
    void deleteByIdAndOwner(Long id, User owner);
} 