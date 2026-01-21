package com.cofound.controller;

import com.cofound.model.Skill;
import com.cofound.model.SkillEndorsement;
import com.cofound.model.User;
import com.cofound.model.FriendRequest;
import com.cofound.repository.FriendRequestRepository;
import com.cofound.repository.SkillEndorsementRepository;
import com.cofound.repository.SkillRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRepository skillRepository;
    private final SkillEndorsementRepository endorsementRepository;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;

    public SkillController(SkillRepository skillRepository, SkillEndorsementRepository endorsementRepository, UserRepository userRepository, FriendRequestRepository friendRequestRepository) {
        this.skillRepository = skillRepository;
        this.endorsementRepository = endorsementRepository;
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    @PostMapping("/{userId}/endorse")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> endorseSkill(@PathVariable Long userId, @RequestBody String skillName, Principal principal) {
        User endorser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (endorser.equals(recipient)) {
            return ResponseEntity.badRequest().body("Cannot endorse yourself.");
        }

        // Verify friendship
        FriendRequest fr = friendRequestRepository.findByUsers(endorser, recipient).orElse(null);
        if (fr == null || fr.getStatus() != FriendRequest.FriendRequestStatus.ACCEPTED) {
            return ResponseEntity.badRequest().body("You can only endorse friends.");
        }

        Skill skill = skillRepository.findByName(skillName)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!recipient.getSkills().contains(skill)) {
            return ResponseEntity.badRequest().body("User does not have this skill.");
        }

        if (endorsementRepository.existsByEndorserAndRecipientAndSkill(endorser, recipient, skill)) {
            endorsementRepository.deleteByEndorserAndRecipientAndSkill(endorser, recipient, skill);
            return ResponseEntity.ok("Skill endorsement removed.");
        }

        SkillEndorsement endorsement = new SkillEndorsement();
        endorsement.setEndorser(endorser);
        endorsement.setRecipient(recipient);
        endorsement.setSkill(skill);
        endorsementRepository.save(endorsement);

        return ResponseEntity.ok("Skill endorsed.");
    }
}
