-- Test data for H2 database
-- This provides sample data for testing purposes

-- Insert sample articles (without tags column since it's handled by @ElementCollection)
INSERT INTO articles (title, slug, summary, content_path, status, created_at, updated_at, published_at) VALUES
('Test Article 1', 'test-article-1', 'This is a test article summary', '/test-data/markdown/test-article-1.md', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Draft Article', 'draft-article', 'This is a draft article', '/test-data/markdown/draft-article.md', 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('Another Test Article', 'another-test-article', 'Another test article for testing', '/test-data/markdown/another-test.md', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert tags for articles (using the article_tags table created by @ElementCollection)
INSERT INTO article_tags (article_id, tag) VALUES
(1, 'test'),
(1, 'sample'),
(1, 'blog'),
(2, 'draft'),
(2, 'test'),
(3, 'test'),
(3, 'example');

-- Insert sample images
INSERT INTO images (filename, original_name, file_path, file_size, mime_type, base64_content, created_at) VALUES
('test-image-1.jpg', 'sample.jpg', '/test-data/images/test-image-1.jpg', 1024, 'image/jpeg', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A', CURRENT_TIMESTAMP),
('test-image-2.png', 'example.png', '/test-data/images/test-image-2.png', 2048, 'image/png', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', CURRENT_TIMESTAMP);

-- Link articles with images
INSERT INTO article_images (article_id, image_id) VALUES
(1, 1),
(1, 2),
(3, 1);