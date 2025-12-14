# 个人博客系统

这是一个前后端分离的博客系统，支持在线编写Markdown文章、图片上传和预览功能。

## 代码管理要求

1. 前端代码和后端代码要求分别管理在不同目录下，不要交叉，支持单独部署。
2. 后端需要使用java语言进行开发，数据库使用postgresql

## 安装部署要求
1. 支持将前后端打包成docker镜像进行部署

## 功能要求
1. 支持在线编写markdown文件并将文件保存在系统指定目录下
2. 支持markdown文件的在线预览
3. 支持在前端将图片转换成文本后，再调用后端接口

## 项目结构

```
blog/
├── frontend/                 # 前端应用 (React + TypeScript)
├── backend/                  # 后端服务 (Java + Spring Boot)
├── api/                      # API规范 (OpenAPI YAML)
├── docs/                     # 文档
├── docker-compose.yml        # 容器编排
└── README.md
```

## 快速开始

### 后端服务启动

进入后端目录并启动服务：

```bash
cd backend
mvn spring-boot:run
```

或者使用测试模式启动（使用嵌入式H2数据库）：

```bash
cd backend
mvn spring-boot:test-run
```

后端服务默认运行在端口8080，API基础路径为 `/api/v1`。

### 前端应用启动

进入前端目录并启动开发服务器：

```bash
cd frontend
npm install
npm run dev
```

前端应用默认运行在端口3000。

### 访问应用

- 前端界面: http://localhost:3000
- API文档: http://localhost:8080/api/v1/swagger-ui.html
- H2控制台 (测试模式): http://localhost:8080/api/v1/h2-console

## Docker部署

使用Docker Compose一键部署：

```bash
docker-compose up -d
```

## 开发环境

### 后端技术栈
- Java 21 + Spring Boot 3.x
- PostgreSQL 15 (生产环境) / H2 (测试环境)
- Maven 构建工具
- OpenAPI Generator

### 前端技术栈
- React 18 + TypeScript
- Vite 构建工具
- Ant Design UI组件库
- Monaco Editor (Markdown编辑器)
