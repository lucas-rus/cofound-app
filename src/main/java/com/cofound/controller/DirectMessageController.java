package com.cofound.controller;

import com.cofound.model.DirectMessage;
import com.cofound.model.User;
import com.cofound.repository.DirectMessageRepository;
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
@RequestMapping("/api/messages")
public class DirectMessageController {

    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;

    public DirectMessageController(DirectMessageRepository directMessageRepository, UserRepository userRepository) {
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DirectMessageDto>> getChatHistory(@PathVariable Long userId, Principal principal) {
        User me = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DirectMessage> messages = directMessageRepository.findChatHistory(me, other);
        
        // Mark as read (simple implementation: mark all incoming as read when fetching)
        messages.stream()
                .filter(m -> m.getRecipient().equals(me) && !m.isRead())
                .forEach(m -> m.setRead(true));
        directMessageRepository.saveAll(messages);

        List<DirectMessageDto> dtos = messages.stream()
                .map(DirectMessageDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{userId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DirectMessageDto> sendMessage(@PathVariable Long userId, @RequestBody String content, Principal principal) {
        User me = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        DirectMessage msg = new DirectMessage();
        msg.setSender(me);
        msg.setRecipient(other);
        msg.setContent(content);
        msg.setSentAt(Instant.now());
        msg.setRead(false);

        directMessageRepository.save(msg);

        return ResponseEntity.ok(new DirectMessageDto(msg));
    }

    static class DirectMessageDto {
        public Long id;
        public Long senderId;
        public Long recipientId;
        public String content;
        public String sentAt;
        public boolean isRead;

        public DirectMessageDto(DirectMessage msg) {
            this.id = msg.getId();
            this.senderId = msg.getSender().getId();
            this.recipientId = msg.getRecipient().getId();
            this.content = msg.getContent();
            this.sentAt = msg.getSentAt().toString();
            this.isRead = msg.isRead();
        }
    }
}
