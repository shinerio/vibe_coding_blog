import React from 'react'
import { Typography, Card } from 'antd'

const { Title, Paragraph } = Typography

const ArticleListPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>文章管理</Title>
      <Card>
        <Paragraph>
          文章列表功能将在后续任务中实现。
        </Paragraph>
        <Paragraph>
          功能包括：
        </Paragraph>
        <ul>
          <li>显示所有文章列表</li>
          <li>支持按标题、标签、状态筛选</li>
          <li>分页显示</li>
          <li>文章操作（编辑、删除、预览）</li>
        </ul>
      </Card>
    </div>
  )
}

export default ArticleListPage