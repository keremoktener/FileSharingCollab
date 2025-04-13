package com.filesharing.backend.repository;

import com.filesharing.backend.model.FileEntity;
import com.filesharing.backend.model.Folder;
import com.filesharing.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    // Find all non-deleted files by owner
    List<FileEntity> findByOwnerAndDeletedFalse(User owner);
    
    // Find files in a specific folder
    List<FileEntity> findByOwnerAndFolderAndDeletedFalse(User owner, Folder folder);
    
    // Find files not in any folder (folder is null)
    List<FileEntity> findByOwnerAndFolderIsNullAndDeletedFalse(User owner);
    
    // Find a specific non-deleted file by ID and owner
    Optional<FileEntity> findByIdAndOwnerAndDeletedFalse(Long id, User owner);
    
    // Find a file with access permission (either owned or shared with user)
    @Query("SELECT f FROM FileEntity f WHERE f.id = :id AND f.deleted = false AND " +
           "(f.owner.id = :userId OR EXISTS " +
           "(SELECT s FROM SharedItem s WHERE s.file.id = f.id AND s.sharedWith.id = :userId))")
    Optional<FileEntity> findFileWithAccess(@Param("id") Long id, @Param("userId") Long userId);
    
    // Soft delete method
    @Modifying
    @Transactional
    @Query("UPDATE FileEntity f SET f.deleted = true, f.deletedAt = :deletedAt WHERE f.id = :id AND f.owner = :owner")
    int softDeleteByIdAndOwner(@Param("id") Long id, @Param("owner") User owner, @Param("deletedAt") LocalDateTime deletedAt);
    
    // Soft delete all files in a folder
    @Modifying
    @Transactional
    @Query("UPDATE FileEntity f SET f.deleted = true, f.deletedAt = :deletedAt WHERE f.folder.id = :folderId AND f.owner = :owner")
    int softDeleteByFolderAndOwner(@Param("folderId") Long folderId, @Param("owner") User owner, @Param("deletedAt") LocalDateTime deletedAt);
} 