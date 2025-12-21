import React from 'react'
import { Card, Typography, Row, Col, Statistic, Spin, Alert, Button, Space } from 'antd'
import {
  FileTextOutlined,
  PictureOutlined,
  EditOutlined,
  ArrowRightOutlined,
  BookOutlined,
  HeartOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useDashboardStats'

const { Title, Paragraph, Text } = Typography

const HomePage: React.FC = () => {
  const { stats, loading, error } = useDashboardStats()
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '80px 0 60px' }}>
        <Title
          level={1}
          style={{
            fontSize: '3.5rem',
            fontWeight: 300,
            marginBottom: '16px',
            color: '#1a1a1a',
            lineHeight: 1.2
          }}
        >
          Hi, I'm Ming!
        </Title>
        <Paragraph
          style={{
            fontSize: '1.25rem',
            color: '#666',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}
        >
          欢迎来到我的个人博客。这里记录着我在技术、生活和思考中的点点滴滴。
        </Paragraph>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/articles')}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            浏览文章
          </Button>
          <Button
            size="large"
            icon={<BookOutlined />}
            onClick={() => navigate('/editor')}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            写文章
          </Button>
        </Space>
      </div>

      {/* Stats Section */}
      <div style={{ marginBottom: '80px' }}>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '32px 24px' }}
            >
              <Statistic
                title={<Text style={{ fontSize: '16px', color: '#666' }}>文章总数</Text>}
                value={stats.totalArticles}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                loading={loading}
                valueStyle={{ fontSize: '2.5rem', fontWeight: 500, color: '#1a1a1a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '32px 24px' }}
            >
              <Statistic
                title={<Text style={{ fontSize: '16px', color: '#666' }}>图片总数</Text>}
                value={stats.totalImages}
                prefix={<PictureOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ fontSize: '2.5rem', fontWeight: 500, color: '#1a1a1a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '32px 24px' }}
            >
              <Statistic
                title={<Text style={{ fontSize: '16px', color: '#666' }}>草稿数量</Text>}
                value={stats.draftArticles}
                prefix={<EditOutlined style={{ color: '#faad14' }} />}
                loading={loading}
                valueStyle={{ fontSize: '2.5rem', fontWeight: 500, color: '#1a1a1a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          style={{
            marginBottom: '32px',
            borderRadius: '8px'
          }}
        />
      )}

      {/* Quick Start Section */}
      <Card
        style={{
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: '60px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', fontWeight: 400 }}>
          快速开始
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                fontSize: '48px',
                color: '#1890ff',
                marginBottom: '16px',
                lineHeight: 1
              }}>
                <EditOutlined />
              </div>
              <Title level={4} style={{ marginBottom: '12px' }}>写文章</Title>
              <Paragraph style={{ color: '#666', marginBottom: '20px' }}>
                使用强大的Markdown编辑器创建和编辑你的博客文章
              </Paragraph>
              <Button type="link" onClick={() => navigate('/editor')}>
                开始写作 <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                fontSize: '48px',
                color: '#52c41a',
                marginBottom: '16px',
                lineHeight: 1
              }}>
                <FileTextOutlined />
              </div>
              <Title level={4} style={{ marginBottom: '12px' }}>文章管理</Title>
              <Paragraph style={{ color: '#666', marginBottom: '20px' }}>
                查看、编辑和管理你所有的博客文章
              </Paragraph>
              <Button type="link" onClick={() => navigate('/articles')}>
                管理文章 <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{
                fontSize: '48px',
                color: '#faad14',
                marginBottom: '16px',
                lineHeight: 1
              }}>
                <PictureOutlined />
              </div>
              <Title level={4} style={{ marginBottom: '12px' }}>图片管理</Title>
              <Paragraph style={{ color: '#666', marginBottom: '20px' }}>
                上传和管理博客中使用的图片资源
              </Paragraph>
              <Button type="link" onClick={() => navigate('/images')}>
                管理图片 <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Footer CTA */}
      <div style={{
        textAlign: 'center',
        padding: '40px 0',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Title level={3} style={{ marginBottom: '16px', fontWeight: 400 }}>
          有什么想法想要分享？
        </Title>
        <Paragraph style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>
          开始记录你的想法，与世界分享你的见解
        </Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => navigate('/editor')}
          style={{
            borderRadius: '8px',
            height: '48px',
            padding: '0 32px',
            fontSize: '16px'
          }}
        >
          立即开始写作
        </Button>
      </div>
    </div>
  )
}

export default HomePage