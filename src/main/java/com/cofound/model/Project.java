package com.cofound.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectApplication> applications = new HashSet<>();

    @Column(name = "team_size_needed")
    private int teamSizeNeeded;

    @ElementCollection
    @CollectionTable(name = "project_required_skills", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "skill_name")
    private List<String> requiredSkills;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectRoleNeeded> rolesNeeded = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    private java.time.Instant completedAt;

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<ProjectApplication> getApplications() {
        return applications;
    }

    public void setApplications(Set<ProjectApplication> applications) {
        this.applications = applications;
    }

    public int getTeamSizeNeeded() {
        return teamSizeNeeded;
    }

    public void setTeamSizeNeeded(int teamSizeNeeded) {
        this.teamSizeNeeded = teamSizeNeeded;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Set<ProjectRoleNeeded> getRolesNeeded() {
        return rolesNeeded;
    }

    public void setRolesNeeded(Set<ProjectRoleNeeded> rolesNeeded) {
        this.rolesNeeded = rolesNeeded;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }

    public java.time.Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(java.time.Instant completedAt) {
        this.completedAt = completedAt;
    }
}