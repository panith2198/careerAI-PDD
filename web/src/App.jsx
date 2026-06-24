import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts / Guards
import AuthGuard from '@/features/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';

// Auth Pages
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import OtpPage from '@/features/auth/OtpPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import OnboardingPage from '@/features/onboarding/OnboardingPage';
import NotFoundPage from '@/features/auth/NotFoundPage';

// Main / Feature Pages
import LandingPage from '@/features/home/LandingPage';
import DashboardPage from '@/features/home/DashboardPage';
import CareerListPage from '@/features/career/CareerListPage';
import CareerDetailPage from '@/features/career/CareerDetailPage';
import { careerLoader } from '@/features/career/career.loader';
import CareerPathPage from '@/features/career/CareerPathPage';
import CareerRecommendPage from '@/features/career/CareerRecommendPage';
import RagChatPage from '@/features/chat/RagChatPage';
import AssessmentListPage from '@/features/assessment/AssessmentListPage';
import QuizPage from '@/features/assessment/QuizPage';
import ResultPage from '@/features/assessment/ResultPage';
import SkillGapPage from '@/features/assessment/SkillGapPage';
import RoadmapPage from '@/features/roadmap/RoadmapPage';
import MilestoneDetailPage from '@/features/roadmap/MilestoneDetailPage';
import JobsPage from '@/features/jobs/JobsPage';
import JobDetailPage from '@/features/jobs/JobDetailPage';
import ResumeUploadPage from '@/features/resume/ResumeUploadPage';
import ResumePreviewPage from '@/features/resume/ResumePreviewPage';
import ProfilePage from '@/features/profile/ProfilePage';
import SkillsPage from '@/features/profile/SkillsPage';
import EditProfilePage from '@/features/profile/EditProfilePage';
import SettingsPage from '@/features/profile/SettingsPage';
import AnalyticsDashboardPage from '@/features/analytics/AnalyticsDashboardPage';
import NotificationsPage from '@/features/notifications/NotificationsPage';



const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/register/otp',
    element: <OtpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // Protected Routes (AuthGuard -> AppShell layout)
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        element: <AppShell />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/careers',
            element: <CareerListPage />,
          },
          {
            path: '/careers/:slug',
            element: <CareerDetailPage />,
            loader: careerLoader,
          },
          {
            path: '/careers/:slug/path',
            element: <CareerPathPage />,
          },
          {
            path: '/careers/recommend',
            element: <CareerRecommendPage />,
          },
          {
            path: '/chat',
            element: <RagChatPage />,
          },
          {
            path: '/assessments',
            element: <AssessmentListPage />,
          },
          {
            path: '/assessments/:id/quiz',
            element: <QuizPage />,
          },
          {
            path: '/assessments/:sessionId/result',
            element: <ResultPage />,
          },
          {
            path: '/assessments/:sessionId/gap',
            element: <SkillGapPage />,
          },
          {
            path: '/roadmap',
            element: <RoadmapPage />,
          },
          {
            path: '/roadmap/:id/milestone/:mid',
            element: <MilestoneDetailPage />,
          },
          {
            path: '/jobs',
            element: <JobsPage />,
          },
          {
            path: '/jobs/:id',
            element: <JobDetailPage />,
          },
          {
            path: '/resume/upload',
            element: <ResumeUploadPage />,
          },
          {
            path: '/resume/:id/preview',
            element: <ResumePreviewPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/profile/skills',
            element: <SkillsPage />,
          },
          {
            path: '/profile/edit',
            element: <EditProfilePage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
          {
            path: '/analytics',
            element: <AnalyticsDashboardPage />,
          },
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },
        ],
      },
    ],
  },

  // Fallback Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
