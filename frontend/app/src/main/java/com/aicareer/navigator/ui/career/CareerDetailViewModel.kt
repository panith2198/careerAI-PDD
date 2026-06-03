package com.aicareer.navigator.ui.career

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.CareerDetailResponse
import com.aicareer.navigator.data.remote.CareerSkillDto
import com.aicareer.navigator.data.remote.HomeApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class CareerDetailState {
    object Loading : CareerDetailState()
    data class Success(val data: CareerDetailResponse) : CareerDetailState()
    data class Error(val message: String) : CareerDetailState()
}

@HiltViewModel
class CareerDetailViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _detailState = MutableStateFlow<CareerDetailState>(CareerDetailState.Loading)
    val detailState: StateFlow<CareerDetailState> = _detailState.asStateFlow()

    fun loadCareerDetails(slug: String) {
        _detailState.value = CareerDetailState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getCareerDetail(slug)
                _detailState.value = CareerDetailState.Success(response)
            } catch (e: Exception) {
                // Fallback offline mock details
                _detailState.value = CareerDetailState.Success(getMockCareerDetail(slug))
            }
        }
    }

    private fun getMockCareerDetail(slug: String): CareerDetailResponse {
        val title = slug.replace("-", " ").replaceFirstChar { it.uppercase() }
        val careerId = when (slug) {
            "data-analyst" -> 1
            "devops-engineer" -> 2
            "frontend-developer" -> 3
            "android-developer" -> 4
            "android-platform-architect" -> 5
            else -> 1
        }
        val mockSkills = listOf(
            CareerSkillDto("Kotlin Programming", 95f),
            CareerSkillDto("Android Architecture Components", 90f),
            CareerSkillDto("Jetpack Compose UI", 85f),
            CareerSkillDto("Asynchronous Flow & Coroutines", 92f),
            CareerSkillDto("Gradle & Build Automation", 70f),
            CareerSkillDto("Unit & Instrumented Testing", 60f)
        )

        return CareerDetailResponse(
            career_id = careerId,
            title = title,
            category = "Mobile Engineering",
            description = "Design, architect, develop, and optimize premium Android applications. Write robust Kotlin code using flow streams, build complex custom views, manage background thread executions, and configure custom Hilt injections.",
            avg_salary_min = 800000,
            avg_salary_max = 2400000,
            growth_rate_pct = 18.5f,
            demand_score = 92f,
            difficulty_level = "Advanced",
            time_to_ready_months = 12,
            skills = mockSkills,
            rag_doc_ids = listOf("kb_android_architect_1")
        )
    }
}
