## Why

发布页面是拼车小程序的核心功能之一，目前只是空白页面，无法让用户发布拼车信息。需要实现完整的发布流程，让司机可以发布找乘客的行程，乘客可以发布找车的需求，从而激活整个拼车平台的供需匹配。

## What Changes

- 实现发布页面的完整 UI 和交互逻辑
- 支持两种发布类型：找车（乘客发布）和找乘客（司机发布）
- 添加表单字段：拼车类型、出发地、目的地、出发时间、座位数、价格、备注
- 实现表单验证和错误提示
- 集成地点输入组件（支持手动输入或地图选点）
- 集成时间选择器
- 实现发布提交功能，调用后端 API
- 添加发布成功/失败的反馈提示

## Capabilities

### New Capabilities

- `ride-publish-form`：拼车信息发布表单，包含所有必要字段的输入、验证和提交逻辑
- `ride-type-selector`：拼车类型选择器，支持在"找车"和"找乘客"两种模式间切换
- `location-input`：地点输入组件，支持手动输入地址或通过地图选点
- `datetime-picker`：日期时间选择器，用于选择出发时间

### Modified Capabilities

无。这是新增功能，不修改现有能力。

## Impact

**受影响的文件：**
- `wechat-carpool-miniprogram/src/pages/publish/index.vue`：主要实现文件
- `wechat-carpool-miniprogram/src/api/ride.ts`：可能需要添加发布接口
- `wechat-carpool-miniprogram/src/types/index.ts`：可能需要补充类型定义

**依赖：**
- uni-app 的表单组件（picker、input、textarea 等）
- 可能需要地图服务（腾讯地图或高德地图）用于地点选择
- 后端 API 需要提供发布接口（当前使用 mock 数据）

**用户体验：**
- 用户可以通过 TabBar 进入发布页面
- 填写完整信息后可以发布拼车信息
- 发布成功后跳转到首页查看发布的内容
