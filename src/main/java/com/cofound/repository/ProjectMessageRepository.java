package com.cofound.repository;

import com.cofound.model.ProjectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, Long> {
    List<ProjectMessage> findByProjectIdOrderBySentAtAsc(Long projectId);
    Optional<ProjectMessage> findTopByProjectIdOrderBySentAtDesc(Long projectId);
    long countByProjectId(Long projectId);
}