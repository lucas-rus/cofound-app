package com.cofound.controller;

import com.cofound.model.FriendRequest;
import com.cofound.model.Notification;
import com.cofound.model.User;
import com.cofound.repository.DirectMessageRepository;
import com.cofound.repository.FriendRequestRepository;
import com.cofound.repository.NotificationRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final DirectMessageRepository directMessageRepository;
    private final NotificationRepository notificationRepository;

    public NotificationController(UserRepository userRepository, FriendRequestRepository friendRequestRepository, DirectMessageRepository directMessageRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.directMessageRepository = directMessageRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/counts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponseDto> getNotificationCounts(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationDetailDto> details = new ArrayList<>();

        // Pending Friend Requests
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.FriendRequestStatus.PENDING);
        for (FriendRequest req : requests) {
            details.add(new NotificationDetailDto("Friend Request", "from " + req.getSender().getUsername()));
        }

        // Unread Direct Messages
        List<User> messageSenders = directMessageRepository.findSendersOfUnreadMessages(user);
        for (User sender : messageSenders) {
            long count = directMessageRepository.countUnreadMessagesFrom(user, sender);
            details.add(new NotificationDetailDto("Message", count + " unread from " + sender.getUsername()));
        }

        // General Notifications (Alerts/Success)
        List<Notification> generalNotifs = notificationRepository.findByRecipientAndIsReadFalse(user);
        for (Notification n : generalNotifs) {
            String typeLabel = n.getType() == Notification.NotificationType.SUCCESS ? "Success" : "Alert";
            details.add(new NotificationDetailDto(typeLabel, n.getContent()));
        }

        long total = requests.size() + directMessageRepository.countUnreadMessages(user) + generalNotifs.size();

        return ResponseEntity.ok(new NotificationResponseDto(total, details));
    }

    static class NotificationResponseDto {
        public long totalNetwork;
        public List<NotificationDetailDto> details;

        public NotificationResponseDto(long total, List<NotificationDetailDto> details) {
            this.totalNetwork = total;
            this.details = details;
        }
    }

    static class NotificationDetailDto {
        public String type;
        public String description;

        public NotificationDetailDto(String type, String description) {
            this.type = type;
            this.description = description;
        }
    }
}