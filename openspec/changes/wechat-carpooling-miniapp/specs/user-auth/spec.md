## ADDED Requirements

### Requirement: 微信授权登录
用户 SHALL 通过微信 OAuth 授权获取 openid 和基本信息（昵称、头像），系统以 openid 作为唯一用户身份标识。首次登录时系统 SHALL 自动创建用户记录；再次登录时 SHALL 更新昵称和头像至最新值。

#### Scenario: 首次授权登录
- **WHEN** 用户首次打开小程序并点击授权按钮
- **THEN** 系统调用云函数 `login` 获取 openid，在 users 集合中创建新记录，并将用户信息存入本地缓存

#### Scenario: 再次登录更新信息
- **WHEN** 已登录用户再次打开小程序
- **THEN** 系统 SHALL 使用缓存中的 openid 静默登录，并更新 users 集合中的昵称和头像字段

#### Scenario: 用户拒绝授权
- **WHEN** 用户拒绝微信授权
- **THEN** 系统 SHALL 显示提示说明授权的必要性，并提供重新授权的入口，不得强制跳转或关闭小程序

### Requirement: 登录态持久化
系统 SHALL 将用户 openid 和基本信息缓存至本地存储（wx.setStorageSync），避免每次启动都重新授权。

#### Scenario: 缓存有效时自动登录
- **WHEN** 用户打开小程序且本地缓存中存在有效的 openid
- **THEN** 系统 SHALL 直接进入首页，不再弹出授权弹窗

#### Scenario: 缓存失效时重新登录
- **WHEN** 本地缓存不存在或已清除
- **THEN** 系统 SHALL 展示授权引导页，引导用户重新授权
