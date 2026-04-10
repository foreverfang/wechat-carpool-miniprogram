## Why

微信拼车小程序目前只有前端页面,缺少后端服务支持,无法实现数据持久化、用户认证、拼车信息管理和实时聊天等核心功能。需要构建一个完整的后端服务来支撑小程序的业务逻辑。

## What Changes

- **新增后端服务**: 基于 Nest.js 框架构建 RESTful API 服务
- **数据库**: 使用 MySQL 存储用户、拼车信息、订单等数据
- **即时通讯**: 集成腾讯云 IM SDK,实现用户间实时聊天功能
- **用户系统**: 实现微信小程序用户登录、认证和授权机制
- **拼车业务**: 实现拼车信息发布、搜索、匹配等核心业务逻辑
- **API 接口**: 提供完整的 RESTful API 供小程序调用

## Capabilities

### New Capabilities

- `user-auth`: 用户认证和授权系统,包括微信登录、JWT token 管理、权限控制
- `ride-management`: 拼车信息管理,包括发布、查询、匹配、订单管理
- `chat-integration`: 腾讯云 IM 集成,实现用户间实时聊天功能
- `database-schema`: MySQL 数据库设计,包括用户表、拼车表、订单表等
- `api-design`: RESTful API 接口设计,定义请求/响应格式、错误处理等

### Modified Capabilities

<!-- 无现有能力需要修改 -->

## Impact

### 新增项目结构
- 创建独立的后端项目目录 `backend/`
- 使用 Nest.js CLI 初始化项目结构
- 配置 TypeScript、ESLint、Prettier 等开发工具

### 技术栈
- **框架**: Nest.js (Node.js 企业级框架)
- **数据库**: MySQL 8.0+
- **ORM**: TypeORM (Nest.js 官方推荐)
- **认证**: JWT + 微信小程序登录
- **即时通讯**: 腾讯云 IM SDK
- **API 文档**: Swagger/OpenAPI

### 依赖服务
- MySQL 数据库服务
- Redis (用于缓存和 session 管理)
- 腾讯云 IM 服务(免费体验版)
- 微信小程序开放平台(用户登录)

### 开发环境
- Node.js 18+
- pnpm 包管理器
- Docker (可选,用于本地数据库)
