## ADDED Requirements

### Requirement: 发布拼车行程
已登录用户 SHALL 能够填写并发布一条拼车行程。必填字段为：出发地、目的地、出发时间、总座位数（1-8）。可选字段为：费用说明（文字描述）。发布成功后行程状态初始化为 `open`，`takenSeats` 初始化为 0。

#### Scenario: 成功发布行程
- **WHEN** 用户填写所有必填字段并点击"发布"
- **THEN** 系统调用云函数 `createRide` 写入 rides 集合，返回行程 ID，并跳转至该行程详情页

#### Scenario: 出发时间不得早于当前时间
- **WHEN** 用户选择的出发时间早于当前时刻
- **THEN** 系统 SHALL 在提交前展示错误提示"出发时间不能早于当前时间"，阻止提交

#### Scenario: 必填字段缺失
- **WHEN** 用户未填写任意必填字段并点击"发布"
- **THEN** 系统 SHALL 高亮缺失字段并展示对应提示，不得调用云函数

### Requirement: 取消自己发布的行程
行程发起人（车主）SHALL 能够取消状态为 `open` 或 `full` 的行程。取消后行程状态变为 `cancelled`，所有 `pending` 状态的申请自动变为 `rejected`。

#### Scenario: 车主取消行程
- **WHEN** 车主在行程详情页点击"取消行程"并确认
- **THEN** 系统将行程状态更新为 `cancelled`，将所有 pending 申请状态更新为 `rejected`

#### Scenario: 非车主无法取消
- **WHEN** 非车主用户访问某行程详情页
- **THEN** 系统 SHALL 不展示"取消行程"按钮
