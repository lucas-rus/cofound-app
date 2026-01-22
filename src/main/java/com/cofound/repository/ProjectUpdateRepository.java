package com.cofound.repository;

import com.cofound.model.Project;
import com.cofound.model.ProjectUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectUpdateRepository extends JpaRepository<ProjectUpdate, Long> {
    List<ProjectUpdate> findByProjectOrderByCreatedAtDesc(Project project);

    @Query("SELECT pu FROM ProjectUpdate pu LEFT JOIN FETCH pu.project p LEFT JOIN FETCH pu.poster u WHERE pu.id = :id")
    Optional<ProjectUpdate> findByIdWithProjectAndOwner(@Param("id") Long id);
}