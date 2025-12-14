package com.blog.service;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ArticleService {
    
    /**
     * 创建新文章
     */
    Article createArticle(Article article);
    
    /**
     * 根据ID获取文章
     */
    Optional<Article> getArticleById(Long id);
    
    /**
     * 根据slug获取文章
     */
    Optional<Article> getArticleBySlug(String slug);
    
    /**
     * 获取所有文章（分页）
     */
    Page<Article> getAllArticles(Pageable pageable);
    
    /**
     * 根据状态获取文章（分页）
     */
    Page<Article> getArticlesByStatus(ArticleStatus status, Pageable pageable);
    
    /**
     * 根据标题搜索文章（分页）
     */
    Page<Article> searchArticlesByTitle(String title, Pageable pageable);
    
    /**
     * 根据标签获取文章（分页）
     */
    Page<Article> getArticlesByTag(String tag, Pageable pageable);
    
    /**
     * 根据多个标签获取文章（分页）
     */
    Page<Article> getArticlesByTags(List<String> tags, Pageable pageable);
    
    /**
     * 更新文章
     */
    Article updateArticle(Long id, Article article);
    
    /**
     * 更新文章状态
     */
    Article updateArticleStatus(Long id, ArticleStatus status);
    
    /**
     * 删除文章
     */
    void deleteArticle(Long id);
    
    /**
     * 发布文章
     */
    Article publishArticle(Long id);
    
    /**
     * 归档文章
     */
    Article archiveArticle(Long id);
    
    /**
     * 为文章添加标签
     */
    Article addTagToArticle(Long id, String tag);
    
    /**
     * 从文章中移除标签
     */
    Article removeTagFromArticle(Long id, String tag);
    
    /**
     * 检查slug是否已存在
     */
    boolean existsBySlug(String slug);
}