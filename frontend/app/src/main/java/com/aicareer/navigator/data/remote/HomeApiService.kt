package com.aicareer.navigator.data.remote

import retrofit2.http.GET

interface HomeApiService {
    @GET("api/v1/analytics/dashboard")
    suspend fun getDashboardMetrics(): DashboardMetricsResponse

    @GET("api/v1/careers/list")
    suspend fun getCareersList(): CareersListResponse

    @retrofit2.http.GET("api/v1/careers/{slug}")
    suspend fun getCareerDetail(@retrofit2.http.Path("slug") slug: String): CareerDetailResponse

    @GET("api/v1/roadmaps/list")
    suspend fun getRoadmapsList(): RoadmapsListResponse

    @GET("api/v1/jobs/list")
    suspend fun getJobsList(): JobsListResponse

    @retrofit2.http.GET("api/v1/careers/graph")
    suspend fun getCareerGraph(
        @retrofit2.http.Query("from_role") fromRole: String,
        @retrofit2.http.Query("to_role") toRole: String
    ): CareerGraphResponse

    @retrofit2.http.POST("api/v1/careers/recommend")
    suspend fun recommendCareers(
        @retrofit2.http.Body payload: RecommendPayload
    ): RecommendResponse

    @retrofit2.http.GET("api/v1/assessments/list")
    suspend fun getAssessmentsList(
        @retrofit2.http.Query("career_id") careerId: Int? = null
    ): AssessmentsListResponse

    @retrofit2.http.POST("api/v1/assessments/{id}/start")
    suspend fun startAssessment(@retrofit2.http.Path("id") id: Int): StartSessionResponse

    @retrofit2.http.POST("api/v1/assessments/session/{sid}/answer")
    suspend fun submitAnswer(
        @retrofit2.http.Path("sid") sid: String,
        @retrofit2.http.Body payload: AnswerPayloadDto
    ): AnswerSessionResponse

    @retrofit2.http.POST("api/v1/assessments/session/{sid}/submit")
    suspend fun submitQuiz(
        @retrofit2.http.Path("sid") sid: String
    ): SubmitQuizResponse

    @retrofit2.http.GET("api/v1/assessments/results")
    suspend fun getAssessmentResults(): ResultsListResponse

    @retrofit2.http.POST("api/v1/roadmaps/generate")
    suspend fun generateRoadmap(@retrofit2.http.Body payload: RoadmapGeneratePayloadDto): RoadmapGenerateResponseDto

    @retrofit2.http.GET("api/v1/roadmaps/{id}")
    suspend fun getRoadmapDetails(@retrofit2.http.Path("id") id: Int): RoadmapDetailsResponseDto

    @retrofit2.http.PATCH("api/v1/roadmaps/{id}/milestone")
    suspend fun updateMilestone(
        @retrofit2.http.Path("id") id: Int,
        @retrofit2.http.Body payload: MilestoneUpdatePayloadDto
    ): MilestoneUpdateResponseDto

    @retrofit2.http.Multipart
    @retrofit2.http.POST("api/v1/resume/upload")
    suspend fun uploadResume(
        @retrofit2.http.Part file: okhttp3.MultipartBody.Part
    ): ResumeUploadResponse

    @retrofit2.http.GET("api/v1/resume/{id}/status")
    suspend fun getResumeStatus(
        @retrofit2.http.Path("id") id: Int
    ): ResumeStatusResponse

    @retrofit2.http.GET("api/v1/resume/{id}")
    suspend fun getResumeDetails(
        @retrofit2.http.Path("id") id: Int
    ): Map<String, Any>

    @retrofit2.http.GET("api/v1/users/me")
    suspend fun getMe(): UserMeResponse

    @retrofit2.http.POST("api/v1/users/me/skills")
    suspend fun addUserSkill(
        @retrofit2.http.Body payload: UserSkillAddPayload
    ): UserSkillAddResponse

    @retrofit2.http.DELETE("api/v1/users/me/skills/{id}")
    suspend fun deleteUserSkill(
        @retrofit2.http.Path("id") id: Int
    ): retrofit2.Response<Unit>

    @retrofit2.http.GET("api/v1/skills/autocomplete")
    suspend fun autocompleteSkills(
        @retrofit2.http.Query("prefix") prefix: String
    ): List<SkillDto>

    @retrofit2.http.PUT("api/v1/users/me")
    suspend fun updateMe(
        @retrofit2.http.Body payload: UserMeUpdatePayload
    ): UserMeResponse

    @retrofit2.http.POST("api/v1/auth/logout")
    suspend fun logout(): StandardApiResponse

    @retrofit2.http.DELETE("api/v1/users/me")
    suspend fun deleteAccount(): StandardApiResponse

    // === Notifications ===

    @retrofit2.http.GET("api/v1/notifications/list")
    suspend fun getNotificationsList(): NotificationsListResponse

    @retrofit2.http.PATCH("api/v1/notifications/{id}/read")
    suspend fun markNotificationRead(
        @retrofit2.http.Path("id") id: Int
    ): StandardApiResponse

    @retrofit2.http.POST("api/v1/notifications/read-all")
    suspend fun markAllNotificationsRead(): StandardApiResponse

