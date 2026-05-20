import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryUpload';

export const PROFILE_PHOTO_OPTIONS = {
  mediaType: 'photo',
  quality: 0.85,
  maxWidth: 1200,
  maxHeight: 1200,
};

export async function ensureAndroidCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera permission',
      message: 'Allow camera access to take a profile photo.',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export async function handleProfilePhotoPickerResult(result, callbacks) {
  const { onLocalUri, onUploadedUrl, onUploadStart, onUploadEnd } = callbacks;

  if (result.didCancel) {
    return;
  }
  if (result.errorCode) {
    Alert.alert('Photo error', result.errorMessage || 'Could not use that image.');
    return;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    return;
  }

  onLocalUri?.(asset.uri);
  onUploadedUrl?.(null);
  onUploadStart?.();

  try {
    const json = await uploadImageToCloudinary(asset);
    const secureUrl = json?.secure_url;
    if (secureUrl) {
      onUploadedUrl?.(secureUrl);
    } else {
      Alert.alert(
        'Upload incomplete',
        'Could not get image URL from Cloudinary. Try another photo.',
      );
    }
  } catch {
    Alert.alert(
      'Upload failed',
      'Photo could not be uploaded. Check your connection and try again.',
    );
  } finally {
    onUploadEnd?.();
  }
}

export function showProfilePhotoPickerAlert(callbacks) {
  Alert.alert('Profile photo', 'Add or change your profile photo', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Take photo',
      onPress: async () => {
        const allowed = await ensureAndroidCameraPermission();
        if (!allowed) {
          Alert.alert('Permission needed', 'Camera access is required to take a photo.');
          return;
        }
        const result = await launchCamera(PROFILE_PHOTO_OPTIONS);
        await handleProfilePhotoPickerResult(result, callbacks);
      },
    },
    {
      text: 'Choose from library',
      onPress: async () => {
        const result = await launchImageLibrary({
          ...PROFILE_PHOTO_OPTIONS,
          selectionLimit: 1,
        });
        await handleProfilePhotoPickerResult(result, callbacks);
      },
    },
  ]);
}
