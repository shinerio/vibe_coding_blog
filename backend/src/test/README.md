# Test Environment Setup

This directory contains test configurations and utilities for the Personal Blog Backend.

## TestApplication

The `TestApplication` class provides a standalone test environment that uses an embedded H2 database instead of PostgreSQL. This is useful for:

- Manual API testing and debugging
- Development without setting up PostgreSQL
- Quick prototyping and experimentation

### Running the Test Application

#### Option 1: Using Maven (Recommended)
```bash
# From the backend directory
mvn test-compile exec:java -Dexec.mainClass="com.blog.TestApplication" -Dexec.classpathScope=test
```

#### Option 2: Using IDE
1. Open `src/test/java/com/blog/TestApplication.java` in your IDE
2. Run the main method directly

### Available Endpoints

Once the application starts, you can access:

- **H2 Database Console**: http://localhost:8080/api/v1/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (empty)

- **API Base URL**: http://localhost:8080/api/v1
- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **OpenAPI Specification**: http://localhost:8080/api/v1/v3/api-docs

### Test Data

The application automatically loads sample test data from `data-h2.sql`:
- 3 sample articles with different statuses (PUBLISHED, DRAFT)
- Sample tags associated with articles
- Sample images for testing

### Configuration

The test application uses:
- **Profile**: `test`
- **Database**: H2 embedded (in-memory)
- **Configuration**: `application-test.yml`
- **Test Configuration**: `H2TestConfiguration.java`

### Stopping the Application

Press `Ctrl+C` in the terminal to stop the application.

## Test Database Structure

The H2 database schema is automatically created by Hibernate and matches the production PostgreSQL structure:

- `articles` table: Main article data
- `article_tags` table: Article tags (ElementCollection)
- `images` table: Image metadata
- `article_images` table: Article-Image relationships

## Notes

- The H2 database is in-memory, so all data is lost when the application stops
- This is perfect for testing as it provides a clean state on each restart
- The embedded database configuration ensures consistency with production PostgreSQL structure