    @retrofit2.http.DELETE("api/v1/notifications/{id}")
    suspend fun dismissNotification(
        @retrofit2.http.Path("id") id: Int
    ): retrofit2.Response<Unit>

    // === RAG Chat ===

    @retrofit2.http.Multipart
    @retrofit2.http.POST("api/v1/rag/chat")
    suspend fun ragChat(
        @retrofit2.http.Part("query") query: String,
        @retrofit2.http.Part("collection") collection: String,
        @retrofit2.http.Part("session_id") sessionId: Int? = null,
        @retrofit2.http.Part file: okhttp3.MultipartBody.Part? = null
    ): RagChatResponse

    @retrofit2.http.GET("api/v1/rag/sessions")
    suspend fun getChatSessions(): List<ChatSessionDto>

    @retrofit2.http.GET("api/v1/rag/sessions/{session_id}/messages")
    suspend fun getSessionMessages(
        @retrofit2.http.Path("session_id") sessionId: Int
    ): List<ChatMessageDto>

    @retrofit2.http.POST("api/v1/rag/sessions")
    suspend fun createChatSession(
        @retrofit2.http.Query("title") title: String? = null
    ): CreateSessionResponse

    @retrofit2.http.DELETE("api/v1/rag/sessions/{session_id}")
    suspend fun deleteChatSession(
        @retrofit2.http.Path("session_id") sessionId: Int
    ): StandardApiResponse

    @retrofit2.http.DELETE("api/v1/rag/sessions")
    suspend fun clearAllChatSessions(): StandardApiResponse
}

// Data Transfer Objects
data class DashboardMetricsResponse(
    val skill_progress: List<SkillProgressDto>?,
    val assessment_scores: List<AssessmentScoreDto>?,
    val roadmap_pct: List<RoadmapPctDto>?,
    val career_fit_trend: List<CareerFitTrendDto>?
)

data class SkillProgressDto(
    val skill_id: Int,
    val skill_name: String,
    val proficiency_level: String?,
    val proficiency_score: Float,
    val is_verified: Boolean
)

data class AssessmentScoreDto(
    val result_id: Int,
    val assessment_title: String,
    val score: Float,
    val percentile_rank: Float,
    val time_taken_seconds: Int?,
    val completed_at: String?
)

data class RoadmapPctDto(
    val roadmap_id: Int,
    val title: String,
    val completion_pct: Float,
    val status: String,
    val total_weeks: Int?,
    val hours_per_week: Int?,
    val career_id: Int? = null
)

data class CareerFitTrendDto(
    val rec_id: Int,
    val career_id: Int,
    val fit_score: Float,
    val rank: Int,
    val trigger: String?,
    val generated_at: String
)

data class CareersListResponse(
    val items: List<CareerDto>?,
    val total: Int
)

data class CareerDto(
    val career_id: Int,
    val title: String,
    val category: String?,
    val description: String?,
    val avg_salary_min: Int?,
    val avg_salary_max: Int?,
    val growth_rate_pct: Float?
)

data class RoadmapsListResponse(
    val items: List<RoadmapDto>?
)

data class RoadmapDto(
    val roadmap_id: Int,
    val title: String,
    val completion_pct: Float,
    val status: String,
    val career_id: Int? = null
)

data class JobsListResponse(
    val items: List<JobDto>?
)

data class JobDto(
    val job_id: Int,
    val title: String,
    val company: String?,
    val location: String?,
    val salary_min: Int?,
    val salary_max: Int?,
    val match_score: Float?
)

data class CareerDetailResponse(
    val career_id: Int,
    val title: String,
    val category: String?,
    val description: String?,
    val avg_salary_min: Int?,
    val avg_salary_max: Int?,
    val growth_rate_pct: Float?,
    val demand_score: Float?,
    val difficulty_level: String?,
    val time_to_ready_months: Int?,
    val skills: List<CareerSkillDto>?,
    val rag_doc_ids: List<String>?
)

data class CareerSkillDto(
    val name: String,
    val importance: Float?
)

data class CareerGraphResponse(
    val path: List<String>?,
    val hops: Int,
    val total_weight: Float
)

data class RecommendPayload(
    val force_refresh: Boolean = false
)

data class RecommendResponse(
    val careers: List<CareerRecommendDto>?,
    val generated_at: String?,
    val model_used: String?
)

data class CareerRecommendDto(
    val career_id: Int,
    val title: String,
    val fit_score: Float,
    val rank: Int,
    val reasoning: Map<String, Any>?,
    val gap_skills: Map<String, List<String>>?
)

data class AssessmentsListResponse(
    val items: List<AssessmentDto>?,
    val total: Int
)

data class AssessmentDto(
    val assessment_id: Int,
    val title: String,
    val career_id: Int?,
    val skill_id: Int?,
    val type: String?,
    val difficulty: String?,
    val total_questions: Int,
    val time_limit_minutes: Int
)

data class StartSessionResponse(
    val session_id: String,
    val first_question: QuestionDto,
    val time_limit_seconds: Int
)

data class QuestionDto(
    val question_id: Int,
    val text: String,
    val difficulty: String,
    val options: List<OptionDto>
)

