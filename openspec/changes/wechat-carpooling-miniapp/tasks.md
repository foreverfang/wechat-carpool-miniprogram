## 1. 项目初始化

- [ ] 1.1 在微信开发者工具中创建小程序项目，填入 AppID，选择"云开发"模板
- [ ] 1.2 初始化云开发环境，记录 envId，配置 `app.js` 中的 `wx.cloud.init`
- [ ] 1.3 配置 `app.json`：设置底部 TabBar（首页、发布、我的），注册所有页面路径
- [ ] 1.4 创建页面目录结构：`pages/index`、`pages/publish`、`pages/detail`、`pages/my-trips`、`pages/requests`
- [ ] 1.5 创建云函数目录结构：`cloudfunctions/login`、`createRide`、`getRides`、`joinRide`、`handleJoinRequest`、`getMyTrips`、`sendNotify`

## 2. 数据库初始化

- [ ] 2.1 在云开发控制台创建 `users` 集合，设置安全规则：仅创建者可写，所有人可读
- [ ] 2.2 在云开发控制台创建 `rides` 集合，设置安全规则：仅 ownerOpenid 可写，所有人可读
- [ ] 2.3 在云开发控制台创建 `join_requests` 集合，设置安全规则：申请人可写自己的记录，车主可读关联行程的申请
- [ ] 2.4 为 `rides` 集合的 `departAt` 和 `status` 字段添加索引（提升列表查询性能）
- [ ] 2.5 为 `join_requests` 集合的 `rideId` 和 `applicantOpenid` 字段添加复合索引

## 3. 云函数：用户登录（user-auth）

- [ ] 3.1 实现云函数 `login`：通过 `event.userInfo` 获取昵称和头像，读取 `cloud.getWXContext().OPENID` 获取 openid
- [ ] 3.2 在 `login` 中实现 upsert 逻辑：若 users 集合中不存在该 openid 则创建，否则更新昵称和头像
- [ ] 3.3 在 `app.js` 的 `onLaunch` 中调用 `login` 云函数，将返回的用户信息存入 `wx.setStorageSync`
- [ ] 3.4 实现登录态检测：启动时优先读取本地缓存，缓存不存在时触发授权流程

## 4. 云函数：行程管理（ride-publish）

- [ ] 4.1 实现云函数 `createRide`：校验必填字段（from、to、departAt、totalSeats），写入 rides 集合，初始化 `takenSeats=0`、`status='open'`
- [ ] 4.2 在 `createRide` 中添加出发时间校验：`departAt` 不得早于当前时间，否则返回错误
- [ ] 4.3 实现云函数中取消行程逻辑（集成到 `createRide` 或单独 `cancelRide`）：校验调用者为 ownerOpenid，将行程状态改为 `cancelled`，将关联 pending 申请批量改为 `rejected`

## 5. 云函数：行程列表（ride-browse）

- [ ] 5.1 实现云函数 `getRides`：查询 `status in ['open', 'full']` 且 `departAt > now` 的行程，按 `departAt` 升序返回
- [ ] 5.2 在 `getRides` 中添加分页参数支持（`skip` + `limit`，默认 limit=20）

## 6. 云函数：申请加入（ride-join）

- [ ] 6.1 实现云函数 `joinRide`：校验行程状态为 `open`，校验该用户无 pending/accepted 申请，创建 join_requests 记录，调用 `sendNotify` 通知车主
- [ ] 6.2 实现云函数 `handleJoinRequest`：校验调用者为行程 ownerOpenid，更新申请状态，若 accepted 则 `takenSeats+1`，若 `takenSeats==totalSeats` 则将行程状态改为 `full`，调用 `sendNotify` 通知申请人

## 7. 云函数：我的行程（my-trips）

- [ ] 7.1 实现云函数 `getMyTrips`：查询该 openid 作为 ownerOpenid 的行程列表（发起的），按 `createdAt` 倒序
- [ ] 7.2 在 `getMyTrips` 中同时查询该 openid 的 accepted 申请，关联返回对应行程信息（参与的）

## 8. 云函数：订阅消息通知（notify）

