## ADDED Requirements

### Requirement: 申请加入拼车
已登录的非车主用户 SHALL 能够对状态为 `open` 的行程提交加入申请。每个用户对同一行程 SHALL 只能有一条有效申请（状态为 `pending` 或 `accepted`）。申请提交后在 join_requests 集合中创建记录，状态为 `pending`。

#### Scenario: 成功提交申请
- **WHEN** 用户点击行程详情页的"申请加入"按钮
- **THEN** 系统调用云函数 `joinRide`，在 join_requests 中创建 pending 记录，并触发通知车主

#### Scenario: 重复申请同一行程
- **WHEN** 用户对已有 pending 或 accepted 申请的行程再次点击"申请加入"
- **THEN** 系统 SHALL 提示"你已申请过此行程"，不创建新记录

#### Scenario: 行程已满时无法申请
- **WHEN** 行程状态为 `full`
- **THEN** 系统 SHALL 不展示"申请加入"按钮，或将其置灰并提示"座位已满"

#### Scenario: 车主不能申请自己的行程
- **WHEN** 车主访问自己发布的行程详情页
- **THEN** 系统 SHALL 不展示"申请加入"按钮，取而代之展示申请管理入口

### Requirement: 车主处理加入申请
行程发起人（车主）SHALL 能够查看该行程所有 `pending` 状态的申请，并对每条申请执行确认或拒绝操作。

#### Scenario: 车主确认申请
- **WHEN** 车主点击某条申请的"确认"按钮
- **THEN** 系统调用云函数 `handleJoinRequest`，将申请状态更新为 `accepted`，`rides.takenSeats` 加 1；若 `takenSeats` 达到 `totalSeats`，行程状态更新为 `full`；同时触发通知申请人

#### Scenario: 车主拒绝申请
- **WHEN** 车主点击某条申请的"拒绝"按钮
- **THEN** 系统将申请状态更新为 `rejected`，`takenSeats` 不变，触发通知申请人

#### Scenario: 已接受申请后座位满
- **WHEN** 车主接受最后一个可用座位的申请
- **THEN** 行程状态 SHALL 自动更新为 `full`，其余 pending 申请保留但用户无法再提交新申请
