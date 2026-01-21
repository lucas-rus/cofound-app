package com.cofound.repository;

import com.cofound.model.UserReview;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {
    List<UserReview> findByReviewee(User reviewee);
    List<UserReview> findByReviewer(User reviewer);

    @Query("SELECT AVG(r.rating) FROM UserReview r WHERE r.reviewee = :user")
    Double getAverageRating(@Param("user") User user);

    long countByReviewee(User user);
}
