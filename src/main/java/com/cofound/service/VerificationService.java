package com.cofound.service;

import com.cofound.model.User;
import com.cofound.model.VerificationToken;
import com.cofound.repository.UserRepository;
import com.cofound.repository.VerificationTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class VerificationService {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    public VerificationService(VerificationTokenRepository tokenRepository, UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public String verify(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElse(null);
        if (verificationToken == null) {
            return "Error: Invalid verification token.";
        }
        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            return "Error: Verification token has expired.";
        }
        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        // one-time use: remove token after success
        tokenRepository.delete(verificationToken);
        return "Account verified successfully! You can now log in.";
    }
}

