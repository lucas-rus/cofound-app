package com.cofound.repository;

import com.cofound.model.SkillEndorsement;
import com.cofound.model.User;
import com.cofound.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillEndorsementRepository extends JpaRepository<SkillEndorsement, Long> {
    
    long countByRecipientAndSkill(User recipient, Skill skill);
    
    @Query("SELECT se.skill.name, COUNT(se) FROM SkillEndorsement se WHERE se.recipient = :recipient GROUP BY se.skill.name")
    List<Object[]> countEndorsementsByRecipient(@Param("recipient") User recipient);

    boolean existsByEndorserAndRecipientAndSkill(User endorser, User recipient, Skill skill);

    List<SkillEndorsement> findByRecipient(User recipient);

    void deleteByEndorserAndRecipientAndSkill(User endorser, User recipient, Skill skill);
}
