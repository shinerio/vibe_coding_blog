import React from 'react'
import { Card, Typography, Row, Col, Statistic, Spin, Alert } from 'antd'
import {
  FileTextOutlined,
  PictureOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useDashboardStats } from '../hooks/useDashboardStats'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
  const { stats, loading, error } = useDashboardStats()

  return (
    <div>
      <Title level={2}>欢迎使用个人博客系统</Title>
      <Paragraph>
        这是一个现代化的个人博客管理系统，支持Markdown编辑、图片管理和文章发布。
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="文章总数"
              value={stats.totalArticles}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="图片总数"
              value={stats.totalImages}
              prefix={<PictureOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="草稿数量"
              value={stats.draftArticles}
              prefix={<EditOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}

      <Card style={{ marginTop: '32px' }}>
        <Title level={3}>快速开始</Title>
        <Paragraph>
          <ul>
            <li>点击"写文章"开始创建新的博客文章</li>
            <li>使用"文章管理"查看和编辑已有文章</li>
            <li>通过"图片管理"上传和管理图片资源</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  )
}

export default HomePage