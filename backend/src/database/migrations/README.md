# 数据库迁移说明

## 开发环境

开发环境使用 TypeORM 的 `synchronize: true`,会自动同步实体到数据库。

## 生产环境迁移

生产环境需要手动执行迁移:

### 1. 生成迁移文件

```bash
npm run typeorm migration:generate -- -n InitialSchema
```

### 2. 运行迁移

```bash
npm run typeorm migration:run
```

### 3. 回滚迁移

```bash
npm run typeorm migration:revert
```

## 数据库表结构

### users 表
- 用户基本信息
- 微信 openid 唯一索引
- IM 用户 ID 关联

### rides 表
- 拼车信息
- 软删除支持
- 状态管理(active/closed/expired)

### orders 表
- 拼车订单
- 关联乘客和司机

### ratings 表
- 用户评价
- 关联订单
