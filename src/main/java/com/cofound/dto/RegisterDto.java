package com.cofound.dto;

import lombok.Data;

@Data
public class RegisterDto {
    private String username;
    private String email;
    private String password;
    private String role; // e.g., "ROLE_MEMBER" or "ROLE_POSTER"
}