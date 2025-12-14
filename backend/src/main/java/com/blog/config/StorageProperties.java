package com.blog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "blog.storage")
public class StorageProperties {
    
    private String markdownPath = "./data/markdown";
    private String imagesPath = "./data/images";
    
    public String getMarkdownPath() {
        return markdownPath;
    }
    
    public void setMarkdownPath(String markdownPath) {
        this.markdownPath = markdownPath;
    }
    
    public String getImagesPath() {
        return imagesPath;
    }
    
    public void setImagesPath(String imagesPath) {
        this.imagesPath = imagesPath;
    }
}