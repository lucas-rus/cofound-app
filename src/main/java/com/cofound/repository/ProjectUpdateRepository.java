package com.cofound.repository;

import com.cofound.model.Project;
import com.cofound.model.ProjectUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectUpdateRepository extends JpaRepository<ProjectUpdate, Long> {
    List<ProjectUpdate> findByProjectOrderByCreatedAtDesc(Project project);
}
