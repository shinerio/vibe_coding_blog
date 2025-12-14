package com.blog.service.impl;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import com.blog.exception.ArticleNotFoundException;
import com.blog.exception.ValidationException;
import com.blog.repository.ArticleRepository;
import com.blog.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ArticleServiceImpl implements ArticleService {
    
    private final ArticleRepository articleRepository;
    
    @Autowired
    public ArticleServiceImpl(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }
    
    @Override
    public Article createArticle(Article article) {
        validateArticle(article);
        
        // 检查slug是否已存在
        if (existsBySlug(article.getSlug())) {
            throw new ValidationException("文章slug已存在: " + article.getSlug());
        }
        
        // 设置默认状态
        if (article.getStatus() == null) {
            article.setStatus(ArticleStatus.DRAFT);
        }
        
        return articleRepository.save(article);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Article> getArticleById(Long id) {
        if (id == null) {
            throw new ValidationException("文章ID不能为空");
        }
        return articleRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Article> getArticleBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new ValidationException("文章slug不能为空");
        }
        return articleRepository.findBySlug(slug);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Article> getAllArticles(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByStatus(ArticleStatus status, Pageable pageable) {
        if (status == null) {
            throw new ValidationException("文章状态不能为空");
        }
        return articleRepository.findByStatus(status, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Article> searchArticlesByTitle(String title, Pageable pageable) {
        if (!StringUtils.hasText(title)) {
            throw new ValidationException("搜索标题不能为空");
        }
        return articleRepository.findByTitleContainingIgnoreCase(title, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByTag(String tag, Pageable pageable) {
        if (!StringUtils.hasText(tag)) {
            throw new ValidationException("标签不能为空");
        }
        return articleRepository.findByTagsContaining(tag, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Article> getArticlesByTags(List<String> tags, Pageable pageable) {
        if (tags == null || tags.isEmpty()) {
            throw new ValidationException("标签列表不能为空");
        }
        return articleRepository.findByTagsIn(tags, pageable);
    }
    
    @Override
    public Article updateArticle(Long id, Article updatedArticle) {
        Article existingArticle = articleRepository.findById(id)
            .orElseThrow(() -> new ArticleNotFoundException("文章不存在，ID: " + id));
        
        validateArticle(updatedArticle);
        
        // 检查slug是否被其他文章使用
        if (!existingArticle.getSlug().equals(updatedArticle.getSlug()) && 
            existsBySlug(updatedArticle.getSlug())) {
            throw new ValidationException("文章slug已存在: " + updatedArticle.getSlug());
        }
        
        // 更新字段
        existingArticle.setTitle(updatedArticle.getTitle());
        existingArticle.setSlug(updatedArticle.getSlug());
        existingArticle.setSummary(updatedArticle.getSummary());
        existingArticle.setContentPath(updatedArticle.getContentPath());
        
        if (updatedArticle.getTags() != null) {
            existingArticle.setTags(updatedArticle.getTags());
        }
        
        return articleRepository.save(existingArticle);
    }
    
    @Override
    public Article updateArticleStatus(Long id, ArticleStatus status) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ArticleNotFoundException("文章不存在，ID: " + id));
        
        if (status == null) {
            throw new ValidationException("文章状态不能为空");
        }
        
        article.setStatus(status);
        
        // 如果状态改为已发布，设置发布时间
        if (status == ArticleStatus.PUBLISHED && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        return articleRepository.save(article);
    }
    
    @Override
    public void deleteArticle(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new ArticleNotFoundException("文章不存在，ID: " + id);
        }
        articleRepository.deleteById(id);
    }
    
    @Override
    public Article publishArticle(Long id) {
        return updateArticleStatus(id, ArticleStatus.PUBLISHED);
    }
    
    @Override
    public Article archiveArticle(Long id) {
        return updateArticleStatus(id, ArticleStatus.ARCHIVED);
    }
    
    @Override
    public Article addTagToArticle(Long id, String tag) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ArticleNotFoundException("文章不存在，ID: " + id));
        
        if (!StringUtils.hasText(tag)) {
            throw new ValidationException("标签不能为空");
        }
        
        article.addTag(tag.trim());
        return articleRepository.save(article);
    }
    
    @Override
    public Article removeTagFromArticle(Long id, String tag) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ArticleNotFoundException("文章不存在，ID: " + id));
        
        if (!StringUtils.hasText(tag)) {
            throw new ValidationException("标签不能为空");
        }
        
        article.removeTag(tag.trim());
        return articleRepository.save(article);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            return false;
        }
        return articleRepository.existsBySlug(slug);
    }
    
    private void validateArticle(Article article) {
        if (article == null) {
            throw new ValidationException("文章对象不能为空");
        }
        
        if (!StringUtils.hasText(article.getTitle())) {
            throw new ValidationException("文章标题不能为空");
        }
        
        if (!StringUtils.hasText(article.getSlug())) {
            throw new ValidationException("文章slug不能为空");
        }
        
        if (!StringUtils.hasText(article.getContentPath())) {
            throw new ValidationException("文章内容路径不能为空");
        }
        
        // 验证slug格式（只允许字母、数字、连字符和下划线）
        if (!article.getSlug().matches("^[a-zA-Z0-9_-]+$")) {
            throw new ValidationException("文章slug格式不正确，只允许字母、数字、连字符和下划线");
        }
    }
}