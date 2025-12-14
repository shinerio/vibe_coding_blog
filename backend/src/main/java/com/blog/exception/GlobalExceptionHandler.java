package com.blog.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ArticleNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleArticleNotFoundException(
            ArticleNotFoundException ex, WebRequest request) {
        return buildErrorResponse(
                "ARTICLE_NOT_FOUND",
                ex.getMessage(),
                "文章不存在",
                HttpStatus.NOT_FOUND,
                request.getDescription(false).replace("uri=", "")
        );
    }

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleImageNotFoundException(
            ImageNotFoundException ex, WebRequest request) {
        return buildErrorResponse(
                "IMAGE_NOT_FOUND",
                ex.getMessage(),
                "图片不存在",
                HttpStatus.NOT_FOUND,
                request.getDescription(false).replace("uri=", "")
        );
    }

    @ExceptionHandler(FileOperationException.class)
    public ResponseEntity<Map<String, Object>> handleFileOperationException(
            FileOperationException ex, WebRequest request) {
        return buildErrorResponse(
                "FILE_OPERATION_ERROR",
                ex.getMessage(),
                "文件操作失败",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request.getDescription(false).replace("uri=", "")
        );
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            ValidationException ex, WebRequest request) {
        return buildErrorResponse(
                "VALIDATION_ERROR",
                ex.getMessage(),
                "请求参数验证失败",
                HttpStatus.BAD_REQUEST,
                request.getDescription(false).replace("uri=", "")
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        return buildErrorResponse(
                "VALIDATION_ERROR",
                ex.getMessage(),
                "请求参数验证失败",
                HttpStatus.BAD_REQUEST,
                request.getDescription(false).replace("uri=", "")
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        return buildErrorResponse(
                "INTERNAL_SERVER_ERROR",
                ex.getMessage(),
                "服务器内部错误",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request.getDescription(false).replace("uri=", "")
        );
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            String code, String message, String details, HttpStatus status, String path) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", code);
        errorDetails.put("message", message);
        errorDetails.put("details", details);
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("path", path);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", errorDetails);

        return new ResponseEntity<>(errorResponse, status);
    }
}