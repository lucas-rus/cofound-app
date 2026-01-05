package com.cofound.repository;

import com.cofound.model.ProjectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, Long> {
    List<ProjectMessage> findByProjectIdOrderBySentAtAsc(Long projectId);
}