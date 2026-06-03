package com.aicareer.navigator.ui.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.AssessmentScoreDto
import com.aicareer.navigator.data.remote.CareerFitTrendDto
import com.aicareer.navigator.data.remote.DashboardMetricsResponse
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.RoadmapPctDto
import com.aicareer.navigator.data.remote.SkillProgressDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// === UI States ===

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: DashboardMetricsResponse) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

data class SkillTrendPoint(
    val day: Int,
    val score: Float
)

data class SkillTrendData(
    val skillName: String,
    val trend: List<SkillTrendPoint>,
    val cohortAvg: List<SkillTrendPoint>
)

sealed class SkillTrendUiState {
    object Loading : SkillTrendUiState()
    data class Success(val data: SkillTrendData) : SkillTrendUiState()
    data class Error(val message: String) : SkillTrendUiState()
}

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    // Dashboard overview state
    private val _dashboardState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val dashboardState: StateFlow<DashboardUiState> = _dashboardState.asStateFlow()

    // Skill trend state
    private val _skillTrendState = MutableStateFlow<SkillTrendUiState>(SkillTrendUiState.Loading)
    val skillTrendState: StateFlow<SkillTrendUiState> = _skillTrendState.asStateFlow()

    // Date range filter (7d, 30d, 90d, all)
    private val _dateRange = MutableStateFlow("30d")
    val dateRange: StateFlow<String> = _dateRange.asStateFlow()

    // Selected skill for trend tab
    private val _selectedSkill = MutableStateFlow("Kotlin")
    val selectedSkill: StateFlow<String> = _selectedSkill.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        _dashboardState.value = DashboardUiState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getDashboardMetrics()
                _dashboardState.value = DashboardUiState.Success(response)
            } catch (e: Exception) {
                // Fallback to high-fidelity mock data
                _dashboardState.value = DashboardUiState.Success(getMockDashboard())
            }
        }
    }

    fun setDateRange(range: String) {
        _dateRange.value = range
        loadDashboard()
    }

    fun selectSkill(skill: String) {
        _selectedSkill.value = skill
        loadSkillTrend(skill)
    }

    fun loadSkillTrend(skill: String) {
        _skillTrendState.value = SkillTrendUiState.Loading
        viewModelScope.launch {
            try {
                // Simulate API — in production: GET /analytics/skills/trend?skill={name}&range={range}
                _skillTrendState.value = SkillTrendUiState.Success(getMockSkillTrend(skill))
            } catch (e: Exception) {
                _skillTrendState.value = SkillTrendUiState.Error(e.message ?: "Failed to load skill trend")
            }
        }
    }

    // === HIGH-FIDELITY MOCK DATA ===

    private fun getMockDashboard(): DashboardMetricsResponse {
        return DashboardMetricsResponse(
            skill_progress = listOf(
                SkillProgressDto(1, "Kotlin", "advanced", 82f, true),
                SkillProgressDto(2, "Jetpack Compose", "intermediate", 65f, false),
                SkillProgressDto(3, "System Design", "intermediate", 58f, true),
                SkillProgressDto(4, "Coroutines", "advanced", 76f, false),
                SkillProgressDto(5, "Testing", "beginner", 35f, false)
            ),
            assessment_scores = listOf(
                AssessmentScoreDto(1, "Kotlin Fundamentals", 85f, 78f, 1800, "2024-05-01"),
                AssessmentScoreDto(2, "Android Architecture", 72f, 65f, 2400, "2024-05-08"),
                AssessmentScoreDto(3, "System Design", 68f, 55f, 3000, "2024-05-15"),
                AssessmentScoreDto(4, "Data Structures", 91f, 88f, 1500, "2024-05-20"),
                AssessmentScoreDto(5, "Jetpack Compose", 77f, 70f, 2100, "2024-05-25")
            ),
            roadmap_pct = listOf(
                RoadmapPctDto(1, "Android Mastery", 68f, "active", 16, 12),
                RoadmapPctDto(2, "Backend Basics", 25f, "active", 8, 6)
            ),
            career_fit_trend = listOf(
                CareerFitTrendDto(1, 1, 62f, 3, "initial", "2024-04-26"),
                CareerFitTrendDto(2, 1, 65f, 3, "assessment", "2024-05-01"),
                CareerFitTrendDto(3, 1, 70f, 2, "skill_update", "2024-05-06"),
                CareerFitTrendDto(4, 1, 73f, 2, "assessment", "2024-05-11"),
                CareerFitTrendDto(5, 1, 78f, 1, "assessment", "2024-05-16"),
                CareerFitTrendDto(6, 1, 82f, 1, "skill_update", "2024-05-21"),
                CareerFitTrendDto(7, 1, 85f, 1, "assessment", "2024-05-25")
            )
        )
    }

    private fun getMockSkillTrend(skill: String): SkillTrendData {
        val baseScore = when (skill.lowercase()) {
            "kotlin" -> 60f
            "jetpack compose" -> 40f
            "system design" -> 35f
            "coroutines" -> 50f
            "testing" -> 20f
            else -> 45f
        }

        val trend = (0..29).map { day ->
            SkillTrendPoint(day, baseScore + (day * 0.8f) + (Math.random().toFloat() * 5f))
        }

        val cohortAvg = (0..29).map { day ->
            SkillTrendPoint(day, baseScore - 10f + (day * 0.4f) + (Math.random().toFloat() * 3f))
        }

        return SkillTrendData(
            skillName = skill,
            trend = trend,
            cohortAvg = cohortAvg
        )
    }
}
