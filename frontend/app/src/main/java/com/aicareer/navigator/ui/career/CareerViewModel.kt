package com.aicareer.navigator.ui.career

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class CareerListState {
    object Loading : CareerListState()
    data class Success(val list: List<CareerDto>) : CareerListState()
    data class Error(val message: String) : CareerListState()
}

sealed class CareerPathState {
    object Idle : CareerPathState()
    object Loading : CareerPathState()
    data class Success(val path: CareerGraphResponse) : CareerPathState()
    data class Error(val message: String) : CareerPathState()
}

sealed class RecommendState {
    object Idle : RecommendState()
    object Loading : RecommendState()
    data class Success(val response: RecommendResponse) : RecommendState()
    data class Error(val message: String) : RecommendState()
}

@HiltViewModel
class CareerViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _careerListState = MutableStateFlow<CareerListState>(CareerListState.Loading)
    val careerListState: StateFlow<CareerListState> = _careerListState.asStateFlow()

    private val _careerPathState = MutableStateFlow<CareerPathState>(CareerPathState.Idle)
    val careerPathState: StateFlow<CareerPathState> = _careerPathState.asStateFlow()

    private val _recommendState = MutableStateFlow<RecommendState>(RecommendState.Idle)
    val recommendState: StateFlow<RecommendState> = _recommendState.asStateFlow()

    val searchQuery = MutableStateFlow("")
    val categoryFilter = MutableStateFlow("")
    val sortOrder = MutableStateFlow("match")

    init {
        loadCareers()
    }

    fun loadCareers() {
        _careerListState.value = CareerListState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getCareersList()
                _careerListState.value = CareerListState.Success(response.items ?: emptyList())
            } catch (e: Exception) {
                // Fallback offline mock careers
                _careerListState.value = CareerListState.Success(getMockCareers())
            }
        }
    }

    fun loadCareerPath(fromRole: String, toRole: String) {
        _careerPathState.value = CareerPathState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getCareerGraph(fromRole, toRole)
                _careerPathState.value = CareerPathState.Success(response)
            } catch (e: Exception) {
                // Fallback offline mock graph
                val mockResponse = CareerGraphResponse(
                    path = listOf("Android Developer", "Senior Android Engineer", "Android Platform Architect"),
                    hops = 2,
                    total_weight = 4.5f
                )
                _careerPathState.value = CareerPathState.Success(mockResponse)
            }
        }
    }

    fun generateRecommendations(forceRefresh: Boolean = false) {
        _recommendState.value = RecommendState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.recommendCareers(RecommendPayload(forceRefresh))
                _recommendState.value = RecommendState.Success(response)
            } catch (e: Exception) {
                // Fallback offline mock recommendations
                val mockRecs = listOf(
                    CareerRecommendDto(1, "Android Platform Architect", 95f, 1, mapOf("match_ratio" to 0.95), mapOf("missing" to listOf("Jetpack Compose", "Custom View Animation"))),
                    CareerRecommendDto(2, "Mobile Tech Lead", 85f, 2, mapOf("match_ratio" to 0.85), mapOf("missing" to listOf("Staff Leadership", "Product Lifecycle Management"))),
                    CareerRecommendDto(3, "Staff iOS Engineer", 60f, 3, mapOf("match_ratio" to 0.60), mapOf("missing" to listOf("Swift Programming", "iOS System Optimization")))
                )
                _recommendState.value = RecommendState.Success(RecommendResponse(mockRecs, "2026-05-26T12:00:00Z", "mistral-embed+tf-idf"))
            }
        }
    }

    private fun getMockCareers(): List<CareerDto> {
        return listOf(
            CareerDto(1, "Android Platform Architect", "Mobile Engineering", "Design and optimize platform core structures.", 1200000, 2400000, 18.5f),
            CareerDto(2, "Mobile Tech Lead", "Management", "Steer high-performance mobile units.", 1800000, 3200000, 12.0f),
            CareerDto(3, "Staff iOS Engineer", "Mobile Engineering", "Build ultra-smooth system level features.", 1400000, 2600000, 8.5f)
        )
    }
}
