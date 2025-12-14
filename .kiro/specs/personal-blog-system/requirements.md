# 需求文档

## 介绍

个人博客系统是一个前后端分离的Web应用程序，支持用户在线编写、预览和管理Markdown博客文章。系统采用Java后端和现代前端技术栈，支持Docker容器化部署。

## 术语表

- **博客系统 (Blog_System)**: 完整的前后端分离博客应用程序
- **前端应用 (Frontend_App)**: 用户界面和客户端逻辑
- **后端服务 (Backend_Service)**: 服务器端API和业务逻辑
- **Markdown编辑器 (Markdown_Editor)**: 在线文本编辑组件
- **文章管理器 (Article_Manager)**: 处理文章CRUD操作的模块
- **图片处理器 (Image_Processor)**: 处理图片上传和转换的组件
- **Docker镜像 (Docker_Image)**: 容器化部署包
- **API规范 (API_Specification)**: OpenAPI YAML格式的接口定义文档
- **代码生成器 (Code_Generator)**: 基于OpenAPI规范生成服务端接口代码的工具

## 需求

### 需求 1

**用户故事:** 作为博客作者，我希望能够在线编写Markdown文章，以便随时随地创作内容。

#### 验收标准

1. THE 前端应用 SHALL 提供Markdown编辑器界面
2. WHEN 用户输入Markdown内容时，THE Markdown编辑器 SHALL 实时显示格式化预览
3. WHEN 用户保存文章时，THE 后端服务 SHALL 将Markdown文件存储到指定目录
4. THE 后端服务 SHALL 使用PostgreSQL数据库存储文章元数据
5. THE 后端服务 SHALL 提供RESTful API接口用于文章管理

### 需求 2

**用户故事:** 作为博客作者，我希望能够预览Markdown文章的最终效果，以便确认文章格式正确。

#### 验收标准

1. THE 前端应用 SHALL 提供Markdown预览功能
2. WHEN 用户选择预览模式时，THE 前端应用 SHALL 渲染Markdown为HTML格式
3. THE 前端应用 SHALL 支持实时预览和编辑模式切换
4. THE 前端应用 SHALL 正确显示Markdown语法元素包括标题、列表、代码块和链接

### 需求 3

**用户故事:** 作为博客作者，我希望能够上传图片并转换为文本格式，以便在文章中引用图片。

#### 验收标准

1. THE 前端应用 SHALL 提供图片上传界面
2. WHEN 用户上传图片时，THE 前端应用 SHALL 将图片转换为Base64文本格式
3. WHEN 图片转换完成时，THE 前端应用 SHALL 调用后端服务API保存图片数据
4. THE 后端服务 SHALL 提供图片存储和检索API接口
5. THE 后端服务 SHALL 返回图片的唯一标识符供文章引用

### 需求 4

**用户故事:** 作为系统管理员，我希望能够独立部署前端和后端服务，以便实现灵活的部署架构。

#### 验收标准

1. THE 前端应用 SHALL 构建为独立的静态资源包
2. THE 后端服务 SHALL 构建为独立的Java应用程序
3. THE 博客系统 SHALL 支持前端和后端代码分别管理在不同目录
4. THE 前端应用 SHALL 通过HTTP API与后端服务通信
5. THE 前端应用和后端服务 SHALL 支持独立部署到不同服务器

### 需求 5

**用户故事:** 作为运维人员，我希望能够使用Docker容器部署博客系统，以便简化部署和运维流程。

#### 验收标准

1. THE 前端应用 SHALL 提供Dockerfile构建Docker镜像
2. THE 后端服务 SHALL 提供Dockerfile构建Docker镜像
3. THE Docker镜像 SHALL 包含所有必要的运行时依赖
4. THE 博客系统 SHALL 提供docker-compose配置文件
5. WHEN 使用Docker部署时，THE 博客系统 SHALL 正常启动并提供完整功能

### 需求 6

**用户故事:** 作为博客作者，我希望系统能够管理我的所有文章，以便组织和查找内容。

#### 验收标准

1. THE 后端服务 SHALL 使用PostgreSQL数据库存储文章信息
2. THE 后端服务 SHALL 提供文章列表查询API
3. THE 后端服务 SHALL 支持按标题、日期、标签筛选文章
4. THE 前端应用 SHALL 显示文章列表和详情页面
5. THE 后端服务 SHALL 支持文章的创建、读取、更新和删除操作

### 需求 7

**用户故事:** 作为开发人员，我希望遵循API First原则设计接口，以便确保前后端开发的一致性和规范性。

#### 验收标准

1. THE 博客系统 SHALL 首先定义OpenAPI YAML格式的API规范文档
2. THE API规范 SHALL 包含所有前后端交互接口的完整定义
3. THE 后端服务 SHALL 使用openapi-generator工具生成服务端接口代码
4. THE API规范 SHALL 定义请求响应格式、数据模型和错误处理
5. THE 前端应用 SHALL 基于API规范实现接口调用

### 需求 8

**用户故事:** 作为开发人员，我希望使用嵌入式数据库进行测试和本地调试，以便提高开发效率和测试可靠性。

#### 验收标准

1. THE 后端服务 SHALL 在测试环境中使用嵌入式数据库替代PostgreSQL
2. THE 后端服务 SHALL 在test目录下提供独立的main入口类
3. WHEN 运行测试main入口时，THE 后端服务 SHALL 使用嵌入式数据库启动临时服务
4. THE 测试main入口 SHALL 支持手动调试和API测试
5. THE 嵌入式数据库配置 SHALL 与生产环境PostgreSQL保持数据结构一致性