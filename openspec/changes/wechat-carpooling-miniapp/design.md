## Context

本项目为全新微信小程序，面向微信群内的拼车场景。用户通过微信授权登录，可发布或加入拼车行程，并通过订阅消息接收关键节点通知。后端选用微信云开发（CloudBase），省去服务器运维成本，天然与微信生态集成。

当前无任何已有代码，从零开始建设。

## Goals / Non-Goals

**Goals:**
- 定义前端小程序的页面结构和技术选型
- 定义云开发数据库集合结构（Schema）
- 定义云函数的职责划分
- 明确用户身份体系和权限模型
- 明确拼车行程的状态机

**Non-Goals:**
- 不做实时聊天（群友可通过微信直接联系）
- 不做在线支付（费用分摊线下结算）
- 不做地图路线规划（仅录入文字地址）
- 不做评价/信用体系（MVP 阶段）
- 不做多群隔离（MVP 阶段所有用户共享一个列表）

## Decisions

### 1. 前端框架：微信小程序原生 vs Taro

**决策**：使用微信小程序原生框架（WXML/WXSS/JS）

**理由**：
- MVP 阶段只需支持微信一端，无跨端需求
- 原生框架无额外编译依赖，调试链路更短
- 云开发 SDK 与原生小程序集成最成熟

**放弃 Taro 的原因**：跨端能力在此场景无价值，增加初期复杂度。

---

### 2. 后端架构：云开发（CloudBase）

**决策**：使用微信云开发，采用云函数 + 云数据库 + 云存储组合

**理由**：
- 免服务器运维，按需计费，适合低频 MVP
- openid 鉴权由微信平台保证，无需自建 auth 体系
- 云数据库支持实时监听，未来可扩展

**云函数划分**：

| 云函数 | 职责 |
|--------|------|
| `login` | 获取用户 openid，写入或更新 users 集合 |
| `createRide` | 创建拼车行程，校验字段，写入 rides 集合 |
| `getRides` | 查询有效行程列表（状态为 open，按时间排序） |
| `joinRide` | 提交加入申请，写入 join_requests，触发通知 |
| `handleJoinRequest` | 车主确认/拒绝申请，更新申请状态和行程座位数 |
| `getMyTrips` | 查询当前用户发起和参与的行程 |
| `sendNotify` | 封装订阅消息发送逻辑（被其他函数调用） |

---

### 3. 数据库 Schema

**users 集合**

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 云数据库自动生成 |
| `openid` | string | 微信 openid，唯一索引 |
| `nickName` | string | 微信昵称 |
| `avatarUrl` | string | 头像 URL |
| `createdAt` | timestamp | 首次登录时间 |

**rides 集合**

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 行程 ID |
| `ownerOpenid` | string | 发起人 openid |
| `ownerNickName` | string | 发起人昵称（冗余，减少 join） |
| `from` | string | 出发地（文字） |
| `to` | string | 目的地（文字） |
| `departAt` | timestamp | 出发时间 |
| `totalSeats` | number | 总座位数（不含司机） |
| `takenSeats` | number | 已占座位数 |
| `feeDesc` | string | 费用说明（如"AA 制，约 20 元"） |
| `status` | string | `open` / `full` / `cancelled` / `done` |
| `createdAt` | timestamp | 创建时间 |

**join_requests 集合**

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 申请 ID |
| `rideId` | string | 关联行程 ID |
| `applicantOpenid` | string | 申请人 openid |
| `applicantNickName` | string | 申请人昵称 |
| `applicantAvatar` | string | 申请人头像 |
| `status` | string | `pending` / `accepted` / `rejected` |
| `createdAt` | timestamp | 申请时间 |

---

### 4. 行程状态机

```
open → full（座位满）
open → cancelled（车主取消）
open/full → done（出发时间过后自动标记，或车主手动）
full → open（有人退出，座位释放）
```

---

### 5. 用户身份与权限

- 所有接口通过云函数调用，微信平台自动注入 `openid`，无需 token
- 数据库安全规则：用户只能修改自己创建的文档
- 敏感操作（取消行程、处理申请）在云函数中校验 `openid` 是否为 owner

---

### 6. 页面结构

```
pages/
├── index/          # 首页：拼车列表（ride-browse）
├── publish/        # 发布拼车（ride-publish）
├── detail/         # 行程详情 + 申请加入（ride-join）
├── my-trips/       # 我的行程（my-trips）
└── requests/       # 我发起行程的申请管理（ride-join 车主侧）
```

底部 TabBar：首页 | 发布 | 我的

## Risks / Trade-offs

- **[风险] 订阅消息需用户主动授权** → 缓解：在发布行程和加入行程时引导用户订阅，降低通知缺失影响
- **[风险] 云开发免费额度有限** → 缓解：MVP 阶段用户量小，超出再付费升级；查询添加必要索引减少读次数
- **[风险] 地址为纯文字，搜索精度低** → 缓解：MVP 接受此限制，后续可接入腾讯地图选点组件
- **[取舍] 无实时更新** → 进入列表页时主动拉取最新数据，暂不使用实时监听（降低复杂度）
- **[取舍] 无多群隔离** → MVP 阶段适用于单一群场景，若需要多群可后续引入群 ID 字段

## Open Questions

- 小程序是否需要审核上线，还是仅体验版在群内分享即可？（影响订阅消息模板申请）
- 出发时间过期的行程是否自动标记为 done？若是，需要定时云函数（计划触发器）
