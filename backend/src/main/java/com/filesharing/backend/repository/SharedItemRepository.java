package com.filesharing.backend.repository;

import com.filesharing.backend.model.SharedItem;
import com.filesharing.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharedItemRepository extends JpaRepository<SharedItem, Long> {
    List<SharedItem> findByOwner(User owner);
    
    List<SharedItem> findBySharedWith(User sharedWith);
    
    @Query("SELECT s FROM SharedItem s WHERE s.publicLink = :publicLink " +
           "AND (s.expiryDate IS NULL OR s.expiryDate > :now)")
    Optional<SharedItem> findByPublicLinkAndNotExpired(
            @Param("publicLink") String publicLink, 
            @Param("now") LocalDateTime now);
    
    Optional<SharedItem> findByFileIdAndSharedWith(Long fileId, User sharedWith);
    
    Optional<SharedItem> findByFolderIdAndSharedWith(Long folderId, User sharedWith);
    
    @Query("SELECT s FROM SharedItem s WHERE s.file.id = :fileId AND s.owner.id = :ownerId")
    List<SharedItem> findByFileIdAndOwnerId(@Param("fileId") Long fileId, @Param("ownerId") Long ownerId);
    
    @Query("SELECT s FROM SharedItem s WHERE s.folder.id = :folderId AND s.owner.id = :ownerId")
    List<SharedItem> findByFolderIdAndOwnerId(@Param("folderId") Long folderId, @Param("ownerId") Long ownerId);
} 