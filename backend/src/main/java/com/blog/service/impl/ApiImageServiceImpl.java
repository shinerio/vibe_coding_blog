package com.blog.service.impl;

import com.blog.entity.Image;
import com.blog.model.ImagePageResponse;
import com.blog.model.ImageResponse;
import com.blog.service.ApiImageService;
import com.blog.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * API图片服务实现类
 */
@Service
public class ApiImageServiceImpl implements ApiImageService {

    private static final Logger logger = LoggerFactory.getLogger(ApiImageServiceImpl.class);

    @Autowired
    private ImageService imageService;

    @Override
    public ImagePageResponse getImages(Integer page, Integer size) {
        logger.info("获取图片列表 - page: {}, size: {}", page, size);

        // 创建分页参数
        Pageable pageable = PageRequest.of(page, size);

        // 获取图片分页数据
        Page<Image> imagePage = imageService.getImages(pageable);

        // 转换为响应模型
        ImagePageResponse response = new ImagePageResponse();
        response.setContent(convertToImageResponses(imagePage.getContent()));
        response.setPage(imagePage.getNumber());
        response.setSize(imagePage.getSize());
        response.setTotalElements(imagePage.getTotalElements());
        response.setTotalPages(imagePage.getTotalPages());
        response.setFirst(imagePage.isFirst());
        response.setLast(imagePage.isLast());

        logger.info("成功获取图片列表 - 总数: {}", response.getTotalElements());
        return response;
    }

    /**
     * 将Image实体列表转换为ImageResponse列表
     */
    private List<ImageResponse> convertToImageResponses(List<Image> images) {
        List<ImageResponse> responses = new ArrayList<>();
        for (Image image : images) {
            responses.add(convertToImageResponse(image));
        }
        return responses;
    }

    /**
     * 将Image实体转换为ImageResponse
     */
    private ImageResponse convertToImageResponse(Image image) {
        ImageResponse response = new ImageResponse();
        response.setId(image.getId());
        response.setFilename(image.getFilename());
        response.setOriginalName(image.getOriginalName());
        response.setFilePath(image.getFilePath());
        response.setFileSize(image.getFileSize());
        response.setMimeType(image.getMimeType());
        response.setBase64Content(image.getBase64Content());

        // 转换LocalDateTime为OffsetDateTime
        if (image.getCreatedAt() != null) {
            OffsetDateTime offsetDateTime = image.getCreatedAt().atOffset(ZoneOffset.UTC);
            response.setCreatedAt(offsetDateTime);
        }

        return response;
    }
}