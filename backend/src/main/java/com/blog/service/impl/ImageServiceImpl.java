package com.blog.service.impl;

import com.blog.entity.Image;
import com.blog.exception.ImageNotFoundException;
import com.blog.repository.ImageRepository;
import com.blog.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * 图片处理服务实现类
 */
@Service
@Transactional
public class ImageServiceImpl implements ImageService {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageServiceImpl.class);
    
    // 支持的图片格式
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    // 最大文件大小：5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    @Autowired
    private ImageRepository imageRepository;
    
    @Value("${app.image.storage.path:data/images}")
    private String imageStoragePath;
    
    @Override
    public Image uploadImage(MultipartFile file, String description) {
        logger.info("开始上传图片: {}", file.getOriginalFilename());
        
        // 验证文件
        validateImageFile(file);
        
        try {
            // 生成唯一文件名
            String filename = generateUniqueFilename(file.getOriginalFilename());
            
            // 创建存储目录
            Path storageDir = Paths.get(imageStoragePath);
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }
            
            // 保存文件到磁盘
            Path filePath = storageDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // 转换为Base64
            String base64Content = convertToBase64(file);
            
            // 创建图片实体
            Image image = new Image();
            image.setFilename(filename);
            image.setOriginalName(file.getOriginalFilename());
            image.setFilePath(filePath.toString());
            image.setFileSize(file.getSize());
            image.setMimeType(file.getContentType());
            image.setBase64Content(base64Content);
            
            // 保存到数据库
            Image savedImage = imageRepository.save(image);
            
            logger.info("图片上传成功: ID={}, 文件名={}", savedImage.getId(), filename);
            return savedImage;
            
        } catch (IOException e) {
            logger.error("图片上传失败: {}", e.getMessage(), e);
            throw new RuntimeException("图片上传失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Image> getImageById(Long id) {
        logger.debug("获取图片信息: ID={}", id);
        return imageRepository.findById(id);
    }
    
    @Override
    public boolean deleteImage(Long id) {
        logger.info("删除图片: ID={}", id);
        
        Optional<Image> imageOpt = imageRepository.findById(id);
        if (imageOpt.isEmpty()) {
            logger.warn("图片不存在: ID={}", id);
            return false;
        }
        
        Image image = imageOpt.get();
        
        try {
            // 删除磁盘文件
            Path filePath = Paths.get(image.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.debug("删除磁盘文件: {}", filePath);
            }
            
            // 删除数据库记录
            imageRepository.delete(image);
            
            logger.info("图片删除成功: ID={}", id);
            return true;
            
        } catch (IOException e) {
            logger.error("删除图片文件失败: {}", e.getMessage(), e);
            // 即使文件删除失败，也删除数据库记录
            imageRepository.delete(image);
            return true;
        }
    }
    
    @Override
    public String convertToBase64(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            return Base64.getEncoder().encodeToString(fileBytes);
        } catch (IOException e) {
            logger.error("Base64转换失败: {}", e.getMessage(), e);
            throw new RuntimeException("Base64转换失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                String.format("文件大小超过限制，最大允许 %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }
        
        // 验证MIME类型
        String mimeType = file.getContentType();
        if (mimeType == null || !SUPPORTED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new IllegalArgumentException(
                "不支持的文件格式，支持的格式: " + String.join(", ", SUPPORTED_MIME_TYPES)
            );
        }
        
        // 验证文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !hasValidImageExtension(originalFilename)) {
            throw new IllegalArgumentException("文件扩展名不正确");
        }
        
        logger.debug("文件验证通过: {}, 大小: {} bytes, MIME: {}", 
                    originalFilename, file.getSize(), mimeType);
    }
    
    /**
     * 生成唯一的文件名
     */
    private String generateUniqueFilename(String originalFilename) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFilename);
        return String.format("%s_%s%s", timestamp, uuid, extension);
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }
    
    /**
     * 验证图片文件扩展名
     */
    private boolean hasValidImageExtension(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp").contains(extension);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Image> getImages(Pageable pageable) {
        logger.debug("获取图片列表 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return imageRepository.findAll(pageable);
    }
}