package com.blog.controller;

import com.blog.api.ImagesApi;
import com.blog.entity.Image;
import com.blog.exception.ImageNotFoundException;
import com.blog.model.ImageResponse;
import com.blog.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

/**
 * 图片管理控制器
 * 实现图片上传、获取和删除的REST API
 */
@RestController
public class ImageController implements ImagesApi {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    
    @Autowired
    private ImageService imageService;
    
    @Override
    public ResponseEntity<ImageResponse> imagesPost(MultipartFile file, String description) {
        logger.info("接收图片上传请求: 文件名={}, 描述={}", 
                   file.getOriginalFilename(), description);
        
        try {
            Image savedImage = imageService.uploadImage(file, description);
            ImageResponse response = convertToImageResponse(savedImage);
            
            logger.info("图片上传成功: ID={}", savedImage.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("图片上传参数错误: {}", e.getMessage());
            throw e; // 将由GlobalExceptionHandler处理
        } catch (Exception e) {
            logger.error("图片上传失败: {}", e.getMessage(), e);
            throw new RuntimeException("图片上传失败", e);
        }
    }
    
    @Override
    public ResponseEntity<ImageResponse> imagesIdGet(Long id) {
        logger.debug("获取图片信息: ID={}", id);
        
        Optional<Image> imageOpt = imageService.getImageById(id);
        if (imageOpt.isEmpty()) {
            logger.warn("图片不存在: ID={}", id);
            throw new ImageNotFoundException(id);
        }
        
        Image image = imageOpt.get();
        ImageResponse response = convertToImageResponse(image);
        
        logger.debug("成功获取图片信息: ID={}", id);
        return ResponseEntity.ok(response);
    }
    
    @Override
    public ResponseEntity<Void> imagesIdDelete(Long id) {
        logger.info("删除图片请求: ID={}", id);
        
        boolean deleted = imageService.deleteImage(id);
        if (!deleted) {
            logger.warn("图片不存在，无法删除: ID={}", id);
            throw new ImageNotFoundException(id);
        }
        
        logger.info("图片删除成功: ID={}", id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 将Image实体转换为ImageResponse
     */
    private ImageResponse convertToImageResponse(Image image) {
        ImageResponse response = new ImageResponse();
        response.setId(image.getId());
        response.setFilename(image.getFilename());
        response.setOriginalName(image.getOriginalName());
        response.setFilePath(image.getFilePath());
        response.setFileSize(image.getFileSize());
        response.setMimeType(image.getMimeType());
        response.setBase64Content(image.getBase64Content());
        
        // 转换LocalDateTime为OffsetDateTime
        if (image.getCreatedAt() != null) {
            OffsetDateTime offsetDateTime = image.getCreatedAt().atOffset(ZoneOffset.UTC);
            response.setCreatedAt(offsetDateTime);
        }
        
        return response;
    }
}