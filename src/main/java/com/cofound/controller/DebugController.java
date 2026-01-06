package com.cofound.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

    @GetMapping("/")
    public String home() {
        return "Backend is running! Environment: " + System.getenv("SPRING_PROFILES_ACTIVE");
    }
    
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}