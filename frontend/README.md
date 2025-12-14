# 个人博客系统 - 前端应用

基于 React + TypeScript + Vite + Ant Design 构建的现代化博客管理前端应用。

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Ant Design** - 企业级UI组件库
- **React Router** - 客户端路由
- **Axios** - HTTP客户端

## 开发环境

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   └── layout/         # 布局组件
├── pages/              # 页面组件
├── router/             # 路由配置
├── services/           # API服务
├── types/              # TypeScript类型定义
├── App.tsx             # 根组件
└── main.tsx            # 应用入口
```

## 环境变量

- `VITE_API_BASE_URL` - 后端API基础URL
- `VITE_APP_TITLE` - 应用标题
- `VITE_APP_VERSION` - 应用版本

## API集成

前端通过Axios与后端Spring Boot应用通信，支持：

- 统一错误处理
- 请求/响应拦截器
- 自动代理配置（开发环境）

## 开发指南

1. 所有API调用都通过 `services/` 目录下的服务类进行
2. 使用TypeScript类型确保类型安全
3. 遵循Ant Design设计规范
4. 组件采用函数式组件 + Hooks模式