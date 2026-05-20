import React, { useState } from 'react';
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
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';

import { useRegisterParentMutation } from '../api/eps';
import AppButton from '../components/AppButton';
import { setAuthData } from '../store/authSlice';
import { saveParentSession } from '../utils/authStorage';
import { authApiErrorMessage, normalizeAuthPayload } from '../utils/authSession';
import AppTextInput from '../components/appTextInput';
import { showProfilePhotoPickerAlert } from '../utils/profilePhotoPicker';
import { signupValidationSchema } from '../validation/authSchemas';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const GREY_PLACEHOLDER = '#9CA3AF';
const TEXT_PRIMARY = '#111827';

export default function Signup() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [registerParent, { isLoading: isRegistering }] = useRegisterParentMutation();

  const [photoUri, setPhotoUri] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
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

  const isBusy = isRegistering || isUploadingPhoto;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 24}
      >
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={signupValidationSchema}
          validateOnChange
          validateOnBlur
          onSubmit={async (values, { setErrors, setFieldTouched }) => {
            if (!profileImageUrl?.trim()) {
              Alert.alert(
                'Profile photo required',
                isUploadingPhoto
                  ? 'Please wait for your photo to finish uploading.'
                  : 'Add a profile photo before creating your account.',
              );
              return;
            }

            const email = values.email.trim().toLowerCase();
            const body = {
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email,
              phoneNumber: values.phone.trim(),
              password: values.password,
              confirmPassword: values.confirmPassword,
              role: 'parent',
              profileImage: profileImageUrl.trim(),
            };

            try {
              const raw = await registerParent(body).unwrap();
              const session = normalizeAuthPayload(raw, email);
              if (session) {
                try {
                  await saveParentSession(session);
                  dispatch(setAuthData(session));
                  navigation.replace('Main');
                  return;
                } catch {
                  setFieldTouched('email', true, false);
                  setErrors({
                    email: 'Account created but session could not be saved. Please sign in.',
                  });
                  return;
                }
              }
              Alert.alert(
                'Account created',
                'Your account was created. Please sign in with your email and password.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }],
              );
            } catch (err) {
              setFieldTouched('email', true, false);
              setErrors({
                email: authApiErrorMessage(err, 'Could not create account. Please try again.'),
              });
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
              <Pressable
                onPress={goBack}
                style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={28} color={PRIMARY_BLUE} />
              </Pressable>

              <Pressable
                onPress={openPhotoOptions}
                style={styles.avatarWrap}
                accessibilityRole="button"
                accessibilityLabel="Add profile photo"
              >
                <View style={styles.avatarCircle}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={48} color="#FFFFFF" />
                  )}
                  {isUploadingPhoto ? (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    </View>
                  ) : null}
                </View>
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </Pressable>
              <Text style={styles.photoHint}>Tap to add profile photo</Text>

              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Early Start Platform</Text>

              <View style={styles.formBlock}>
                <AppTextInput
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  placeholder="First Name"
                  autoCapitalize="words"
                  error={errors.firstName}
                  touched={touched.firstName}
                  startIconComponent={
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={PRIMARY_BLUE}
                    />
                  }
                />
                <AppTextInput
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  placeholder="Last Name"
                  autoCapitalize="words"
                  error={errors.lastName}
                  touched={touched.lastName}
                  startIconComponent={
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={PRIMARY_BLUE}
                    />
                  }
                />
                <AppTextInput
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  touched={touched.email}
                  startIconComponent={
                    <Ionicons name="mail-outline" size={18} color={PRIMARY_BLUE} />
                  }
                />
                <AppTextInput
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  error={errors.phone}
                  touched={touched.phone}
                  startIconComponent={
                    <Ionicons name="call-outline" size={18} color={PRIMARY_BLUE} />
                  }
                />
                <AppTextInput
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Password"
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.password}
                  touched={touched.password}
                  startIconComponent={
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={PRIMARY_BLUE}
                    />
                  }
                />
                <AppTextInput
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  placeholder="Confirm Password"
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  startIconComponent={
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={PRIMARY_BLUE}
                    />
                  }
                />
              </View>

              <AppButton
                title="Create Account"
                type="primary"
                onPress={handleSubmit}
                loading={isBusy}
                disabled={isBusy}
                style={styles.btnCreate}
                textStyle={styles.btnCreateLabel}
              />

              <Text style={styles.footer}>
                <Text style={styles.footerGrey}>Already have an account? </Text>
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.replace('Login')}
                >
                  Sign In Now
                </Text>
              </Text>
            </ScrollView>
          )}
        </Formik>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 4,
    paddingBottom: 36,
    alignItems: 'center',
    flexGrow: 1,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginLeft: -6,
    marginBottom: 4,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  avatarWrap: {
    marginTop: 4,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TEXT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    fontSize: 11,
    color: GREY_MUTED,
    marginBottom: 4,
  },
  title: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    color: GREY_MUTED,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 8,
  },
  formBlock: {
    width: '100%',
    marginTop: 18,
    gap: 16,
  },
  btnCreate: {
    width: '100%',
    marginTop: 28,
  },
  btnCreateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  footerGrey: {
    color: GREY_PLACEHOLDER,
    fontSize: 12,
  },
  footerLink: {
    color: PRIMARY_BLUE,
    fontSize: 12,
    fontWeight: '700',
  },
});
