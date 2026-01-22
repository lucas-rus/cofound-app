package com.cofound.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skill_endorsements", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"endorser_id", "recipient_id", "skill_id"})
})
public class SkillEndorsement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endorser_id", nullable = false)
    private User endorser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getEndorser() {
        return endorser;
    }

    public void setEndorser(User endorser) {
        this.endorser = endorser;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }
}