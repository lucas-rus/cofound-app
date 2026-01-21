package com.cofound.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    @Async
    public void logUserActivity(String username, String action) {
        try {
            // Simulate a slow operation (e.g., writing to an external analytics server)
            System.out.println(" [Async Thread: " + Thread.currentThread().getName() + "] Starting analytics log for: " + username);
            Thread.sleep(2000); // Sleep for 2 seconds to prove it's async (doesn't block the user)
            System.out.println(" [Async Thread: " + Thread.currentThread().getName() + "] Completed analytics log: " + action);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
