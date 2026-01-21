package com.cofound.controller;

import com.cofound.model.FriendRequest;
import com.cofound.model.User;
import com.cofound.repository.FriendRequestRepository;
import com.cofound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final com.cofound.repository.ProjectRepository projectRepository;

    public FriendController(FriendRequestRepository friendRequestRepository, UserRepository userRepository, com.cofound.repository.ProjectRepository projectRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @PostMapping("/request/{userId}")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendRequest(@PathVariable Long userId, Principal principal) {
        User sender = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User receiver = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (sender.equals(receiver)) {
            return ResponseEntity.badRequest().body("Cannot send friend request to yourself.");
        }

        if (friendRequestRepository.findByUsers(sender, receiver).isPresent()) {
            return ResponseEntity.badRequest().body("Friend request or friendship already exists.");
        }

        com.cofound.model.FriendRequest request = new com.cofound.model.FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(com.cofound.model.FriendRequest.FriendRequestStatus.PENDING);
        friendRequestRepository.save(request);

        return ResponseEntity.ok("Friend request sent.");
    }

    @PutMapping("/request/{requestId}/accept")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.cofound.model.FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().equals(user)) {
            return ResponseEntity.status(403).body("Not your request.");
        }

        request.setStatus(com.cofound.model.FriendRequest.FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        return ResponseEntity.ok("Friend request accepted.");
    }

    @PutMapping("/request/{requestId}/reject")
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.cofound.model.FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().equals(user)) {
            return ResponseEntity.status(403).body("Not your request.");
        }

        request.setStatus(com.cofound.model.FriendRequest.FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
        return ResponseEntity.ok("Friend request rejected.");
    }

    @GetMapping
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FriendDto>> getFriends(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<com.cofound.model.FriendRequest> friendships = friendRequestRepository.findAllAccepted(user);

        List<FriendDto> friends = friendships.stream()
                .map(fr -> {
                    User friend = fr.getSender().equals(user) ? fr.getReceiver() : fr.getSender();
                    return new FriendDto(friend);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(friends);
    }

    @GetMapping("/requests")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FriendRequestDto>> getPendingRequests(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<com.cofound.model.FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(user, com.cofound.model.FriendRequest.FriendRequestStatus.PENDING);

        List<FriendRequestDto> dtos = requests.stream()
                .map(FriendRequestDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FriendDto>> searchUsers(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) return ResponseEntity.ok(List.of());
        List<FriendDto> matches = userRepository.findByUsernameContainingIgnoreCase(query.trim()).stream()
                .filter(u -> !u.getUsername().equalsIgnoreCase("admin") && u.getRoles().stream().noneMatch(r -> r.getName().name().equals("ROLE_ADMIN")))
                .map(FriendDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/recommendations")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FriendDto>> getRecommendations(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Set<User> allCandidates = new java.util.HashSet<>();

        // 1. Co-workers (Same Projects)
        java.util.Set<com.cofound.model.Project> myProjects = new java.util.HashSet<>();
        if (user.getProjects() != null) myProjects.addAll(user.getProjects());
        if (user.getJoinedProjects() != null) myProjects.addAll(user.getJoinedProjects());

        for (com.cofound.model.Project p : myProjects) {
            if (p.getMembers() != null) allCandidates.addAll(p.getMembers());
            if (p.getOwner() != null) allCandidates.add(p.getOwner());
        }

        // 2. Similar Projects (Projects matching my projects' skills)
        List<String> myProjectSkills = myProjects.stream()
                .flatMap(p -> p.getRequiredSkills().stream())
                .distinct()
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        if (!myProjectSkills.isEmpty()) {
            List<com.cofound.model.Project> similarProjects = projectRepository.findProjectsWithMatchingSkills(myProjectSkills);
            for (com.cofound.model.Project p : similarProjects) {
                if (p.getMembers() != null) allCandidates.addAll(p.getMembers());
                if (p.getOwner() != null) allCandidates.add(p.getOwner());
            }
        }

        // 3. Shared Skills (Direct)
        List<String> mySkills = user.getSkills().stream().map(com.cofound.model.Skill::getName).collect(Collectors.toList());
        if (!mySkills.isEmpty()) {
            List<User> bySkills = userRepository.findBySharedSkills(user.getId(), mySkills);
            allCandidates.addAll(bySkills);
        }
        
        // Filter out existing friends, requests, admins, and self
        List<FriendDto> recs = allCandidates.stream()
                .filter(u -> !u.equals(user))
                .filter(u -> !u.getUsername().equalsIgnoreCase("admin") && u.getRoles().stream().noneMatch(r -> r.getName().name().equals("ROLE_ADMIN")))
                .filter(u -> friendRequestRepository.findByUsers(user, u).isEmpty())
                .limit(10)
                .map(FriendDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(recs);
    }

    @GetMapping("/check/{userId}")
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FriendStatusDto> checkStatus(@PathVariable Long userId, Principal principal) {
        User me = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return friendRequestRepository.findByUsers(me, other)
                .map(fr -> ResponseEntity.ok(new FriendStatusDto(fr.getStatus().name(), fr.getSender().getId(), fr.getId())))
                .orElse(ResponseEntity.ok(new FriendStatusDto("NONE", null, null)));
    }

    static class FriendStatusDto {
        public String status;
        public Long senderId;
        public Long requestId;

        public FriendStatusDto(String status, Long senderId, Long requestId) {
            this.status = status;
            this.senderId = senderId;
            this.requestId = requestId;
        }
    }

    static class FriendDto {
        public Long id;
        public String username;
        public String profilePictureUrl;

        public FriendDto(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.profilePictureUrl = user.getUserProfile() != null ? user.getUserProfile().getProfilePictureUrl() : null;
        }
    }

    static class FriendRequestDto {
        public Long id;
        public FriendDto sender;
        public String sentAt;

        public FriendRequestDto(FriendRequest fr) {
            this.id = fr.getId();
            this.sender = new FriendDto(fr.getSender());
            this.sentAt = fr.getCreatedAt().toString();
        }
    }
}
