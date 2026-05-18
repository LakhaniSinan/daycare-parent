import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@daycareParent/parentSession';

/**
 * @param {{ user?: object; token: string; parentId?: string | null }} session
 */
export async function saveParentSession(session) {
  if (!session?.token) return;
  const parentId = session.parentId ?? session.user?.id ?? session.user?._id ?? null;
  const payload = {
    token: session.token,
    user: session.user ?? null,
    parentId,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

/** @returns {Promise<{ user: object | null; token: string; parentId: string | null } | null>} */
export async function loadParentSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.token === 'string' && parsed.token.length > 0) {
      const user = parsed.user ?? null;
      const parentId = parsed.parentId ?? user?.id ?? user?._id ?? null;
      return { user, token: parsed.token, parentId };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearParentSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
