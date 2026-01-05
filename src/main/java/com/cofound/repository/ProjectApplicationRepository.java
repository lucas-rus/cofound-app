package com.cofound.repository;

import com.cofound.model.ProjectApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    @Query("""
            select distinct pa
            from ProjectApplication pa
            join fetch pa.project p
            join fetch pa.applicant a
            left join fetch a.skills
            where p.id = :projectId
            """)
    List<ProjectApplication> findAllByProjectIdWithApplicantSkills(@Param("projectId") Long projectId);

    @Query("""
            select distinct pa
            from ProjectApplication pa
            join fetch pa.project p
            join fetch pa.applicant a
            left join fetch a.skills
            where pa.id = :applicationId
            """)
    Optional<ProjectApplication> findByIdWithApplicantSkills(@Param("applicationId") Long applicationId);

    boolean existsByProjectIdAndApplicantId(Long projectId, Long applicantId);
}