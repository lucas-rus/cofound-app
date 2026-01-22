package com.cofound.controller;

import com.cofound.dto.ProjectDto;
import com.cofound.dto.ProjectSummaryDto;
import com.cofound.model.*;
import com.cofound.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final UserReviewRepository reviewRepository;
    private final PendingReviewRepository pendingReviewRepository;
    private final ProjectMessageRepository projectMessageRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository,
                             ProjectHistoryRepository historyRepository, NotificationRepository notificationRepository,
                             UserReviewRepository reviewRepository, PendingReviewRepository pendingReviewRepository,
                             ProjectMessageRepository projectMessageRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.reviewRepository = reviewRepository;
        this.pendingReviewRepository = pendingReviewRepository;
        this.projectMessageRepository = projectMessageRepository;
    }

    private ProjectSummaryDto convertToSummaryDto(Project project) {
        String lastMessageAt = projectMessageRepository.findTopByProjectIdOrderBySentAtDesc(project.getId())
                .map(m -> m.getSentAt().toString())
                .orElse(null);
        long messageCount = projectMessageRepository.countByProjectId(project.getId());
        
        long pendingApps = project.getApplications() == null ? 0 : project.getApplications().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.PENDING)
                .count();

        return new ProjectSummaryDto(project, lastMessageAt, messageCount, pendingApps);
    }

    private void createPendingReview(User reviewer, User reviewee, Project project) {
        if (reviewer.equals(reviewee)) return;
        if (pendingReviewRepository.findByReviewerAndRevieweeAndProject(reviewer, reviewee, project).isEmpty()) {
            PendingReview pr = new PendingReview();
            pr.setReviewer(reviewer);
            pr.setReviewee(reviewee);
            pr.setProject(project);
            pendingReviewRepository.save(pr);
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProjectSummaryDto>> getAllProjects() {
        List<ProjectSummaryDto> projects = projectRepository.findAll().stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Project> createProject(@Valid @RequestBody ProjectDto projectDto, Principal principal) {

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

        // Create ProjectHistory entry for the owner
        ProjectHistory ownerHistory = new ProjectHistory();
        ownerHistory.setUser(projectOwner);
        ownerHistory.setProject(savedProject);
        ownerHistory.setStatus(ProjectHistory.HistoryStatus.JOINED);
        ownerHistory.setStartedAt(java.time.Instant.now());
        ownerHistory.setOccurredAt(java.time.Instant.now());
        historyRepository.save(ownerHistory);
        
        return ResponseEntity.ok(savedProject);
    }

    @PutMapping("/{projectId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> updateProject(@PathVariable Long projectId, @Valid @RequestBody ProjectDto projectDto, Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getOwner().equals(user)) {
            return ResponseEntity.status(403).body("Only the project owner can edit project details.");
        }

        project.setDescription(projectDto.getDescription());
        if (projectDto.getRequiredSkills() != null) {
            project.setRequiredSkills(projectDto.getRequiredSkills());
        }
        
        if (projectDto.getTitle() != null && !projectDto.getTitle().isBlank()) {
             project.setTitle(projectDto.getTitle());
        }
        if (projectDto.getTeamSizeNeeded() != null && projectDto.getTeamSizeNeeded() > 0) {
             project.setTeamSizeNeeded(projectDto.getTeamSizeNeeded());
        }

        Project savedProject = projectRepository.save(project);
        return ResponseEntity.ok(convertToSummaryDto(savedProject));
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
                .map(this::convertToSummaryDto)
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
                .map(s -> s.getName().toLowerCase())
                .collect(Collectors.toList());

        if (userSkills.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Project> matching = projectRepository.findProjectsWithMatchingSkills(userSkills);
        
        List<Project> filtered = matching.stream()
                .filter(p -> !p.getOwner().equals(user))
                .filter(p -> !p.getMembers().contains(user))
                .filter(p -> p.getApplications().stream().noneMatch(a -> a.getApplicant().equals(user)))
                .collect(Collectors.toList());
        
        filtered.sort((p1, p2) -> {
            long p1Matches = p1.getRequiredSkills().stream().map(String::toLowerCase).filter(userSkills::contains).count();
            long p2Matches = p2.getRequiredSkills().stream().map(String::toLowerCase).filter(userSkills::contains).count();
            return Long.compare(p2Matches, p1Matches);
        });

        List<ProjectSummaryDto> dtos = filtered.stream()
                .map(this::convertToSummaryDto)
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
        List<Object> members = project.getMembers().stream()
                .map(u -> new TeamMemberDto(u.getId(), u.getUsername(), u.getEmail(), 
                        u.getUserProfile() != null ? u.getUserProfile().getProfilePictureUrl() : null))
                .collect(Collectors.toList());
        
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

        List<ProjectSummaryDto> dtos = all.stream()
                .distinct()
                .map(this::convertToSummaryDto)
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
        project.setStatus("COMPLETED");
        
        historyRepository.findByUserAndProjectAndEndedAtIsNull(project.getOwner(), project)
            .ifPresent(h -> {
                h.setEndedAt(java.time.Instant.now());
                h.setStatus(ProjectHistory.HistoryStatus.COMPLETED);
                h.setOccurredAt(java.time.Instant.now());
                historyRepository.save(h);
            });

        for (User m : project.getMembers()) {
            historyRepository.findByUserAndProjectAndEndedAtIsNull(m, project)
                .ifPresent(h -> {
                    h.setEndedAt(java.time.Instant.now());
                    h.setStatus(ProjectHistory.HistoryStatus.COMPLETED);
                    h.setOccurredAt(java.time.Instant.now());
                    historyRepository.save(h);
                });
            
            Notification n = new Notification();
            n.setRecipient(m);
            n.setContent("Project '" + project.getTitle() + "' is completed! Please rate your team.");
            n.setType(Notification.NotificationType.SUCCESS);
            notificationRepository.save(n);
        }

        Set<User> team = new HashSet<>(project.getMembers());
        team.add(project.getOwner());
        for (User u1 : team) {
            for (User u2 : team) {
                if (!u1.equals(u2)) {
                    createPendingReview(u1, u2, project);
                }
            }
        }

        projectRepository.save(project);

        return ResponseEntity.ok(convertToSummaryDto(project));
    }

    @PostMapping("/{projectId}/leave")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> leaveProject(@PathVariable Long projectId, Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (project.getOwner().equals(user)) {
            return ResponseEntity.badRequest().body("Owner cannot leave the project. Delete it or transfer ownership.");
        }

        if (!project.getMembers().contains(user)) {
            return ResponseEntity.badRequest().body("You are not a member of this project.");
        }

        historyRepository.findByUserAndProjectAndEndedAtIsNull(user, project)
            .ifPresentOrElse(h -> {
                h.setEndedAt(java.time.Instant.now());
                h.setStatus(ProjectHistory.HistoryStatus.LEFT);
                h.setOccurredAt(java.time.Instant.now());
                historyRepository.save(h);
            }, () -> {
                ProjectHistory history = new ProjectHistory();
                history.setUser(user);
                history.setProject(project);
                history.setStatus(ProjectHistory.HistoryStatus.LEFT);
                history.setStartedAt(java.time.Instant.now()); 
                history.setEndedAt(java.time.Instant.now());
                history.setOccurredAt(java.time.Instant.now());
                historyRepository.save(history);
            });

        Notification notif = new Notification();
        notif.setRecipient(project.getOwner());
        notif.setContent(user.getUsername() + " has left your project '" + project.getTitle() + "'. Please rate them.");
        notif.setType(Notification.NotificationType.ALERT);
        notificationRepository.save(notif);

        createPendingReview(user, project.getOwner(), project);
        createPendingReview(project.getOwner(), user, project);

        for (User m : project.getMembers()) {
            if (!m.equals(user)) {
                createPendingReview(m, user, project);
                createPendingReview(user, m, project);
                
                Notification n = new Notification();
                n.setRecipient(m);
                n.setContent(user.getUsername() + " left the project. Please rate your experience with them.");
                n.setType(Notification.NotificationType.ALERT);
                notificationRepository.save(n);
            }
        }

        project.getMembers().remove(user);
        projectRepository.save(project);
        return ResponseEntity.ok("You have left the project.");
    }

    @PostMapping("/{projectId}/kick")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> kickMember(@PathVariable Long projectId, @RequestBody KickDto kickDto, Principal principal) {
        Project project = projectRepository.findByIdWithMembersAndOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User owner = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getOwner().equals(owner)) {
            return ResponseEntity.status(403).body("Only the owner can kick members.");
        }

        User target = userRepository.findById(kickDto.userId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (!project.getMembers().contains(target)) {
            return ResponseEntity.badRequest().body("User is not a member of this project.");
        }

        historyRepository.findByUserAndProjectAndEndedAtIsNull(target, project)
            .ifPresentOrElse(h -> {
                h.setEndedAt(java.time.Instant.now());
                h.setStatus(ProjectHistory.HistoryStatus.KICKED);
                h.setReason(kickDto.reason);
                h.setOccurredAt(java.time.Instant.now());
                historyRepository.save(h);
            }, () -> {
                ProjectHistory history = new ProjectHistory();
                history.setUser(target);
                history.setProject(project);
                history.setStatus(ProjectHistory.HistoryStatus.KICKED);
                history.setReason(kickDto.reason);
                history.setStartedAt(java.time.Instant.now());
                history.setEndedAt(java.time.Instant.now());
                history.setOccurredAt(java.time.Instant.now());
                historyRepository.save(history);
            });

        Notification notif = new Notification();
        notif.setRecipient(target);
        notif.setContent("You were removed from project '" + project.getTitle() + "'. Reason: " + kickDto.reason + ". You can rate your teammates.");
        notif.setType(Notification.NotificationType.ALERT);
        notificationRepository.save(notif);

        UserReview review = new UserReview();
        review.setReviewer(owner);
        review.setReviewee(target);
        review.setProject(project);
        review.setRating(1);
        review.setComment("Terminated from project: " + kickDto.reason);
        reviewRepository.save(review);

        createPendingReview(target, owner, project); // Target rates Owner

        for (User m : project.getMembers()) {
            if (!m.equals(target)) {
                createPendingReview(m, target, project); // Member rates Target
                createPendingReview(target, m, project); // Target rates Member
                
                Notification n = new Notification();
                n.setRecipient(m);
                n.setContent("User " + target.getUsername() + " was removed. Please rate your experience with them.");
                n.setType(Notification.NotificationType.ALERT);
                notificationRepository.save(n);
            }
        }

        project.getMembers().remove(target);
        projectRepository.save(project);
        
        return ResponseEntity.ok("User removed from project.");
    }

    static class KickDto {
        public Long userId;
        public String reason;
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
