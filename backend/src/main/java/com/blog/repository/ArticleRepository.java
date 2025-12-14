package com.blog.repository;

import com.blog.entity.Article;
import com.blog.entity.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    /**
     * 根据slug查找文章
     */
    Optional<Article> findBySlug(String slug);
    
    /**
     * 检查slug是否存在
     */
    boolean existsBySlug(String slug);
    
    /**
     * 根据状态查找文章（分页）
     */
    Page<Article> findByStatus(ArticleStatus status, Pageable pageable);
    
    /**
     * 根据标题搜索文章（忽略大小写，分页）
     */
    Page<Article> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    /**
     * 根据标签查找文章（分页）
     */
    @Query("SELECT a FROM Article a WHERE :tag MEMBER OF a.tags")
    Page<Article> findByTagsContaining(@Param("tag") String tag, Pageable pageable);
    
    /**
     * 根据多个标签查找文章（分页）
     */
    @Query("SELECT DISTINCT a FROM Article a JOIN a.tags t WHERE t IN :tags")
    Page<Article> findByTagsIn(@Param("tags") List<String> tags, Pageable pageable);
    
    /**
     * 根据创建时间范围查找文章（分页）
     */
    Page<Article> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * 根据更新时间范围查找文章（分页）
     */
    Page<Article> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * 根据发布时间范围查找文章（分页）
     */
    Page<Article> findByPublishedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * 查找已发布的文章（按发布时间倒序，分页）
     */
    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' ORDER BY a.publishedAt DESC")
    Page<Article> findPublishedArticlesOrderByPublishedAtDesc(Pageable pageable);
    
    /**
     * 查找最近更新的文章（分页）
     */
    Page<Article> findByOrderByUpdatedAtDesc(Pageable pageable);
    
    /**
     * 查找最近创建的文章（分页）
     */
    Page<Article> findByOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * 复合搜索：根据标题、摘要和标签搜索文章（分页）
     */
    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN a.tags t WHERE " +
           "(:title IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:summary IS NULL OR LOWER(a.summary) LIKE LOWER(CONCAT('%', :summary, '%'))) AND " +
           "(:tag IS NULL OR t = :tag) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Article> searchArticles(@Param("title") String title,
                                @Param("summary") String summary,
                                @Param("tag") String tag,
                                @Param("status") ArticleStatus status,
                                Pageable pageable);
    
    /**
     * 根据状态和标签查找文章（分页）
     */
    @Query("SELECT a FROM Article a WHERE a.status = :status AND :tag MEMBER OF a.tags")
    Page<Article> findByStatusAndTagsContaining(@Param("status") ArticleStatus status,
                                               @Param("tag") String tag,
                                               Pageable pageable);
    
    /**
     * 统计各状态的文章数量
     */
    @Query("SELECT a.status, COUNT(a) FROM Article a GROUP BY a.status")
    List<Object[]> countArticlesByStatus();
    
    /**
     * 统计各标签的文章数量
     */
    @Query("SELECT t, COUNT(a) FROM Article a JOIN a.tags t GROUP BY t ORDER BY COUNT(a) DESC")
    List<Object[]> countArticlesByTag();
    
    /**
     * 查找包含特定标签的文章数量
     */
    @Query("SELECT COUNT(a) FROM Article a WHERE :tag MEMBER OF a.tags")
    long countByTagsContaining(@Param("tag") String tag);
    
    /**
     * 查找特定状态的文章数量
     */
    long countByStatus(ArticleStatus status);
}