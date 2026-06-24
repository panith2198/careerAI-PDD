import { z } from 'zod';

export const credentialSchema = z.object({
  name: z.string()
    .min(1, { message: 'Full name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string()
    .min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  careerInterest: z.string({
    required_error: 'Please select a career goal',
  }).min(1, { message: 'Please select a career goal' }),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Professional'], {
    required_error: 'Please select your experience level',
  }),
  skills: z.array(z.string())
    .min(1, { message: 'Please select at least one skill' }),
  bio: z.string()
    .min(1, { message: 'Bio is required' })
    .min(10, { message: 'Bio must be at least 10 characters long' }),
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, { message: 'Full name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string()
    .min(1, { message: 'Please confirm your password' }),
  careerInterest: z.string({
    required_error: 'Please select a career goal',
  }).min(1, { message: 'Please select a career goal' }),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Professional'], {
    required_error: 'Please select your experience level',
  }),
  skills: z.array(z.string())
    .min(1, { message: 'Please select at least one skill' }),
  bio: z.string()
    .min(1, { message: 'Bio is required' })
    .min(10, { message: 'Bio must be at least 10 characters long' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

