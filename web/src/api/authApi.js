import api from './api';

export function login(payload) {
  return api.post('/auth/login', payload);
}

export function register(payload) {
  return api.post('/auth/register', payload);
}

export function verifyOtp(payload) {
  const email = payload.email;
  const code = payload.code || payload.otp;
  return api.post('/auth/verify-otp', { email, code });
}

export function logout() {
  return api.post('/auth/logout');
}

export function refreshToken(refreshTokenValue) {
  return api.post('/auth/refresh', { refresh_token: refreshTokenValue });
}

export function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export function resetPassword(payload) {
  return api.post('/auth/reset-password', payload);
}
