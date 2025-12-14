package com.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import com.blog.config.H2TestConfiguration;

/**
 * Test application entry point for manual debugging and API testing.
 * This application uses embedded H2 database instead of PostgreSQL.
 * 
 * Usage:
 * 1. Run this main method to start the application with test configuration
 * 2. Access H2 console at: http://localhost:8080/api/v1/h2-console
 * 3. Use JDBC URL: jdbc:h2:mem:testdb
 * 4. Test APIs using tools like Postman or curl
 * 
 * The application will start with sample test data loaded from data-h2.sql
 */
@SpringBootApplication
@ActiveProfiles("test")
@Import(H2TestConfiguration.class)
public class TestApplication {

    public static void main(String[] args) {
        System.out.println("=".repeat(60));
        System.out.println("Starting Personal Blog Backend in TEST MODE");
        System.out.println("=".repeat(60));
        System.out.println("Database: H2 Embedded (In-Memory)");
        System.out.println("Profile: test");
        System.out.println("Port: 8080");
        System.out.println("Context Path: /api/v1");
        System.out.println();
        System.out.println("Available endpoints:");
        System.out.println("- H2 Console: http://localhost:8080/api/v1/h2-console");
        System.out.println("  JDBC URL: jdbc:h2:mem:testdb");
        System.out.println("  Username: sa");
        System.out.println("  Password: (empty)");
        System.out.println();
        System.out.println("- API Base URL: http://localhost:8080/api/v1");
        System.out.println("- Swagger UI: http://localhost:8080/api/v1/swagger-ui.html");
        System.out.println("- OpenAPI Spec: http://localhost:8080/api/v1/v3/api-docs");
        System.out.println();
        System.out.println("Sample test data will be loaded automatically.");
        System.out.println("=".repeat(60));
        
        SpringApplication.run(TestApplication.class, args);
    }
}