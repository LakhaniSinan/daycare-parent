import { clearParentSession } from './authStorage';

/**
 * Clear persisted user/session data (AsyncStorage, etc.).
 */
export async function clearUserData() {
  await clearParentSession();
}

/** Reset the root stack to Login (call after logout from nested tabs/stacks). */
export function resetNavigationToLogin(navigation) {
  if (!navigation) return;
  let root = navigation;
  while (root.getParent?.()) {
    root = root.getParent();
  }
  if (typeof root.reset === 'function') {
    root.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}
