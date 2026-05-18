import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Formik } from 'formik';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/appTextInput';
import { images } from '../assets';
import { forgotPasswordNewPasswordSchema } from '../validation/authSchemas';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';

export default function ForgotPasswordNewPassword() {
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

  const goToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={forgotPasswordNewPasswordSchema}
          validateOnChange
          validateOnBlur
          onSubmit={() => {
            Alert.alert(
              'Password updated',
              'You can now sign in with your new password.',
              [{ text: 'OK', onPress: goToLogin }],
            );
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
              <Text style={styles.title}>New password</Text>
              <Text style={styles.subtitle}>
                Choose a new password for{' '}
                <Text style={styles.emailInline}>{email || 'your account'}</Text>.
              </Text>

              <View style={styles.formBlock}>
                <AppTextInput
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="New password"
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
                  placeholder="Confirm new password"
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
                title="Save password"
                type="primary"
                onPress={handleSubmit}
                style={styles.btnFull}
                textStyle={styles.btnPrimaryLabel}
              />
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
});
