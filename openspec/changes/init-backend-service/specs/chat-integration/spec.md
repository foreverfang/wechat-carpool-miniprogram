## ADDED Requirements

### Requirement: 腾讯云 IM SDK 集成
系统 SHALL 集成腾讯云 IM SDK 实现即时通讯功能。

#### Scenario: 初始化 IM SDK
- **WHEN** 后端服务启动
- **THEN** 系统使用 SDKAppID 和密钥初始化腾讯云 IM SDK
- **THEN** 验证 SDK 初始化成功

### Requirement: 用户 IM 账号创建
系统 SHALL 为每个用户创建对应的 IM 账号。

#### Scenario: 新用户注册时创建 IM 账号
- **WHEN** 新用户完成微信登录
- **THEN** 系统使用用户 ID 在腾讯云 IM 创建账号
- **THEN** 系统存储 IM UserID 与用户的映射关系

#### Scenario: IM 账号创建失败
- **WHEN** 创建 IM 账号失败
- **THEN** 系统记录错误日志
- **THEN** 系统标记用户 IM 状态为"未初始化"
- **THEN** 后续可重试创建

### Requirement: IM UserSig 生成
系统 SHALL 为用户生成 IM UserSig 用于登录。

#### Scenario: 用户请求 IM UserSig
- **WHEN** 用户请求获取 IM UserSig
- **THEN** 系统验证用户身份
- **THEN** 系统使用私钥生成 UserSig
- **THEN** 返回 UserSig 给前端

#### Scenario: UserSig 有效期
- **WHEN** 生成 UserSig
- **THEN** 有效期设置为 7 天
- **THEN** 过期后用户需重新获取

### Requirement: 单聊会话创建
系统 SHALL 支持用户之间创建单聊会话。

#### Scenario: 用户发起聊天
- **WHEN** 用户 A 点击与用户 B 聊天
- **THEN** 系统检查两人是否有拼车关联
- **THEN** 系统创建或获取单聊会话
- **THEN** 返回会话 ID 给前端

#### Scenario: 无拼车关联禁止聊天
- **WHEN** 用户 A 尝试与无拼车关联的用户 B 聊天
- **THEN** 系统返回 403 Forbidden 错误
- **THEN** 提示"只能与拼车相关用户聊天"

### Requirement: 消息发送
系统 SHALL 支持用户发送文本消息。

#### Scenario: 发送文本消息
- **WHEN** 用户在聊天界面发送文本消息
- **THEN** 前端调用腾讯云 IM SDK 发送消息
- **THEN** 消息实时推送给接收方
- **THEN** 发送方收到发送成功回执

#### Scenario: 发送消息失败
- **WHEN** 消息发送失败(网络问题等)
- **THEN** 前端显示发送失败状态
- **THEN** 用户可以重试发送

### Requirement: 消息接收
系统 SHALL 支持用户接收实时消息。

#### Scenario: 在线接收消息
- **WHEN** 用户在线且收到新消息
- **THEN** 前端实时显示新消息
- **THEN** 消息列表自动滚动到最新

#### Scenario: 离线消息推送
- **WHEN** 用户离线时收到消息
- **THEN** 腾讯云 IM 存储离线消息
- **THEN** 用户下次上线时拉取离线消息

### Requirement: 会话列表
系统 SHALL 提供用户的会话列表。

#### Scenario: 查看会话列表
- **WHEN** 用户打开消息页面
- **THEN** 系统返回用户的所有会话
- **THEN** 显示最后一条消息和时间
- **THEN** 显示未读消息数量
- **THEN** 按最后消息时间倒序排列

#### Scenario: 会话未读数
- **WHEN** 用户收到新消息
- **THEN** 对应会话的未读数+1
- **THEN** 用户打开会话后未读数清零

### Requirement: 消息历史记录
系统 SHALL 支持查询历史消息。

#### Scenario: 加载历史消息
- **WHEN** 用户在聊天界面上滑加载更多
- **THEN** 系统从腾讯云 IM 拉取历史消息
- **THEN** 每次加载 20 条
- **THEN** 按时间顺序显示

### Requirement: 敏感词过滤
系统 SHALL 对消息内容进行敏感词过滤。

#### Scenario: 消息包含敏感词
- **WHEN** 用户发送包含敏感词的消息
- **THEN** 腾讯云 IM 自动过滤敏感词
- **THEN** 接收方看到过滤后的消息(敏感词用 * 替换)

### Requirement: IM 配置管理
系统 SHALL 管理腾讯云 IM 的配置信息。

#### Scenario: 配置信息安全存储
- **WHEN** 系统启动时加载 IM 配置
- **THEN** SDKAppID 和密钥从环境变量读取
- **THEN** 不在代码中硬编码敏感信息
