export function hasValidProfileImage(image) {
  if (!image || typeof image !== 'string') return false;
  const trimmed = image.trim();
  if (!trimmed || trimmed === 'someimage') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

export function getValidProfileImageUri(image) {
  return hasValidProfileImage(image) ? image.trim() : null;
}

export function getUserDisplayName(user) {
  if (!user) return '';
  const first = user.firstName?.trim() || '';
  const last = user.lastName?.trim() || '';
  const full = [first, last].filter(Boolean).join(' ');
  return full || user.name?.trim() || user.email?.trim() || '';
}

export function getRoleLabel(role) {
  if (role === 'admin') return 'Director';
  if (role === 'teacher') return 'Staff';
  return 'Parent';
}
