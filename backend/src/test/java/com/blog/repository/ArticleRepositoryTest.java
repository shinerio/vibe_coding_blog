package com.blog.repository;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(excludeAutoConfiguration = {})
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.yml")
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class ArticleRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private ArticleRepository articleRepository;
    
    private Article testArticle1;
    private Article testArticle2;
    
    @BeforeEach
    void setUp() {
        testArticle1 = new Article();
        testArticle1.setTitle("第一篇文章");
        testArticle1.setSlug("first-article");
        testArticle1.setContentPath("first-article.md");
        testArticle1.setStatus(ArticleStatus.PUBLISHED);
        testArticle1.setSummary("这是第一篇文章的摘要");
        testArticle1.setTags(Arrays.asList("java", "spring"));
        testArticle1.setPublishedAt(LocalDateTime.now().minusDays(1));
        
        testArticle2 = new Article();
        testArticle2.setTitle("第二篇文章");
        testArticle2.setSlug("second-article");
        testArticle2.setContentPath("second-article.md");
        testArticle2.setStatus(ArticleStatus.DRAFT);
        testArticle2.setSummary("这是第二篇文章的摘要");
        testArticle2.setTags(Arrays.asList("javascript", "react"));
        
        entityManager.persistAndFlush(testArticle1);
        entityManager.persistAndFlush(testArticle2);
    }
    
    @Test
    void findBySlug_Success() {
        // When
        Optional<Article> result = articleRepository.findBySlug("first-article");
        
        // Then
        assertTrue(result.isPresent());
        assertEquals("第一篇文章", result.get().getTitle());
        assertEquals("first-article", result.get().getSlug());
    }
    
    @Test
    void findBySlug_NotFound() {
        // When
        Optional<Article> result = articleRepository.findBySlug("non-existent");
        
        // Then
        assertFalse(result.isPresent());
    }
    
    @Test
    void existsBySlug_True() {
        // When
        boolean result = articleRepository.existsBySlug("first-article");
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void existsBySlug_False() {
        // When
        boolean result = articleRepository.existsBySlug("non-existent");
        
        // Then
        assertFalse(result);
    }
    
    @Test
    void findByStatus_Published() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByStatus(ArticleStatus.PUBLISHED, pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("第一篇文章", result.getContent().get(0).getTitle());
        assertEquals(ArticleStatus.PUBLISHED, result.getContent().get(0).getStatus());
    }
    
    @Test
    void findByStatus_Draft() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByStatus(ArticleStatus.DRAFT, pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("第二篇文章", result.getContent().get(0).getTitle());
        assertEquals(ArticleStatus.DRAFT, result.getContent().get(0).getStatus());
    }
    
    @Test
    void findByTitleContainingIgnoreCase_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByTitleContainingIgnoreCase("第一", pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("第一篇文章", result.getContent().get(0).getTitle());
    }
    
    @Test
    void findByTitleContainingIgnoreCase_CaseInsensitive() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByTitleContainingIgnoreCase("文章", pageable);
        
        // Then
        assertEquals(2, result.getTotalElements());
    }
    
    @Test
    void findByTagsContaining_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByTagsContaining("java", pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("第一篇文章", result.getContent().get(0).getTitle());
        assertTrue(result.getContent().get(0).getTags().contains("java"));
    }
    
    @Test
    void findByTagsIn_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<String> tags = Arrays.asList("java", "javascript");
        
        // When
        Page<Article> result = articleRepository.findByTagsIn(tags, pageable);
        
        // Then
        assertEquals(2, result.getTotalElements());
    }
    
    @Test
    void findByOrderByCreatedAtDesc_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.findByOrderByCreatedAtDesc(pageable);
        
        // Then
        assertEquals(2, result.getTotalElements());
        // 验证按创建时间降序排列
        assertTrue(result.getContent().get(0).getCreatedAt().isAfter(result.getContent().get(1).getCreatedAt()) ||
                  result.getContent().get(0).getCreatedAt().isEqual(result.getContent().get(1).getCreatedAt()));
    }
    
    @Test
    void searchArticles_ByTitle() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.searchArticles("第一", null, null, null, pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("第一篇文章", result.getContent().get(0).getTitle());
    }
    
    @Test
    void searchArticles_ByStatus() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.searchArticles(null, null, null, ArticleStatus.PUBLISHED, pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals(ArticleStatus.PUBLISHED, result.getContent().get(0).getStatus());
    }
    
    @Test
    void searchArticles_ByTag() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Article> result = articleRepository.searchArticles(null, null, "java", null, pageable);
        
        // Then
        assertEquals(1, result.getTotalElements());
        assertTrue(result.getContent().get(0).getTags().contains("java"));
    }
    
    @Test
    void countByStatus_Success() {
        // When
        long publishedCount = articleRepository.countByStatus(ArticleStatus.PUBLISHED);
        long draftCount = articleRepository.countByStatus(ArticleStatus.DRAFT);
        
        // Then
        assertEquals(1, publishedCount);
        assertEquals(1, draftCount);
    }
    
    @Test
    void countByTagsContaining_Success() {
        // When
        long javaCount = articleRepository.countByTagsContaining("java");
        long reactCount = articleRepository.countByTagsContaining("react");
        
        // Then
        assertEquals(1, javaCount);
        assertEquals(1, reactCount);
    }
}