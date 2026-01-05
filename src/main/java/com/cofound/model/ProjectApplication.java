package com.cofound.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "project_applications")
@Getter
@Setter
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApplicationStatus status;

    private Instant appliedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = Instant.now();
        this.status = ApplicationStatus.PENDING;
    }
}