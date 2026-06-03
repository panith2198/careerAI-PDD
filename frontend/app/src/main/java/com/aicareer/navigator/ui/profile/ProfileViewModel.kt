package com.aicareer.navigator.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.UserMeResponse
import com.aicareer.navigator.data.remote.UserMeUpdatePayload
import com.aicareer.navigator.data.remote.UserSkillAddPayload
import com.aicareer.navigator.data.remote.UserSkillDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val response: UserMeResponse) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _profileState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val profileState: StateFlow<ProfileUiState> = _profileState.asStateFlow()

    private val _skillsState = MutableStateFlow<List<UserSkillDto>>(emptyList())
    val skillsState: StateFlow<List<UserSkillDto>> = _skillsState.asStateFlow()

    // Notification and preference settings
    private val _settingsState = MutableStateFlow<Map<String, Boolean>>(
        mapOf(
            "jobAlerts" to true,
            "roadmapReminders" to true,
            "aiTips" to true,
            "darkMode" to true
        )
    )
    val settingsState: StateFlow<Map<String, Boolean>> = _settingsState.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        _profileState.value = ProfileUiState.Loading
        viewModelScope.launch {
            try {
                val me = homeApiService.getMe()
                _profileState.value = ProfileUiState.Success(me)
                _skillsState.value = me.skills ?: emptyList()
            } catch (e: Exception) {
                _profileState.value = ProfileUiState.Error(e.message ?: "Failed to fetch profile details.")
            }
        }
    }

    fun updateProfile(
        fullName: String,
        bio: String,
        city: String,
        state: String,
        preferredWorkMode: String,
        expectedSalaryMin: Int,
        educationLevel: String,
        fieldOfStudy: String,
        institutionName: String,
        graduationYear: Int,
        linkedinUrl: String,
        githubUrl: String
    ) {
        viewModelScope.launch {
            try {
                homeApiService.updateMe(
                    UserMeUpdatePayload(
                        full_name = fullName,
                        bio = bio,
                        city = city,
                        state = state,
                        preferred_work_mode = preferredWorkMode,
                        expected_salary_min = expectedSalaryMin,
                        education_level = educationLevel,
                        field_of_study = fieldOfStudy,
                        institution_name = institutionName,
                        graduation_year = graduationYear,
                        linkedin_url = linkedinUrl,
                        github_url = githubUrl
                    )
                )
                loadProfile()
            } catch (e: Exception) {
                loadProfile()
            }
        }
    }

    fun addSkill(skillId: Int, level: String) {
        viewModelScope.launch {
            try {
                homeApiService.addUserSkill(
                    UserSkillAddPayload(
                        skill_id = skillId,
                        proficiency_level = level
                    )
                )
                loadProfile()
            } catch (e: Exception) {
                loadProfile()
            }
        }
    }

    fun removeSkill(userSkillId: Int) {
        viewModelScope.launch {
            try {
                homeApiService.deleteUserSkill(userSkillId)
                loadProfile()
            } catch (e: Exception) {
                loadProfile()
            }
        }
    }

    fun toggleSetting(key: String, enabled: Boolean) {
        val current = _settingsState.value.toMutableMap()
        current[key] = enabled
        _settingsState.value = current
    }
}
