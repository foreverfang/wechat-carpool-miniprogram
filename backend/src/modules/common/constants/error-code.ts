export enum ErrorCode {
  // 通用错误 1000-1999
  SUCCESS = 0,
  UNKNOWN_ERROR = 1000,
  INVALID_PARAMS = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,

  // 用户相关错误 2000-2999
  USER_NOT_FOUND = 2000,
  USER_DISABLED = 2001,
  USER_ALREADY_EXISTS = 2002,

  // 认证相关错误 3000-3999
  WECHAT_LOGIN_FAILED = 3000,
  TOKEN_INVALID = 3001,
  TOKEN_EXPIRED = 3002,

  // 拼车相关错误 4000-4999
  RIDE_NOT_FOUND = 4000,
  RIDE_PERMISSION_DENIED = 4001,
  RIDE_ALREADY_CLOSED = 4002,

  // IM 相关错误 5000-5999
  IM_INIT_FAILED = 5000,
  IM_CREATE_USER_FAILED = 5001,
  IM_GENERATE_USERSIG_FAILED = 5002,
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.INVALID_PARAMS]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',

  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_DISABLED]: '用户已被禁用',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',

  [ErrorCode.WECHAT_LOGIN_FAILED]: '微信登录失败',
  [ErrorCode.TOKEN_INVALID]: 'Token 无效',
  [ErrorCode.TOKEN_EXPIRED]: 'Token 已过期',

  [ErrorCode.RIDE_NOT_FOUND]: '拼车信息不存在',
  [ErrorCode.RIDE_PERMISSION_DENIED]: '无权操作此拼车信息',
  [ErrorCode.RIDE_ALREADY_CLOSED]: '拼车已关闭',

  [ErrorCode.IM_INIT_FAILED]: 'IM 初始化失败',
  [ErrorCode.IM_CREATE_USER_FAILED]: 'IM 用户创建失败',
  [ErrorCode.IM_GENERATE_USERSIG_FAILED]: 'UserSig 生成失败',
};
