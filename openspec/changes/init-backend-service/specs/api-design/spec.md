## ADDED Requirements

### Requirement: RESTful API 设计规范
系统 SHALL 遵循 RESTful API 设计规范。

#### Scenario: 资源命名
- **WHEN** 设计 API 路径
- **THEN** 使用名词复数形式(如 /users, /rides)
- **THEN** 使用小写字母和连字符
- **THEN** 避免使用动词

#### Scenario: HTTP 方法使用
- **WHEN** 设计 API 接口
- **THEN** GET 用于查询
- **THEN** POST 用于创建
- **THEN** PUT/PATCH 用于更新
- **THEN** DELETE 用于删除

### Requirement: 统一响应格式
系统 SHALL 使用统一的响应格式。

#### Scenario: 成功响应
- **WHEN** API 请求成功
- **THEN** 返回格式为:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": { ... }
  }
  ```

#### Scenario: 错误响应
- **WHEN** API 请求失败
- **THEN** 返回格式为:
  ```json
  {
    "code": 错误码,
    "message": "错误描述",
    "data": null
  }
  ```

### Requirement: HTTP 状态码规范
系统 SHALL 正确使用 HTTP 状态码。

#### Scenario: 状态码使用
- **WHEN** 返回 API 响应
- **THEN** 200: 成功
- **THEN** 201: 创建成功
- **THEN** 400: 请求参数错误
- **THEN** 401: 未认证
- **THEN** 403: 无权限
- **THEN** 404: 资源不存在
- **THEN** 500: 服务器错误

### Requirement: 用户认证接口
系统 SHALL 提供用户认证相关接口。

#### Scenario: 微信登录接口
- **WHEN** POST /api/auth/wechat-login
- **THEN** 请求体包含: { code: string }
- **THEN** 返回: { token: string, user: {...} }

#### Scenario: 获取用户信息接口
- **WHEN** GET /api/auth/profile
- **THEN** 需要携带 Authorization header
- **THEN** 返回当前用户信息

#### Scenario: 刷新 Token 接口
- **WHEN** POST /api/auth/refresh
- **THEN** 需要携带旧 token
- **THEN** 返回新 token

### Requirement: 拼车信息接口
系统 SHALL 提供拼车信息管理接口。

#### Scenario: 发布拼车接口
- **WHEN** POST /api/rides
- **THEN** 请求体包含拼车信息
- **THEN** 返回创建的拼车记录

#### Scenario: 查询拼车列表接口
- **WHEN** GET /api/rides
- **THEN** 支持查询参数: type, page, limit
- **THEN** 返回分页的拼车列表

#### Scenario: 查询拼车详情接口
- **WHEN** GET /api/rides/:id
- **THEN** 返回指定 ID 的拼车详情

#### Scenario: 更新拼车接口
- **WHEN** PATCH /api/rides/:id
- **THEN** 验证用户权限
- **THEN** 返回更新后的拼车信息

#### Scenario: 删除拼车接口
- **WHEN** DELETE /api/rides/:id
- **THEN** 验证用户权限
- **THEN** 软删除拼车记录

### Requirement: 聊天相关接口
系统 SHALL 提供聊天功能相关接口。

#### Scenario: 获取 IM UserSig 接口
- **WHEN** GET /api/chat/user-sig
- **THEN** 验证用户身份
- **THEN** 返回 UserSig 和 IM 配置

#### Scenario: 创建会话接口
- **WHEN** POST /api/chat/conversations
- **THEN** 请求体包含: { targetUserId: string }
- **THEN** 验证拼车关联关系
- **THEN** 返回会话 ID

### Requirement: 用户信息接口
系统 SHALL 提供用户信息管理接口。

#### Scenario: 更新用户信息接口
- **WHEN** PATCH /api/users/profile
- **THEN** 请求体包含要更新的字段
- **THEN** 返回更新后的用户信息

#### Scenario: 查询用户拼车记录接口
- **WHEN** GET /api/users/rides
- **THEN** 返回当前用户的拼车记录
- **THEN** 支持按状态筛选

### Requirement: 请求参数验证
系统 SHALL 验证所有请求参数。

#### Scenario: 参数类型验证
- **WHEN** 接收到请求
- **THEN** 验证参数类型是否正确
- **THEN** 类型错误时返回 400 错误

#### Scenario: 必填参数验证
- **WHEN** 接收到请求
- **THEN** 验证必填参数是否存在
- **THEN** 缺少必填参数时返回 400 错误

#### Scenario: 参数格式验证
- **WHEN** 接收到请求
- **THEN** 验证参数格式(如手机号、邮箱)
- **THEN** 格式错误时返回 400 错误

### Requirement: 错误处理
系统 SHALL 统一处理所有错误。

#### Scenario: 业务错误处理
- **WHEN** 发生业务错误
- **THEN** 返回对应的错误码和错误信息
- **THEN** 记录错误日志

#### Scenario: 系统错误处理
- **WHEN** 发生系统错误(如数据库连接失败)
- **THEN** 返回 500 错误
- **THEN** 记录详细错误日志
- **THEN** 不暴露敏感信息给客户端

### Requirement: API 文档
系统 SHALL 提供完整的 API 文档。

#### Scenario: Swagger 文档
- **WHEN** 访问 /api/docs
- **THEN** 显示 Swagger UI 界面
- **THEN** 包含所有接口的详细说明
- **THEN** 支持在线测试接口

### Requirement: API 限流
系统 SHALL 实现 API 限流防止滥用。

#### Scenario: 接口限流
- **WHEN** 用户频繁调用接口
- **THEN** 限制每个用户每分钟最多 60 次请求
- **THEN** 超过限制时返回 429 Too Many Requests

### Requirement: 跨域配置
系统 SHALL 配置 CORS 支持跨域请求。

#### Scenario: 开发环境跨域
- **WHEN** 前端开发环境请求 API
- **THEN** 允许所有来源的跨域请求

#### Scenario: 生产环境跨域
- **WHEN** 生产环境请求 API
- **THEN** 只允许指定域名的跨域请求
- **THEN** 配置允许的 HTTP 方法和 headers
