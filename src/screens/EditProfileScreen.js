import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/appTextInput';
import ParentDrawer from '../components/ParentDrawer';
import UserAvatar from '../components/UserAvatar';
import { images } from '../assets';
import { useUpdateProfileMutation } from '../api/eps';
import { useUserProfile } from '../hooks/useUserProfile';
import { showProfilePhotoPickerAlert } from '../utils/profilePhotoPicker';

const PRIMARY = '#1E88E5';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';
const DIVIDER = '#E5E7EB';

const MENU_BTN_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

function getApiErrorMessage(err, fallback) {
  const d = err?.data;
  let msg =
    (typeof d === 'string' && d) ||
    d?.message ||
    d?.error ||
    err?.error ||
    fallback;
  if (Array.isArray(msg)) msg = msg.join(', ');
  if (typeof msg !== 'string') return fallback;
  return msg;
}

function ReadOnlyField({ label, value }) {
  const display = value?.trim() ? value.trim() : '—';
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{display}</Text>
      </View>
    </View>
  );
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    phone: false,
  });
  const [photoUri, setPhotoUri] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    userDetails,
    profileImageUri,
    email,
    isLoading,
    refetch,
  } = useUserProfile();

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const displayImageUri = useMemo(
    () => photoUri || profileImageUrl || profileImageUri,
    [photoUri, profileImageUrl, profileImageUri],
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (!userDetails) return;
    setFirstName(userDetails.firstName?.trim() ?? '');
    setLastName(userDetails.lastName?.trim() ?? '');
    setPhone(userDetails.phoneNumber?.trim() ?? '');
  }, [userDetails]);

  const firstNameError =
    touched.firstName && !firstName.trim() ? 'First name is required' : undefined;
  const lastNameError =
    touched.lastName && !lastName.trim() ? 'Last name is required' : undefined;
  const phoneError =
    touched.phone && !phone.trim() ? 'Phone number is required' : undefined;

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openPhotoOptions = () => {
    showProfilePhotoPickerAlert({
      onLocalUri: setPhotoUri,
      onUploadedUrl: setProfileImageUrl,
      onUploadStart: () => setIsUploadingPhoto(true),
      onUploadEnd: () => setIsUploadingPhoto(false),
    });
  };

  const handleSave = async () => {
    setTouched({ firstName: true, lastName: true, phone: true });

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedPhone) {
      Alert.alert('Missing information', 'Please complete all required fields.');
      return;
    }

    if (isUploadingPhoto) {
      Alert.alert('Please wait', 'Your profile photo is still uploading.');
      return;
    }

    const imageToSave =
      profileImageUrl?.trim() ||
      userDetails?.profileImage?.trim() ||
      profileImageUri ||
      undefined;

    try {
      await updateProfile({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phoneNumber: trimmedPhone,
        profileImage: imageToSave,
      }).unwrap();

      await refetch();
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: goBack },
      ]);
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not update profile.'));
    }
  };

  const isBusy = isSaving || isUploadingPhoto;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      <View style={styles.headerBlock}>
        <View style={styles.headerMenuRow}>
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [
              styles.menuIconSquare,
              MENU_BTN_SHADOW,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
          </Pressable>
        </View>

        <View style={styles.headerTitleRow}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={PRIMARY} />
          </Pressable>
          <Text style={styles.pageTitle} numberOfLines={1}>
            Personal Information
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                {displayImageUri ? (
                  <Image source={{ uri: displayImageUri }} style={styles.avatarImage} />
                ) : (
                  <UserAvatar
                    imageUri={null}
                    size={120}
                    borderWidth={4}
                    borderColor={PRIMARY}
                    iconColor={TEXT_MUTED}
                    placeholderStyle={styles.avatarPlaceholder}
                  />
                )}
                {isUploadingPhoto ? (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                ) : null}
                <Pressable
                  onPress={openPhotoOptions}
                  style={({ pressed }) => [
                    styles.cameraBadge,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
              <Text style={styles.photoHint}>Tap camera to update photo</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>First name</Text>
                <AppTextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                  placeholder="First name"
                  autoCapitalize="words"
                  error={firstNameError}
                  touched={touched.firstName}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Last name</Text>
                <AppTextInput
                  value={lastName}
                  onChangeText={setLastName}
                  onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                  placeholder="Last name"
                  autoCapitalize="words"
                  error={lastNameError}
                  touched={touched.lastName}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Phone number</Text>
                <AppTextInput
                  value={phone}
                  onChangeText={setPhone}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  error={phoneError}
                  touched={touched.phone}
                />
              </View>

              <ReadOnlyField label="Email" value={email} />
            </View>

            <AppButton
              title="Save changes"
              onPress={handleSave}
              loading={isBusy}
              disabled={isBusy}
              style={styles.saveBtn}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  headerBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
    paddingBottom: 12,
  },
  headerMenuRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  menuIconSquare: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEEEEE',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  backBtn: {
    padding: 4,
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: PRIMARY,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TEXT_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    marginTop: 10,
    fontSize: 12,
    color: TEXT_MUTED,
  },
  form: {
    gap: 4,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  readOnlyBox: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 16,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
