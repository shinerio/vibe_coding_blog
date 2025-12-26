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

### 构建镜像

```bash
# 构建所有服务镜像
docker-compose build

# 仅构建前端镜像
docker-compose build frontend

# 仅构建后端镜像
docker-compose build backend

# 无缓存重新构建
docker-compose build --no-cache
```

### 启动服务

```bash
# 后台启动所有服务
docker-compose up -d

# 前台启动（可查看日志）
docker-compose up

# 启动并重新构建
docker-compose up -d --build
```

### 服务管理

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器及数据卷
docker-compose down -v
```

### 访问地址

- **本地访问**: http://localhost:3000
- **远程访问**: http://<服务器IP>:3000
- **后端API**: http://<服务器IP>:8080/api/v1

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
