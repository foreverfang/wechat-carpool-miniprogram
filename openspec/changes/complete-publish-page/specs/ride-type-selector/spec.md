## ADDED Requirements

### Requirement: 支持两种拼车类型
拼车类型选择器 SHALL 支持"找车"和"找乘客"两种类型的选择。

#### Scenario: 显示两种类型选项
- **WHEN** 用户查看拼车类型选择器
- **THEN** 系统显示"找车"和"找乘客"两个选项

#### Scenario: 默认选中找车类型
- **WHEN** 用户首次进入发布页面
- **THEN** 系统默认选中"找车"类型

### Requirement: 类型切换
用户 SHALL 能够在两种类型之间切换。

#### Scenario: 切换到找乘客
- **WHEN** 用户点击"找乘客"选项
- **THEN** 系统将拼车类型切换为"找乘客"
- **THEN** 系统显示座位数输入字段

#### Scenario: 切换到找车
- **WHEN** 用户点击"找车"选项
- **THEN** 系统将拼车类型切换为"找车"
- **THEN** 系统隐藏座位数输入字段

### Requirement: 类型状态保持
系统 SHALL 在用户填写表单过程中保持所选类型状态。

#### Scenario: 切换类型后保持其他字段数据
- **WHEN** 用户填写了出发地、目的地等字段后切换类型
- **THEN** 系统保持已填写的字段数据不变
- **THEN** 仅改变座位数字段的显示状态

### Requirement: 类型值传递
系统 SHALL 在提交表单时正确传递拼车类型值。

#### Scenario: 提交找车类型
- **WHEN** 用户选择"找车"类型并提交表单
- **THEN** 系统传递 type 值为 "find-car"

#### Scenario: 提交找乘客类型
- **WHEN** 用户选择"找乘客"类型并提交表单
- **THEN** 系统传递 type 值为 "find-passenger"
