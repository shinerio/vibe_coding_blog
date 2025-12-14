package com.blog.service;

import com.blog.BaseIntegrationTest;
import com.blog.entity.Image;
import com.blog.repository.ImageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ImageService单元测试
 * 测试图片上传、转换、存储和检索功能
 */
class ImageServiceTest extends BaseIntegrationTest {

    @Autowired
    private ImageService imageService;

    @Autowired
    private ImageRepository imageRepository;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUpImageService() {
        // 设置临时目录作为图片存储路径
        ReflectionTestUtils.setField(imageService, "imageStoragePath", tempDir.toString());
    }

    @Test
    void testUploadImage_Success() throws IOException {
        // 准备测试数据
        byte[] imageContent = createTestImageContent();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                imageContent
        );

        // 执行上传
        Image savedImage = imageService.uploadImage(file, "Test image description");

        // 验证结果
        assertNotNull(savedImage);
        assertNotNull(savedImage.getId());
        assertEquals("test-image.jpg", savedImage.getOriginalName());
        assertEquals("image/jpeg", savedImage.getMimeType());
        assertEquals(imageContent.length, savedImage.getFileSize());
        assertNotNull(savedImage.getBase64Content());
        assertNotNull(savedImage.getFilename());
        assertNotNull(savedImage.getFilePath());
        assertNotNull(savedImage.getCreatedAt());

        // 验证文件已保存到磁盘
        Path savedFilePath = Path.of(savedImage.getFilePath());
        assertTrue(Files.exists(savedFilePath));
        assertEquals(imageContent.length, Files.size(savedFilePath));

        // 验证数据库记录
        Optional<Image> dbImage = imageRepository.findById(savedImage.getId());
        assertTrue(dbImage.isPresent());
        assertEquals(savedImage.getFilename(), dbImage.get().getFilename());
    }

    @Test
    void testUploadImage_InvalidFileFormat() {
        // 准备无效格式的文件
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.txt",
                "text/plain",
                "This is not an image".getBytes()
        );

        // 验证抛出异常
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageService.uploadImage(file, "Invalid file")
        );

        assertTrue(exception.getMessage().contains("不支持的文件格式"));
    }

    @Test
    void testUploadImage_FileTooLarge() {
        // 准备超大文件（6MB）
        byte[] largeContent = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large-image.jpg",
                "image/jpeg",
                largeContent
        );

        // 验证抛出异常
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageService.uploadImage(file, "Large file")
        );

        assertTrue(exception.getMessage().contains("文件大小超过限制"));
    }

    @Test
    void testUploadImage_EmptyFile() {
        // 准备空文件
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        // 验证抛出异常
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageService.uploadImage(file, "Empty file")
        );

        assertTrue(exception.getMessage().contains("文件不能为空"));
    }

    @Test
    void testGetImageById_Success() {
        // 先上传一个图片
        byte[] imageContent = createTestImageContent();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-get.jpg",
                "image/jpeg",
                imageContent
        );
        Image savedImage = imageService.uploadImage(file, "Test get image");

        // 测试获取图片
        Optional<Image> retrievedImage = imageService.getImageById(savedImage.getId());

        // 验证结果
        assertTrue(retrievedImage.isPresent());
        assertEquals(savedImage.getId(), retrievedImage.get().getId());
        assertEquals(savedImage.getFilename(), retrievedImage.get().getFilename());
        assertEquals(savedImage.getBase64Content(), retrievedImage.get().getBase64Content());
    }

    @Test
    void testGetImageById_NotFound() {
        // 测试获取不存在的图片
        Optional<Image> retrievedImage = imageService.getImageById(999L);

        // 验证结果
        assertFalse(retrievedImage.isPresent());
    }

    @Test
    void testDeleteImage_Success() throws IOException {
        // 先上传一个图片
        byte[] imageContent = createTestImageContent();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-delete.jpg",
                "image/jpeg",
                imageContent
        );
        Image savedImage = imageService.uploadImage(file, "Test delete image");
        Path filePath = Path.of(savedImage.getFilePath());

        // 验证文件存在
        assertTrue(Files.exists(filePath));

        // 执行删除
        boolean deleted = imageService.deleteImage(savedImage.getId());

        // 验证结果
        assertTrue(deleted);
        assertFalse(Files.exists(filePath));

        // 验证数据库记录已删除
        Optional<Image> dbImage = imageRepository.findById(savedImage.getId());
        assertFalse(dbImage.isPresent());
    }

    @Test
    void testDeleteImage_NotFound() {
        // 测试删除不存在的图片
        boolean deleted = imageService.deleteImage(999L);

        // 验证结果
        assertFalse(deleted);
    }

    @Test
    void testConvertToBase64_Success() {
        // 准备测试数据
        byte[] imageContent = createTestImageContent();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-base64.jpg",
                "image/jpeg",
                imageContent
        );

        // 执行转换
        String base64Content = imageService.convertToBase64(file);

        // 验证结果
        assertNotNull(base64Content);
        assertFalse(base64Content.isEmpty());

        // 验证Base64解码后的内容与原始内容一致
        byte[] decodedContent = java.util.Base64.getDecoder().decode(base64Content);
        assertArrayEquals(imageContent, decodedContent);
    }

    @Test
    void testValidateImageFile_ValidJpeg() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                createTestImageContent()
        );

        // 应该不抛出异常
        assertDoesNotThrow(() -> imageService.validateImageFile(file));
    }

    @Test
    void testValidateImageFile_ValidPng() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                createTestImageContent()
        );

        // 应该不抛出异常
        assertDoesNotThrow(() -> imageService.validateImageFile(file));
    }

    @Test
    void testValidateImageFile_InvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "image/jpeg",
                createTestImageContent()
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageService.validateImageFile(file)
        );

        assertTrue(exception.getMessage().contains("文件扩展名不正确"));
    }

    @Test
    void testValidateImageFile_NullFile() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageService.validateImageFile(null)
        );

        assertTrue(exception.getMessage().contains("文件不能为空"));
    }

    /**
     * 创建测试用的图片内容
     */
    private byte[] createTestImageContent() {
        // 创建一个简单的测试图片内容（实际项目中可以使用真实的图片字节）
        return "fake-image-content-for-testing".getBytes();
    }
}