package com.cofound.controller;

import com.cofound.model.Project;
import com.cofound.model.ProjectMessage;
import com.cofound.model.User;
import com.cofound.repository.ProjectMessageRepository;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/messages")
public class ProjectMessageController {

    private final ProjectMessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectMessageController(ProjectMessageRepository messageRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMessages(@PathVariable Long projectId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check if user is member or owner
        boolean isMember = project.getMembers().contains(user) || project.getOwner().equals(user);
        if (!isMember) {
            return ResponseEntity.status(403).body("Access denied");
        }

        List<MessageDto> messages = messageRepository.findByProjectIdOrderBySentAtAsc(projectId)
                .stream()
                .map(MessageDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    @PostMapping
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> postMessage(@PathVariable Long projectId, @RequestBody String content, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check if user is member or owner
        boolean isMember = project.getMembers().contains(user) || project.getOwner().equals(user);
        if (!isMember) {
            return ResponseEntity.status(403).body("Access denied");
        }

        ProjectMessage message = new ProjectMessage();
        message.setContent(content);
        message.setSender(user);
        message.setProject(project);
        
        ProjectMessage saved = messageRepository.save(message);

        return ResponseEntity.ok(new MessageDto(saved));
    }

    static class MessageDto {
        public Long id;
        public String content;
        public Instant sentAt;
        public SenderDto sender;

        public MessageDto(ProjectMessage msg) {
            this.id = msg.getId();
            this.content = msg.getContent();
            this.sentAt = msg.getSentAt();
            this.sender = new SenderDto(msg.getSender());
        }
    }

    static class SenderDto {
        public Long id;
        public String username;
        public String profilePictureUrl;

        public SenderDto(User u) {
            this.id = u.getId();
            this.username = u.getUsername();
            if (u.getUserProfile() != null) {
                this.profilePictureUrl = u.getUserProfile().getProfilePictureUrl();
            }
        }
    }
}