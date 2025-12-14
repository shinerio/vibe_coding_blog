import React from 'react'
import { Spin, SpinProps } from 'antd'

interface LoadingProps extends SpinProps {
  tip?: string
  children?: React.ReactNode
}

const Loading: React.FC<LoadingProps> = ({ 
  tip = '加载中...', 
  children, 
  ...props 
}) => {
  if (children) {
    return (
      <Spin tip={tip} {...props}>
        {children}
      </Spin>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <Spin tip={tip} size="large" {...props} />
    </div>
  )
}

export default Loading