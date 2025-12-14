package com.blog.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public interface FileService {
    
    /**
     * 保存Markdown文件内容
     */
    String saveMarkdownFile(String filename, String content) throws IOException;
    
    /**
     * 读取Markdown文件内容
     */
    String readMarkdownFile(String filePath) throws IOException;
    
    /**
     * 更新Markdown文件内容
     */
    void updateMarkdownFile(String filePath, String content) throws IOException;
    
    /**
     * 删除Markdown文件
     */
    void deleteMarkdownFile(String filePath) throws IOException;
    
    /**
     * 检查文件是否存在
     */
    boolean fileExists(String filePath);
    
    /**
     * 获取文件大小
     */
    long getFileSize(String filePath) throws IOException;
    
    /**
     * 列出Markdown目录下的所有文件
     */
    List<String> listMarkdownFiles() throws IOException;
    
    /**
     * 创建目录（如果不存在）
     */
    void createDirectoryIfNotExists(String directoryPath) throws IOException;
    
    /**
     * 验证文件路径安全性
     */
    boolean isValidFilePath(String filePath);
    
    /**
     * 生成唯一的文件名
     */
    String generateUniqueFilename(String originalFilename);
    
    /**
     * 获取文件的绝对路径
     */
    Path getAbsolutePath(String relativePath);
}