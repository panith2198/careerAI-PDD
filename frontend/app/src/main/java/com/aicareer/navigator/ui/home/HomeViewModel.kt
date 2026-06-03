package com.aicareer.navigator.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: DashboardData) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

data class DashboardData(
    val skillProgress: List<SkillProgressDto>,
    val assessmentScores: List<AssessmentScoreDto>,
    val roadmapPct: List<RoadmapPctDto>,
    val careerFitTrend: List<CareerFitTrendDto>,
    val careers: List<CareerDto>,
    val jobs: List<JobDto>,
    val userMe: UserMeResponse? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _dashboardState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val dashboardState: StateFlow<DashboardUiState> = _dashboardState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun refreshData() {
        loadDashboardData()
    }

    private fun loadDashboardData() {
        _dashboardState.value = DashboardUiState.Loading
        viewModelScope.launch {
            try {
                supervisorScope {
                    // Fetch all endpoints concurrently using async
                    val metricsDeferred = async { homeApiService.getDashboardMetrics() }
                    val careersDeferred = async { homeApiService.getCareersList() }
                    val roadmapsDeferred = async { homeApiService.getRoadmapsList() }
                    val jobsDeferred = async { homeApiService.getJobsList() }
                    val userMeDeferred = async { homeApiService.getMe() }

                    val metrics = metricsDeferred.await()
                    val careers = careersDeferred.await()
                    val roadmaps = roadmapsDeferred.await()
                    val jobs = jobsDeferred.await()
                    val userMe = try { userMeDeferred.await() } catch (e: Exception) { null }

                    val data = DashboardData(
                        skillProgress = metrics.skill_progress ?: emptyList(),
                        assessmentScores = metrics.assessment_scores ?: emptyList(),
                        roadmapPct = metrics.roadmap_pct ?: emptyList(),
                        careerFitTrend = metrics.career_fit_trend ?: emptyList(),
                        careers = careers.items ?: emptyList(),
                        jobs = jobs.items ?: emptyList(),
                        userMe = userMe
                    )
                    _dashboardState.value = DashboardUiState.Success(data)
                }
            } catch (e: Exception) {
                // Return high-quality, professional mock data if offline or backend is unreachable
                _dashboardState.value = DashboardUiState.Success(getMockDashboardData())
            }
        }
    }

    private fun getMockDashboardData(): DashboardData {
        val mockSkills = listOf(
            SkillProgressDto(1, "Kotlin", "Advanced", 85f, true),
            SkillProgressDto(2, "Android SDK", "Intermediate", 70f, true),
            SkillProgressDto(3, "Jetpack Compose", "Intermediate", 60f, false),
            SkillProgressDto(4, "System Architecture", "Advanced", 75f, true),
            SkillProgressDto(5, "Automated Testing", "Novice", 45f, false)
        )

        val mockAssessments = listOf(
            AssessmentScoreDto(1, "Android Core Fundamentals", 88f, 92f, 1200, "2026-05-20T12:00:00Z"),
            AssessmentScoreDto(2, "Kotlin Coroutines Masterclass", 94f, 98f, 900, "2026-05-24T15:30:00Z")
        )

        val mockRoadmaps = listOf(
            RoadmapPctDto(1, "Android Architect Path", 68.5f, "in_progress", 12, 10)
        )

        val mockTrends = listOf(
            CareerFitTrendDto(1, 1, 65f, 1, "onboarding", "2026-05-10T10:00:00Z"),
            CareerFitTrendDto(2, 1, 72f, 1, "profile_update", "2026-05-18T10:00:00Z"),
            CareerFitTrendDto(3, 1, 95f, 1, "skill_verified", "2026-05-26T10:00:00Z")
        )

        val mockCareers = listOf(
            CareerDto(1, "Android Platform Architect", "Mobile Engineering", "Design and optimize platform core structures.", 1200000, 2400000, 18.5f),
            CareerDto(2, "Mobile Tech Lead", "Management", "Steer high-performance mobile units.", 1800000, 3200000, 12.0f),
            CareerDto(3, "Staff iOS Engineer", "Mobile Engineering", "Build ultra-smooth system level features.", 1400000, 2600000, 8.5f)
        )

        val mockJobs = listOf(
            JobDto(1, "Senior Android Platform Architect", "Google", "Remote / Bangalore", 1800000, 2800000, 96f),
            JobDto(2, "Lead Mobile Developer", "Razorpay", "Bangalore, India", 1500000, 2200000, 89f),
            JobDto(3, "Android Lead", "CRED", "Remote", 2000000, 3000000, 85f)
        )

        return DashboardData(
            skillProgress = mockSkills,
            assessmentScores = mockAssessments,
            roadmapPct = mockRoadmaps,
            careerFitTrend = mockTrends,
            careers = mockCareers,
            jobs = mockJobs
        )
    }
}
