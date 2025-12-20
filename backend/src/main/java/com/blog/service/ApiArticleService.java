package com.blog.service;

import com.blog.model.*;

/**
 * API服务接口，用于处理OpenAPI生成的模型类
 */
public interface ApiArticleService {

    /**
     * 获取文章列表
     */
    ArticlePageResponse getArticles(Integer page, Integer size, String title, String tags,
                                   ArticleStatus status, String sort, String direction);

    /**
     * 根据ID获取文章
     */
    java.util.Optional<ArticleResponse> getArticleById(Long id);

    /**
     * 创建文章
     */
    ArticleResponse createArticle(CreateArticleRequest request);

    /**
     * 更新文章
     */
    ArticleResponse updateArticle(Long id, UpdateArticleRequest request);

    /**
     * 删除文章
     */
    void deleteArticle(Long id);

    /**
     * 发布文章
     */
    ArticleResponse publishArticle(Long id);

    /**
     * 取消发布文章
     */
    ArticleResponse unpublishArticle(Long id);
}