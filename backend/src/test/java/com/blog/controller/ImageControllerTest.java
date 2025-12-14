package com.blog.controller;

import com.blog.BaseIntegrationTest;
import com.blog.entity.Image;
import com.blog.repository.ImageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ImageController集成测试
 * 测试图片管理REST API端点
 */
@AutoConfigureMockMvc
class ImageControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Image testImage;

    @BeforeEach
    void setUpTestData() {
        // 清理数据
        imageRepository.deleteAll();

        // 创建测试图片
        testImage = new Image();
        testImage.setFilename("test_20241213_12345678.jpg");
        testImage.setOriginalName("test.jpg");
        testImage.setFilePath("./test-data/images/test_20241213_12345678.jpg");
        testImage.setFileSize(1024L);
        testImage.setMimeType("image/jpeg");
        testImage.setBase64Content("dGVzdCBpbWFnZSBjb250ZW50");
        testImage = imageRepository.save(testImage);
    }

    @Test
    void testUploadImage_Success() throws Exception {
        // 准备测试文件
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "upload-test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // 执行上传请求
        mockMvc.perform(multipart("/images")
                        .file(file)
                        .param("description", "Test upload"))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.originalName", is("upload-test.jpg")))
                .andExpect(jsonPath("$.mimeType", is("image/jpeg")))
                .andExpect(jsonPath("$.fileSize", is(18)))
                .andExpect(jsonPath("$.base64Content", notNullValue()))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        // 验证数据库中有新记录
        assertEquals(2, imageRepository.count());
    }

    @Test
    void testUploadImage_InvalidFormat() throws Exception {
        // 准备无效格式文件
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "not an image".getBytes()
        );

        // 执行上传请求
        mockMvc.perform(multipart("/images")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.error.message", containsString("不支持的文件格式")));

        // 验证数据库中没有新记录
        assertEquals(1, imageRepository.count());
    }

    @Test
    void testUploadImage_FileTooLarge() throws Exception {
        // 准备超大文件
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        // 执行上传请求
        mockMvc.perform(multipart("/images")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.error.message", containsString("文件大小超过限制")));

        // 验证数据库中没有新记录
        assertEquals(1, imageRepository.count());
    }

    @Test
    void testGetImage_Success() throws Exception {
        // 执行获取请求
        mockMvc.perform(get("/images/{id}", testImage.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(testImage.getId().intValue())))
                .andExpect(jsonPath("$.filename", is(testImage.getFilename())))
                .andExpect(jsonPath("$.originalName", is(testImage.getOriginalName())))
                .andExpect(jsonPath("$.filePath", is(testImage.getFilePath())))
                .andExpect(jsonPath("$.fileSize", is(testImage.getFileSize().intValue())))
                .andExpect(jsonPath("$.mimeType", is(testImage.getMimeType())))
                .andExpect(jsonPath("$.base64Content", is(testImage.getBase64Content())))
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    void testGetImage_NotFound() throws Exception {
        // 执行获取不存在图片的请求
        mockMvc.perform(get("/images/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code", is("IMAGE_NOT_FOUND")))
                .andExpect(jsonPath("$.error.message", containsString("Image with ID 999 not found")));
    }

    @Test
    void testDeleteImage_Success() throws Exception {
        // 执行删除请求
        mockMvc.perform(delete("/images/{id}", testImage.getId()))
                .andExpect(status().isNoContent());

        // 验证数据库中记录已删除
        assertEquals(0, imageRepository.count());
        assertFalse(imageRepository.findById(testImage.getId()).isPresent());
    }

    @Test
    void testDeleteImage_NotFound() throws Exception {
        // 执行删除不存在图片的请求
        mockMvc.perform(delete("/images/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code", is("IMAGE_NOT_FOUND")))
                .andExpect(jsonPath("$.error.message", containsString("Image with ID 999 not found")));

        // 验证原有记录未被删除
        assertEquals(1, imageRepository.count());
    }

    @Test
    void testUploadImage_WithoutDescription() throws Exception {
        // 准备测试文件（不提供描述）
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "no-desc.png",
                "image/png",
                "test content".getBytes()
        );

        // 执行上传请求
        mockMvc.perform(multipart("/images")
                        .file(file))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.originalName", is("no-desc.png")))
                .andExpect(jsonPath("$.mimeType", is("image/png")));

        // 验证数据库中有新记录
        assertEquals(2, imageRepository.count());
    }

    @Test
    void testUploadImage_EmptyFile() throws Exception {
        // 准备空文件
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        // 执行上传请求
        mockMvc.perform(multipart("/images")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.error.message", containsString("文件不能为空")));

        // 验证数据库中没有新记录
        assertEquals(1, imageRepository.count());
    }
}