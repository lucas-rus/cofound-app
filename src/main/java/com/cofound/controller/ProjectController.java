package com.cofound.controller;

import com.cofound.dto.ProjectDto;
import com.cofound.dto.ProjectSummaryDto; // Shared DTO
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

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository,
                             ProjectHistoryRepository historyRepository, NotificationRepository notificationRepository,
                             UserReviewRepository reviewRepository, PendingReviewRepository pendingReviewRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.reviewRepository = reviewRepository;
        this.pendingReviewRepository = pendingReviewRepository;
    }

    private void createPendingReview(User reviewer, User reviewee, Project project) {
        if (reviewer.equals(reviewee)) return;
        // Check if already reviewed
        // ... (UserReview check would be good, but expensive. Assuming PendingReview check is enough).
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
                .map(ProjectSummaryDto::new)
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
                .map(s -> s.getName().toLowerCase())
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
            long p1Matches = p1.getRequiredSkills().stream().map(String::toLowerCase).filter(userSkills::contains).count();
            long p2Matches = p2.getRequiredSkills().stream().map(String::toLowerCase).filter(userSkills::contains).count();
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
        project.setStatus("COMPLETED");
        
        // History for Owner
        ProjectHistory hOwner = new ProjectHistory();
        hOwner.setUser(project.getOwner());
        hOwner.setProject(project);
        hOwner.setStatus(ProjectHistory.HistoryStatus.COMPLETED);
        historyRepository.save(hOwner);

        // History and Notifications for Members
        for (User m : project.getMembers()) {
            ProjectHistory h = new ProjectHistory();
            h.setUser(m);
            h.setProject(project);
            h.setStatus(ProjectHistory.HistoryStatus.COMPLETED);
            historyRepository.save(h);
            
            Notification n = new Notification();
            n.setRecipient(m);
            n.setContent("Project '" + project.getTitle() + "' is completed! Please rate your team.");
            n.setType(Notification.NotificationType.SUCCESS);
            notificationRepository.save(n);
        }

        // Pending Reviews (All to All)
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

        return ResponseEntity.ok(new ProjectSummaryDto(project));
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

        // History
        ProjectHistory history = new ProjectHistory();
        history.setUser(user);
        history.setProject(project);
        history.setStatus(ProjectHistory.HistoryStatus.LEFT);
        historyRepository.save(history);

        // Notification to Owner
        Notification notif = new Notification();
        notif.setRecipient(project.getOwner());
        notif.setContent(user.getUsername() + " has left your project '" + project.getTitle() + "'. Please rate them.");
        notif.setType(Notification.NotificationType.ALERT);
        notificationRepository.save(notif);

        // Pending Reviews
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

        // 1. History
        ProjectHistory history = new ProjectHistory();
        history.setUser(target);
        history.setProject(project);
        history.setStatus(ProjectHistory.HistoryStatus.KICKED);
        history.setReason(kickDto.reason);
        historyRepository.save(history);

        // 2. Notification to Target
        Notification notif = new Notification();
        notif.setRecipient(target);
        notif.setContent("You were removed from project '" + project.getTitle() + "'. Reason: " + kickDto.reason + ". You can rate your teammates.");
        notif.setType(Notification.NotificationType.ALERT);
        notificationRepository.save(notif);

        // 3. Review (Owner reviews Target)
        UserReview review = new UserReview();
        review.setReviewer(owner);
        review.setReviewee(target);
        review.setProject(project);
        review.setRating(1);
        review.setComment("Terminated from project: " + kickDto.reason);
        reviewRepository.save(review);

        // 4. Pending Reviews & Notifications for Teammates
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

        // 5. Remove
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