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
import {
  DEMO_RESET_OTP,
  forgotPasswordOtpSchema,
} from '../validation/authSchemas';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';

export default function ForgotPasswordOtp() {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email ?? '';

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ForgotPassword');
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
          initialValues={{ otp: '' }}
          validationSchema={forgotPasswordOtpSchema}
          validateOnChange
          validateOnBlur
          onSubmit={() => {
            navigation.navigate('ForgotPasswordNewPassword', { email });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleSubmit,
            setFieldValue,
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
              <Text style={styles.title}>Enter verification code</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{' '}
                <Text style={styles.emailInline}>{email || 'your email'}</Text>.
                Enter it below to continue.
              </Text>
              {__DEV__ ? (
                <Text style={styles.devHint}>Demo code: {DEMO_RESET_OTP}</Text>
              ) : null}

              <View style={styles.formBlock}>
                <AppTextInput
                  value={values.otp}
                  onChangeText={(t) =>
                    setFieldValue('otp', t.replace(/\D/g, '').slice(0, 6))
                  }
                  onBlur={handleBlur('otp')}
                  placeholder="6-digit code"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                  error={errors.otp}
                  touched={touched.otp}
                  startIconComponent={
                    <Ionicons
                      name="keypad-outline"
                      size={18}
                      color={PRIMARY_BLUE}
                    />
                  }
                />
              </View>

              <AppButton
                title="Verify"
                type="primary"
                onPress={handleSubmit}
                style={styles.btnFull}
                textStyle={styles.btnPrimaryLabel}
              />

              <Pressable onPress={goBack} style={styles.linkWrap}>
                <Text style={styles.link}>Change email</Text>
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
    paddingHorizontal: 4,
  },
  emailInline: {
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  devHint: {
    marginTop: 10,
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
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
  linkWrap: {
    marginTop: 20,
    paddingVertical: 8,
  },
  link: {
    color: PRIMARY_BLUE,
    fontSize: 13,
    fontWeight: '600',
  },
});
