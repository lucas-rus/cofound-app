package com.cofound.repository;

import com.cofound.model.Notification;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
    long countByRecipientAndIsReadFalse(User recipient);
}
