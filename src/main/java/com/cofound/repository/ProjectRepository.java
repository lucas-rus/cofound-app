package com.cofound.repository;

import com.cofound.model.Project;
import com.cofound.model.User;
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

    @Query("SELECT DISTINCT p FROM Project p JOIN p.requiredSkills rs WHERE LOWER(rs) IN :skills AND p.status = 'RECRUITING'")
    List<Project> findProjectsWithMatchingSkills(@Param("skills") List<String> skills);

    @Query("""
            SELECT DISTINCT p FROM Project p 
            LEFT JOIN p.requiredSkills s 
            WHERE (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) 
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) 
               OR LOWER(s) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    List<Project> searchProjects(@Param("query") String query);

    @Query("""
            SELECT COUNT(p) FROM Project p 
            WHERE (p.owner = :user1 OR :user1 MEMBER OF p.members)
            AND (p.owner = :user2 OR :user2 MEMBER OF p.members)
            """)
    long countCommonProjects(@Param("user1") User user1, @Param("user2") User user2);
}