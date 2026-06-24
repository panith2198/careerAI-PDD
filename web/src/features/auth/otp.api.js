import api from '@/api/api';

/**
 * Verify OTP using the exact POST /auth/otp/verify endpoint.
 */
export async function verifyOtpApi(email, otpCode) {
  return await api.post('/auth/otp/verify', {
    otp: otpCode,
    ...(email ? { email } : {}),
  });
}

/**
 * Resends the OTP verification code by requesting a new registration code from the backend.
 */
export async function resendOtpApi(email) {
  if (!email) {
    throw new Error('Registration email context is missing. Please register again.');
  }
  return await api.post('/auth/resend-otp', { email });
}

