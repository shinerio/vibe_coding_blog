package com.blog.controller;

import com.blog.api.FilesApi;
import com.blog.entity.Article;
import com.blog.model.ErrorResponse;
import com.blog.model.ErrorResponseError;
import com.blog.model.FileOperationResponse;
import com.blog.repository.ArticleRepository;
import com.blog.service.FileService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * 文件操作REST控制器
 * 实现FilesApi接口，处理Markdown文件的读写操作
 */
@RestController
@RequestMapping("/")
public class FilesController implements FilesApi {

    private static final Logger log = LoggerFactory.getLogger(FilesController.class);

    private final FileService fileService;
    private final ArticleRepository articleRepository;
    private final ObjectMapper objectMapper;

    public FilesController(FileService fileService, ArticleRepository articleRepository, ObjectMapper objectMapper) {
        this.fileService = fileService;
        this.articleRepository = articleRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public ResponseEntity<String> filesMarkdownArticleIdGet(
            @Parameter(name = "articleId", description = "文章ID", in = ParameterIn.PATH) @PathVariable("articleId") Long articleId) {
        try {
            log.info("获取Markdown文件内容 - articleId: {}", articleId);

            // 获取文章信息
            Optional<Article> articleOpt = articleRepository.findById(articleId);
            if (articleOpt.isEmpty()) {
                log.warn("文章不存在 - articleId: {}", articleId);
                ErrorResponseError errorError = new ErrorResponseError()
                        .code("404")
                        .message("文章不存在")
                        .path("/files/markdown/" + articleId)
                        .details("Article with id " + articleId + " not found")
                        .timestamp(OffsetDateTime.now());
                ErrorResponse error = new ErrorResponse()
                        .error(errorError);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error.toString());
            }

            Article article = articleOpt.get();
            String contentPath = article.getContentPath();

            // 读取Markdown文件
            String content = fileService.readMarkdownFile(contentPath);

            log.info("成功读取Markdown文件 - articleId: {}, filePath: {}", articleId, contentPath);
            return ResponseEntity.ok(content);

        } catch (Exception e) {
            log.error("获取Markdown文件内容失败 - articleId: {}", articleId, e);
            ErrorResponseError errorError = new ErrorResponseError()
                    .code("500")
                    .message("服务器内部错误")
                    .path("/files/markdown/" + articleId)
                    .details(e.getMessage())
                    .timestamp(OffsetDateTime.now());
            ErrorResponse error = new ErrorResponse()
                    .error(errorError);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error.toString());
        }
    }

    @Override
    public ResponseEntity<FileOperationResponse> filesMarkdownArticleIdPut(
            @Parameter(name = "articleId", description = "文章ID", in = ParameterIn.PATH) @PathVariable("articleId") Long articleId,
            @Parameter(name = "body", description = "") @RequestBody(required = false) String body) {
        try {
            log.info("保存Markdown文件内容 - articleId: {}, contentLength: {}", articleId, body != null ? body.length() : 0);

            // 获取文章信息
            Optional<Article> articleOpt = articleRepository.findById(articleId);
            if (articleOpt.isEmpty()) {
                log.warn("文章不存在 - articleId: {}", articleId);
                FileOperationResponse response = new FileOperationResponse()
                        .success(false)
                        .filePath("")
                        .message("文章不存在")
                        .timestamp(OffsetDateTime.now());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Article article = articleOpt.get();
            String contentPath = article.getContentPath();

            // 解析内容，支持JSON和纯文本格式
            String content = parseContentFromBody(body);

            // 检查文件是否存在，如果不存在则创建
            if (!fileService.fileExists(contentPath)) {
                log.info("Markdown文件不存在，创建新文件 - articleId: {}, filePath: {}", articleId, contentPath);
                // 从contentPath中提取文件名
                String filename = contentPath.substring(contentPath.lastIndexOf('/') + 1);
                String newFilePath = fileService.saveMarkdownFile(filename, content);

                // 更新文章的contentPath
                article.setContentPath(newFilePath);
                articleRepository.save(article);

                contentPath = newFilePath;
            } else {
                // 更新现有文件
                fileService.updateMarkdownFile(contentPath, content);
            }

            log.info("成功保存Markdown文件 - articleId: {}, filePath: {}", articleId, contentPath);

            FileOperationResponse response = new FileOperationResponse()
                    .success(true)
                    .filePath(contentPath)
                    .message("Markdown文件保存成功")
                    .timestamp(OffsetDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("保存Markdown文件内容失败 - articleId: {}", articleId, e);

            FileOperationResponse response = new FileOperationResponse()
                    .success(false)
                    .filePath("")
                    .message("保存失败: " + e.getMessage())
                    .timestamp(OffsetDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 解析请求体中的内容
     * 支持JSON格式：{"content": "markdown内容"} 或 {"body": "markdown内容"}
     * 支持纯文本格式："markdown内容"
     */
    private String parseContentFromBody(String body) {
        if (body == null || body.trim().isEmpty()) {
            return "";
        }

        // 尝试解析为JSON
        try {
            JsonNode jsonNode = objectMapper.readTree(body);

            // 优先查找content字段
            if (jsonNode.has("content")) {
                return jsonNode.get("content").asText();
            }

            // 其次查找body字段
            if (jsonNode.has("body")) {
                return jsonNode.get("body").asText();
            }

            // 如果没有找到特定字段，返回整个JSON字符串
            return body;

        } catch (IOException e) {
            // 如果不是JSON格式，直接返回原文本
            log.debug("请求体不是JSON格式，作为纯文本处理");
            return body;
        }
    }

    /**
     * 处理OPTIONS预检请求
     */
    @RequestMapping(value = "/files", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleFilesOptions() {
        return ResponseEntity.ok().build();
    }

    /**
     * 处理OPTIONS预检请求
     */
    @RequestMapping(value = "/files/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleFileDetailOptions() {
        return ResponseEntity.ok().build();
    }
}