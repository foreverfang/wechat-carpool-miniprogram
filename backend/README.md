# 拼车小程序后端服务

基于 Nest.js + TypeScript + MySQL 构建的微信拼车小程序后端服务。

## 技术栈

- **框架**: Nest.js 11.x
- **语言**: TypeScript 4.9
- **数据库**: MySQL 8.0
- **ORM**: TypeORM 0.3
- **认证**: JWT + 微信小程序登录
- **即时通讯**: 腾讯云 IM SDK
- **API 文档**: Swagger/OpenAPI

## 功能特性

- ✅ 微信小程序用户登录
- ✅ JWT Token 认证
- ✅ 用户信息管理
- ✅ 拼车信息发布、查询、修改、删除
- ✅ 拼车列表筛选和分页
- ✅ 统一响应格式
- ✅ 全局异常处理
- ✅ API 限流保护
- ✅ Swagger API 文档

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置:

```bash
cp .env.example .env
```

### 启动服务

开发模式:
```bash
pnpm run start:dev
```

### 访问 API 文档

启动服务后访问: http://localhost:3000/api/docs

## API 接口

详见 Swagger 文档: http://localhost:3000/api/docs

## 许可证

MIT
