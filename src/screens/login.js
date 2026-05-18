import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';

import { useLoginParentMutation } from '../api/eps';
import AppButton from '../components/AppButton';
import { setAuthData } from '../store/authSlice';
import { saveParentSession } from '../utils/authStorage';
import AppTextInput from '../components/appTextInput';
import { images } from '../assets';
import { loginValidationSchema } from '../validation/authSchemas';

/** Primary brand blue — matches AppButton / screenshot */
const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';
const RED_FORGOT = '#E53935';

function normalizeLoginPayload(data, emailFallback) {
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

function loginErrorMessage(err) {
  const d = err?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(', ') : d.message;
  if (d?.error) return d.error;
  if (err?.error === 'FETCH_ERROR') return 'Network error. Check server and BASE_URL.';
  return 'Invalid email or password.';
}

export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loginParent, { isLoading: isLoginLoading }] = useLoginParentMutation();

  const goSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginValidationSchema}
          validateOnChange
          validateOnBlur
          onSubmit={async (values, { setErrors, setFieldTouched }) => {
            const email = values.email.trim().toLowerCase();
            try {
              const raw = await loginParent({
                email,
                password: values.password,
              }).unwrap();
              const session = normalizeLoginPayload(raw, email);
              if (!session) {
                setFieldTouched('password', true, false);
                setErrors({
                  password: 'Unexpected response from server (no token).',
                });
                return;
              }
              try {
                await saveParentSession(session);
                dispatch(setAuthData(session));
                navigation.replace('Main');
              } catch {
                setFieldTouched('password', true, false);
                setErrors({
                  password: 'Could not save your session. Please try again.',
                });
              }
            } catch (err) {
              setFieldTouched('password', true, false);
              setErrors({ password: loginErrorMessage(err) });
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
            <View style={styles.content}>
              <Image
                source={images.logo}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Early Start</Text>
              <Text style={styles.subtitle}>
                Childcare & Development Platform
              </Text>

              <View style={styles.formBlock}>
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
              </View>

              <AppButton
                title="Sign In"
                type="primary"
                onPress={handleSubmit}
                style={styles.btnFull}
                textStyle={styles.btnPrimaryLabel}
                loading={isLoginLoading}
              />

              <AppButton
                title="Sign Up"
                type="outline"
                onPress={goSignup}
                style={styles.btnFullSecondary}
                textStyle={styles.btnOutlineLabel}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.btnGoogle,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => {}}
              >
                <Text style={styles.btnGoogleText}>Sign In With Google</Text>
                <Image
                  source={images.google}
                  style={styles.btnGoogleIcon}
                  resizeMode="contain"
                />
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate('ForgotPassword', {
                    email: values.email.trim(),
                  })
                }
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>Forget Password ?</Text>
              </Pressable>
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 36,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 82,
    marginTop: 4,
  },
  title: {
    marginTop: 14,
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
    paddingHorizontal: 12,
  },
  formBlock: {
    width: '100%',
    marginTop: 26,
    gap: 16,
  },
  btnFull: {
    width: '100%',
    marginTop: 24,
  },
  btnFullSecondary: {
    width: '100%',
    marginTop: 14,
  },
  btnPrimaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnOutlineLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  btnGoogle: {
    width: '100%',
    height: 55,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  btnGoogleText: {
    color: PRIMARY_BLUE,
    fontSize: 13,
    fontWeight: '700',
  },
  btnGoogleIcon: {
    marginLeft: 12,
    width: 22,
    height: 22,
  },
  btnPressed: {
    opacity: 0.88,
  },
  forgotWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 6,
  },
  forgotText: {
    color: RED_FORGOT,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
