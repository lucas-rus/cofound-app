package com.cofound.service;

import com.cofound.model.User;
import com.cofound.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void deleteUser(Long userIdToDelete, Long adminId) {
        if (userIdToDelete.equals(adminId)) {
            throw new IllegalArgumentException("Admins cannot delete their own account.");
        }
        if (!userRepository.existsById(userIdToDelete)) {
            throw new UsernameNotFoundException("User not found with id: " + userIdToDelete);
        }
        userRepository.deleteById(userIdToDelete);
    }

    @Transactional
    public User toggleUserStatus(Long userIdToToggle, Long adminId) {
        if (userIdToToggle.equals(adminId)) {
            throw new IllegalArgumentException("Admins cannot disable/enable their own account.");
        }

        User user = userRepository.findById(userIdToToggle)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userIdToToggle));

        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }
}
