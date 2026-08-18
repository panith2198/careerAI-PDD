export type ApiList<T> = {
  items?: T[];
  data?: T[];
  results?: T[];
  total?: number;
};

export type Career = {
  id?: number;
  career_id?: number;
  title?: string;
  name?: string;
  slug?: string;
  category?: string;
  match_score?: number;
  description?: string;
};

export type Assessment = {
  id?: number;
  assessment_id?: number;
  title?: string;
  name?: string;
  skill_name?: string;
  difficulty?: string;
  question_count?: number;
};

export type Job = {
  id?: number;
  job_id?: number;
  title?: string;
  company?: string;
  location?: string;
  city?: string;
  work_mode?: string;
  match_score?: number;
};

export type Roadmap = {
  id?: number;
  roadmap_id?: number;
  title?: string;
  career_title?: string;
  status?: string;
  progress?: number;
};
