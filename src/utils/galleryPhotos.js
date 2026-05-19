export function galleryPhotoSource(photo) {
  if (typeof photo?.url === 'string') return { uri: photo.url };
  if (typeof photo?.image === 'string') return { uri: photo.image };
  if (typeof photo?.secure_url === 'string') return { uri: photo.secure_url };
  if (typeof photo?.uri === 'string') return { uri: photo.uri };
  if (typeof photo === 'string') return { uri: photo };
  return null;
}

export function normalizeGalleryPhoto(item, index = 0) {
  if (typeof item === 'string') {
    return { _id: `photo-${index}`, url: item, uploadedAt: null };
  }
  const url = item?.url ?? item?.secure_url ?? item?.image ?? '';
  return {
    _id: item?._id ?? item?.id ?? `photo-${index}`,
    url,
    uploadedAt: item?.uploadedAt ?? item?.createdAt ?? null,
  };
}

export function mergeGalleryPhotos(...lists) {
  const byUrl = new Map();

  lists.flat().forEach((item, index) => {
    const normalized = normalizeGalleryPhoto(item, index);
    if (!normalized.url) return;
    const existing = byUrl.get(normalized.url);
    if (!existing) {
      byUrl.set(normalized.url, normalized);
      return;
    }
    if (normalized.uploadedAt && (!existing.uploadedAt || normalized.uploadedAt > existing.uploadedAt)) {
      byUrl.set(normalized.url, { ...existing, ...normalized });
    }
  });

  return Array.from(byUrl.values()).sort((a, b) => {
    const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return tb - ta;
  });
}
