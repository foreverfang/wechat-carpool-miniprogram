## ADDED Requirements

### Requirement: 微信小程序登录
系统 SHALL 支持微信小程序用户通过微信授权登录。

#### Scenario: 用户首次登录
- **WHEN** 用户在小程序中点击登录按钮
- **THEN** 系统调用微信登录接口获取 code
- **THEN** 系统将 code 发送到后端
- **THEN** 后端使用 code 换取 openid 和 session_key
- **THEN** 后端创建用户记录并生成 JWT token
- **THEN** 前端收到 token 并存储

#### Scenario: 用户已注册再次登录
- **WHEN** 已注册用户再次登录
- **THEN** 系统使用 openid 查找现有用户
- **THEN** 系统生成新的 JWT token 返回

### Requirement: JWT Token 认证
系统 SHALL 使用 JWT token 进行用户身份认证。

#### Scenario: 携带有效 token 访问受保护接口
- **WHEN** 用户请求受保护的 API 接口并携带有效 token
- **THEN** 系统验证 token 签名和有效期
- **THEN** 系统允许访问并返回数据

#### Scenario: 携带无效 token 访问受保护接口
- **WHEN** 用户请求受保护的 API 接口但 token 无效或过期
- **THEN** 系统返回 401 Unauthorized 错误
- **THEN** 前端引导用户重新登录

#### Scenario: 未携带 token 访问受保护接口
- **WHEN** 用户请求受保护的 API 接口但未携带 token
- **THEN** 系统返回 401 Unauthorized 错误

### Requirement: Token 刷新机制
系统 SHALL 支持 token 刷新以延长用户登录状态。

#### Scenario: Token 即将过期时刷新
- **WHEN** 用户的 token 即将过期(剩余时间少于 1 小时)
- **THEN** 前端调用刷新接口
- **THEN** 系统验证旧 token 并生成新 token
- **THEN** 前端更新存储的 token

### Requirement: 用户权限控制
系统 SHALL 实现基于角色的权限控制。

#### Scenario: 普通用户访问自己的数据
- **WHEN** 普通用户访问自己的拼车记录
- **THEN** 系统允许访问并返回数据

#### Scenario: 普通用户访问他人的私密数据
- **WHEN** 普通用户尝试访问他人的私密数据
- **THEN** 系统返回 403 Forbidden 错误

### Requirement: 用户信息获取
系统 SHALL 支持获取微信用户的基本信息。

#### Scenario: 获取用户昵称和头像
- **WHEN** 用户授权获取用户信息
- **THEN** 系统调用微信 API 获取用户昵称和头像
- **THEN** 系统更新用户记录
- **THEN** 返回更新后的用户信息
