## ADDED Requirements

### Requirement: 查看我发起的行程
已登录用户 SHALL 能够在"我的行程"页查看自己作为车主发布的所有行程，包括各状态（open/full/cancelled/done）的历史记录，按创建时间倒序排列。

#### Scenario: 查看我发起的行程列表
- **WHEN** 用户进入"我的行程"页并选择"我发起的"标签
- **THEN** 系统调用云函数 `getMyTrips`，返回该用户作为 ownerOpenid 的所有行程，按创建时间倒序展示

#### Scenario: 进入行程管理
- **WHEN** 用户点击自己发起的某条行程
- **THEN** 系统跳转至该行程详情页，并展示申请管理入口（查看/处理申请）

### Requirement: 查看我参与的行程
已登录用户 SHALL 能够查看自己作为乘客申请加入（且申请状态为 `accepted`）的行程列表，按出发时间升序排列。

#### Scenario: 查看我参与的行程列表
- **WHEN** 用户进入"我的行程"页并选择"我参与的"标签
- **THEN** 系统返回该用户 openid 对应的所有 accepted 申请关联的行程，按出发时间升序展示

#### Scenario: 申请被拒绝时的展示
- **WHEN** 用户的申请状态为 `rejected`
- **THEN** 该行程 SHALL 不出现在"我参与的"列表中，但可在申请记录中查看

### Requirement: 查看申请状态
用户 SHALL 能够查看自己对各行程提交的申请当前状态（pending/accepted/rejected）。

#### Scenario: 查看待确认申请
- **WHEN** 用户的申请状态为 `pending`
- **THEN** "我参与的"页中 SHALL 展示该行程并标注"等待车主确认"

#### Scenario: 查看已拒绝申请
- **WHEN** 用户的申请被拒绝
- **THEN** 系统 SHALL 在申请记录中展示"已拒绝"状态，告知用户结果
