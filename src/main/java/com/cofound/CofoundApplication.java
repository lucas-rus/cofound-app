package com.cofound;

import com.cofound.model.Role;
import com.cofound.model.RoleEnum;
import com.cofound.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CofoundApplication {

    public static void main(String[] args) {
        SpringApplication.run(CofoundApplication.class, args);
    }

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            for (RoleEnum roleName : RoleEnum.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    System.out.println("Initialized role: " + roleName);
                }
            }
        };
    }
}