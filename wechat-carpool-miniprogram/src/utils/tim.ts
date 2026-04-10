import { TUILogin } from '@tencentcloud/tui-core';
import { getUserSig } from '@/api/chat';

const SDKAppID = 1600132280;
let isLoggedIn = false;

/**
 * 从后端获取 UserSig，然后登录腾讯云 IM
 */
export async function timLogin(): Promise<void> {
  if (isLoggedIn) return;

  const res = await getUserSig();
  const { imUserId, userSig } = res;

  await TUILogin.login({
    SDKAppID,
    userID: imUserId,
    userSig,
    useUploadPlugin: true,
    framework: 'vue3',
  });

  isLoggedIn = true;
}

/**
 * 退出登录
 */
export async function timLogout(): Promise<void> {
  if (!isLoggedIn) return;
  await TUILogin.logout();
  isLoggedIn = false;
}

export function isTimLoggedIn(): boolean {
  return isLoggedIn;
}
