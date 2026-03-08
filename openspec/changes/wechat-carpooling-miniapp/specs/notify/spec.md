## ADDED Requirements

### Requirement: 订阅消息通知车主有新申请
当有乘客申请加入行程时，系统 SHALL 通过微信订阅消息向车主发送通知，告知有人申请及申请人昵称。通知发送的前提是车主已订阅对应消息模板。

#### Scenario: 有人申请加入时通知车主
- **WHEN** 乘客提交加入申请成功后
- **THEN** 系统调用云函数 `sendNotify`，向行程 ownerOpenid 发送订阅消息，内容包含申请人昵称和行程出发地/目的地

#### Scenario: 车主未订阅时的降级处理
- **WHEN** 车主未订阅消息模板
- **THEN** 系统 SHALL 静默跳过通知，不影响申请流程，不向用户报错

### Requirement: 订阅消息通知申请人审批结果
车主确认或拒绝申请后，系统 SHALL 通过微信订阅消息通知申请人审批结果。通知发送的前提是申请人已订阅对应消息模板。

#### Scenario: 申请被确认时通知乘客
- **WHEN** 车主确认某条申请
- **THEN** 系统向申请人 openid 发送订阅消息，内容包含"申请已通过"及行程出发时间和出发地/目的地

#### Scenario: 申请被拒绝时通知乘客
- **WHEN** 车主拒绝某条申请
- **THEN** 系统向申请人 openid 发送订阅消息，内容包含"申请未通过"及行程信息

### Requirement: 引导用户订阅消息
系统 SHALL 在关键操作时机引导用户订阅消息模板，以确保通知可达。

#### Scenario: 发布行程时引导车主订阅
- **WHEN** 用户点击"发布"按钮前
- **THEN** 系统 SHALL 调用 `wx.requestSubscribeMessage` 引导车主订阅"有人申请加入"消息模板

#### Scenario: 申请加入时引导乘客订阅
- **WHEN** 用户点击"申请加入"按钮前
- **THEN** 系统 SHALL 调用 `wx.requestSubscribeMessage` 引导乘客订阅"申请审批结果"消息模板
