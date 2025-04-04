package com.filesharing.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import jakarta.annotation.PostConstruct;
import java.io.File;

@SpringBootApplication
public class BackendApplication {

    @PostConstruct
    public void init() {
        // Create uploads directory if it doesn't exist
        File uploadDir = new File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // Load environment variables from .env file
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .load();
            System.out.println("Environment variables loaded from .env file");
        } catch (Exception e) {
            System.out.println("Warning: Could not load .env file. Using system environment variables.");
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
} 