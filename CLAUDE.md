# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern personal blog system with a separation of concerns between frontend and backend:

- **Frontend**: React 18 + TypeScript + Vite + Ant Design application for managing and displaying blog content
- **Backend**: Spring Boot 3.x + Java 21 REST API service with PostgreSQL database
- **Architecture**: Follows API First design principle with OpenAPI specification driving development

## Repository Structure

```
personal-blog-system/
├── frontend/                 # React frontend application
│   ├── src/
│   ├── package.json
│   └── README.md
├── backend/                  # Spring Boot backend service
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── src/test/            # Test configurations and utilities
├── api/                      # OpenAPI specification
│   └── openapi.yaml
├── docs/                     # Documentation
├── data/                     # Runtime data storage (markdown & images)
├── docker-compose.yml        # Container orchestration
└── README.md
```

## Development Commands

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Backend Development

```bash
# Run backend with PostgreSQL (requires DB setup)
./mvnw spring-boot:run

# Run backend with embedded H2 database for testing/development
./mvnw test-compile exec:java -Dexec.mainClass="com.blog.TestApplication" -Dexec.classpathScope=test

# Run unit and integration tests
./mvnw test

# Package application as JAR
./mvnw package
```

### Docker Deployment

```bash
# Start all services (frontend, backend, PostgreSQL)
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs
```

## Architecture Overview

### Backend Architecture

Follows a layered architecture:
- **Controller Layer**: REST API endpoints (`com.blog.controller`)
- **Service Layer**: Business logic (`com.blog.service`)
- **Repository Layer**: Data access (`com.blog.repository`)
- **Entity Layer**: JPA entities (`com.blog.entity`)

Key components:
- Articles management with CRUD operations
- Image handling with Base64 conversion
- Markdown file storage and retrieval
- PostgreSQL database with H2 embedded option for testing

### Frontend Architecture

Component structure:
- `/src/pages/` - Page components (HomePage, ArticleEditor, etc.)
- `/src/components/` - Reusable UI components
- `/src/services/` - API service layer
- `/src/hooks/` - Custom React hooks
- `/src/utils/` - Utility functions

### API Contract

Defined in `api/openapi.yaml` with key endpoints:
- `GET /api/v1/articles` - List articles with pagination/filtering
- `POST /api/v1/articles` - Create new article
- `GET /api/v1/articles/{id}` - Get article details
- `PUT /api/v1/articles/{id}` - Update article
- `DELETE /api/v1/articles/{id}` - Delete article
- `POST /api/v1/images` - Upload image
- `GET /api/v1/images/{id}` - Get image info
- `GET /api/v1/files/markdown/{articleId}` - Get markdown content
- `PUT /api/v1/files/markdown/{articleId}` - Save markdown content

## Key Configuration Files

- `backend/src/main/resources/application.yml` - Production configuration
- `backend/src/test/resources/application-test.yml` - Test configuration
- `frontend/.env` - Frontend environment variables
- `docker-compose.yml` - Container orchestration

## Testing

The backend includes:
- Unit tests using JUnit 5 and Mockito
- Integration tests with H2 embedded database
- Test data initialization in `backend/src/test/resources/data-h2.sql`
- Standalone test application in `TestApplication.java` for manual debugging

Run tests with: `./mvnw test`

## Data Model

Core entities:
- `Article` - Blog posts with title, content, tags, status
- `Image` - Uploaded images with Base64 content
- Relationship tables for article-image associations

Storage paths:
- Markdown files: `./data/markdown/`
- Images: `./data/images/`

## Development Workflow

1. For backend development, use the TestApplication with embedded H2 database
2. For frontend development, use `npm run dev` with proxy to backend
3. For integration testing, use docker-compose to run all services together
4. API changes should start with updates to `api/openapi.yaml`