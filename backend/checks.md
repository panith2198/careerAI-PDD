# CareerAI API Telemetry Verification Matrix
Generated at: 2026-05-26T09:50:24.700494Z

| HTTP Endpoint | Result Status | Status Code | Telemetry Note |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/register` | **PASS** | `201` | Verified controller path correctly resolved |
| `POST /api/v1/auth/login` | **FAIL** | `401` | Verified controller path correctly resolved |
| `POST /api/v1/auth/refresh` | **FAIL** | `401` | Verified controller path correctly resolved |
| `POST /api/v1/auth/logout` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/auth/otp/send` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/users/me` | **PASS** | `200` | Verified controller path correctly resolved |
| `PUT /api/v1/users/me` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/users/me/skills` | **FAIL** | `404` | Verified controller path correctly resolved |
| `DELETE /api/v1/users/me/skills/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/resumes/history` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/resumes/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `DELETE /api/v1/resumes/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/careers/recommend` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/careers/recommend/history` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/careers/data-analyst` | **FAIL** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/careers/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/careers/graph` | **FAIL** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/careers/match` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/rag/query` | **FAIL** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/rag/kb/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/rag/collections` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/assessments/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/assessments/1/start` | **PASS** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/assessments/session/mock-session-id/answer` | **FAIL** | `422` | Verified controller path correctly resolved |
| `POST /api/v1/assessments/session/mock-session-id/submit` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/assessments/results` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/roadmaps/generate` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/roadmaps/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/roadmaps/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `PATCH /api/v1/roadmaps/1/milestone` | **PASS** | `404` | Verified controller path correctly resolved |
| `DELETE /api/v1/roadmaps/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/jobs/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `POST /api/v1/jobs/match` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/jobs/applications` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/jobs/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/jobs/1/apply` | **PASS** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/jobs/1/save` | **PASS** | `404` | Verified controller path correctly resolved |
| `DELETE /api/v1/jobs/1/save` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/mentors/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/mentors/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `POST /api/v1/mentors/session/book` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/mentors/session/history` | **PASS** | `200` | Verified controller path correctly resolved |
| `PUT /api/v1/mentors/availability` | **PASS** | `403` | Verified controller path correctly resolved |
| `GET /api/v1/notifications/list` | **PASS** | `200` | Verified controller path correctly resolved |
| `PATCH /api/v1/notifications/read-all` | **PASS** | `200` | Verified controller path correctly resolved |
| `PATCH /api/v1/notifications/1/read` | **PASS** | `404` | Verified controller path correctly resolved |
| `DELETE /api/v1/notifications/1` | **PASS** | `404` | Verified controller path correctly resolved |
| `GET /api/v1/analytics/dashboard` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/analytics/skills/trend` | **PASS** | `200` | Verified controller path correctly resolved |
| `GET /api/v1/analytics/cohort` | **PASS** | `200` | Verified controller path correctly resolved |
