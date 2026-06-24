import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Recover user session from localStorage before render
useAuthStore.getState().initializeSession();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    <Toaster position="top-right" closeButton richColors />
  </StrictMode>
);
