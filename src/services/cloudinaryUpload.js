import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

function logCloudinaryUploadHelp(json) {
  const msg = json?.error?.message || '';
  if (/whitelist|unsigned/i.test(msg)) {
    console.warn(
      '[Cloudinary] Account blocks unsigned uploads for this preset.\n' +
        'Fix in Cloudinary Console:\n' +
        '• Create a NEW preset: Settings → Upload → Upload presets → Add → Signing mode: Unsigned.\n' +
        '• Use that preset name in src/config/cloudinary.js (CLOUDINARY_UPLOAD_PRESET).\n' +
        '• If error persists: Settings → Security → enable / allow unsigned client uploads, or add the preset to the allowed list.\n' +
        '• Avoid ml_default for mobile unsigned uploads — it is usually Signed (ML) and not allowlisted.',
    );
  }
}

/**
 * @param {{ uri: string, type?: string, fileName?: string }} asset From react-native-image-picker `assets[0]`
 * @returns {Promise<object>} Parsed JSON from Cloudinary (includes secure_url on success)
 */
export async function uploadImageToCloudinary(asset) {
  if (!CLOUDINARY_UPLOAD_PRESET?.trim()) {
    console.warn(
      '[Cloudinary] Set CLOUDINARY_UPLOAD_PRESET in src/config/cloudinary.js (unsigned preset name).',
    );
    return null;
  }

  const uri = asset.uri;
  const type = asset.type || 'image/jpeg';
  const name = asset.fileName || 'photo.jpg';

  const formData = new FormData();
  formData.append('file', { uri, type, name });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET.trim());

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();

    console.log('[Cloudinary] status:', response.status);
    console.log('[Cloudinary] response:', JSON.stringify(json, null, 2));

    if (!response.ok) {
      logCloudinaryUploadHelp(json);
      console.warn('[Cloudinary] upload failed — see hints above or check preset name and network.');
    }

    return json;
  } catch (e) {
    console.warn('[Cloudinary] request error:', e?.message || e);
    throw e;
  }
}
