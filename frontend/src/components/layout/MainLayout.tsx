import React, { useState } from 'react'
import { Layout, Menu, Typography, Breadcrumb, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeOutlined, 
  EditOutlined, 
  FileTextOutlined,
  PictureOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/articles',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/editor',
      icon: <EditOutlined />,
      label: '写文章',
    },
    {
      key: '/images',
      icon: <PictureOutlined />,
      label: '图片管理',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  // 生成面包屑导航
  const generateBreadcrumb = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i)
    const breadcrumbItems = [
      {
        title: <HomeOutlined />,
        href: '/',
      }
    ]

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
      const isLast = index === pathSnippets.length - 1
      
      let title = snippet
      switch (snippet) {
        case 'articles':
          title = '文章管理'
          break
        case 'editor':
          title = '编辑器'
          break
        case 'images':
          title = '图片管理'
          break
        default:
          // 如果是数字ID，显示为"详情"
          if (/^\d+$/.test(snippet)) {
            title = '详情'
          }
      }

      breadcrumbItems.push({
        title,
        href: isLast ? undefined : url,
      })
    })

    return breadcrumbItems
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
    // 处理编辑页面的路由匹配
    if (path.startsWith('/editor')) {
      return ['/editor']
    }
    if (path.startsWith('/articles') && path !== '/articles') {
      return ['/articles']
    }
    return [path]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={200} 
        theme="light" 
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div style={{ 
          padding: collapsed ? '16px 8px' : '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0 }}>
              个人博客
            </Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ marginRight: 16 }}
          />
          <Title level={3} style={{ margin: 0, flex: 1 }}>
            个人博客管理系统
          </Title>
        </Header>
        <Content style={{ margin: '0 24px' }}>
          <Breadcrumb 
            items={generateBreadcrumb()}
            style={{ margin: '16px 0' }}
          />
          <div style={{ 
            background: '#fff', 
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout