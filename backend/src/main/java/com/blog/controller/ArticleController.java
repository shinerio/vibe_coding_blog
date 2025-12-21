package com.blog.controller;

import com.blog.api.ArticlesApi;
import com.blog.model.*;
import com.blog.service.ApiArticleService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.Optional;

/**
 * 文章管理REST控制器
 * 实现ArticlesApi接口，提供文章的CRUD操作
 */
@RestController
@RequestMapping("/")
public class ArticleController implements ArticlesApi {

    private static final Logger log = LoggerFactory.getLogger(ArticleController.class);

    private final ApiArticleService apiArticleService;

    public ArticleController(ApiArticleService apiArticleService) {
        this.apiArticleService = apiArticleService;
    }

    @Override
    public ResponseEntity<ArticlePageResponse> articlesGet(
            @Min(0) @Parameter(name = "page", description = "页码，从0开始", in = ParameterIn.QUERY) @Valid @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @Min(1) @Max(100) @Parameter(name = "size", description = "每页数量", in = ParameterIn.QUERY) @Valid @RequestParam(value = "size", required = false, defaultValue = "20") Integer size,
            @Parameter(name = "title", description = "按标题搜索", in = ParameterIn.QUERY) @Valid @RequestParam(value = "title", required = false) String title,
            @Parameter(name = "tags", description = "按标签筛选，多个标签用逗号分隔", in = ParameterIn.QUERY) @Valid @RequestParam(value = "tags", required = false) String tags,
            @Parameter(name = "status", description = "按状态筛选", in = ParameterIn.QUERY) @Valid @RequestParam(value = "status", required = false) ArticleStatus status,
            @Parameter(name = "sort", description = "排序字段", in = ParameterIn.QUERY) @Valid @RequestParam(value = "sort", required = false, defaultValue = "createdAt") String sort,
            @Parameter(name = "direction", description = "排序方向", in = ParameterIn.QUERY) @Valid @RequestParam(value = "direction", required = false, defaultValue = "desc") String direction) {

        try {
            log.info("获取文章列表 - page: {}, size: {}, title: {}, tags: {}, status: {}",
                    page, size, title, tags, status);

            ArticlePageResponse response = apiArticleService.getArticles(page, size, title, tags, status, sort, direction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取文章列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<ArticleResponse> articlesPost(@Valid @RequestBody CreateArticleRequest createArticleRequest) {
        try {
            log.info("创建文章 - title: {}", createArticleRequest.getTitle());

            ArticleResponse response = apiArticleService.createArticle(createArticleRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("创建文章失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<ArticleResponse> articlesIdGet(
            @Parameter(name = "id", description = "文章ID", in = ParameterIn.PATH) @PathVariable("id") Long id) {
        try {
            log.info("获取文章详情 - id: {}", id);

            Optional<ArticleResponse> article = apiArticleService.getArticleById(id);
            if (article.isPresent()) {
                return ResponseEntity.ok(article.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("获取文章详情失败 - id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<ArticleResponse> articlesIdPut(
            @Parameter(name = "id", description = "文章ID", in = ParameterIn.PATH) @PathVariable("id") Long id,
            @Valid @RequestBody UpdateArticleRequest updateArticleRequest) {
        try {
            log.info("更新文章 - id: {}, title: {}", id, updateArticleRequest.getTitle());

            ArticleResponse response = apiArticleService.updateArticle(id, updateArticleRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("更新文章失败 - id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<Void> articlesIdDelete(
            @Parameter(name = "id", description = "文章ID", in = ParameterIn.PATH) @PathVariable("id") Long id) {
        try {
            log.info("删除文章 - id: {}", id);

            apiArticleService.deleteArticle(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("删除文章失败 - id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 发布文章
     */
    @PatchMapping("/articles/{id}/publish")
    public ResponseEntity<ArticleResponse> publishArticle(
            @Parameter(name = "id", description = "文章ID", in = ParameterIn.PATH) @PathVariable("id") Long id) {
        try {
            log.info("发布文章 - id: {}", id);

            ArticleResponse response = apiArticleService.publishArticle(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("发布文章失败 - id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 取消发布文章
     */
    @PatchMapping("/articles/{id}/unpublish")
    public ResponseEntity<ArticleResponse> unpublishArticle(
            @Parameter(name = "id", description = "文章ID", in = ParameterIn.PATH) @PathVariable("id") Long id) {
        try {
            log.info("取消发布文章 - id: {}", id);

            ArticleResponse response = apiArticleService.unpublishArticle(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("取消发布文章失败 - id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 处理OPTIONS预检请求
     */
    @RequestMapping(value = "/articles", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleArticlesOptions() {
        return ResponseEntity.ok().build();
    }

    /**
     * 处理OPTIONS预检请求
     */
    @RequestMapping(value = "/articles/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleArticleDetailOptions() {
        return ResponseEntity.ok().build();
    }
}