import React from 'react';
import {
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

import AppButton from '../components/AppButton';
import { setAuthData } from '../store/authSlice';
import { saveParentSession } from '../utils/authStorage';
import AppTextInput from '../components/appTextInput';
import { signupValidationSchema } from '../validation/authSchemas';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const GREY_PLACEHOLDER = '#9CA3AF';
const TEXT_PRIMARY = '#111827';

export default function Signup() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Formik
          initialValues={{
            firstName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={signupValidationSchema}
          validateOnChange
          validateOnBlur
          onSubmit={async (values, { setErrors, setFieldTouched }) => {
            const email = values.email.trim().toLowerCase();
            const first = values.firstName.trim();
            const session = {
              token: 'demo-parent-session',
              user: {
                name: first || 'Parent',
                email,
                role: 'parent',
              },
              parentId: null,
            };
            try {
              await saveParentSession(session);
              dispatch(setAuthData(session));
              navigation.replace('Main');
            } catch {
              setFieldTouched('email', true, false);
              setErrors({
                email: 'Could not save your session. Please try again.',
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

              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={48} color="#FFFFFF" />
                </View>
              </View>

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
    marginBottom: 8,
  },
  avatarCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
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
