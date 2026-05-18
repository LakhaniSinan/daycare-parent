import React, { useCallback, useEffect, useState } from 'react';
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
import { getRoleLabel } from '../utils/userProfile';

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
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{value}</Text>
      </View>
    </View>
  );
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [touched, setTouched] = useState({ firstName: false, lastName: false });

  const {
    userDetails,
    profileImageUri,
    role,
    isLoading,
    refetch,
  } = useUserProfile();

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (!userDetails) return;
    setFirstName(userDetails.firstName?.trim() ?? '');
    setLastName(userDetails.lastName?.trim() ?? '');
  }, [userDetails]);

  const roleDisplay = getRoleLabel(role) || role || 'Parent';

  const firstNameError =
    touched.firstName && !firstName.trim() ? 'First name is required' : undefined;
  const lastNameError =
    touched.lastName && !lastName.trim() ? 'Last name is required' : undefined;

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    setTouched({ firstName: true, lastName: true });

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert('Missing information', 'Please enter your first and last name.');
      return;
    }

    try {
      await updateProfile({
        firstName: trimmedFirst,
        lastName: trimmedLast,
      }).unwrap();

      await refetch();
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: goBack },
      ]);
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not update profile.'));
    }
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          >
            <View style={styles.avatarSection}>
              <UserAvatar
                imageUri={profileImageUri}
                size={120}
                borderWidth={4}
                borderColor={PRIMARY}
                iconColor={TEXT_MUTED}
                placeholderStyle={styles.avatarPlaceholder}
              />
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

              <ReadOnlyField label="Role" value={roleDisplay} />
            </View>

            <AppButton
              title="Save changes"
              onPress={handleSave}
              loading={isSaving}
              style={styles.saveBtn}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
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
    textTransform: 'capitalize',
  },
  saveBtn: {
    marginTop: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
