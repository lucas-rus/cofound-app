package com.cofound.controller;

import com.cofound.model.*; // NEW: Import all models
import com.cofound.repository.ProjectApplicationRepository;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import com.cofound.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List; // NEW IMPORT

@RestController
// UPDATED: Changed base RequestMapping
@RequestMapping("/api/applications")
public class ApplicationController {

    private final com.cofound.repository.NotificationRepository notificationRepository;
    private final com.cofound.repository.ProjectHistoryRepository historyRepository;

    // UPDATED CONSTRUCTOR
    public ApplicationController(ProjectApplicationRepository applicationRepository,
                                 ProjectRepository projectRepository,
                                 UserRepository userRepository,
                                 EmailService emailService,
                                 com.cofound.repository.NotificationRepository notificationRepository,
                                 com.cofound.repository.ProjectHistoryRepository historyRepository) {
        this.applicationRepository = applicationRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
        this.historyRepository = historyRepository;
    }

    // UPDATED: Changed path
    @PostMapping("/apply/project/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> applyToProject(@PathVariable Long projectId, Principal principal) {
        // ... (existing code)
        User applicant = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (applicationRepository.existsByProjectIdAndApplicantId(projectId, applicant.getId())) {
            return ResponseEntity.badRequest().body("You have already applied to this project.");
        }

        ProjectApplication application = new ProjectApplication();
        application.setApplicant(applicant);
        application.setProject(project);

        applicationRepository.save(application);

        return ResponseEntity.ok("Application submitted successfully!");
    }


    // --- NEW ENDPOINTS ---

    @GetMapping("/for-project/{projectId}")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ApplicationResponseDto>> getApplicationsForProject(
            @PathVariable Long projectId, Principal principal) {

        Project project = projectRepository.findByIdWithOwner(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ** SECURITY CHECK **
        if (!project.getOwner().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403).body(null); // 403 Forbidden
        }

        List<ApplicationResponseDto> responses = applicationRepository
                .findAllByProjectIdWithApplicantSkills(projectId)
                .stream()
                .map(ApplicationResponseDto::new)
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{applicationId}/status")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody String status, // Send "ACCEPTED" or "REJECTED"
            Principal principal) {

        try {
            ProjectApplication application = applicationRepository.findByIdWithApplicantSkills(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Fetch project with OWNER and MEMBERS to avoid LazyInitializationException
            Project project = projectRepository.findByIdWithMembersAndOwner(application.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // ** SECURITY CHECK **
            if (!project.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(403).body("You do not own this project.");
            }

            if (application.getStatus() != null && application.getStatus() != ApplicationStatus.PENDING) {
                return ResponseEntity.badRequest().body("Application has already been processed.");
            }

            String normalizedStatus = status != null ? status.trim() : "";

            if ("ACCEPTED".equalsIgnoreCase(normalizedStatus)) {
                application.setStatus(ApplicationStatus.ACCEPTED);

                // Add user to the project's team
                project.getMembers().add(application.getApplicant());
                projectRepository.save(project);
                
                // Create ProjectHistory entry for the accepted applicant
                ProjectHistory memberHistory = new ProjectHistory();
                memberHistory.setUser(application.getApplicant());
                memberHistory.setProject(project);
                memberHistory.setStatus(ProjectHistory.HistoryStatus.JOINED);
                memberHistory.setStartedAt(java.time.Instant.now());
                memberHistory.setOccurredAt(java.time.Instant.now());
                historyRepository.save(memberHistory);
                
                // Create Notification
                Notification notification = new Notification();
                notification.setRecipient(application.getApplicant());
                notification.setContent("Your application for '" + project.getTitle() + "' was ACCEPTED!");
                notification.setType(Notification.NotificationType.SUCCESS);
                notificationRepository.save(notification);

            } else if ("REJECTED".equalsIgnoreCase(normalizedStatus)) {
                application.setStatus(ApplicationStatus.REJECTED);
                
                // Create Notification
                Notification notification = new Notification();
                notification.setRecipient(application.getApplicant());
                notification.setContent("Your application for '" + project.getTitle() + "' was REJECTED.");
                notification.setType(Notification.NotificationType.ALERT);
                notificationRepository.save(notification);
            } else {
                return ResponseEntity.badRequest().body("Invalid status.");
            }

            applicationRepository.save(application);

            // Notify applicant via email (failure here should not rollback the transaction)
            try {
                emailService.sendApplicationStatusUpdate(
                        application.getApplicant().getEmail(),
                        project.getTitle(),
                        application.getStatus().name()
                );
            } catch (Exception e) {
                // Log error but allow success
                System.err.println("Failed to send status email: " + e.getMessage());
            }

            return ResponseEntity.ok(new ApplicationResponseDto(application));
            
        } catch (Exception e) {
            e.printStackTrace(); // Print full stack trace to console
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-applications")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyApplicationDto>> getMyApplications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MyApplicationDto> dtos = user.getApplications().stream()
                .map(MyApplicationDto::new)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // DTOs
    static class MyApplicationDto {
        public Long id;
        public String status;
        public java.time.Instant appliedAt;
        public ProjectSummaryDto project;

        public MyApplicationDto(ProjectApplication app) {
            this.id = app.getId();
            this.status = app.getStatus().name();
            this.appliedAt = app.getAppliedAt();
            this.project = new ProjectSummaryDto(app.getProject());
        }
    }

    static class ProjectSummaryDto {
        public Long id;
        public String title;
        public String description;
        public String status;
        
        public ProjectSummaryDto(Project p) {
            this.id = p.getId();
            this.title = p.getTitle();
            this.description = p.getDescription();
            this.status = p.getStatus();
        }
    }

    static class ApplicationResponseDto {
        public Long id;
        public String status;
        public java.time.Instant appliedAt;
        public ApplicantDto applicant;

        ApplicationResponseDto(ProjectApplication application) {
            this.id = application.getId();
            this.status = application.getStatus() != null ? application.getStatus().name() : null;
            this.appliedAt = application.getAppliedAt();
            this.applicant = new ApplicantDto(application.getApplicant());
        }
    }

    static class ApplicantDto {
        public Long id;
        public String username;
        public String email;
        public String profilePictureUrl; // NEW FIELD
        public List<String> skills;

        ApplicantDto(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.profilePictureUrl = user.getUserProfile() != null ? user.getUserProfile().getProfilePictureUrl() : null; // POPULATE IT
            this.skills = user.getSkills().stream()
                    .map(Skill::getName)
                    .sorted(String::compareToIgnoreCase)
                    .toList();
        }
    }
}