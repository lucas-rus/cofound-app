package com.cofound.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "project_history")
@Getter
@Setter
public class ProjectHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HistoryStatus status;

    @Column(columnDefinition = "TEXT")
    private String reason; // Kick reason or leave note

    private Instant startedAt; // NEW
    private Instant endedAt;   // NEW

    @Column(nullable = false)
    private Instant occurredAt = Instant.now();

    public enum HistoryStatus {
        JOINED,    // NEW
        COMPLETED, // Project finished
        KICKED,    // Removed by owner
        LEFT       // Left voluntarily
    }
}
