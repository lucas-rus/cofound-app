package com.cofound.repository;

import com.cofound.model.DirectMessage;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    
    @Query("SELECT m FROM DirectMessage m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.sentAt ASC")
    List<DirectMessage> findChatHistory(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.recipient = :user AND m.isRead = false")
    long countUnreadMessages(@Param("user") User user);
    
    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.recipient = :recipient AND m.sender = :sender AND m.isRead = false")
    long countUnreadMessagesFrom(@Param("recipient") User recipient, @Param("sender") User sender);

    @Query("SELECT DISTINCT m.sender FROM DirectMessage m WHERE m.recipient = :recipient AND m.isRead = false")
    List<User> findSendersOfUnreadMessages(@Param("recipient") User recipient);
}
