package com.cofound.controller;

import com.cofound.dto.ProjectSummaryDto; // Shared DTO
import com.cofound.model.Skill;
import com.cofound.model.User;
import com.cofound.model.Project;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.SkillRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;

    private String uploadDir = "/tmp/uploads";
    private String appUrl = "https://cofound-app-production.up.railway.app";

    public UserController(UserRepository userRepository, SkillRepository skillRepository, ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
    }

    @PostMapping("/me/profile-picture")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileDto> uploadProfilePicture(@RequestParam("file") MultipartFile file, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if (user.getUserProfile() == null) {
                com.cofound.model.UserProfile profile = new com.cofound.model.UserProfile();
                profile.setUser(user);
                user.setUserProfile(profile);
            }
            
            String fileUrl = appUrl + "/uploads/" + filename;
            user.getUserProfile().setProfilePictureUrl(fileUrl);
            userRepository.save(user);

            return ResponseEntity.ok(new PublicProfileDto(user));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/me/cv")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileDto> uploadCv(@RequestParam("file") MultipartFile file, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) return ResponseEntity.badRequest().build();

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "cv_" + UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if (user.getUserProfile() == null) {
                com.cofound.model.UserProfile profile = new com.cofound.model.UserProfile();
                profile.setUser(user);
                user.setUserProfile(profile);
            }
            
            String fileUrl = appUrl + "/uploads/" + filename;
            user.getUserProfile().setCvUrl(fileUrl);
            userRepository.save(user);

            return ResponseEntity.ok(new PublicProfileDto(user));

        } catch (Exception e) {
            System.err.println("CV Upload Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeDto> getMe(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String picUrl = user.getUserProfile() != null ? user.getUserProfile().getProfilePictureUrl() : null;
        return ResponseEntity.ok(new MeDto(user.getId(), user.getUsername(), user.getEmail(), picUrl));
    }

    @GetMapping("/me/skills")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getMySkills(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<String> skills = user.getSkills().stream()
                .map(Skill::getName)
                .sorted(String::compareToIgnoreCase)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/me/skills")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> addSkills(@RequestBody List<String> skillNames, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        for (String rawName : skillNames) {
            String name = rawName.trim();
            if (name.isEmpty()) continue;
            Skill skill = skillRepository.findByName(name).orElseGet(() -> {
                Skill s = new Skill();
                s.setName(name);
                return skillRepository.save(s);
            });
            user.getSkills().add(skill);
        }
        userRepository.save(user);
        List<String> updated = user.getSkills().stream().map(Skill::getName).sorted(String::compareToIgnoreCase).collect(Collectors.toList());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/me/skills/{skillName}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> removeSkill(@PathVariable String skillName, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String normalized = skillName.trim();
        user.getSkills().removeIf(s -> s.getName().equalsIgnoreCase(normalized));
        userRepository.save(user);
        List<String> updated = user.getSkills().stream().map(Skill::getName).sorted(String::compareToIgnoreCase).collect(Collectors.toList());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/me")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteMyAccount(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProjects() != null && !user.getProjects().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: You cannot delete your account while you own projects. Please delete or transfer ownership of your projects first.");
        }

        if (user.getJoinedProjects() != null) {
            Set<Project> projectsJoined = new HashSet<>(user.getJoinedProjects());
            for (Project project : projectsJoined) {
                project.getMembers().remove(user);
                projectRepository.save(project);
            }
        }

        userRepository.delete(user);
        return ResponseEntity.ok("Account deleted successfully.");
    }

    @GetMapping("/{userId}/profile")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileDto> getUserProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new PublicProfileDto(user));
    }

    @PutMapping("/me/profile")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileDto> updateMyProfile(@RequestBody UpdateProfileDto dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUserProfile() == null) {
            com.cofound.model.UserProfile profile = new com.cofound.model.UserProfile();
            profile.setUser(user);
            user.setUserProfile(profile);
        }

        if (dto.bio != null) user.getUserProfile().setBio(dto.bio);
        if (dto.linkedInUrl != null) user.getUserProfile().setLinkedInUrl(dto.linkedInUrl);
        if (dto.websiteUrl != null) user.getUserProfile().setWebsiteUrl(dto.websiteUrl);
        if (dto.githubUrl != null) user.getUserProfile().setGithubUrl(dto.githubUrl);
        if (dto.cvUrl != null) user.getUserProfile().setCvUrl(dto.cvUrl);
        if (dto.profilePictureUrl != null) user.getUserProfile().setProfilePictureUrl(dto.profilePictureUrl);

        userRepository.save(user);
        return ResponseEntity.ok(new PublicProfileDto(user));
    }

    static class MeDto {
        public Long id;
        public String username;
        public String email;
        public String profilePictureUrl;
        
        public MeDto(Long id, String username, String email, String profilePictureUrl) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.profilePictureUrl = profilePictureUrl;
        }
    }

    static class PublicProfileDto {
        public Long id;
        public String username;
        public String bio;
        public String linkedInUrl;
        public String websiteUrl;
        public String githubUrl;
        public String cvUrl;
        public String profilePictureUrl;
        public List<String> skills;
        public List<ProjectSummaryDto> activeProjects;
        public List<ProjectSummaryDto> pastProjects;

        public PublicProfileDto(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.skills = user.getSkills().stream().map(Skill::getName).sorted().toList();
            
            if (user.getUserProfile() != null) {
                this.bio = user.getUserProfile().getBio();
                this.linkedInUrl = user.getUserProfile().getLinkedInUrl();
                this.websiteUrl = user.getUserProfile().getWebsiteUrl();
                this.githubUrl = user.getUserProfile().getGithubUrl();
                this.cvUrl = user.getUserProfile().getCvUrl();
                this.profilePictureUrl = user.getUserProfile().getProfilePictureUrl();
            }

            this.activeProjects = new ArrayList<>();
            this.pastProjects = new ArrayList<>();

            Set<Project> allProjects = new HashSet<>();
            if (user.getProjects() != null) allProjects.addAll(user.getProjects());
            if (user.getJoinedProjects() != null) allProjects.addAll(user.getJoinedProjects());

            for (Project p : allProjects) {
                boolean isPast = p.getCompletedAt() != null;
                ProjectSummaryDto summary = new ProjectSummaryDto(p);
                if (isPast) {
                    this.pastProjects.add(summary);
                } else {
                    this.activeProjects.add(summary);
                }
            }
        }
    }

    static class UpdateProfileDto {
        public String bio;
        public String linkedInUrl;
        public String websiteUrl;
        public String githubUrl;
        public String cvUrl;
        public String profilePictureUrl;
    }
}