## ADDED Requirements

### Requirement: 用户表设计
系统 SHALL 设计用户表存储用户信息。

#### Scenario: 用户表结构
- **WHEN** 创建用户表
- **THEN** 包含以下字段:
  - id: 主键,自增
  - openid: 微信 openid,唯一索引
  - unionid: 微信 unionid(可选)
  - nickname: 用户昵称
  - avatar: 用户头像 URL
  - phone: 手机号(可选)
  - im_user_id: 腾讯云 IM 用户 ID
  - rating: 用户评分,默认 5.0
  - status: 用户状态(正常/禁用)
  - created_at: 创建时间
  - updated_at: 更新时间

### Requirement: 拼车信息表设计
系统 SHALL 设计拼车信息表存储拼车数据。

#### Scenario: 拼车信息表结构
- **WHEN** 创建拼车信息表
- **THEN** 包含以下字段:
  - id: 主键,自增
  - user_id: 发布者 ID,外键关联用户表
  - type: 拼车类型(find-car/find-passenger)
  - departure: 出发地
  - destination: 目的地
  - departure_time: 出发时间
  - seats: 座位数(找乘客时必填)
  - price: 价格(可选)
  - note: 备注
  - status: 状态(active/closed/expired)
  - view_count: 浏览次数
  - created_at: 创建时间
  - updated_at: 更新时间
  - deleted_at: 软删除时间

#### Scenario: 拼车信息表索引
- **WHEN** 创建拼车信息表
- **THEN** 创建以下索引:
  - user_id 索引
  - type 索引
  - status 索引
  - departure_time 索引
  - created_at 索引

### Requirement: 拼车订单表设计
系统 SHALL 设计订单表记录拼车匹配关系。

#### Scenario: 订单表结构
- **WHEN** 创建订单表
- **THEN** 包含以下字段:
  - id: 主键,自增
  - ride_id: 拼车信息 ID,外键
  - passenger_id: 乘客 ID,外键关联用户表
  - driver_id: 司机 ID,外键关联用户表
  - status: 订单状态(pending/confirmed/completed/cancelled)
  - price: 实际价格
  - created_at: 创建时间
  - updated_at: 更新时间

### Requirement: 用户评价表设计
系统 SHALL 设计评价表存储用户互评信息。

#### Scenario: 评价表结构
- **WHEN** 创建评价表
- **THEN** 包含以下字段:
  - id: 主键,自增
  - order_id: 订单 ID,外键
  - from_user_id: 评价人 ID
  - to_user_id: 被评价人 ID
  - rating: 评分(1-5)
  - comment: 评价内容
  - created_at: 创建时间

### Requirement: 数据库迁移
系统 SHALL 使用 TypeORM 迁移管理数据库变更。

#### Scenario: 创建初始迁移
- **WHEN** 首次初始化数据库
- **THEN** 运行迁移脚本创建所有表
- **THEN** 迁移成功后记录版本号

#### Scenario: 回滚迁移
- **WHEN** 需要回滚数据库变更
- **THEN** 运行回滚命令
- **THEN** 数据库恢复到上一个版本

### Requirement: 数据库连接配置
系统 SHALL 配置数据库连接参数。

#### Scenario: 开发环境配置
- **WHEN** 在开发环境启动服务
- **THEN** 从 .env 文件读取数据库配置
- **THEN** 包含: host, port, username, password, database

#### Scenario: 生产环境配置
- **WHEN** 在生产环境启动服务
- **THEN** 从环境变量读取数据库配置
- **THEN** 启用 SSL 连接
- **THEN** 配置连接池参数

### Requirement: 数据完整性约束
系统 SHALL 确保数据完整性。

#### Scenario: 外键约束
- **WHEN** 创建表时
- **THEN** 设置外键约束
- **THEN** 删除用户时级联处理相关数据

#### Scenario: 唯一性约束
- **WHEN** 插入用户数据
- **THEN** openid 必须唯一
- **THEN** 重复插入时返回错误

### Requirement: 软删除机制
系统 SHALL 实现软删除而非物理删除。

#### Scenario: 软删除拼车信息
- **WHEN** 用户删除拼车信息
- **THEN** 系统设置 deleted_at 字段为当前时间
- **THEN** 查询时自动过滤已删除记录
- **THEN** 保留数据用于审计和恢复

### Requirement: 数据库性能优化
系统 SHALL 优化数据库查询性能。

#### Scenario: 索引优化
- **WHEN** 执行频繁查询
- **THEN** 使用索引加速查询
- **THEN** 定期分析慢查询日志

#### Scenario: 查询优化
- **WHEN** 查询拼车列表
- **THEN** 使用分页避免全表扫描
- **THEN** 只查询必要的字段
