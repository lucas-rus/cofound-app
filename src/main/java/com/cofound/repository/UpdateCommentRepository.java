package com.cofound.repository;

import com.cofound.model.ProjectUpdate;
import com.cofound.model.UpdateComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UpdateCommentRepository extends JpaRepository<UpdateComment, Long> {
    List<UpdateComment> findByProjectUpdateOrderByCreatedAtAsc(ProjectUpdate projectUpdate);
}
