# 地图选点与路线展示功能设计文档

**日期**: 2026-03-21
**状态**: 已批准
**范围**: 微信拼车小程序 - 发布页地图选点 + 拼车详情路线展示

---

## 一、需求概述

在发布拼车信息时，出发地和目的地改为通过地图选点（调用 `wx.chooseLocation`），同时车找人类型支持添加途径点。乘客可在拼车详情页查看车主规划的路线地图。

---

## 二、数据结构变更

### 新增类型（`src/types/index.ts`）

```ts
interface LocationPoint {
  name: string
  latitude: number
  longitude: number
}
```

### 扩展 `PublishRideParams`

```ts
export interface PublishRideParams {
  type: RideType
  departure: string
  departureLocation?: LocationPoint
  destination: string
  destinationLocation?: LocationPoint
  waypoints?: LocationPoint[]   // 仅 find-passenger，最多3个
  departureTime: string
  seats?: number
  price?: number
  note?: string
}
```

### 扩展 `Ride`（已有 `departureLocation` / `destinationLocation`，补充 `waypoints`）

```ts
waypoints?: LocationPoint[]
```

---

## 三、发布页改动（`src/pages/publish/index.vue`）

### 出发地 / 目的地

- 将 `<input>` 替换为可点击的 `<view>`
- 点击调用 `wx.chooseLocation()`
- 回调写入地址文本（`formData.departure`）和坐标（`formData.departureLocation`）
- 未选时显示灰色占位文字，已选时显示地址名称 + 📍图标

### 途径点区块

- 仅 `type === 'find-passenger'` 时渲染
- 显示已添加途径点列表，每项右侧有删除按钮
- "添加途径点"按钮，已达3个时禁用并提示"最多3个途径点"
- 每个途径点通过 `wx.chooseLocation()` 选取

### 验证逻辑

- 出发地/目的地必须已通过地图选点（有坐标），否则提示"请通过地图选择地点"
- 途径点为可选项，不强制

---

## 四、详情页（新建 `src/pages/ride/detail.vue`）

### 页面结构

```
┌─────────────────────────────┐
│  <map> 组件（高度 400rpx）   │
│  - 出发地绿色标记            │
│  - 途径点蓝色标记（可选）    │
│  - 目的地红色标记            │
│  - polyline 折线连接         │
└─────────────────────────────┘
│  拼车基本信息                │
│  出发地 → 目的地             │
│  途径点列表（如有）          │
│  出发时间 / 座位 / 价格      │
│  备注                        │
└─────────────────────────────┘
│  [联系车主] 按钮             │
└─────────────────────────────┘
```

### 地图标记规则

| 点类型 | 颜色 | iconPath |
|--------|------|----------|
| 出发地 | 绿色 | 使用 `<map>` markers 的 callout |
| 途径点 | 蓝色 | 同上 |
| 目的地 | 红色 | 同上 |

### 数据获取

- `onLoad(options)` 接收 `id` 参数
- 调用 `getRideDetail(id)` 获取拼车详情
- 若无坐标数据（旧数据兼容），隐藏地图区块，仅展示文字

### 联系车主

- 点击按钮跳转 `TUIKit/components/TUIChat/index?userId=xxx`

---

## 五、首页改动（`src/pages/home/index.vue`）

- `viewDetail(ride)` 改为：
  ```ts
  uni.navigateTo({ url: `/pages/ride/detail?id=${ride.id}` })
  ```

---

## 六、路由注册（`src/pages.json`）

```json
{
  "path": "pages/ride/detail",
  "style": {
    "navigationBarTitleText": "拼车详情"
  }
}
```

---

## 七、不在本次范围内

- 乘客侧路线规划（导航功能）
- 途径点方案B（WebView 自定义地图）
- 后端接口变更（坐标字段后端已有）

---

## 八、权限配置

`wx.chooseLocation` 需要地理位置权限，在 `src/manifest.json` 的 `mp-weixin` 节点下声明：

```json
"permission": {
  "scope.userLocation": {
    "desc": "选择出发地和目的地需要获取您的位置信息"
  }
}
```

---

## 九、地图标记与折线规则

### 标记（markers）

| 点类型 | 标记颜色方案 | callout 标题 |
|--------|-------------|-------------|
| 出发地 | 使用微信默认红色标记（无自定义图标） | "出发地" |
| 途径点 | 使用微信默认蓝色标记 | "途径点N" |
| 目的地 | 使用微信默认红色标记 | "目的地" |

暂不使用自定义 iconPath，使用 `<map>` markers 默认样式即可。

### 折线（polyline）

连接顺序：**出发地 → 途径点1 → 途径点2 → 途径点3 → 目的地**（按添加顺序，不做地理优化）

```ts
// 构建 polyline points
const points = [
  departureLocation,
  ...waypoints,
  destinationLocation
].map(p => ({ latitude: p.latitude, longitude: p.longitude }))
```

### 地图初始视图

自动计算所有标记点的中心坐标作为地图中心，`scale` 固定为 `12`（城市级别），适合大多数城市内路线。

```ts
const centerLat = points.reduce((s, p) => s + p.latitude, 0) / points.length
const centerLng = points.reduce((s, p) => s + p.longitude, 0) / points.length
```

---

## 十、错误处理

### wx.chooseLocation 失败处理

```ts
wx.chooseLocation({
  success: (res) => { /* 写入数据 */ },
  fail: (err) => {
    // 用户取消：err.errMsg 包含 'cancel'，静默处理
    // 定位失败：提示"获取位置失败，请检查定位权限"
    if (!err.errMsg?.includes('cancel')) {
      uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
    }
  }
})
```

### 地图加载降级

详情页中，若 `departureLocation` 或 `destinationLocation` 任一为空（旧数据），隐藏 `<map>` 组件，仅展示文字地址。判断条件：

```ts
const hasMapData = computed(() =>
  !!ride.departureLocation?.latitude && !!ride.destinationLocation?.latitude
)
```

---

## 十一、途径点状态管理

删除途径点直接用 `splice`：

```ts
const removeWaypoint = (index: number) => {
  formData.waypoints?.splice(index, 1)
}
```

无需重新排序，展示和折线均按数组顺序处理。

---

## 十二、联系车主跳转

TUIChat 通过 `conversationID` 参数进入，格式为 `C2C{userId}`：

```ts
uni.navigateTo({
  url: `/TUIKit/components/TUIChat/index?conversationID=C2C${ride.userId}`
})
```

---

## 十三、实现顺序

1. 配置 `manifest.json` 地理位置权限
2. 更新 `types/index.ts`
3. 修改 `publish/index.vue`（地图选点 + 途径点）
4. 新建 `pages/ride/detail.vue`
5. 注册路由 `pages.json`
6. 修改 `home/index.vue` 跳转逻辑
