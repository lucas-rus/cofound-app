package com.cofound.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class DebugController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/")
    public String home() {
        return "Backend is running! Environment: " + System.getenv("SPRING_PROFILES_ACTIVE");
    }
    
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @GetMapping("/health")
    public String health() {
        try (Connection conn = dataSource.getConnection()) {
            return "{\"status\": \"UP\", \"database\": \"Connected\", \"product\": \"" + conn.getMetaData().getDatabaseProductName() + "\"}";
        } catch (Exception e) {
            return "{\"status\": \"DOWN\", \"error\": \"" + e.getMessage() + "\"}";
        }
    }
}