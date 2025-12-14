import React from 'react'
import { Typography, Card } from 'antd'

const { Title, Paragraph } = Typography

const ImageManagePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>图片管理</Title>
      <Card>
        <Paragraph>
          图片管理功能将在后续任务中实现。
        </Paragraph>
        <Paragraph>
          功能包括：
        </Paragraph>
        <ul>
          <li>图片上传（拖拽和点击选择）</li>
          <li>Base64转换和预览</li>
          <li>图片列表显示</li>
          <li>图片删除和管理</li>
          <li>图片格式和大小验证</li>
        </ul>
      </Card>
    </div>
  )
}

export default ImageManagePage