package com.cofound.repository;

import com.cofound.model.PendingReview;
import com.cofound.model.Project;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PendingReviewRepository extends JpaRepository<PendingReview, Long> {
    List<PendingReview> findByReviewer(User reviewer);
    Optional<PendingReview> findByReviewerAndRevieweeAndProject(User reviewer, User reviewee, Project project);
    void deleteByReviewerAndRevieweeAndProject(User reviewer, User reviewee, Project project);
}