data class OptionDto(
    val id: Int,
    val text: String
)

data class AnswerPayloadDto(
    val question_id: Int,
    val selected_option_id: Int,
    val time_taken_ms: Int
)

data class AnswerSessionResponse(
    val next_question: QuestionDto?,
    val adapted_difficulty: String
)

data class SubmitQuizResponse(
    val score: Float,
    val percentile_rank: Float,
    val gap_analysis_json: GapAnalysisDto?,
    val mistral_feedback: String?
)

data class GapAnalysisDto(
    val missing_competencies: List<MissingCompetencyDto>?
)

data class MissingCompetencyDto(
    val skill_id: Int,
    val skill_name: String,
    val recommended_focus: String?
)

data class ResultsListResponse(
    val items: List<AssessmentResultDto>?,
    val total: Int,
    val page: Int
)

data class AssessmentResultDto(
    val result_id: Int,
    val assessment_id: Int,
    val title: String,
    val score: Float,
    val percentile_rank: Float?,
    val ai_feedback: String?,
    val gap_analysis: GapAnalysisDto?,
    val completed_at: String
)

data class RoadmapGeneratePayloadDto(
    val career_id: Int,
    val hours_per_week: Int,
    val target_months: Int,
    val budget_inr: Int = 0
)

data class RoadmapGenerateResponseDto(
    val task_id: String,
    val roadmap_id: Int
)

data class RoadmapDetailsResponseDto(
    val roadmap_id: Int,
    val title: String,
    val total_weeks: Int,
    val hours_per_week: Int,
    val status: String,
    val completion_pct: Float,
    val milestones_json: Map<String, Any>?,
    val generated_at: String
)

data class MilestoneUpdatePayloadDto(
    val milestone_id: String,
    val completed: Boolean,
    val note: String? = null
)

data class MilestoneUpdateResponseDto(
    val completion_pct: Float,
    val updated_at: String
)

data class ResumeUploadResponse(
    val resume_id: Int,
    val task_id: String,
    val status: String
)

data class ResumeStatusResponse(
    val status: String,
    val ats_score: Float?,
    val parsed_at: String?
)

data class UserMeResponse(
    val user_id: Int,
    val email: String,
    val full_name: String?,
    val role: String?,
    val subscription_tier: String?,
    val profile: UserProfileDto?,
    val skills: List<UserSkillDto>?
)

data class UserProfileDto(
    val city: String?,
    val state: String?,
    val preferred_work_mode: String?,
    val education_level: String?,
    val expected_salary_min: Int?,
    val field_of_study: String?,
    val institution_name: String?,
    val graduation_year: Int?,
    val linkedin_url: String?,
    val github_url: String?
)

data class UserSkillDto(
    val user_skill_id: Int,
    val skill_id: Int,
    val skill_name: String,
    val proficiency_level: String,
    val years_of_experience: Float
)

data class UserSkillAddPayload(
    val skill_id: Int,
    val proficiency_level: String,
    val years_experience: Float = 0.0f
)

data class UserSkillAddResponse(
    val user_skill_id: Int
)

data class SkillDto(
    val skill_id: Int,
    val skill_name: String,
    val category: String? = null
)

data class UserMeUpdatePayload(
    val full_name: String,
    val bio: String? = null,
    val city: String? = null,
    val state: String? = null,
    val preferred_work_mode: String? = null,
    val expected_salary_min: Int? = null,
    val education_level: String? = null,
    val field_of_study: String? = null,
    val institution_name: String? = null,
    val graduation_year: Int? = null,
    val linkedin_url: String? = null,
    val github_url: String? = null
)

data class StandardApiResponse(
    val message: String? = null,
    val status: String? = null
)


// === Notification DTOs ===

data class NotificationsListResponse(
    val items: List<NotificationDto>?,
    val total: Int?
)

data class NotificationDto(
    val id: Int,
    val type: String,           // "job_match", "roadmap", "assessment", "ai_tip", "system"
    val title: String,
    val message: String,
    val is_read: Boolean,
    val created_at: String,     // ISO-8601
    val target_id: Int?,        // Related entity ID (job_id, roadmap_id, etc.)
    val target_type: String?    // "job", "roadmap", "assessment", "mentor", etc.
)

// === RAG Chat DTOs ===

data class RagChatPayload(
    val query: String,
    val collection: String = "careers"
)

data class RagChatResponse(
    val session_id: Int,
    val answer: String,
    val confidence: Float,
    val sources: List<RagSourceDto>?,
    val model_used: String?
)

data class RagSourceDto(
    val doc_id: Int,
    val title: String,
    val source_type: String?
)

data class ChatSessionDto(
    val session_id: Int,
    val title: String,
    val created_at: String,
    val updated_at: String
)

data class ChatMessageDto(
    val message_id: Int,
    val session_id: Int,
    val is_user: Boolean,
    val message_text: String,
    val confidence: Float?,
    val sources: List<RagSourceDto>?,
    val model_used: String?,
    val created_at: String
)

data class CreateSessionResponse(
    val session_id: Int,
    val title: String,
    val created_at: String
)
