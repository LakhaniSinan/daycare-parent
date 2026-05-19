/** Normalize login/register API payloads into app session shape. */
export function normalizeAuthPayload(data, emailFallback) {
  if (data == null) return null;
  const root = data.data != null ? data.data : data;
  const token =
    root.token ??
    root.accessToken ??
    root.access_token ??
    data.token ??
    data.accessToken;
  const user =
    root.user ??
    root.parent ??
    (root.email ? { email: root.email } : emailFallback ? { email: emailFallback } : null);
  if (!token || typeof token !== 'string') return null;
  const resolvedUser = user ?? { email: emailFallback ?? '' };
  const parentId = resolvedUser?.id ?? resolvedUser?._id ?? null;
  return { token, user: resolvedUser, parentId };
}

export function authApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const d = err?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(', ') : d.message;
  if (d?.error) return d.error;
  if (err?.error === 'FETCH_ERROR') return 'Network error. Check server and BASE_URL.';
  return fallback;
}
