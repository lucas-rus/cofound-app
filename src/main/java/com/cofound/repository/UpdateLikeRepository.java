package com.cofound.repository;

import com.cofound.model.ProjectUpdate;
import com.cofound.model.UpdateLike;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UpdateLikeRepository extends JpaRepository<UpdateLike, Long> {
    long countByProjectUpdate(ProjectUpdate projectUpdate);
    boolean existsByProjectUpdateAndUser(ProjectUpdate projectUpdate, User user);
    Optional<UpdateLike> findByProjectUpdateAndUser(ProjectUpdate projectUpdate, User user);
}
