package com.cofound;

import com.cofound.model.Role;
import com.cofound.model.RoleEnum;
import com.cofound.model.User;
import com.cofound.repository.RoleRepository;
import com.cofound.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;

@SpringBootApplication
@EnableAsync
public class CofoundApplication {

    public static void main(String[] args) {
        SpringApplication.run(CofoundApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            for (RoleEnum roleName : RoleEnum.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    System.out.println("Initialized role: " + roleName);
                }
            }

            if (!userRepository.existsByUsername("admin")) {
                Role adminRole = roleRepository.findByName(RoleEnum.ROLE_ADMIN).orElseThrow();
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@cofound.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEnabled(true);
                admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
                userRepository.save(admin);
                System.out.println("Initialized default admin user: admin / admin123");
            }
        };
    }
}