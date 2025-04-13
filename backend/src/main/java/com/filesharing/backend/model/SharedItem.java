package com.filesharing.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shared_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_id")
    private User sharedWith; // Nullable for public shares

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileEntity file; // Nullable if folder is shared

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder; // Nullable if file is shared

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessType access;

    @Column(nullable = false, unique = true)
    private String publicLink; // Generated UUID

    @Column
    private LocalDateTime expiryDate; // Nullable if no expiry

    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        if (this.publicLink == null || this.publicLink.isEmpty()) {
            this.publicLink = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
} 