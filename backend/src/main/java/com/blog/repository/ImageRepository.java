package com.blog.repository;

import com.blog.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 图片数据访问接口
 */
@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    
    /**
     * 根据文件名查找图片
     * 
     * @param filename 文件名
     * @return 图片实体
     */
    Optional<Image> findByFilename(String filename);
    
    /**
     * 根据原始文件名查找图片
     * 
     * @param originalName 原始文件名
     * @return 图片列表
     */
    List<Image> findByOriginalName(String originalName);
    
    /**
     * 根据MIME类型查找图片
     * 
     * @param mimeType MIME类型
     * @return 图片列表
     */
    List<Image> findByMimeType(String mimeType);
    
    /**
     * 查找指定时间范围内上传的图片
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 图片列表
     */
    @Query("SELECT i FROM Image i WHERE i.createdAt BETWEEN :startTime AND :endTime ORDER BY i.createdAt DESC")
    List<Image> findByCreatedAtBetween(@Param("startTime") LocalDateTime startTime, 
                                      @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查找大于指定大小的图片
     * 
     * @param fileSize 文件大小（字节）
     * @return 图片列表
     */
    @Query("SELECT i FROM Image i WHERE i.fileSize > :fileSize ORDER BY i.fileSize DESC")
    List<Image> findByFileSizeGreaterThan(@Param("fileSize") Long fileSize);
    
    /**
     * 统计指定MIME类型的图片数量
     * 
     * @param mimeType MIME类型
     * @return 图片数量
     */
    @Query("SELECT COUNT(i) FROM Image i WHERE i.mimeType = :mimeType")
    long countByMimeType(@Param("mimeType") String mimeType);
    
    /**
     * 查找所有图片，按创建时间倒序排列
     * 
     * @return 图片列表
     */
    @Query("SELECT i FROM Image i ORDER BY i.createdAt DESC")
    List<Image> findAllOrderByCreatedAtDesc();
}