import { api } from './client';
import type { ApiList, Assessment, Career, Job, Roadmap } from '../types';

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  token?: string;
  user?: unknown;
};

export function login(email: string, password: string) {
  return api.post<unknown, LoginResponse>('/auth/login', { email, password });
}

export function getDashboard() {
  return Promise.allSettled([
    api.get('/analytics/dashboard'),
    api.post('/career/recommend', { force_refresh: false }),
    api.get('/roadmap/list?status=active'),
    api.post('/jobs/match'),
  ]);
}

export function getCareers() {
  return api.get<unknown, ApiList<Career> | Career[]>('/careers?page=1&limit=20&sort=recommended');
}

export function getAssessments() {
  return api.get<unknown, ApiList<Assessment> | Assessment[]>('/assessments/list');
}

export function getJobs() {
  return api.get<unknown, ApiList<Job> | Job[]>('/jobs/list?page=1&limit=10');
}

export function getRoadmaps() {
  return api.get<unknown, ApiList<Roadmap> | Roadmap[]>('/roadmap/list?status=active');
}

export function askCareerChat(query: string) {
  return api.post<unknown, { answer?: string; response?: string }>('/rag/query', { query });
}

export function unwrapList<T>(payload: ApiList<T> | T[] | undefined): T[] {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.items || payload.data || payload.results || [];
}
