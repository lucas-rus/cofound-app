package com.cofound.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@cofound.com}")
    private String fromAddress;

    @Value("${app.url:https://cofound-app-production.up.railway.app}")
    private String appUrl;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String username, String token) {
        String verificationLink = appUrl + "/auth/verify?token=" + token;
        
        // Keep the log for safety, but this will now run synchronously
        System.out.println("Preparing to send verification email to: " + to);
        System.out.println("Link: " + verificationLink);

        if (mailSender == null) {
            System.err.println("Mail sender not configured! Email skipped.");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject("CoFound - Verify Your Account");
            message.setText("Hello " + username + ",\n\n"
                    + "Thank you for registering with CoFound.\n\n"
                    + "Please verify your account by clicking the link below:\n"
                    + verificationLink + "\n\n"
                    + "If you did not request this, you can ignore this email.");
            mailSender.send(message);
            System.out.println("Verification email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
    }

    //add this later for notifications
    public void sendApplicationStatusUpdate(String to, String projectTitle, String status) {
        if (mailSender == null) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your-email@gmail.com");
        message.setTo(to);
        message.setSubject("Application Status Update for " + projectTitle);
        message.setText("Your application for the project '" + projectTitle + "' has been " + status.toUpperCase() + ".");
        mailSender.send(message);
    }
}