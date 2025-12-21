package com.blog.service;

import com.blog.model.ImagePageResponse;

/**
 * API服务接口，用于处理OpenAPI生成的图片模型类
 */
public interface ApiImageService {

    /**
     * 获取图片列表
     */
    ImagePageResponse getImages(Integer page, Integer size);
}