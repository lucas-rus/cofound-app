package com.cofound.controller;

import com.cofound.model.User;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import com.cofound.service.UserService; // NEW IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // NEW IMPORT
import org.springframework.security.core.context.SecurityContextHolder; // NEW IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService; // NEW INJECTION

    public AdminController(UserRepository userRepository, ProjectRepository projectRepository, UserService userService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.userService = userService; // INITIALIZE NEW SERVICE
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public String getAdminStats() {
        long userCount = userRepository.count();
        long projectCount = projectRepository.count();
        return "System Status: Running. Users: " + userCount + ", Projects: " + projectCount;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(u -> new AdminUserDto(u.getId(), u.getUsername(), u.getEmail(), u.isEnabled()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/projects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.deleteById(id);
        return ResponseEntity.ok("Project deleted successfully by Admin.");
    }

    // NEW ENDPOINT: Delete User
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User adminUser = (User) authentication.getPrincipal(); // Assuming admin is a User object
            Long adminId = adminUser.getId();

            userService.deleteUser(id, adminId);
            return ResponseEntity.ok("User deleted successfully by Admin.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) { // Catch other exceptions like UsernameNotFoundException
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User adminUser = (User) authentication.getPrincipal(); // Assuming admin is a User object
            Long adminId = adminUser.getId();

            User updatedUser = userService.toggleUserStatus(id, adminId);
            
            return ResponseEntity.ok(new AdminUserDto(updatedUser.getId(), updatedUser.getUsername(), updatedUser.getEmail(), updatedUser.isEnabled()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) { // Catch other exceptions like UsernameNotFoundException
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }


    // Simple DTO for Admin view
    static class AdminUserDto {
        public Long id;
        public String username;
        public String email;
        public boolean enabled;

        public AdminUserDto(Long id, String username, String email, boolean enabled) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.enabled = enabled;
        }
    }
}
