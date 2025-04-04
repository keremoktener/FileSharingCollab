package com.filesharing.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;
import java.io.File;

@SpringBootApplication
public class BackendApplication {

    static {
        // Load environment variables from .env file before Spring initializes
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .ignoreIfMissing()
                    .load();
            
            // Set system properties for Spring to pick up
            dotenv.entries().forEach(entry -> 
                System.setProperty(entry.getKey(), entry.getValue())
            );
            
            System.out.println("Environment variables loaded from .env file");
        } catch (Exception e) {
            System.out.println("Warning: Could not load .env file. Using system environment variables.");
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void init() {
        // Create uploads directory if it doesn't exist
        File uploadDir = new File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
} 