package com.cofound.repository;

import com.cofound.model.FriendRequest;
import com.cofound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender = :u1 AND fr.receiver = :u2) OR (fr.sender = :u2 AND fr.receiver = :u1)")
    Optional<FriendRequest> findByUsers(@Param("u1") User u1, @Param("u2") User u2);

    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequest.FriendRequestStatus status);

    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender = :user OR fr.receiver = :user) AND fr.status = 'ACCEPTED'")
    List<FriendRequest> findAllAccepted(@Param("user") User user);
}
