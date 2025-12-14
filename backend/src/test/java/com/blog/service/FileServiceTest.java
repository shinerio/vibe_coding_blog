package com.blog.service;

import com.blog.config.StorageProperties;
import com.blog.exception.FileOperationException;
import com.blog.service.impl.FileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class FileServiceTest {
    
    @TempDir
    Path tempDir;
    
    private FileService fileService;
    private StorageProperties storageProperties;
    
    @BeforeEach
    void setUp() {
        storageProperties = new StorageProperties();
        storageProperties.setMarkdownPath(tempDir.toString());
        fileService = new FileServiceImpl(storageProperties);
    }
    
    @Test
    void saveMarkdownFile_Success() throws IOException {
        // Given
        String filename = "test-article";
        String content = "# 测试文章\n\n这是测试内容。";
        
        // When
        String savedPath = fileService.saveMarkdownFile(filename, content);
        
        // Then
        assertNotNull(savedPath);
        assertTrue(savedPath.endsWith(".md"));
        assertTrue(fileService.fileExists(savedPath));
        
        String readContent = fileService.readMarkdownFile(savedPath);
        assertEquals(content, readContent);
    }
    
    @Test
    void saveMarkdownFile_EmptyFilename_ThrowsException() {
        // When & Then
        FileOperationException exception = assertThrows(FileOperationException.class,
            () -> fileService.saveMarkdownFile("", "content"));
        assertEquals("文件名不能为空", exception.getMessage());
    }
    
    @Test
    void saveMarkdownFile_NullContent_Success() throws IOException {
        // Given
        String filename = "test-article";
        
        // When
        String savedPath = fileService.saveMarkdownFile(filename, null);
        
        // Then
        assertNotNull(savedPath);
        assertTrue(fileService.fileExists(savedPath));
        
        String readContent = fileService.readMarkdownFile(savedPath);
        assertEquals("", readContent);
    }
    
    @Test
    void readMarkdownFile_Success() throws IOException {
        // Given
        String filename = "test-read";
        String content = "# 读取测试\n\n测试读取功能。";
        String savedPath = fileService.saveMarkdownFile(filename, content);
        
        // When
        String readContent = fileService.readMarkdownFile(savedPath);
        
        // Then
        assertEquals(content, readContent);
    }
    
    @Test
    void readMarkdownFile_FileNotExists_ThrowsException() {
        // When & Then
        FileOperationException exception = assertThrows(FileOperationException.class,
            () -> fileService.readMarkdownFile("non-existent.md"));
        assertTrue(exception.getMessage().contains("文件不存在"));
    }
    
    @Test
    void readMarkdownFile_EmptyPath_ThrowsException() {
        // When & Then
        FileOperationException exception = assertThrows(FileOperationException.class,
            () -> fileService.readMarkdownFile(""));
        assertEquals("文件路径不能为空", exception.getMessage());
    }
    
    @Test
    void updateMarkdownFile_Success() throws IOException {
        // Given
        String filename = "test-update";
        String originalContent = "# 原始内容";
        String updatedContent = "# 更新后的内容\n\n新增内容。";
        String savedPath = fileService.saveMarkdownFile(filename, originalContent);
        
        // When
        fileService.updateMarkdownFile(savedPath, updatedContent);
        
        // Then
        String readContent = fileService.readMarkdownFile(savedPath);
        assertEquals(updatedContent, readContent);
    }
    
    @Test
    void updateMarkdownFile_FileNotExists_ThrowsException() {
        // When & Then
        FileOperationException exception = assertThrows(FileOperationException.class,
            () -> fileService.updateMarkdownFile("non-existent.md", "content"));
        assertTrue(exception.getMessage().contains("文件不存在"));
    }
    
    @Test
    void deleteMarkdownFile_Success() throws IOException {
        // Given
        String filename = "test-delete";
        String content = "# 待删除的文章";
        String savedPath = fileService.saveMarkdownFile(filename, content);
        assertTrue(fileService.fileExists(savedPath));
        
        // When
        fileService.deleteMarkdownFile(savedPath);
        
        // Then
        assertFalse(fileService.fileExists(savedPath));
    }
    
    @Test
    void deleteMarkdownFile_FileNotExists_ThrowsException() {
        // When & Then
        FileOperationException exception = assertThrows(FileOperationException.class,
            () -> fileService.deleteMarkdownFile("non-existent.md"));
        assertTrue(exception.getMessage().contains("文件不存在"));
    }
    
    @Test
    void fileExists_True() throws IOException {
        // Given
        String filename = "test-exists";
        String content = "# 存在性测试";
        String savedPath = fileService.saveMarkdownFile(filename, content);
        
        // When
        boolean exists = fileService.fileExists(savedPath);
        
        // Then
        assertTrue(exists);
    }
    
    @Test
    void fileExists_False() {
        // When
        boolean exists = fileService.fileExists("non-existent.md");
        
        // Then
        assertFalse(exists);
    }
    
    @Test
    void getFileSize_Success() throws IOException {
        // Given
        String filename = "test-size";
        String content = "# 文件大小测试\n\n这是测试内容。";
        String savedPath = fileService.saveMarkdownFile(filename, content);
        
        // When
        long size = fileService.getFileSize(savedPath);
        
        // Then
        assertTrue(size > 0);
        assertEquals(content.getBytes().length, size);
    }
    
    @Test
    void listMarkdownFiles_Success() throws IOException {
        // Given
        fileService.saveMarkdownFile("article1", "内容1");
        fileService.saveMarkdownFile("article2", "内容2");
        fileService.saveMarkdownFile("article3", "内容3");
        
        // When
        List<String> files = fileService.listMarkdownFiles();
        
        // Then
        assertEquals(3, files.size());
        assertTrue(files.stream().allMatch(file -> file.endsWith(".md")));
    }
    
    @Test
    void listMarkdownFiles_EmptyDirectory() throws IOException {
        // When
        List<String> files = fileService.listMarkdownFiles();
        
        // Then
        assertTrue(files.isEmpty());
    }
    
    @Test
    void isValidFilePath_ValidPath() throws IOException {
        // Given
        String filename = "valid-article";
        String savedPath = fileService.saveMarkdownFile(filename, "content");
        
        // When
        boolean isValid = fileService.isValidFilePath(fileService.getAbsolutePath(savedPath).toString());
        
        // Then
        assertTrue(isValid);
    }
    
    @Test
    void isValidFilePath_InvalidPath_ContainsDotDot() {
        // When
        boolean isValid = fileService.isValidFilePath("../../../etc/passwd");
        
        // Then
        assertFalse(isValid);
    }
    
    @Test
    void isValidFilePath_InvalidPath_WrongExtension() {
        // When
        boolean isValid = fileService.isValidFilePath("test.txt");
        
        // Then
        assertFalse(isValid);
    }
    
    @Test
    void generateUniqueFilename_Success() {
        // Given
        String originalFilename = "test-article";
        
        // When
        String uniqueFilename = fileService.generateUniqueFilename(originalFilename);
        
        // Then
        assertNotNull(uniqueFilename);
        assertTrue(uniqueFilename.endsWith(".md"));
        assertTrue(uniqueFilename.contains("test_article"));
        // More flexible regex pattern
        assertTrue(uniqueFilename.matches("test_article_\\d{8}_\\d{6}_[a-f0-9]{8}\\.md"));
    }
    
    @Test
    void generateUniqueFilename_EmptyInput() {
        // When
        String uniqueFilename = fileService.generateUniqueFilename("");
        
        // Then
        assertNotNull(uniqueFilename);
        assertTrue(uniqueFilename.endsWith(".md"));
        assertTrue(uniqueFilename.startsWith("untitled"));
    }
    
    @Test
    void createDirectoryIfNotExists_Success() throws IOException {
        // Given
        Path newDir = tempDir.resolve("new-directory");
        assertFalse(Files.exists(newDir));
        
        // When
        fileService.createDirectoryIfNotExists(newDir.toString());
        
        // Then
        assertTrue(Files.exists(newDir));
        assertTrue(Files.isDirectory(newDir));
    }
}