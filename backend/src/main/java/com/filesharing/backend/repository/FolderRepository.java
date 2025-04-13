package com.filesharing.backend.repository;

import com.filesharing.backend.model.Folder;
import com.filesharing.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerAndParentAndDeletedFalse(User owner, Folder parent);
    
    List<Folder> findByOwnerAndDeletedFalse(User owner);
    
    Optional<Folder> findByIdAndOwnerAndDeletedFalse(Long id, User owner);
    
    @Query("SELECT f FROM Folder f WHERE f.id = :id AND f.deleted = false AND " +
           "(f.owner.id = :userId OR EXISTS " +
           "(SELECT s FROM SharedItem s WHERE s.folder.id = f.id AND s.sharedWith.id = :userId))")
    Optional<Folder> findFolderWithAccess(@Param("id") Long id, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(f) FROM FileEntity f WHERE f.folder.id = :folderId AND f.deleted = false")
    int countFilesByFolderId(@Param("folderId") Long folderId);
    
    @Query("SELECT COUNT(f) FROM Folder f WHERE f.parent.id = :folderId AND f.deleted = false")
    int countSubfoldersByFolderId(@Param("folderId") Long folderId);
} 