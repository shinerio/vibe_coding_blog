package com.blog.exception;

public class ArticleNotFoundException extends RuntimeException {
    
    public ArticleNotFoundException(String message) {
        super(message);
    }
    
    public ArticleNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public ArticleNotFoundException(Long id) {
        super("Article with ID " + id + " not found");
    }
}