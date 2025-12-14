package com.blog.service;

import com.blog.entity.Image;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * 图片处理服务接口
 * 提供图片上传、Base64转换、存储和检索功能
 */
public interface ImageService {
    
    /**
     * 上传图片文件并转换为Base64格式存储
     * 
     * @param file 上传的图片文件
     * @param description 图片描述（可选）
     * @return 保存的图片实体
     * @throws IllegalArgumentException 当文件格式不支持或大小超限时
     * @throws RuntimeException 当文件处理失败时
     */
    Image uploadImage(MultipartFile file, String description);
    
    /**
     * 根据ID获取图片信息
     * 
     * @param id 图片ID
     * @return 图片实体，如果不存在则返回空
     */
    Optional<Image> getImageById(Long id);
    
    /**
     * 删除图片
     * 
     * @param id 图片ID
     * @return 是否删除成功
     */
    boolean deleteImage(Long id);
    
    /**
     * 将MultipartFile转换为Base64字符串
     * 
     * @param file 文件
     * @return Base64编码的字符串
     * @throws RuntimeException 当转换失败时
     */
    String convertToBase64(MultipartFile file);
    
    /**
     * 验证图片文件格式和大小
     * 
     * @param file 文件
     * @throws IllegalArgumentException 当验证失败时
     */
    void validateImageFile(MultipartFile file);
}