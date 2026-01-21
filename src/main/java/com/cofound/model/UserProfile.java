package com.cofound.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String lookingFor; // NEW: What they want (e.g. Technical Co-founder)

    @Column(columnDefinition = "TEXT")
    private String offering;   // NEW: What they bring (e.g. Marketing, Capital)

    private String commitmentLevel; // NEW: e.g. "Full-time", "Part-time"

    private String linkedInUrl;
    private String websiteUrl; // NEW
    private String githubUrl;  // NEW
    private String cvUrl; // Link to uploaded resume
    private String profilePictureUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}