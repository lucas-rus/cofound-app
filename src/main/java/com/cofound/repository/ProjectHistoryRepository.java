package com.cofound.repository;

import com.cofound.model.Project;
import com.cofound.model.ProjectHistory;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectHistoryRepository extends JpaRepository<ProjectHistory, Long> {
    List<ProjectHistory> findByUserOrderByOccurredAtDesc(User user);
    Optional<ProjectHistory> findByUserAndProjectAndEndedAtIsNull(User user, Project project);
}