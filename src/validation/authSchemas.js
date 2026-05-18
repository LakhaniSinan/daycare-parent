import * as yup from 'yup';

/** Demo OTP until backend verifies codes */
export const DEMO_RESET_OTP = '123456';

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const signupValidationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(
      /^\+?[\d\s\-()]{10,}$/,
      'Enter a valid phone number (at least 10 digits)',
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const forgotPasswordEmailSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
});

export const forgotPasswordOtpSchema = yup.object({
  otp: yup
    .string()
    .required('Enter the verification code')
    .matches(/^\d{6}$/, 'Code must be exactly 6 digits')
    .oneOf([DEMO_RESET_OTP], 'Invalid verification code'),
});

export const forgotPasswordNewPasswordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});
