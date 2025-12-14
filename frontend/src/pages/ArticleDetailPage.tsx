import React from 'react'
import { Typography, Card, Button, Space } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate(`/editor/${id}`)
  }

  const handleBack = () => {
    navigate('/articles')
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
          编辑文章
        </Button>
      </Space>
      
      <Title level={2}>文章详情</Title>
      <Card>
        <Paragraph>
          文章详情页面功能将在后续任务中实现。
        </Paragraph>
        <Paragraph>
          当前文章ID: {id}
        </Paragraph>
        <Paragraph>
          功能包括：
        </Paragraph>
        <ul>
          <li>显示文章完整内容</li>
          <li>Markdown渲染</li>
          <li>文章元数据显示</li>
          <li>编辑和返回操作</li>
        </ul>
      </Card>
    </div>
  )
}

export default ArticleDetailPage