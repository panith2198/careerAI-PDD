-- CareerAI Relational Database Schema (MySQL 8.0+)
-- Generated on 2026-05-26

CREATE DATABASE IF NOT EXISTS `careerai`;
USE `careerai`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_sessions`;
DROP TABLE IF EXISTS `user_otps`;
DROP TABLE IF EXISTS `career_recommendations`;

DROP TABLE IF EXISTS `job_applications`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `roadmaps`;
DROP TABLE IF EXISTS `assessment_results`;
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `career_skills`;
DROP TABLE IF EXISTS `careers`;
DROP TABLE IF EXISTS `user_skills`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `rag_documents`;
DROP TABLE IF EXISTS `resumes`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. Users Table
-- ==========================================
CREATE TABLE `users` (
  `user_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `uuid` CHAR(36) UNIQUE NOT NULL COMMENT 'UUID v4 for external API use',
  `email` VARCHAR(255) UNIQUE NOT NULL COMMENT 'Login email; B-Tree indexed',
  `phone` VARCHAR(20) UNIQUE NULL COMMENT 'OTP-verified phone number',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt hash cost=12',
  `full_name` VARCHAR(120) NOT NULL COMMENT 'Display name',
  `role` ENUM('student') DEFAULT 'student' COMMENT 'RBAC role for permission checks',
  `subscription_tier` ENUM('free', 'pro', 'enterprise') DEFAULT 'free' COMMENT 'Feature gating; token budget tier',
  `mistral_token_budget` INT UNSIGNED DEFAULT 10000 COMMENT 'Monthly MistralAI token allowance per tier',
  `is_verified` TINYINT(1) DEFAULT 0 COMMENT 'Email verified flag',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Soft delete flag',
  `last_login_at` DATETIME NULL COMMENT 'Last successful login',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last profile update',
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. User Profiles Table
-- ==========================================
CREATE TABLE `user_profiles` (
  `profile_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED UNIQUE NOT NULL COMMENT '1:1 link',
  `education_level` ENUM('12th', 'diploma', 'btech', 'mtech', 'mba', 'phd') NOT NULL COMMENT 'Highest qualification',
  `field_of_study` VARCHAR(120) NOT NULL COMMENT 'Degree specialization',
  `institution_name` VARCHAR(255) NOT NULL COMMENT 'College name',
  `graduation_year` YEAR NOT NULL COMMENT 'Graduation year for cohort analysis',
  `city` VARCHAR(100) NULL COMMENT 'Current city for job geo-matching',
  `state` VARCHAR(100) NULL COMMENT 'State for regional market data',
  `career_interests` JSON NULL COMMENT 'Array of career domain interests',
  `preferred_work_mode` ENUM('remote', 'onsite', 'hybrid') NULL COMMENT 'Work mode preference',
  `expected_salary_min` INT UNSIGNED NULL COMMENT 'Min salary expectation INR p.a.',
  `linkedin_url` VARCHAR(500) NULL COMMENT 'LinkedIn profile URL',
  `github_url` VARCHAR(500) NULL COMMENT 'GitHub portfolio URL',
  `resume_url` VARCHAR(500) NULL COMMENT 'Latest PDF resume path',
  `profile_embedding` JSON NULL COMMENT '1024-dim mistral-embed vector for user-career matching',
  CONSTRAINT `fk_user_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. Resumes Table
-- ==========================================
CREATE TABLE `resumes` (
  `resume_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'Resume owner; B-Tree indexed',
  `file_url` VARCHAR(500) NOT NULL COMMENT 'Storage path to PDF',
  `file_size_kb` INT UNSIGNED NOT NULL COMMENT 'File size in KB',
  `page_count` TINYINT UNSIGNED NOT NULL COMMENT 'Page count',
  `raw_text` LONGTEXT NOT NULL COMMENT 'Full text by PyMuPDF',
  `structured_json` JSON NOT NULL COMMENT 'Parsed sections: personal/edu/exp/skills',
  `skills_extracted` JSON NOT NULL COMMENT 'Canonical skills by spaCy NER + taxonomy',
  `ats_score` DECIMAL(5,2) NULL COMMENT 'ATS compatibility 0-100',
  `parser_version` VARCHAR(20) NOT NULL COMMENT 'e.g., spacy-3.7+msmarco-l6v2',
  `chroma_doc_id` VARCHAR(100) NULL COMMENT 'ChromaDB embedding document ID',
  `parse_status` ENUM('pending', 'processing', 'done', 'failed') DEFAULT 'pending' COMMENT 'Async parse state',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
  `parsed_at` DATETIME NULL COMMENT 'Completion timestamp',
  CONSTRAINT `fk_resumes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_resumes_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. RAG Documents Table
-- ==========================================
CREATE TABLE `rag_documents` (
  `doc_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `collection_name` VARCHAR(100) NOT NULL COMMENT 'ChromaDB collection (careers/skills/kb)',
  `source_type` ENUM('pdf', 'url', 'docx', 'txt', 'manual') NOT NULL COMMENT 'Source type',
  `source_path` VARCHAR(500) NOT NULL COMMENT 'File path or URL',
  `title` VARCHAR(300) NOT NULL COMMENT 'Document title',
  `chunk_index` SMALLINT UNSIGNED NOT NULL COMMENT 'Chunk number in parent doc',
  `chunk_text` TEXT NOT NULL COMMENT 'Chunk text content',
  `chroma_doc_id` VARCHAR(200) UNIQUE NOT NULL COMMENT 'ChromaDB vector record ID',
  `embedding_model` VARCHAR(100) NOT NULL COMMENT 'mistral-embed or all-MiniLM-L6-v2',
  `embedding_dim` SMALLINT UNSIGNED NOT NULL COMMENT '1024 or 384',
  `token_count` INT UNSIGNED NULL COMMENT 'Chunk token count',
  `msmarco_relevance_cache` JSON NULL COMMENT 'Cached ms-marco scores for top queries',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Active/deleted flag',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. Skills Table
-- ==========================================
CREATE TABLE `skills` (
  `skill_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `skill_name` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Canonical skill name (e.g., Python, SQL, React)',
  `skill_slug` VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-safe slug for API routing',
  `category` ENUM('technical', 'soft', 'domain', 'tool') NOT NULL COMMENT 'Skill category for filtering and grouping',
  `domain` VARCHAR(80) NOT NULL COMMENT 'Broad domain (e.g., Data Science, Web Dev, Cloud)',
  `market_demand_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Real-time demand score 0-100 from job market API',
  `avg_salary_impact_pct` DECIMAL(5,2) NULL COMMENT 'Average salary premium % for having this skill',
  `is_trending` TINYINT(1) DEFAULT 0 COMMENT 'Flag for trending/hot skills in current market',
  `parent_skill_id` INT UNSIGNED NULL COMMENT 'Parent skill for hierarchical skill taxonomy',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  CONSTRAINT `fk_skills_parent_skill_id` FOREIGN KEY (`parent_skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. User Skills Table
-- ==========================================
CREATE TABLE `user_skills` (
  `user_skill_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'Reference to user owning this skill',
  `skill_id` INT UNSIGNED NOT NULL COMMENT 'Reference to canonical skill in taxonomy',
  `proficiency_level` ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL COMMENT 'Self-declared or assessed skill proficiency level',
  `proficiency_score` DECIMAL(5,2) NULL COMMENT 'AI-assessed numeric proficiency 0-100',
  `years_of_experience` DECIMAL(3,1) DEFAULT 0.0 COMMENT 'Years actively using this skill',
  `is_verified` TINYINT(1) DEFAULT 0 COMMENT 'Verified via assessment test flag',
  `endorsed_by_count` INT UNSIGNED DEFAULT 0 COMMENT 'Number of mentors who endorsed this skill',
  `source` ENUM('self', 'assessment', 'ai', 'resume') DEFAULT 'self' COMMENT 'How this skill was added to profile',
  `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When skill was added to user profile',
  CONSTRAINT `fk_user_skills_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_skills_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_user_skills_user_skill` (`user_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. Careers Table
-- ==========================================
CREATE TABLE `careers` (
  `career_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL COMMENT 'Career title (e.g., Data Analyst, DevOps Engineer)',
  `slug` VARCHAR(150) UNIQUE NOT NULL COMMENT 'URL-safe career identifier for routing',
  `category` VARCHAR(100) NOT NULL COMMENT 'Career category (Tech, Finance, Design, etc.)',
  `description` TEXT NOT NULL COMMENT 'Detailed career description for display and AI context',
  `avg_salary_min` INT UNSIGNED NULL COMMENT 'Minimum average salary range (INR per annum)',
  `avg_salary_max` INT UNSIGNED NULL COMMENT 'Maximum average salary range (INR per annum)',
  `growth_rate_pct` DECIMAL(5,2) NULL COMMENT 'Projected annual job growth rate percentage',
  `demand_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Current market demand score 0-100',
  `difficulty_level` ENUM('easy', 'medium', 'hard', 'expert') NOT NULL COMMENT 'Entry barrier difficulty for freshers',
  `time_to_job_ready_months` TINYINT UNSIGNED NOT NULL COMMENT 'Average months to become job-ready',
  `embedding_vector` JSON NULL COMMENT '768-dim career embedding for semantic similarity',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Career listing active/inactive status',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. Career Skills Table
-- ==========================================
CREATE TABLE `career_skills` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `career_id` INT UNSIGNED NOT NULL COMMENT 'Career role requiring the skill',
  `skill_id` INT UNSIGNED NOT NULL COMMENT 'Required skill for this career',
  `importance` ENUM('must_have', 'good_to_have', 'optional') NOT NULL COMMENT 'Skill requirement priority level',
  `min_proficiency` ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL COMMENT 'Minimum proficiency level required for hire',
  `weightage` DECIMAL(4,2) DEFAULT 1.00 COMMENT 'Weight in career fit score calculation (0.0 to 1.0)',
  CONSTRAINT `fk_career_skills_career_id` FOREIGN KEY (`career_id`) REFERENCES `careers` (`career_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_career_skills_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_career_skills_career_skill` (`career_id`, `skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. Assessments Table
-- ==========================================
CREATE TABLE `assessments` (
  `assessment_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL COMMENT 'Assessment title (e.g., Python Basics Quiz)',
  `career_id` INT UNSIGNED NULL COMMENT 'Associated career for targeted assessment',
  `skill_id` INT UNSIGNED NULL COMMENT 'Primary skill being assessed',
  `type` ENUM('mcq', 'coding', 'scenario', 'video') NOT NULL COMMENT 'Assessment question type/format',
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL COMMENT 'Overall difficulty level of assessment',
  `total_questions` SMALLINT UNSIGNED NOT NULL COMMENT 'Total number of questions in assessment',
  `time_limit_minutes` SMALLINT UNSIGNED NOT NULL COMMENT 'Maximum allowed time to complete assessment',
  `pass_score_pct` DECIMAL(5,2) DEFAULT 60.00 COMMENT 'Minimum percentage score to pass',
  `irt_params` JSON NULL COMMENT 'Item Response Theory parameters for adaptive testing',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Assessment published/draft status',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Assessment creation timestamp',
  CONSTRAINT `fk_assessments_career_id` FOREIGN KEY (`career_id`) REFERENCES `careers` (`career_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_assessments_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. Assessment Results Table
-- ==========================================
CREATE TABLE `assessment_results` (
  `result_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'User who took the assessment',
  `assessment_id` INT UNSIGNED NOT NULL COMMENT 'Assessment that was taken',
  `score` DECIMAL(5,2) NOT NULL COMMENT 'Raw percentage score achieved',
  `percentile_rank` DECIMAL(5,2) NULL COMMENT 'Percentile rank among all test takers',
  `time_taken_seconds` INT UNSIGNED NOT NULL COMMENT 'Total time taken to complete in seconds',
  `answers_json` JSON NOT NULL COMMENT 'Complete answer record for review and AI analysis',
  `ai_feedback` TEXT NULL COMMENT 'Claude-generated personalized feedback on performance',
  `gap_analysis_json` JSON NULL COMMENT 'Structured skill gap output from assessment AI',
  `attempt_number` TINYINT UNSIGNED DEFAULT 1 COMMENT 'Attempt number (for tracking retakes)',
  `completed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Assessment submission timestamp',
  CONSTRAINT `fk_assessment_results_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assessment_results_assessment_id` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`assessment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. Roadmaps Table
-- ==========================================
CREATE TABLE `roadmaps` (
  `roadmap_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'User this roadmap belongs to',
  `career_id` INT UNSIGNED NOT NULL COMMENT 'Target career for this roadmap',
  `title` VARCHAR(200) NOT NULL COMMENT 'Roadmap title (e.g., Become a Data Analyst in 6M)',
  `total_weeks` TINYINT UNSIGNED NOT NULL COMMENT 'Total roadmap duration in weeks',
  `hours_per_week` TINYINT UNSIGNED NOT NULL COMMENT 'Weekly time commitment planned',
  `status` ENUM('draft', 'active', 'completed', 'paused') DEFAULT 'draft' COMMENT 'Current roadmap execution status',
  `completion_pct` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Overall completion percentage 0-100',
  `ai_model_used` VARCHAR(50) NOT NULL COMMENT 'AI model that generated roadmap (claude/gpt-4)',
  `milestones_json` JSON NOT NULL COMMENT 'Full roadmap structure with milestones and resources',
  `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Roadmap generation timestamp',
  `last_activity_at` DATETIME NULL COMMENT 'Last time user interacted with roadmap',
  CONSTRAINT `fk_roadmaps_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_roadmaps_career_id` FOREIGN KEY (`career_id`) REFERENCES `careers` (`career_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 12. Jobs Table
-- ==========================================
CREATE TABLE `jobs` (
  `job_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `external_id` VARCHAR(100) UNIQUE NULL COMMENT 'External job ID from source API (LinkedIn, Naukri)',
  `job_url` VARCHAR(500) NULL COMMENT 'Direct link to job post',
  `job_url_direct` VARCHAR(500) NULL COMMENT 'Apply link',
  `title` VARCHAR(200) NOT NULL COMMENT 'Job title as posted by employer',
  `company_name` VARCHAR(200) NOT NULL COMMENT 'Hiring company name',
  `company_url` VARCHAR(300) NULL COMMENT 'Hiring company link',
  `company_logo_url` VARCHAR(500) NULL COMMENT 'Hiring company logo link',
  `career_id` INT UNSIGNED NULL COMMENT 'Mapped career category for this job',
  `description_raw` LONGTEXT NOT NULL COMMENT 'Full job description for NLP/AI parsing',
  `required_skills_json` JSON NOT NULL COMMENT 'AI-extracted required skills from JD',
  `location_city` VARCHAR(100) NULL COMMENT 'Job location city',
  `work_mode` ENUM('remote', 'onsite', 'hybrid') NOT NULL COMMENT 'Work mode requirement',
  `job_type` ENUM('fulltime', 'parttime', 'internship', 'contract') NULL COMMENT 'Employment type',
  `experience_min_months` SMALLINT UNSIGNED DEFAULT 0 COMMENT 'Minimum experience required in months',
  `salary_min` INT UNSIGNED NULL COMMENT 'Minimum salary offered (INR per annum)',
  `salary_max` INT UNSIGNED NULL COMMENT 'Maximum salary offered (INR per annum)',
  `currency` VARCHAR(10) DEFAULT 'INR' NULL COMMENT 'Salary currency',
  `source` ENUM('linkedin', 'naukri', 'indeed', 'zip_recruiter', 'google', 'glassdoor', 'internal', 'manual') NOT NULL COMMENT 'Job data source for attribution',
  `is_fresher_eligible` TINYINT(1) DEFAULT 1 COMMENT 'Whether job accepts fresh graduates',
  `posting_date` DATE NOT NULL COMMENT 'Original job posting date',
  `expiry_date` DATE NULL COMMENT 'Job listing expiry date for auto-removal',
  `embedding_vector` JSON NULL COMMENT '384-dim JD embedding for semantic job matching',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Job listing active/expired status',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record import timestamp',
  CONSTRAINT `fk_jobs_career_id` FOREIGN KEY (`career_id`) REFERENCES `careers` (`career_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 13. Job Applications Table
-- ==========================================
CREATE TABLE `job_applications` (
  `application_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'Applicant user reference',
  `job_id` INT UNSIGNED NOT NULL COMMENT 'Applied job reference',
  `match_score` DECIMAL(5,2) NULL COMMENT 'AI-computed match score at time of application',
  `status` ENUM('saved', 'applied', 'interview', 'offered', 'rejected', 'withdrawn') DEFAULT 'saved' COMMENT 'Application pipeline status',
  `cover_letter` TEXT NULL COMMENT 'AI-assisted or manually written cover letter',
  `ai_interview_tips` TEXT NULL COMMENT 'Claude-generated interview preparation tips',
  `applied_at` DATETIME NULL COMMENT 'Timestamp of actual application submission',
  `status_updated_at` DATETIME NULL COMMENT 'Last status change timestamp',
  `notes` TEXT NULL COMMENT 'User personal notes about this application',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  CONSTRAINT `fk_job_applications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_job_applications_job_id` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_job_applications_user_job` (`user_id`, `job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 15. Career Recommendations Table
-- ==========================================
CREATE TABLE `career_recommendations` (
  `rec_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'User who received recommendations',
  `career_id` INT UNSIGNED NOT NULL COMMENT 'Recommended career role',
  `fit_score` DECIMAL(5,2) NOT NULL COMMENT 'AI-computed career fit score 0-100',
  `rank` TINYINT UNSIGNED NOT NULL COMMENT 'Recommendation rank (1=best match)',
  `ai_model` VARCHAR(50) NOT NULL COMMENT 'AI model used (claude-3-opus, gpt-4, etc.)',
  `reasoning_json` JSON NOT NULL COMMENT 'Full AI reasoning and score breakdown',
  `gap_skills_json` JSON NULL COMMENT 'Skills user needs to develop for this career',
  `trigger` ENUM('onboarding', 'profile_update', 'manual', 'scheduled') NOT NULL COMMENT 'What triggered this recommendation run',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Recommendation generation timestamp',
  CONSTRAINT `fk_career_recommendations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_career_recommendations_career_id` FOREIGN KEY (`career_id`) REFERENCES `careers` (`career_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 16. Notifications Table
-- ==========================================
CREATE TABLE `notifications` (
  `notification_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'Notification recipient user',
  `type` ENUM('system', 'job_match', 'roadmap', 'assessment', 'ai_tip') NOT NULL COMMENT 'Notification category for filtering and display',
  `title` VARCHAR(200) NOT NULL COMMENT 'Short notification title for push/in-app display',
  `message` TEXT NOT NULL COMMENT 'Full notification message content',
  `action_url` VARCHAR(500) NULL COMMENT 'Deep link URL for notification CTA button',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT 'Read/unread tracking flag',
  `channel` SET('in_app', 'email', 'sms', 'push') NOT NULL COMMENT 'Delivery channels used for this notification',
  `sent_at` DATETIME NULL COMMENT 'Actual delivery timestamp',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Notification creation timestamp',
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 17. Audit Logs Table
-- ==========================================
CREATE TABLE `audit_logs` (
  `log_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL COMMENT 'Acting user (NULL = system action)',
  `action` VARCHAR(100) NOT NULL COMMENT 'Action performed (e.g., LOGIN, GENERATE_ROADMAP)',
  `resource_type` VARCHAR(100) NOT NULL COMMENT 'Resource affected (user, career, assessment, etc.)',
  `resource_id` VARCHAR(100) NULL COMMENT 'ID of the specific resource affected',
  `ip_address` VARCHAR(45) NULL COMMENT 'Client IP for security audit (IPv4/IPv6 compatible)',
  `user_agent` TEXT NULL COMMENT 'Browser/client user-agent string',
  `request_data` JSON NULL COMMENT 'Sanitized request payload (no passwords/tokens)',
  `response_code` SMALLINT UNSIGNED NULL COMMENT 'HTTP response status code',
  `duration_ms` INT UNSIGNED NULL COMMENT 'Request processing time in milliseconds',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Event timestamp (partition key for archival)',
  CONSTRAINT `fk_audit_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 19. User OTPs Table
-- ==========================================
CREATE TABLE `user_otps` (
  `otp_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL COMMENT 'Email to which OTP was sent',
  `code` VARCHAR(10) NOT NULL COMMENT 'Verification code',
  `expires_at` DATETIME NOT NULL COMMENT 'Expiration timestamp',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  INDEX `idx_user_otps_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 20. Chat Sessions Table
-- ==========================================
CREATE TABLE `chat_sessions` (
  `session_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'User who owns this session',
  `title` VARCHAR(255) NOT NULL DEFAULT 'New Chat Session' COMMENT 'Session display title',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  CONSTRAINT `fk_chat_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_chat_sessions_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 21. Chat Messages Table
-- ==========================================
CREATE TABLE `chat_messages` (
  `message_id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT UNSIGNED NOT NULL COMMENT 'Chat session this message belongs to',
  `is_user` TINYINT(1) NOT NULL COMMENT 'Flag indicating if message is from user (1) or AI (0)',
  `message_text` TEXT NOT NULL COMMENT 'Message content text',
  `confidence` DECIMAL(5,2) NULL COMMENT 'AI answer confidence score',
  `sources_json` JSON NULL COMMENT 'Source documents cited by AI',
  `model_used` VARCHAR(50) NULL COMMENT 'LLM model version used for generation',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Message timestamp',
  CONSTRAINT `fk_chat_messages_session_id` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_chat_messages_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