- [ ] 8.1 在微信公众平台申请两个订阅消息模板："有人申请加入拼车"和"拼车申请审批结果"，记录 templateId
- [ ] 8.2 实现云函数 `sendNotify`：调用微信 `openapi.subscribeMessage.send`，封装通知类型（newRequest / requestResult）和对应模板数据
- [ ] 8.3 在 `sendNotify` 中捕获异常（用户未订阅时静默忽略，不抛出错误）

## 9. 前端：授权登录页

- [ ] 9.1 创建授权引导组件，展示授权说明和"微信授权登录"按钮
- [ ] 9.2 接入 `getUserProfile` API（或 `open-type="getUserInfo"`）获取用户信息，调用 `login` 云函数
- [ ] 9.3 登录成功后跳转至首页，登录失败展示错误提示和重试按钮

## 10. 前端：首页（行程列表）

- [ ] 10.1 实现 `pages/index` 页面，调用 `getRides` 云函数加载行程列表
- [ ] 10.2 实现行程卡片组件：展示出发地、目的地、出发时间、剩余座位（`totalSeats - takenSeats`）、发起人头像和昵称
- [ ] 10.3 行程状态为 `full` 时在卡片上展示"已满"标签
- [ ] 10.4 实现下拉刷新（`onPullDownRefresh`）重新加载列表
- [ ] 10.5 列表为空时展示空状态提示文案

## 11. 前端：发布拼车页

- [ ] 11.1 实现 `pages/publish` 页面，包含表单：出发地（文字输入）、目的地（文字输入）、出发时间（日期时间选择器）、座位数（数字选择器 1-8）、费用说明（可选文字输入）
- [ ] 11.2 实现提交前表单校验：必填字段非空、出发时间不早于当前时间，不满足时高亮对应字段并提示
- [ ] 11.3 提交前调用 `wx.requestSubscribeMessage` 引导车主订阅"有人申请加入"消息模板
- [ ] 11.4 调用 `createRide` 云函数，成功后跳转至该行程详情页

## 12. 前端：行程详情页

- [ ] 12.1 实现 `pages/detail` 页面，根据路由参数 `rideId` 加载行程完整信息
- [ ] 12.2 非车主用户：行程状态为 `open` 时展示"申请加入"按钮；`full` 时按钮置灰并提示"座位已满"；`cancelled` 时显示"此行程已取消"
- [ ] 12.3 点击"申请加入"前调用 `wx.requestSubscribeMessage` 引导乘客订阅"申请审批结果"消息模板，然后调用 `joinRide` 云函数
- [ ] 12.4 车主侧：展示"取消行程"按钮和"查看申请"入口，不展示"申请加入"按钮
- [ ] 12.5 实现取消行程：弹出确认对话框，确认后调用取消行程云函数，刷新页面状态

## 13. 前端：申请管理页（车主）

- [ ] 13.1 实现 `pages/requests` 页面，根据 `rideId` 查询该行程所有 join_requests
- [ ] 13.2 展示申请人头像、昵称，以及"确认"和"拒绝"操作按钮（仅 pending 状态显示按钮）
- [ ] 13.3 点击"确认"或"拒绝"调用 `handleJoinRequest` 云函数，操作后刷新申请列表

## 14. 前端：我的行程页

- [ ] 14.1 实现 `pages/my-trips` 页面，包含两个 Tab："我发起的"和"我参与的"
- [ ] 14.2 "我发起的"Tab：调用 `getMyTrips` 加载车主行程列表，显示状态标签（进行中/已满/已取消/已完成）
- [ ] 14.3 "我参与的"Tab：展示 accepted 行程，以及 pending 状态的行程（标注"等待确认"）
- [ ] 14.4 点击行程跳转至详情页（车主跳转时显示申请管理入口）

## 15. 测试与上线准备

- [ ] 15.1 在开发者工具中真机调试授权登录全流程
- [ ] 15.2 测试拼车发布 → 列表显示 → 申请加入 → 车主确认 完整链路
- [ ] 15.3 测试边界场景：座位满后状态自动变 full、取消行程后申请批量拒绝
- [ ] 15.4 测试订阅消息发送（需真机，模拟器不支持）
- [ ] 15.5 检查数据库安全规则，确保用户无法越权操作他人数据
- [ ] 15.6 提交小程序审核（或分享体验版二维码供群内测试）
