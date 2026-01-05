package com.cofound.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    public void sendVerificationEmail(String to, String username, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("CoFound - Verify Your Account");
        message.setText("Hello " + username + ",\n\n"
                + "Thank you for registering with CoFound.\n\n"
                + "Please verify your account by clicking the link below:\n"
                + appUrl + "/auth/verify?token=" + token + "\n\n"
                + "If you did not request this, you can ignore this email.");
        mailSender.send(message);
    }

    //add this later for notifications
    public void sendApplicationStatusUpdate(String to, String projectTitle, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your-email@gmail.com");
        message.setTo(to);
        message.setSubject("Application Status Update for " + projectTitle);
        message.setText("Your application for the project '" + projectTitle + "' has been " + status.toUpperCase() + ".");
        mailSender.send(message);
    }
}