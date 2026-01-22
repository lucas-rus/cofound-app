package com.cofound.controller;

import com.cofound.dto.ProjectUpdatePostDto;
import com.cofound.model.*;
import com.cofound.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectUpdateController {

    private final ProjectUpdateRepository updateRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UpdateLikeRepository likeRepository;
    private final UpdateCommentRepository commentRepository;

    private String uploadDir = "uploads";
    
    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    public ProjectUpdateController(ProjectUpdateRepository updateRepository, ProjectRepository projectRepository, 
                                   UserRepository userRepository, UpdateLikeRepository likeRepository, 
                                   UpdateCommentRepository commentRepository) {
        this.updateRepository = updateRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping("/{projectId}/updates")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectUpdateDto>> getUpdates(@PathVariable Long projectId, Principal principal) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User me = principal != null ? userRepository.findByUsername(principal.getName()).orElse(null) : null;

        List<ProjectUpdateDto> dtos = updateRepository.findByProjectOrderByCreatedAtDesc(project).stream()
                .map(u -> {
                    long likes = likeRepository.countByProjectUpdate(u);
                    boolean likedByMe = me != null && likeRepository.existsByProjectUpdateAndUser(u, me);
                    List<UpdateCommentDto> comments = commentRepository.findByProjectUpdateOrderByCreatedAtAsc(u).stream()
                            .map(UpdateCommentDto::new)
                            .collect(Collectors.toList());
                    return new ProjectUpdateDto(u, likes, likedByMe, comments);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{projectId}/updates")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> postUpdate(@PathVariable Long projectId, 
                                        @Valid @ModelAttribute ProjectUpdatePostDto projectUpdatePostDto,
                                        @RequestParam(value = "file", required = false) MultipartFile file,
                                        Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = project.getMembers().contains(user) || project.getOwner().equals(user);
        if (!isMember) {
            return ResponseEntity.status(403).body("Only team members can post updates.");
        }

        ProjectUpdate update = new ProjectUpdate();
        update.setProject(project);
        update.setPoster(user);
        update.setTitle(projectUpdatePostDto.getTitle());
        update.setContent(projectUpdatePostDto.getContent());
        
        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                String filename = "update_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                update.setImageUrl(appUrl + "/uploads/" + filename);
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Failed to upload image");
            }
        }
        
        updateRepository.save(update);
        return ResponseEntity.ok(new ProjectUpdateDto(update, 0, false, List.of()));
    }

    @PostMapping("/updates/{updateId}/like")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleLike(@PathVariable Long updateId, Principal principal) {
        ProjectUpdate update = updateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (likeRepository.existsByProjectUpdateAndUser(update, user)) {
            likeRepository.findByProjectUpdateAndUser(update, user).ifPresent(likeRepository::delete);
            return ResponseEntity.ok("Unliked");
        } else {
            UpdateLike like = new UpdateLike();
            like.setProjectUpdate(update);
            like.setUser(user);
            likeRepository.save(like);
            return ResponseEntity.ok("Liked");
        }
    }

    @PostMapping("/updates/{updateId}/comments")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UpdateCommentDto> postComment(@PathVariable Long updateId, @RequestBody String content, Principal principal) {
        ProjectUpdate update = updateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (content == null || content.trim().isEmpty()) return ResponseEntity.badRequest().build();

        UpdateComment comment = new UpdateComment();
        comment.setProjectUpdate(update);
        comment.setUser(user);
        comment.setContent(content);
        commentRepository.save(comment);

        return ResponseEntity.ok(new UpdateCommentDto(comment));
    }

    @DeleteMapping("/updates/comments/{commentId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Principal principal) {
        UpdateComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok("Comment deleted successfully.");
    }

    @DeleteMapping("/updates/{updateId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteUpdate(@PathVariable Long updateId, Principal principal) {
        ProjectUpdate update = updateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is the poster or the project owner using IDs
        boolean isPoster = update.getPoster().getId().equals(user.getId());
        boolean isProjectOwner = update.getProject().getOwner().getId().equals(user.getId());

        if (!isPoster && !isProjectOwner) {
            return ResponseEntity.status(403).body("Only the poster or project owner can delete this update.");
        }

        updateRepository.delete(update);
        return ResponseEntity.ok("Update deleted successfully.");
    }

    @PutMapping("/updates/{updateId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUpdate(@PathVariable Long updateId,
                                        @Valid @ModelAttribute ProjectUpdatePostDto projectUpdatePostDto,
                                        @RequestParam(value = "file", required = false) MultipartFile file,
                                        Principal principal) {
        ProjectUpdate update = updateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is the poster or the project owner using IDs
        boolean isPoster = update.getPoster().getId().equals(user.getId());
        boolean isProjectOwner = update.getProject().getOwner().getId().equals(user.getId());

        if (!isPoster && !isProjectOwner) {
            return ResponseEntity.status(403).body("Only the poster or project owner can edit this update.");
        }

        update.setTitle(projectUpdatePostDto.getTitle());
        update.setContent(projectUpdatePostDto.getContent());

        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                String filename = "update_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                update.setImageUrl(appUrl + "/uploads/" + filename);
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Failed to upload image");
            }
        } else if (projectUpdatePostDto.getImageUrl() == null || projectUpdatePostDto.getImageUrl().isEmpty()) {
            // If no new file and imageUrl is explicitly set to null/empty in DTO, remove existing image
            update.setImageUrl(null);
        }
        
        updateRepository.save(update);
        return ResponseEntity.ok(new ProjectUpdateDto(update, likeRepository.countByProjectUpdate(update), likeRepository.existsByProjectUpdateAndUser(update, user), commentRepository.findByProjectUpdateOrderByCreatedAtAsc(update).stream().map(UpdateCommentDto::new).collect(Collectors.toList())));
    }

    static class ProjectUpdateDto {
        public Long id;
        public String title;
        public String content;
        public String imageUrl;
        public String createdAt;
        public long likeCount;
        public boolean likedByMe;
        public List<UpdateCommentDto> comments;
        public PosterDto poster;

        public ProjectUpdateDto(ProjectUpdate u, long likes, boolean liked, List<UpdateCommentDto> comments) {
            this.id = u.getId();
            this.title = u.getTitle();
            this.content = u.getContent();
            this.imageUrl = u.getImageUrl();
            this.createdAt = u.getCreatedAt().toString();
            this.likeCount = likes;
            this.likedByMe = liked;
            this.comments = comments;
            this.poster = new PosterDto(u.getPoster());
        }
    }

    static class PosterDto {
        public Long id;
        public String username;
        public String profilePictureUrl;

        public PosterDto(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.profilePictureUrl = user.getUserProfile() != null ? user.getUserProfile().getProfilePictureUrl() : null;
        }
    }

    static class UpdateCommentDto {
        public Long id;
        public Long userId;
        public String username;
        public String userPic;
        public String content;
        public String createdAt;

        public UpdateCommentDto(UpdateComment c) {
            this.id = c.getId();
            this.userId = c.getUser().getId();
            this.username = c.getUser().getUsername();
            this.userPic = c.getUser().getUserProfile() != null ? c.getUser().getUserProfile().getProfilePictureUrl() : null;
            this.content = c.getContent();
            this.createdAt = c.getCreatedAt().toString();
        }
    }
}
