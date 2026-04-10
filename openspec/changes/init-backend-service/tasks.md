## 1. 项目初始化

- [x] 1.1 使用 Nest CLI 创建新项目 `backend`
- [x] 1.2 配置 TypeScript、ESLint、Prettier
- [x] 1.3 安装核心依赖: @nestjs/typeorm, typeorm, mysql2
- [x] 1.4 安装认证依赖: @nestjs/jwt, @nestjs/passport, passport-jwt
- [x] 1.5 安装工具依赖: @nestjs/config, @nestjs/swagger, class-validator
- [x] 1.6 创建 .env.example 文件定义环境变量
- [x] 1.7 配置 .gitignore 排除敏感文件
- [x] 1.8 创建基础项目结构(modules, config, database 目录)

## 2. 数据库配置

- [x] 2.1 配置 TypeORM 连接 MySQL
- [x] 2.2 创建 User 实体(用户表)
- [x] 2.3 创建 Ride 实体(拼车信息表)
- [x] 2.4 创建 Order 实体(订单表)
- [x] 2.5 创建 Rating 实体(评价表)
- [x] 2.6 生成初始数据库迁移文件
- [x] 2.7 编写迁移脚本创建所有表和索引
- [x] 2.8 测试迁移脚本的执行和回滚

## 3. 用户认证模块

- [x] 3.1 创建 Auth 模块(nest g module auth)
- [x] 3.2 创建 Auth 服务实现微信登录逻辑
- [x] 3.3 实现 code 换取 openid 的功能
- [x] 3.4 实现 JWT token 生成和验证
- [x] 3.5 创建 JWT 策略(JwtStrategy)
- [x] 3.6 创建 Auth Guard 保护路由
- [x] 3.7 创建 Auth Controller 提供登录接口
- [x] 3.8 实现 token 刷新接口
- [x] 3.9 添加 Swagger 文档注解

## 4. 用户模块

- [x] 4.1 创建 User 模块(nest g module user)
- [x] 4.2 创建 User 服务实现用户 CRUD
- [x] 4.3 创建 User Controller 提供用户接口
- [x] 4.4 实现获取用户信息接口
- [x] 4.5 实现更新用户信息接口
- [x] 4.6 实现查询用户拼车记录接口
- [x] 4.7 添加参数验证 DTO
- [x] 4.8 添加 Swagger 文档注解

## 5. 拼车信息模块

- [x] 5.1 创建 Ride 模块(nest g module ride)
- [x] 5.2 创建 Ride 服务实现拼车 CRUD
- [x] 5.3 创建 Ride Controller 提供拼车接口
- [x] 5.4 实现发布拼车接口
- [x] 5.5 实现查询拼车列表接口(支持筛选和分页)
- [x] 5.6 实现查询拼车详情接口
- [x] 5.7 实现更新拼车接口(权限验证)
- [x] 5.8 实现删除拼车接口(软删除)
- [x] 5.9 实现拼车状态自动更新(定时任务)
- [x] 5.10 添加参数验证 DTO
- [x] 5.11 添加 Swagger 文档注解

## 6. 腾讯云 IM 集成

- [x] 6.1 安装腾讯云 IM SDK: tencentcloud-sdk-nodejs
- [x] 6.2 创建 Chat 模块(nest g module chat)
- [x] 6.3 创建 IM 服务封装腾讯云 IM SDK
- [x] 6.4 实现 IM SDK 初始化
- [x] 6.5 实现创建 IM 账号功能
- [x] 6.6 实现生成 UserSig 功能
- [x] 6.7 在用户注册时自动创建 IM 账号
- [x] 6.8 创建 Chat Controller 提供聊天接口
- [x] 6.9 实现获取 UserSig 接口
- [x] 6.10 实现创建会话接口(验证拼车关联)
- [x] 6.11 添加 Swagger 文档注解

## 7. 公共模块

- [x] 7.1 创建统一响应拦截器(ResponseInterceptor)
- [x] 7.2 创建统一异常过滤器(HttpExceptionFilter)
- [x] 7.3 创建业务错误码枚举
- [x] 7.4 创建分页 DTO
- [x] 7.5 创建日志服务(使用 Winston)
- [x] 7.6 配置 Swagger 文档
- [x] 7.7 配置 CORS 跨域
- [x] 7.8 配置 API 限流(ThrottlerModule)

## 8. 测试

- [ ] 8.1 编写 Auth 模块单元测试
- [ ] 8.2 编写 User 模块单元测试
- [ ] 8.3 编写 Ride 模块单元测试
- [ ] 8.4 编写 Chat 模块单元测试
- [ ] 8.5 编写 E2E 测试(登录流程)
- [ ] 8.6 编写 E2E 测试(拼车发布流程)
- [ ] 8.7 测试 API 限流功能
- [ ] 8.8 测试错误处理

## 9. 文档和部署

- [x] 9.1 完善 README.md 文档
- [x] 9.2 编写环境配置说明
- [x] 9.3 编写数据库迁移说明
- [x] 9.4 编写 API 使用文档
- [ ] 9.5 配置生产环境变量
- [x] 9.6 编写 Dockerfile
- [x] 9.7 编写 docker-compose.yml(包含 MySQL 和 Redis)
- [ ] 9.8 部署到服务器并测试

## 10. 前后端联调

- [ ] 10.1 前端配置后端 API 地址
- [ ] 10.2 测试微信登录流程
- [ ] 10.3 测试拼车发布功能
- [ ] 10.4 测试拼车查询功能
- [ ] 10.5 测试聊天功能(腾讯云 IM)
- [ ] 10.6 测试用户信息更新
- [ ] 10.7 修复联调中发现的问题
- [ ] 10.8 性能测试和优化
