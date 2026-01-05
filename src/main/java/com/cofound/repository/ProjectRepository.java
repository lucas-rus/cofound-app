package com.cofound.repository;

import com.cofound.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("""
            select p
            from Project p
            join fetch p.owner
            where p.id = :id
            """)
    Optional<Project> findByIdWithOwner(@Param("id") Long id);

    @Query("""
            select p
            from Project p
            join fetch p.owner
            left join fetch p.members
            where p.id = :id
            """)
    Optional<Project> findByIdWithMembersAndOwner(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.requiredSkills rs WHERE rs IN :skills AND p.status = 'RECRUITING'")
    List<Project> findProjectsWithMatchingSkills(@Param("skills") List<String> skills);
}