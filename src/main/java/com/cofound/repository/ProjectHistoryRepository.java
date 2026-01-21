package com.cofound.repository;

import com.cofound.model.ProjectHistory;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectHistoryRepository extends JpaRepository<ProjectHistory, Long> {
    List<ProjectHistory> findByUserOrderByOccurredAtDesc(User user);
}
