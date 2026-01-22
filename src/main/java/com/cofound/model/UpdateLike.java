package com.cofound.model;

import jakarta.persistence.*;

@Entity
@Table(name = "update_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"update_id", "user_id"})
})
public class UpdateLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "update_id", nullable = false)
    private ProjectUpdate projectUpdate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProjectUpdate getProjectUpdate() {
        return projectUpdate;
    }

    public void setProjectUpdate(ProjectUpdate projectUpdate) {
        this.projectUpdate = projectUpdate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}