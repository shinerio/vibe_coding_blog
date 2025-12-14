package com.blog;

import com.blog.config.H2TestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Base class for integration tests using embedded H2 database
 * Provides common test setup and configuration
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = {PersonalBlogApplication.class, H2TestConfiguration.class})
@TestPropertySource(locations = "classpath:application-test.yml")
@Transactional
public abstract class BaseIntegrationTest {

    @BeforeEach
    void setUp() throws Exception {
        // Create test directories for file storage
        createTestDirectories();
    }

    /**
     * Create necessary test directories for file storage
     */
    private void createTestDirectories() throws Exception {
        Path markdownPath = Paths.get("./test-data/markdown");
        Path imagesPath = Paths.get("./test-data/images");
        
        Files.createDirectories(markdownPath);
        Files.createDirectories(imagesPath);
        
        // Create sample markdown files for testing
        createSampleMarkdownFiles(markdownPath);
    }

    /**
     * Create sample markdown files for testing
     */
    private void createSampleMarkdownFiles(Path markdownPath) throws Exception {
        // Create test markdown file 1
        Path testFile1 = markdownPath.resolve("test-article-1.md");
        if (!Files.exists(testFile1)) {
            String content1 = "# Test Article 1\n\nThis is the content of test article 1.\n\n## Section 1\n\nSome content here.";
            Files.write(testFile1, content1.getBytes());
        }

        // Create draft markdown file
        Path draftFile = markdownPath.resolve("draft-article.md");
        if (!Files.exists(draftFile)) {
            String draftContent = "# Draft Article\n\nThis is a draft article content.\n\n- Item 1\n- Item 2";
            Files.write(draftFile, draftContent.getBytes());
        }

        // Create another test file
        Path testFile2 = markdownPath.resolve("another-test.md");
        if (!Files.exists(testFile2)) {
            String content2 = "# Another Test Article\n\nAnother test article content.\n\n```java\nSystem.out.println(\"Hello World\");\n```";
            Files.write(testFile2, content2.getBytes());
        }
    }
}