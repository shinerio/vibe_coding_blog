import React from 'react'
import { Card, Typography, Row, Col, Statistic } from 'antd'
import { 
  FileTextOutlined, 
  PictureOutlined, 
  EditOutlined 
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
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
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="图片总数"
              value={0}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="草稿数量"
              value={0}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
      </Row>

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