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
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/appTextInput';
import { images } from '../assets';
import { forgotPasswordEmailSchema } from '../validation/authSchemas';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const route = useRoute();
  const paramEmail = route.params?.email;

  const initialEmail = typeof paramEmail === 'string' ? paramEmail : '';

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
          enableReinitialize
          initialValues={{ email: initialEmail }}
          validationSchema={forgotPasswordEmailSchema}
          validateOnChange
          validateOnBlur
          onSubmit={(values) => {
            navigation.navigate('ForgotPasswordOtp', {
              email: values.email.trim(),
            });
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
              <Pressable
                onPress={goBack}
                style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back" size={28} color={PRIMARY_BLUE} />
              </Pressable>

              <Image
                source={images.logo}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter the email address linked to your account. We will email you a
                verification code to reset your password.
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
              </View>

              <AppButton
                title="Send verification code"
                type="primary"
                onPress={handleSubmit}
                style={styles.btnFull}
                textStyle={styles.btnPrimaryLabel}
              />

              <Pressable onPress={goBack} style={styles.backToSignInWrap}>
                <Text style={styles.backToSignIn}>Back to sign in</Text>
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
    paddingTop: 4,
    paddingBottom: 36,
    alignItems: 'center',
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  logo: {
    width: 180,
    height: 74,
    marginTop: 4,
  },
  title: {
    marginTop: 18,
    fontSize: 21,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    color: GREY_MUTED,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  formBlock: {
    width: '100%',
    marginTop: 28,
    gap: 16,
  },
  btnFull: {
    width: '100%',
    marginTop: 24,
  },
  btnPrimaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  backToSignInWrap: {
    marginTop: 20,
    paddingVertical: 8,
  },
  backToSignIn: {
    color: PRIMARY_BLUE,
    fontSize: 13,
    fontWeight: '600',
  },
});
