package com.blog.service.impl;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import com.blog.model.*;
import com.blog.repository.ArticleRepository;
import com.blog.service.ApiArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * API服务实现类，处理OpenAPI生成的模型类与实体类之间的转换
 */
@Service
@Transactional
public class ApiArticleServiceImpl implements ApiArticleService {

    private static final Logger log = LoggerFactory.getLogger(ApiArticleServiceImpl.class);

    private final ArticleRepository articleRepository;

    public ApiArticleServiceImpl(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ArticlePageResponse getArticles(Integer page, Integer size, String title, String tags,
                                          com.blog.model.ArticleStatus status, String sort, String direction) {
        log.debug("获取文章列表 - page: {}, size: {}, title: {}, tags: {}, status: {}",
                page, size, title, tags, status);

        // 构建排序
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sortObj = Sort.by(sortDirection, sort);

        // 构建分页
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Article> articlePage;

        // 根据条件查询
        if (title != null && !title.trim().isEmpty()) {
            articlePage = articleRepository.findByTitleContainingIgnoreCase(title.trim(), pageable);
        } else if (status != null) {
            articlePage = articleRepository.findByStatus(convertApiStatusToEntity(status), pageable);
        } else {
            articlePage = articleRepository.findAll(pageable);
        }

        // 转换为响应模型
        List<ArticleResponse> articleResponses = articlePage.getContent().stream()
                .map(this::convertToArticleResponse)
                .collect(Collectors.toList());

        ArticlePageResponse response = new ArticlePageResponse()
                .content(articleResponses)
                .page(articlePage.getNumber())
                .size(articlePage.getSize())
                .totalElements(articlePage.getTotalElements())
                .totalPages(articlePage.getTotalPages())
                .first(articlePage.isFirst())
                .last(articlePage.isLast());

        log.debug("获取文章列表完成 - 返回 {} 条记录", articleResponses.size());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ArticleResponse> getArticleById(Long id) {
        log.debug("根据ID获取文章 - id: {}", id);

        return articleRepository.findById(id)
                .map(this::convertToArticleResponse);
    }

    @Override
    public ArticleResponse createArticle(CreateArticleRequest request) {
        log.debug("创建文章 - title: {}", request.getTitle());

        // 创建文章实体
        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setStatus(request.getStatus() != null ? convertApiStatusToEntity(request.getStatus()) : ArticleStatus.DRAFT);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());

        // 生成slug（基于标题）
        String slug = generateSlugFromTitle(request.getTitle());
        article.setSlug(slug);

        // 处理标签
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            article.setTags(request.getTags());
        }

        // 设置内容路径
        article.setContentPath("/data/markdown/" + slug + ".md");

        // 如果是发布状态，设置发布时间
        if (ArticleStatus.PUBLISHED.equals(article.getStatus()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        // 保存文章
        Article savedArticle = articleRepository.save(article);

        log.info("文章创建成功 - id: {}, title: {}", savedArticle.getId(), savedArticle.getTitle());
        return convertToArticleResponse(savedArticle);
    }

    @Override
    public ArticleResponse updateArticle(Long id, UpdateArticleRequest request) {
        log.debug("更新文章 - id: {}, title: {}", id, request.getTitle());

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("文章不存在: " + id));

        // 更新字段
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            article.setTitle(request.getTitle().trim());
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
        }
        if (request.getStatus() != null) {
            article.setStatus(convertApiStatusToEntity(request.getStatus()));
            // 如果状态变为发布且还没有发布时间，设置发布时间
            if (ArticleStatus.PUBLISHED.equals(article.getStatus()) && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }
        if (request.getTags() != null) {
            article.setTags(request.getTags());
        }

        article.setUpdatedAt(LocalDateTime.now());

        Article savedArticle = articleRepository.save(article);

        log.info("文章更新成功 - id: {}, title: {}", savedArticle.getId(), savedArticle.getTitle());
        return convertToArticleResponse(savedArticle);
    }

    @Override
    public void deleteArticle(Long id) {
        log.debug("删除文章 - id: {}", id);

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("文章不存在: " + id));

        // 删除文章记录（在实际项目中，内容文件的删除应该由专门的文件服务处理）
        articleRepository.delete(article);

        log.info("文章删除成功 - id: {}", id);
    }

    @Override
    public ArticleResponse publishArticle(Long id) {
        log.debug("发布文章 - id: {}", id);

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("文章不存在: " + id));

        // 更新状态为发布
        article.setStatus(ArticleStatus.PUBLISHED);

        // 如果还没有发布时间，设置发布时间
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        article.setUpdatedAt(LocalDateTime.now());

        Article savedArticle = articleRepository.save(article);

        log.info("文章发布成功 - id: {}, title: {}", savedArticle.getId(), savedArticle.getTitle());
        return convertToArticleResponse(savedArticle);
    }

    @Override
    public ArticleResponse unpublishArticle(Long id) {
        log.debug("取消发布文章 - id: {}", id);

        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("文章不存在: " + id));

        // 更新状态为草稿
        article.setStatus(ArticleStatus.DRAFT);
        article.setUpdatedAt(LocalDateTime.now());
        // 注意：不清除发布时间，保留历史记录

        Article savedArticle = articleRepository.save(article);

        log.info("文章取消发布成功 - id: {}, title: {}", savedArticle.getId(), savedArticle.getTitle());
        return convertToArticleResponse(savedArticle);
    }

    /**
     * 将实体转换为响应模型
     */
    private ArticleResponse convertToArticleResponse(Article article) {
        ArticleResponse response = new ArticleResponse()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .status(convertEntityStatusToApi(article.getStatus()))
                .tags(article.getTags() != null ? article.getTags() : List.of())
                .createdAt(article.getCreatedAt().atOffset(java.time.ZoneOffset.UTC))
                .updatedAt(article.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC));

        // 正确处理publishedAt字段
        if (article.getPublishedAt() != null) {
            response.publishedAt(article.getPublishedAt().atOffset(java.time.ZoneOffset.UTC));
        } else {
            // 明确设置为null，避免JsonNullable的{"present":true}序列化问题
            response.setPublishedAt(org.openapitools.jackson.nullable.JsonNullable.of(null));
        }

        return response;
    }

    /**
     * 将API状态枚举转换为实体状态枚举
     */
    private ArticleStatus convertApiStatusToEntity(com.blog.model.ArticleStatus apiStatus) {
        if (apiStatus == null) {
            return ArticleStatus.DRAFT;
        }
        switch (apiStatus) {
            case PUBLISHED:
                return ArticleStatus.PUBLISHED;
            case DRAFT:
                return ArticleStatus.DRAFT;
            case ARCHIVED:
                return ArticleStatus.ARCHIVED;
            default:
                return ArticleStatus.DRAFT;
        }
    }

    /**
     * 将实体状态枚举转换为API状态枚举
     */
    private com.blog.model.ArticleStatus convertEntityStatusToApi(ArticleStatus entityStatus) {
        if (entityStatus == null) {
            return com.blog.model.ArticleStatus.DRAFT;
        }
        switch (entityStatus) {
            case PUBLISHED:
                return com.blog.model.ArticleStatus.PUBLISHED;
            case DRAFT:
                return com.blog.model.ArticleStatus.DRAFT;
            case ARCHIVED:
                return com.blog.model.ArticleStatus.ARCHIVED;
            default:
                return com.blog.model.ArticleStatus.DRAFT;
        }
    }

    /**
     * 从标题生成slug
     */
    private String generateSlugFromTitle(String title) {
        return title
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-+|-+$", "")
                + "-" + System.currentTimeMillis();
    }
}