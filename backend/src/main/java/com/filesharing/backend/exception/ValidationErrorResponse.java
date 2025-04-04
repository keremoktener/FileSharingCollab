package com.filesharing.backend.exception;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ValidationErrorResponse extends ErrorDetails {
    private Map<String, String> errors;

    public ValidationErrorResponse(LocalDateTime timestamp, String message, String details, String errorCode, Map<String, String> errors) {
        super(timestamp, message, details, errorCode);
        this.errors = errors;
    }
} 