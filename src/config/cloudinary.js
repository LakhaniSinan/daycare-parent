/** Cloudinary cloud name (Dashboard). */
export const CLOUDINARY_CLOUD_NAME = 'dds9hyybx';

/**
 * Must be an UNSIGNED upload preset that is allowlisted for client uploads.
 *
 * `ml_default` is usually SIGNED and blocked for unsigned API calls → use your own preset:
 * 1. Console → Settings → Upload → Upload presets → Add upload preset
 * 2. Signing mode: Unsigned
 * 3. Name it (e.g. daycare_parent) and put that name below
 * 4. If you still see "whitelisted for unsigned uploads": Console → Settings → Security
 *    → allow unsigned / client uploads (or add this preset name to the allowed list)
 */
export const CLOUDINARY_UPLOAD_PRESET = 'daycare_parent';
