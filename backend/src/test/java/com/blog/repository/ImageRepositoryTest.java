package com.blog.repository;

import com.blog.BaseIntegrationTest;
import com.blog.entity.Image;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ImageRepository集成测试
 * 测试图片数据访问层功能
 */
class ImageRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private ImageRepository imageRepository;

    private Image testImage1;
    private Image testImage2;

    @BeforeEach
    void setUpTestData() {
        // 不删除所有数据，避免外键约束问题
        // 只创建新的测试图片
        
        // 创建测试图片1
        testImage1 = new Image();
        testImage1.setFilename("test1_20241213_12345678.jpg");
        testImage1.setOriginalName("test1.jpg");
        testImage1.setFilePath("./test-data/images/test1_20241213_12345678.jpg");
        testImage1.setFileSize(1024L);
        testImage1.setMimeType("image/jpeg");
        testImage1.setBase64Content("dGVzdCBpbWFnZSBjb250ZW50IDE=");
        testImage1 = imageRepository.save(testImage1);

        // 创建测试图片2
        testImage2 = new Image();
        testImage2.setFilename("test2_20241213_87654321.png");
        testImage2.setOriginalName("test2.png");
        testImage2.setFilePath("./test-data/images/test2_20241213_87654321.png");
        testImage2.setFileSize(2048L);
        testImage2.setMimeType("image/png");
        testImage2.setBase64Content("dGVzdCBpbWFnZSBjb250ZW50IDI=");
        testImage2 = imageRepository.save(testImage2);
    }

    @Test
    void testFindById_Success() {
        Optional<Image> found = imageRepository.findById(testImage1.getId());

        assertTrue(found.isPresent());
        assertEquals(testImage1.getFilename(), found.get().getFilename());
        assertEquals(testImage1.getOriginalName(), found.get().getOriginalName());
    }

    @Test
    void testFindById_NotFound() {
        Optional<Image> found = imageRepository.findById(999L);

        assertFalse(found.isPresent());
    }

    @Test
    void testFindByFilename_Success() {
        Optional<Image> found = imageRepository.findByFilename(testImage1.getFilename());

        assertTrue(found.isPresent());
        assertEquals(testImage1.getId(), found.get().getId());
        assertEquals(testImage1.getOriginalName(), found.get().getOriginalName());
    }

    @Test
    void testFindByFilename_NotFound() {
        Optional<Image> found = imageRepository.findByFilename("nonexistent.jpg");

        assertFalse(found.isPresent());
    }

    @Test
    void testFindByOriginalName() {
        List<Image> found = imageRepository.findByOriginalName("test1.jpg");

        assertEquals(1, found.size());
        assertEquals(testImage1.getId(), found.get(0).getId());
    }

    @Test
    void testFindByMimeType() {
        List<Image> jpegImages = imageRepository.findByMimeType("image/jpeg");
        List<Image> pngImages = imageRepository.findByMimeType("image/png");

        assertEquals(1, jpegImages.size());
        assertEquals(testImage1.getId(), jpegImages.get(0).getId());

        assertEquals(1, pngImages.size());
        assertEquals(testImage2.getId(), pngImages.get(0).getId());
    }

    @Test
    void testFindByCreatedAtBetween() {
        LocalDateTime start = LocalDateTime.now().minusHours(1);
        LocalDateTime end = LocalDateTime.now().plusHours(1);

        List<Image> found = imageRepository.findByCreatedAtBetween(start, end);

        assertEquals(2, found.size());
        // 验证按创建时间倒序排列
        assertTrue(found.get(0).getCreatedAt().isAfter(found.get(1).getCreatedAt()) ||
                  found.get(0).getCreatedAt().isEqual(found.get(1).getCreatedAt()));
    }

    @Test
    void testFindByFileSizeGreaterThan() {
        List<Image> largeImages = imageRepository.findByFileSizeGreaterThan(1500L);

        assertEquals(1, largeImages.size());
        assertEquals(testImage2.getId(), largeImages.get(0).getId());
    }

    @Test
    void testCountByMimeType() {
        long jpegCount = imageRepository.countByMimeType("image/jpeg");
        long pngCount = imageRepository.countByMimeType("image/png");
        long gifCount = imageRepository.countByMimeType("image/gif");

        assertEquals(1, jpegCount);
        assertEquals(1, pngCount);
        assertEquals(0, gifCount);
    }

    @Test
    void testFindAllOrderByCreatedAtDesc() {
        List<Image> allImages = imageRepository.findAllOrderByCreatedAtDesc();

        assertEquals(2, allImages.size());
        // 验证按创建时间倒序排列
        assertTrue(allImages.get(0).getCreatedAt().isAfter(allImages.get(1).getCreatedAt()) ||
                  allImages.get(0).getCreatedAt().isEqual(allImages.get(1).getCreatedAt()));
    }

    @Test
    void testSaveAndDelete() {
        // 创建新图片
        Image newImage = new Image();
        newImage.setFilename("new_test.jpg");
        newImage.setOriginalName("new_test.jpg");
        newImage.setFilePath("./test-data/images/new_test.jpg");
        newImage.setFileSize(512L);
        newImage.setMimeType("image/jpeg");
        newImage.setBase64Content("bmV3IHRlc3QgaW1hZ2U=");

        // 保存
        Image saved = imageRepository.save(newImage);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());

        // 验证保存成功
        Optional<Image> found = imageRepository.findById(saved.getId());
        assertTrue(found.isPresent());

        // 删除
        imageRepository.delete(saved);

        // 验证删除成功
        Optional<Image> deleted = imageRepository.findById(saved.getId());
        assertFalse(deleted.isPresent());
    }

    @Test
    void testUpdateImage() {
        // 更新图片信息
        testImage1.setBase64Content("dXBkYXRlZCBjb250ZW50");
        Image updated = imageRepository.save(testImage1);

        // 验证更新成功
        assertEquals("dXBkYXRlZCBjb250ZW50", updated.getBase64Content());

        // 从数据库重新获取验证
        Optional<Image> found = imageRepository.findById(testImage1.getId());
        assertTrue(found.isPresent());
        assertEquals("dXBkYXRlZCBjb250ZW50", found.get().getBase64Content());
    }
}