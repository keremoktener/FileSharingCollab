package com.filesharing.backend;

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
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
} 