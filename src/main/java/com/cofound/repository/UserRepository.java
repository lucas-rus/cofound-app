package com.cofound.repository;

import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String query);

    @Query("SELECT DISTINCT u FROM User u JOIN u.skills s WHERE s.name IN :skills AND u.id != :userId")
    List<User> findBySharedSkills(@Param("userId") Long userId, @Param("skills") List<String> skills);
}
