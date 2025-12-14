package com.blog.exception;

public class ImageNotFoundException extends RuntimeException {
    
    public ImageNotFoundException(String message) {
        super(message);
    }
    
    public ImageNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ImageNotFoundException(Long id) {
        super("Image with ID " + id + " not found");
    }
}