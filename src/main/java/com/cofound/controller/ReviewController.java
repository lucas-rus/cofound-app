package com.cofound.controller;

import com.cofound.model.PendingReview;
import com.cofound.model.Project;
import com.cofound.model.User;
import com.cofound.model.UserReview;
import com.cofound.repository.PendingReviewRepository;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import com.cofound.repository.UserReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final UserReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PendingReviewRepository pendingReviewRepository;

    public ReviewController(UserReviewRepository reviewRepository, UserRepository userRepository, 
                            ProjectRepository projectRepository, PendingReviewRepository pendingReviewRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.pendingReviewRepository = pendingReviewRepository;
    }

    @GetMapping("/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReviewDto>> getUserReviews(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ReviewDto> reviews = reviewRepository.findByReviewee(user).stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/pending")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PendingReviewDto>> getPendingReviews(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PendingReviewDto> pending = pendingReviewRepository.findByReviewer(user).stream()
                .map(PendingReviewDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PostMapping
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addReview(@RequestBody CreateReviewDto dto, Principal principal) {
        User reviewer = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User reviewee = userRepository.findById(dto.revieweeId)
                .orElseThrow(() -> new RuntimeException("Reviewee not found"));
        Project project = projectRepository.findByIdWithMembersAndOwner(dto.projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (reviewer.equals(reviewee)) {
            return ResponseEntity.badRequest().body("Cannot review yourself.");
        }

        // Logic check: Were they co-members? (Or is there a PendingReview?)
        // PendingReview is sufficient proof of relationship for this context.
        // But manual reviews are also allowed if they were team members.
        
        boolean hasPending = pendingReviewRepository.findByReviewerAndRevieweeAndProject(reviewer, reviewee, project).isPresent();
        
        if (!hasPending) {
            return ResponseEntity.badRequest().body("You can only review this user if you have a pending review request (e.g. after project completion or exit).");
        }

        UserReview review = new UserReview();
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setProject(project);
        review.setRating(dto.rating);
        review.setComment(dto.comment);
        
        reviewRepository.save(review);

        // Clear pending
        pendingReviewRepository.deleteByReviewerAndRevieweeAndProject(reviewer, reviewee, project);

        return ResponseEntity.ok("Review added successfully.");
    }

    static class CreateReviewDto {
        public Long revieweeId;
        public Long projectId;
        public int rating;
        public String comment;
    }

    static class ReviewDto {
        public Long id;
        public String reviewerName;
        public String reviewerPic;
        public String projectName;
        public int rating;
        public String comment;
        public String createdAt;

        public ReviewDto(UserReview r) {
            this.id = r.getId();
            this.reviewerName = r.getReviewer().getUsername();
            this.reviewerPic = r.getReviewer().getUserProfile() != null ? r.getReviewer().getUserProfile().getProfilePictureUrl() : null;
            this.projectName = r.getProject().getTitle();
            this.rating = r.getRating();
            this.comment = r.getComment();
            this.createdAt = r.getCreatedAt().toString();
        }
    }

    static class PendingReviewDto {
        public Long id; // This is PendingReview ID, but useful just to count
        public Long revieweeId;
        public String revieweeName;
        public Long projectId;
        public String projectName;

        public PendingReviewDto(PendingReview p) {
            this.id = p.getId();
            this.revieweeId = p.getReviewee().getId();
            this.revieweeName = p.getReviewee().getUsername();
            this.projectId = p.getProject().getId();
            this.projectName = p.getProject().getTitle();
        }
    }
}