import api from './axios';

export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function verifyOtp(otp, email) {
  const response = await api.post('/auth/otp/verify', { otp, email });
  return response.data;
}

export async function resendOtp(email) {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(email, otp, newPassword) {
  const response = await api.post('/auth/reset-password', {
    email,
    otp,
    new_password: newPassword
  });
  return response.data;
}
