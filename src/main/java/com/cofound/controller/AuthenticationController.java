package com.cofound.controller;

import com.cofound.dto.JwtResponseDto;
import com.cofound.dto.LoginDto;
import com.cofound.dto.RegisterDto;
import com.cofound.model.Role;
import com.cofound.model.RoleEnum;
import com.cofound.model.User;
import com.cofound.model.VerificationToken; // NEW IMPORT
import com.cofound.repository.RoleRepository;
import com.cofound.repository.UserRepository;
import com.cofound.repository.VerificationTokenRepository; // NEW IMPORT
import com.cofound.security.JwtService;
import com.cofound.service.EmailService; // NEW IMPORT
import com.cofound.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID; // NEW IMPORT

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    // NEW INJECTIONS
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final VerificationService verificationService;

    // UPDATED CONSTRUCTOR
    public AuthenticationController(AuthenticationManager authenticationManager,
                                    UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    PasswordEncoder passwordEncoder,
                                    JwtService jwtService,
                                    VerificationTokenRepository tokenRepository,
                                    EmailService emailService,
                                    VerificationService verificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.verificationService = verificationService;
    }

    // UPDATED LOGIN METHOD
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(new JwtResponseDto(jwt));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body("Account is not verified. Please check your email.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password.");
        }
    }

    // UPDATED REGISTER METHOD
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterDto registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        // user.setEnabled(false); // This is the default

        // Always assign base user role; project-specific permissions are enforced by ownership checks
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleEnum.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        // --- NEW VERIFICATION LOGIC ---
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, savedUser);
        tokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), token);

        return ResponseEntity.ok("Registration successful! Please check your email to verify your account.");
    }

    // NEW VERIFICATION ENDPOINT

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        String result = verificationService.verify(token);
        if (result.startsWith("Error:")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}