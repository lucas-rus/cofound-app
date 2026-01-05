package com.cofound.controller;

import com.cofound.dto.ProjectDto;
import com.cofound.dto.ProjectSummaryDto; // Shared DTO
import com.cofound.model.Project;
import com.cofound.model.User;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectSummaryDto>> getAllProjects() {
        List<ProjectSummaryDto> projects = projectRepository.findAll().stream()
                .map(ProjectSummaryDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Project> createProject(@RequestBody ProjectDto projectDto, Principal principal) {

        User projectOwner = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setStatus("RECRUITING");
        project.setOwner(projectOwner);
        if (projectDto.getTeamSizeNeeded() != null) {
            project.setTeamSizeNeeded(projectDto.getTeamSizeNeeded());
        }
        if (projectDto.getRequiredSkills() != null) {
            project.setRequiredSkills(projectDto.getRequiredSkills());
        }

        Project savedProject = projectRepository.save(project);
        return ResponseEntity.ok(savedProject);
    }

    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectSummaryDto>> getAvailableProjects() {
        List<Project> all = projectRepository.findAll();
        List<ProjectSummaryDto> available = all.stream()
                .filter(p -> "RECRUITING".equalsIgnoreCase(p.getStatus()))
                .filter(p -> {
                    int needed = p.getTeamSizeNeeded();
                    int current = p.getMembers() != null ? p.getMembers().size() : 0;
                    return needed <= 0 || current < needed;
                })
                .map(ProjectSummaryDto::new)
                .toList();
        return ResponseEntity.ok(available);
    }

    @GetMapping("/recommended")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectSummaryDto>> getRecommendedProjects(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> userSkills = user.getSkills().stream()
                .map(com.cofound.model.Skill::getName)
                .collect(Collectors.toList());

        if (userSkills.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Project> matching = projectRepository.findProjectsWithMatchingSkills(userSkills);
        
        // Filter out projects I own, am a member of, or have applied to
        List<Project> filtered = matching.stream()
                .filter(p -> !p.getOwner().equals(user))
                .filter(p -> !p.getMembers().contains(user))
                .filter(p -> p.getApplications().stream().noneMatch(a -> a.getApplicant().equals(user)))
                .collect(Collectors.toList());
        
        // Sort by number of matches (best match first)
        filtered.sort((p1, p2) -> {
            long p1Matches = p1.getRequiredSkills().stream().filter(userSkills::contains).count();
            long p2Matches = p2.getRequiredSkills().stream().filter(userSkills::contains).count();
            return Long.compare(p2Matches, p1Matches);
        });

        List<ProjectSummaryDto> dtos = filtered.stream()
                .map(ProjectSummaryDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{projectId}/team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProjectTeam(@PathVariable Long projectId, Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = project.getMembers().contains(user) || project.getOwner().equals(user);

        if (!isMember) {
            return ResponseEntity.status(403).body("You do not have access to this project's team.");
        }
        // Return lightweight DTO to avoid lazy-loading issues
        List<Object> members = project.getMembers().stream()
                .map(u -> new TeamMemberDto(u.getId(), u.getUsername(), u.getEmail(), 
                        u.getUserProfile() != null ? u.getUserProfile().getProfilePictureUrl() : null))
                .collect(Collectors.toList());
        
        // Add owner to the list if not already there
        boolean ownerInList = members.stream().anyMatch(m -> ((TeamMemberDto)m).id.equals(project.getOwner().getId()));
        if (!ownerInList) {
             String ownerPic = project.getOwner().getUserProfile() != null ? project.getOwner().getUserProfile().getProfilePictureUrl() : null;
             members.add(0, new TeamMemberDto(project.getOwner().getId(), project.getOwner().getUsername(), project.getOwner().getEmail(), ownerPic));
        }

        return ResponseEntity.ok(members);
    }

    @GetMapping("/my-projects")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectSummaryDto>> getMyProjects(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Project> owned = new ArrayList<>(user.getProjects());
        List<Project> joined = new ArrayList<>(user.getJoinedProjects());
        
        List<Project> all = new ArrayList<>();
        all.addAll(owned);
        all.addAll(joined);

        // Deduplicate just in case
        List<ProjectSummaryDto> dtos = all.stream()
                .distinct()
                .map(ProjectSummaryDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{projectId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> finishProject(@PathVariable Long projectId, Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403).body("You do not own this project.");
        }

        if (project.getCompletedAt() != null) {
            return ResponseEntity.badRequest().body("Project is already completed.");
        }

        project.setCompletedAt(java.time.Instant.now());
        project.setStatus("COMPLETED"); // Update status string too
        projectRepository.save(project);

        return ResponseEntity.ok(new ProjectSummaryDto(project));
    }

    static class TeamMemberDto {
        public Long id;
        public String username;
        public String email;
        public String profilePictureUrl;
        
        public TeamMemberDto(Long id, String username, String email, String profilePictureUrl) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.profilePictureUrl = profilePictureUrl;
        }
    }
}