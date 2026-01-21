package com.cofound.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size; // NEW IMPORT
import jakarta.validation.constraints.NotBlank; // NEW IMPORT
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "project_updates")
@Getter
@Setter
public class ProjectUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poster_id", nullable = false) // NEW FIELD
    private User poster;

    @NotBlank(message = "Title is required") // NEW VALIDATION
    @Size(max = 100, message = "Title cannot exceed 100 characters") // NEW VALIDATION
    private String title; // NEW FIELD

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String imageUrl; // Optional: URL to an image

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
