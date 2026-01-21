package com.cofound.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO;

    private boolean isRead = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public enum NotificationType {
        INFO,
        ALERT, // e.g. Kicked
        SUCCESS
    }
}
