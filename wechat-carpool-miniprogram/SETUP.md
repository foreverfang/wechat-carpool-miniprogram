# 项目初始化指南

## 已完成的工作

✅ 项目结构已创建完成
✅ 所有核心页面已实现
✅ API 接口层已搭建
✅ TypeScript 类型定义已完成
✅ 页面路由和 TabBar 已配置

## 下一步操作

### 1. 安装依赖

```bash
cd wechat-carpool-miniprogram
npm install
```

### 2. 配置微信小程序

1. 在微信公众平台注册小程序账号：https://mp.weixin.qq.com/
2. 获取 AppID
3. 修改 `src/manifest.json` 中的 `mp-weixin.appid` 字段

### 3. 准备 TabBar 图标

在 `src/static/images/` 目录下添加以下图标文件（建议尺寸 81x81px）：
- home.png / home-active.png
- publish.png / publish-active.png
- chat.png / chat-active.png
- profile.png / profile-active.png

### 4. 配置后端 API

修改 `src/utils/request.ts` 中的 `BASE_URL`：
```typescript
const BASE_URL = 'https://your-api-domain.com/api'
```

### 5. 启动开发服务器

```bash
# 微信小程序开发模式
npm run dev:mp-weixin
```

### 6. 导入微信开发者工具

1. 下载并安装微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 打开微信开发者工具
3. 导入项目，选择 `dist/dev/mp-weixin` 目录
4. 填入 AppID
5. 开始开发调试

## 可选配置

### 集成地图服务

#### 方案一：腾讯地图（推荐）
```bash
npm install @dcloudio/uni-map
```

在 `src/manifest.json` 中配置：
```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于拼车匹配"
      }
    }
  }
}
```

#### 方案二：高德地图
参考 uni-app 官方文档：https://uniapp.dcloud.net.cn/api/location/map.html

### 集成 IM 服务

#### 方案一：腾讯云 IM（推荐）
```bash
npm install tim-wx-sdk
```

参考文档：https://cloud.tencent.com/document/product/269

#### 方案二：自建 WebSocket
在 `src/api/chat.ts` 中实现 WebSocket 连接逻辑

### 添加状态管理（Pinia）

```bash
npm install pinia
```

创建 `src/store/index.ts`：
```typescript
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

在 `src/main.ts` 中引入：
```typescript
import pinia from './store'

app.use(pinia)
```

### 集成图表库（可选）

#### uCharts
```bash
npm install @qiun/ucharts
```

#### ECharts
```bash
npm install echarts
npm install echarts-for-weixin
```

## 开发建议

### 1. 代码规范
- 使用 ESLint + Prettier 统一代码风格
- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 类型检查

### 2. 性能优化
- 使用虚拟列表优化长列表渲染
- 图片使用 webp 格式并压缩
- 合理使用分包加载

### 3. 用户体验
- 添加骨架屏提升加载体验
- 实现下拉刷新和上拉加载
- 添加空状态和错误提示

### 4. 安全性
- 敏感信息不要硬编码
- API 请求添加签名验证
- 用户输入进行校验和过滤

## 后端 API 开发建议

### 技术栈推荐
- Node.js + Express / Koa
- Python + FastAPI / Django
- Java + Spring Boot
- Go + Gin

### 数据库
- MySQL / PostgreSQL（关系型）
- MongoDB（文档型）
- Redis（缓存）

### 核心功能
1. 用户认证（微信登录、JWT）
2. 拼车信息 CRUD
3. 地理位置匹配算法
4. 即时通讯（WebSocket）
5. 消息推送（微信模板消息）
6. 评价系统
7. 统计分析

## 部署上线

### 1. 小程序审核
- 完善小程序信息
- 准备隐私政策和用户协议
- 提交审核（通常 1-7 天）

### 2. 服务器部署
- 购买云服务器（阿里云、腾讯云等）
- 配置 HTTPS 证书（必须）
- 部署后端 API
- 配置域名白名单

### 3. 监控和维护
- 接入错误监控（Sentry）
- 配置日志系统
- 定期备份数据
- 收集用户反馈

## 常见问题

### Q: 如何调试小程序？
A: 使用微信开发者工具的调试功能，支持断点、网络请求查看等。

### Q: 如何处理跨域问题？
A: 小程序不存在跨域问题，但需要在微信公众平台配置服务器域名白名单。

### Q: 如何实现实时通讯？
A: 可以使用 WebSocket 或集成第三方 IM 服务（如腾讯云 IM）。

### Q: 如何优化小程序性能？
A: 使用分包加载、图片懒加载、虚拟列表等技术。

## 联系方式

如有问题，请提交 Issue 或联系开发团队。

---

祝开发顺利！🚀
