package com.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import java.util.Arrays;
import java.util.Collections;

/**
 * CORS跨域配置
 * 配置允许前端应用访问后端API
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许所有来源（开发环境）
        // 注意：使用allowedOriginPatterns而不是allowedOrigins，以支持动态子域名
        configuration.setAllowedOriginPatterns(Collections.singletonList("*"));

        // 允许的HTTP方法
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // 允许所有请求头
        configuration.setAllowedHeaders(Collections.singletonList("*"));

        // 允许发送Cookie和认证信息
        configuration.setAllowCredentials(true);

        // 预检请求缓存时间（2小时）
        configuration.setMaxAge(7200L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // 注册到所有路径（包括context-path）
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource()));
        bean.setOrder(0); // 设置最高优先级
        return bean;
    }
}