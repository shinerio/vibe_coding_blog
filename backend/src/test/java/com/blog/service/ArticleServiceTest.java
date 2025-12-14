package com.blog.service;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import com.blog.exception.ArticleNotFoundException;
import com.blog.exception.ValidationException;
import com.blog.repository.ArticleRepository;
import com.blog.service.impl.ArticleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {
    
    @Mock
    private ArticleRepository articleRepository;
    
    @InjectMocks
    private ArticleServiceImpl articleService;
    
    private Article testArticle;
    
    @BeforeEach
    void setUp() {
        testArticle = new Article();
        testArticle.setId(1L);
        testArticle.setTitle("测试文章");
        testArticle.setSlug("test-article");
        testArticle.setContentPath("test-article.md");
        testArticle.setStatus(ArticleStatus.DRAFT);
        testArticle.setCreatedAt(LocalDateTime.now());
        testArticle.setUpdatedAt(LocalDateTime.now());
    }
    
    @Test
    void createArticle_Success() {
        // Given
        when(articleRepository.existsBySlug(testArticle.getSlug())).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);
        
        // When
        Article result = articleService.createArticle(testArticle);
        
        // Then
        assertNotNull(result);
        assertEquals(testArticle.getTitle(), result.getTitle());
        assertEquals(testArticle.getSlug(), result.getSlug());
        verify(articleRepository).existsBySlug(testArticle.getSlug());
        verify(articleRepository).save(testArticle);
    }
    
    @Test
    void createArticle_DuplicateSlug_ThrowsException() {
        // Given
        when(articleRepository.existsBySlug(testArticle.getSlug())).thenReturn(true);
        
        // When & Then
        ValidationException exception = assertThrows(ValidationException.class, 
            () -> articleService.createArticle(testArticle));
        assertEquals("文章slug已存在: " + testArticle.getSlug(), exception.getMessage());
        verify(articleRepository).existsBySlug(testArticle.getSlug());
        verify(articleRepository, never()).save(any());
    }
    
    @Test
    void createArticle_NullArticle_ThrowsException() {
        // When & Then
        ValidationException exception = assertThrows(ValidationException.class, 
            () -> articleService.createArticle(null));
        assertEquals("文章对象不能为空", exception.getMessage());
    }
    
    @Test
    void createArticle_EmptyTitle_ThrowsException() {
        // Given
        testArticle.setTitle("");
        
        // When & Then
        ValidationException exception = assertThrows(ValidationException.class, 
            () -> articleService.createArticle(testArticle));
        assertEquals("文章标题不能为空", exception.getMessage());
    }
    
    @Test
    void getArticleById_Success() {
        // Given
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        
        // When
        Optional<Article> result = articleService.getArticleById(1L);
        
        // Then
        assertTrue(result.isPresent());
        assertEquals(testArticle.getId(), result.get().getId());
        verify(articleRepository).findById(1L);
    }
    
    @Test
    void getArticleById_NotFound() {
        // Given
        when(articleRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When
        Optional<Article> result = articleService.getArticleById(1L);
        
        // Then
        assertFalse(result.isPresent());
        verify(articleRepository).findById(1L);
    }
    
    @Test
    void getArticleById_NullId_ThrowsException() {
        // When & Then
        ValidationException exception = assertThrows(ValidationException.class, 
            () -> articleService.getArticleById(null));
        assertEquals("文章ID不能为空", exception.getMessage());
    }
    
    @Test
    void getArticleBySlug_Success() {
        // Given
        when(articleRepository.findBySlug("test-article")).thenReturn(Optional.of(testArticle));
        
        // When
        Optional<Article> result = articleService.getArticleBySlug("test-article");
        
        // Then
        assertTrue(result.isPresent());
        assertEquals(testArticle.getSlug(), result.get().getSlug());
        verify(articleRepository).findBySlug("test-article");
    }
    
    @Test
    void getAllArticles_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<Article> articles = Arrays.asList(testArticle);
        Page<Article> page = new PageImpl<>(articles, pageable, 1);
        when(articleRepository.findAll(pageable)).thenReturn(page);
        
        // When
        Page<Article> result = articleService.getAllArticles(pageable);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testArticle.getId(), result.getContent().get(0).getId());
        verify(articleRepository).findAll(pageable);
    }
    
    @Test
    void updateArticle_Success() {
        // Given
        Article updatedArticle = new Article();
        updatedArticle.setTitle("更新的标题");
        updatedArticle.setSlug("updated-article");
        updatedArticle.setContentPath("updated-article.md");
        
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.existsBySlug("updated-article")).thenReturn(false);
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);
        
        // When
        Article result = articleService.updateArticle(1L, updatedArticle);
        
        // Then
        assertNotNull(result);
        verify(articleRepository).findById(1L);
        verify(articleRepository).save(testArticle);
    }
    
    @Test
    void updateArticle_NotFound_ThrowsException() {
        // Given
        Article updatedArticle = new Article();
        updatedArticle.setTitle("更新的标题");
        updatedArticle.setSlug("updated-article");
        updatedArticle.setContentPath("updated-article.md");
        
        when(articleRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        ArticleNotFoundException exception = assertThrows(ArticleNotFoundException.class, 
            () -> articleService.updateArticle(1L, updatedArticle));
        assertEquals("文章不存在，ID: 1", exception.getMessage());
        verify(articleRepository).findById(1L);
        verify(articleRepository, never()).save(any());
    }
    
    @Test
    void publishArticle_Success() {
        // Given
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);
        
        // When
        Article result = articleService.publishArticle(1L);
        
        // Then
        assertNotNull(result);
        verify(articleRepository).findById(1L);
        verify(articleRepository).save(testArticle);
    }
    
    @Test
    void deleteArticle_Success() {
        // Given
        when(articleRepository.existsById(1L)).thenReturn(true);
        
        // When
        articleService.deleteArticle(1L);
        
        // Then
        verify(articleRepository).existsById(1L);
        verify(articleRepository).deleteById(1L);
    }
    
    @Test
    void deleteArticle_NotFound_ThrowsException() {
        // Given
        when(articleRepository.existsById(1L)).thenReturn(false);
        
        // When & Then
        ArticleNotFoundException exception = assertThrows(ArticleNotFoundException.class, 
            () -> articleService.deleteArticle(1L));
        assertEquals("文章不存在，ID: 1", exception.getMessage());
        verify(articleRepository).existsById(1L);
        verify(articleRepository, never()).deleteById(any());
    }
    
    @Test
    void addTagToArticle_Success() {
        // Given
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        when(articleRepository.save(any(Article.class))).thenReturn(testArticle);
        
        // When
        Article result = articleService.addTagToArticle(1L, "java");
        
        // Then
        assertNotNull(result);
        verify(articleRepository).findById(1L);
        verify(articleRepository).save(testArticle);
    }
    
    @Test
    void addTagToArticle_EmptyTag_ThrowsException() {
        // Given
        when(articleRepository.findById(1L)).thenReturn(Optional.of(testArticle));
        
        // When & Then
        ValidationException exception = assertThrows(ValidationException.class, 
            () -> articleService.addTagToArticle(1L, ""));
        assertEquals("标签不能为空", exception.getMessage());
    }
    
    @Test
    void existsBySlug_True() {
        // Given
        when(articleRepository.existsBySlug("test-article")).thenReturn(true);
        
        // When
        boolean result = articleService.existsBySlug("test-article");
        
        // Then
        assertTrue(result);
        verify(articleRepository).existsBySlug("test-article");
    }
    
    @Test
    void existsBySlug_False() {
        // Given
        when(articleRepository.existsBySlug("non-existent")).thenReturn(false);
        
        // When
        boolean result = articleService.existsBySlug("non-existent");
        
        // Then
        assertFalse(result);
        verify(articleRepository).existsBySlug("non-existent");
    }
}