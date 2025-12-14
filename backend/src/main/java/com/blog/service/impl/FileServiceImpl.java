package com.blog.service.impl;

import com.blog.config.StorageProperties;
import com.blog.exception.FileOperationException;
import com.blog.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileServiceImpl implements FileService {
    
    private final StorageProperties storageProperties;
    private final Path markdownRoot;
    
    @Autowired
    public FileServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.markdownRoot = Paths.get(storageProperties.getMarkdownPath()).toAbsolutePath().normalize();
        
        // 初始化时创建目录
        try {
            createDirectoryIfNotExists(storageProperties.getMarkdownPath());
        } catch (IOException e) {
            throw new FileOperationException("无法创建Markdown存储目录: " + storageProperties.getMarkdownPath(), e);
        }
    }
    
    @Override
    public String saveMarkdownFile(String filename, String content) throws IOException {
        if (!StringUtils.hasText(filename)) {
            throw new FileOperationException("文件名不能为空");
        }
        
        if (content == null) {
            content = "";
        }
        
        // 确保文件名以.md结尾
        if (!filename.toLowerCase().endsWith(".md")) {
            filename += ".md";
        }
        
        // 生成唯一文件名以避免冲突
        String uniqueFilename = generateUniqueFilename(filename);
        Path filePath = markdownRoot.resolve(uniqueFilename);
        
        // 验证路径安全性
        if (!isValidFilePath(filePath.toString())) {
            throw new FileOperationException("文件路径不安全: " + uniqueFilename);
        }
        
        try {
            // 创建父目录（如果需要）
            Files.createDirectories(filePath.getParent());
            
            // 写入文件
            Files.write(filePath, content.getBytes(StandardCharsets.UTF_8), 
                       StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
            
            // 返回相对路径
            return markdownRoot.relativize(filePath).toString();
            
        } catch (IOException e) {
            throw new FileOperationException("保存Markdown文件失败: " + uniqueFilename, e);
        }
    }
    
    @Override
    public String readMarkdownFile(String filePath) throws IOException {
        if (!StringUtils.hasText(filePath)) {
            throw new FileOperationException("文件路径不能为空");
        }
        
        Path absolutePath = getAbsolutePath(filePath);
        
        if (!isValidFilePath(absolutePath.toString())) {
            throw new FileOperationException("文件路径不安全: " + filePath);
        }
        
        if (!Files.exists(absolutePath)) {
            throw new FileOperationException("文件不存在: " + filePath);
        }
        
        if (!Files.isReadable(absolutePath)) {
            throw new FileOperationException("文件不可读: " + filePath);
        }
        
        try {
            return Files.readString(absolutePath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new FileOperationException("读取Markdown文件失败: " + filePath, e);
        }
    }
    
    @Override
    public void updateMarkdownFile(String filePath, String content) throws IOException {
        if (!StringUtils.hasText(filePath)) {
            throw new FileOperationException("文件路径不能为空");
        }
        
        if (content == null) {
            content = "";
        }
        
        Path absolutePath = getAbsolutePath(filePath);
        
        if (!isValidFilePath(absolutePath.toString())) {
            throw new FileOperationException("文件路径不安全: " + filePath);
        }
        
        if (!Files.exists(absolutePath)) {
            throw new FileOperationException("文件不存在: " + filePath);
        }
        
        try {
            Files.write(absolutePath, content.getBytes(StandardCharsets.UTF_8), 
                       StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new FileOperationException("更新Markdown文件失败: " + filePath, e);
        }
    }
    
    @Override
    public void deleteMarkdownFile(String filePath) throws IOException {
        if (!StringUtils.hasText(filePath)) {
            throw new FileOperationException("文件路径不能为空");
        }
        
        Path absolutePath = getAbsolutePath(filePath);
        
        if (!isValidFilePath(absolutePath.toString())) {
            throw new FileOperationException("文件路径不安全: " + filePath);
        }
        
        if (!Files.exists(absolutePath)) {
            throw new FileOperationException("文件不存在: " + filePath);
        }
        
        try {
            Files.delete(absolutePath);
        } catch (IOException e) {
            throw new FileOperationException("删除Markdown文件失败: " + filePath, e);
        }
    }
    
    @Override
    public boolean fileExists(String filePath) {
        if (!StringUtils.hasText(filePath)) {
            return false;
        }
        
        try {
            Path absolutePath = getAbsolutePath(filePath);
            return isValidFilePath(absolutePath.toString()) && Files.exists(absolutePath);
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public long getFileSize(String filePath) throws IOException {
        if (!StringUtils.hasText(filePath)) {
            throw new FileOperationException("文件路径不能为空");
        }
        
        Path absolutePath = getAbsolutePath(filePath);
        
        if (!isValidFilePath(absolutePath.toString())) {
            throw new FileOperationException("文件路径不安全: " + filePath);
        }
        
        if (!Files.exists(absolutePath)) {
            throw new FileOperationException("文件不存在: " + filePath);
        }
        
        try {
            return Files.size(absolutePath);
        } catch (IOException e) {
            throw new FileOperationException("获取文件大小失败: " + filePath, e);
        }
    }
    
    @Override
    public List<String> listMarkdownFiles() throws IOException {
        try {
            if (!Files.exists(markdownRoot)) {
                return List.of();
            }
            
            try (Stream<Path> paths = Files.walk(markdownRoot)) {
                return paths
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().toLowerCase().endsWith(".md"))
                    .map(path -> markdownRoot.relativize(path).toString())
                    .collect(Collectors.toList());
            }
        } catch (IOException e) {
            throw new FileOperationException("列出Markdown文件失败", e);
        }
    }
    
    @Override
    public void createDirectoryIfNotExists(String directoryPath) throws IOException {
        if (!StringUtils.hasText(directoryPath)) {
            throw new FileOperationException("目录路径不能为空");
        }
        
        Path path = Paths.get(directoryPath).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new FileOperationException("创建目录失败: " + directoryPath, e);
        }
    }
    
    @Override
    public boolean isValidFilePath(String filePath) {
        if (!StringUtils.hasText(filePath)) {
            return false;
        }
        
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            
            // 检查路径是否在允许的根目录下
            if (!path.startsWith(markdownRoot)) {
                return false;
            }
            
            // 检查路径中是否包含危险字符
            String pathString = path.toString();
            if (pathString.contains("..") || pathString.contains("~")) {
                return false;
            }
            
            // 检查文件扩展名
            String fileName = path.getFileName().toString().toLowerCase();
            return fileName.endsWith(".md");
            
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public String generateUniqueFilename(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            originalFilename = "untitled.md";
        }
        
        // 移除文件扩展名
        String nameWithoutExt = originalFilename;
        if (originalFilename.toLowerCase().endsWith(".md")) {
            nameWithoutExt = originalFilename.substring(0, originalFilename.length() - 3);
        }
        
        // 清理文件名，只保留安全字符，将特殊字符转换为下划线
        nameWithoutExt = nameWithoutExt.replaceAll("[^a-zA-Z0-9_]", "_");
        
        // 生成时间戳
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        
        // 生成短UUID
        String shortUuid = UUID.randomUUID().toString().substring(0, 8);
        
        return String.format("%s_%s_%s.md", nameWithoutExt, timestamp, shortUuid);
    }
    
    @Override
    public Path getAbsolutePath(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            throw new FileOperationException("相对路径不能为空");
        }
        
        return markdownRoot.resolve(relativePath).toAbsolutePath().normalize();
    }
}