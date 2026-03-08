# 微信拼车小程序

基于 uni-app + Vue3 + TypeScript 开发的微信拼车小程序。

## 功能特性

### 核心功能
- ✅ **双向拼车发布**：支持"人找车"和"车找人"两种模式
- ✅ **智能匹配推荐**：基于地理位置和路线的智能匹配
- ✅ **即时通讯**：内置 IM 功能，方便车主和乘客沟通
- ✅ **用户认证**：实名认证和信用评价系统
- ✅ **行程管理**：完整的行程状态跟踪和历史记录
- ✅ **地图可视化**：展示路线和上车点
- ✅ **个人中心**：拼车记录、统计数据、成就徽章

### 技术栈
- **框架**：uni-app 3.x
- **前端**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI 组件**：原生组件 + 自定义组件
- **状态管理**：Pinia（可选）
- **地图服务**：腾讯地图 / 高德地图
- **IM 服务**：腾讯云 IM SDK / WebSocket

## 项目结构

```
wechat-carpool-miniprogram/
├── src/
│   ├── pages/              # 页面
│   │   ├── home/          # 首页（拼车信息流）
│   │   ├── publish/       # 发布页
│   │   ├── chat/          # 聊天页
│   │   └── profile/       # 个人中心
│   ├── components/        # 组件
│   ├── api/              # API 接口
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── static/           # 静态资源
│   ├── App.vue           # 应用入口
│   ├── main.ts           # 主入口文件
│   └── pages.json        # 页面配置
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5
```

### 构建生产版本

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 开发指南

### 1. 配置后端 API

修改 `src/utils/request.ts` 中的 `BASE_URL`：

```typescript
const BASE_URL = 'https://your-api-domain.com/api'
```

### 2. 配置微信小程序

1. 在微信公众平台注册小程序账号
2. 获取 AppID
3. 修改 `src/manifest.json` 中的 `mp-weixin.appid`

### 3. 集成地图服务

#### 腾讯地图
```bash
npm install @dcloudio/uni-map
```

#### 高德地图
参考 uni-app 官方文档配置

### 4. 集成 IM 服务

#### 腾讯云 IM
```bash
npm install tim-wx-sdk
```

#### 自建 WebSocket
参考 `src/api/chat.ts` 实现

### 5. 添加 TabBar 图标

将图标文件放置在 `src/static/images/` 目录下：
- home.png / home-active.png
- publish.png / publish-active.png
- chat.png / chat-active.png
- profile.png / profile-active.png

## 页面说明

### 首页（home）
- 拼车信息流展示
- 人找车 / 车找人切换
- 搜索功能
- 智能匹配推荐

### 发布页（publish）
- 类型选择（人找车 / 车找人）
- 地理位置选择
- 出发时间选择
- 人数 / 座位数设置
- 备注信息

### 聊天页（chat）
- 聊天列表
- 聊天详情
- 实时消息推送
- 未读消息提醒

### 个人中心（profile）
- 用户信息展示
- 拼车记录
- 统计数据
- 评价管理
- 实名认证
- 设置

## API 接口

### 拼车相关
- `GET /rides` - 获取拼车列表
- `POST /rides` - 发布拼车信息
- `GET /rides/:id` - 获取拼车详情
- `POST /rides/:id/cancel` - 取消拼车

### 用户相关
- `GET /user/info` - 获取用户信息
- `PUT /user/info` - 更新用户信息
- `GET /user/statistics` - 获取统计数据
- `POST /auth/wx-login` - 微信登录
- `POST /user/verify` - 实名认证

### 聊天相关
- `GET /chats` - 获取聊天列表
- `GET /messages` - 获取聊天消息
- `POST /messages` - 发送消息
- `POST /messages/read/:userId` - 标记已读

## 待实现功能

- [ ] 后端 API 对接
- [ ] 地图服务集成
- [ ] IM 服务集成
- [ ] 支付功能（如需要）
- [ ] 消息推送
- [ ] 数据统计图表（uCharts / ECharts）
- [ ] 评价系统完善
- [ ] 行程匹配算法优化

## 注意事项

1. **隐私保护**：不要在代码中硬编码敏感信息（AppID、密钥等）
2. **权限申请**：使用地理位置、相机等功能需要在 manifest.json 中声明权限
3. **性能优化**：注意列表渲染性能，使用虚拟列表优化长列表
4. **兼容性**：测试不同机型和微信版本的兼容性

## License

MIT
