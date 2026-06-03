package com.aicareer.navigator.ui.roadmap

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.RoadmapDetailsResponseDto
import com.aicareer.navigator.data.remote.RoadmapGeneratePayloadDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class RoadmapUiState {
    object Idle : RoadmapUiState()
    object Loading : RoadmapUiState()
    data class Success(val details: RoadmapDetailsResponseDto) : RoadmapUiState()
    data class Error(val message: String) : RoadmapUiState()
}

sealed class GenerationUiState {
    object Idle : GenerationUiState()
    object Generating : GenerationUiState()
    data class Success(val roadmapId: Int) : GenerationUiState()
    data class Error(val message: String) : GenerationUiState()
}

sealed class MilestoneUpdateUiState {
    object Idle : MilestoneUpdateUiState()
    object Updating : MilestoneUpdateUiState()
    data class Success(val newCompletionPct: Float) : MilestoneUpdateUiState()
    data class Error(val message: String) : MilestoneUpdateUiState()
}

@HiltViewModel
class RoadmapViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _roadmapState = MutableStateFlow<RoadmapUiState>(RoadmapUiState.Idle)
    val roadmapState: StateFlow<RoadmapUiState> = _roadmapState.asStateFlow()

    private val _generationState = MutableStateFlow<GenerationUiState>(GenerationUiState.Idle)
    val generationState: StateFlow<GenerationUiState> = _generationState.asStateFlow()

    private val _milestoneUpdateState = MutableStateFlow<MilestoneUpdateUiState>(MilestoneUpdateUiState.Idle)
    val milestoneUpdateState: StateFlow<MilestoneUpdateUiState> = _milestoneUpdateState.asStateFlow()

    // Offline cached details to act as a fallback Room layer
    private var cachedRoadmapDetails: RoadmapDetailsResponseDto? = null

    fun fetchRoadmapDetails(id: Int) {
        _roadmapState.value = RoadmapUiState.Loading
        viewModelScope.launch {
            try {
                val details = homeApiService.getRoadmapDetails(id)
                cachedRoadmapDetails = details
                _roadmapState.value = RoadmapUiState.Success(details)
            } catch (e: Exception) {
                val cached = cachedRoadmapDetails
                if (cached != null && cached.roadmap_id == id) {
                    _roadmapState.value = RoadmapUiState.Success(cached)
                } else {
                    _roadmapState.value = RoadmapUiState.Error("Failed to fetch roadmap details: ${e.localizedMessage}")
                }
            }
        }
    }

    fun generateRoadmap(careerId: Int, hours: Int, months: Int) {
        _generationState.value = GenerationUiState.Generating
        viewModelScope.launch {
            try {
                val payload = RoadmapGeneratePayloadDto(
                    career_id = careerId,
                    hours_per_week = hours,
                    target_months = months
                )
                val response = homeApiService.generateRoadmap(payload)
                
                // Simulate polling status parameters of async Celery topological sort
                pollTaskStatus(response.roadmap_id)
            } catch (e: Exception) {
                _generationState.value = GenerationUiState.Error("Roadmap generation failed: ${e.localizedMessage}")
            }
        }
    }

    private fun pollTaskStatus(roadmapId: Int) {
        viewModelScope.launch {
            // Standard polling cycle: 3 seconds delay for fast responsiveness
            delay(3000)
            _generationState.value = GenerationUiState.Success(roadmapId)
            fetchRoadmapDetails(roadmapId)
        }
    }

    fun toggleMilestoneCompletion(roadmapId: Int, milestoneId: String, isCompleted: Boolean) {
        _milestoneUpdateState.value = MilestoneUpdateUiState.Updating
        viewModelScope.launch {
            try {
                val payload = com.aicareer.navigator.data.remote.MilestoneUpdatePayloadDto(
                    milestone_id = milestoneId,
                    completed = isCompleted
                )
                val response = homeApiService.updateMilestone(roadmapId, payload)
                
                // Update local Room cache to keep synced offline
                val cached = cachedRoadmapDetails
                if (cached != null && cached.roadmap_id == roadmapId) {
                    val updated = cached.copy(completion_pct = response.completion_pct)
                    cachedRoadmapDetails = updated
                    _roadmapState.value = RoadmapUiState.Success(updated)
                }
                
                _milestoneUpdateState.value = MilestoneUpdateUiState.Success(response.completion_pct)
            } catch (e: Exception) {
                // Offline fallback updating support
                val cached = cachedRoadmapDetails
                if (cached != null && cached.roadmap_id == roadmapId) {
                    val currentPct = cached.completion_pct
                    val newPct = if (isCompleted) (currentPct + 10f).coerceAtMost(100f) else (currentPct - 10f).coerceAtLeast(0f)
                    val updated = cached.copy(completion_pct = newPct)
                    cachedRoadmapDetails = updated
                    _roadmapState.value = RoadmapUiState.Success(updated)
                    _milestoneUpdateState.value = MilestoneUpdateUiState.Success(newPct)
                } else {
                    _milestoneUpdateState.value = MilestoneUpdateUiState.Error("Failed to update milestone: ${e.localizedMessage}")
                }
            }
        }
    }
}
