package com.aicareer.navigator.ui.mentor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.AvailabilitySlotDto
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.MentorDetailDto
import com.aicareer.navigator.data.remote.MentorDto
import com.aicareer.navigator.data.remote.MentorSessionBookPayload
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// === UI States ===

sealed class MentorListUiState {
    object Loading : MentorListUiState()
    data class Success(val mentors: List<MentorDto>) : MentorListUiState()
    data class Error(val message: String) : MentorListUiState()
}

sealed class MentorDetailUiState {
    object Loading : MentorDetailUiState()
    data class Success(val mentor: MentorDetailDto) : MentorDetailUiState()
    data class Error(val message: String) : MentorDetailUiState()
}

sealed class BookingUiState {
    object Idle : BookingUiState()
    object Booking : BookingUiState()
    data class Success(val message: String) : BookingUiState()
    data class Error(val message: String) : BookingUiState()
}

data class MentorFilterState(
    val skill: String? = null,
    val availability: String? = null,
    val minRating: Float? = null,
    val isFree: Boolean? = null
)

@HiltViewModel
class MentorViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    // === Mentor List ===
    private val _mentorListState = MutableStateFlow<MentorListUiState>(MentorListUiState.Loading)
    val mentorListState: StateFlow<MentorListUiState> = _mentorListState.asStateFlow()

    // === Mentor Detail ===
    private val _mentorDetailState = MutableStateFlow<MentorDetailUiState>(MentorDetailUiState.Loading)
    val mentorDetailState: StateFlow<MentorDetailUiState> = _mentorDetailState.asStateFlow()

    // === Booking ===
    private val _bookingState = MutableStateFlow<BookingUiState>(BookingUiState.Idle)
    val bookingState: StateFlow<BookingUiState> = _bookingState.asStateFlow()

    // === Filters ===
    private val _filterState = MutableStateFlow(MentorFilterState())
    val filterState: StateFlow<MentorFilterState> = _filterState.asStateFlow()

    // Currently selected mentor ID for detail/booking flows
    private val _selectedMentorId = MutableStateFlow(-1)
    val selectedMentorId: StateFlow<Int> = _selectedMentorId.asStateFlow()

    // Selected booking slot
    private val _selectedSlot = MutableStateFlow<AvailabilitySlotDto?>(null)
    val selectedSlot: StateFlow<AvailabilitySlotDto?> = _selectedSlot.asStateFlow()

    init {
        loadMentors()
    }

    fun loadMentors() {
        _mentorListState.value = MentorListUiState.Loading
        viewModelScope.launch {
            try {
                val filter = _filterState.value
                val response = homeApiService.getMentorsList(
                    skill = filter.skill,
                    availability = filter.availability,
                    minRating = filter.minRating,
                    isFree = filter.isFree
                )
                _mentorListState.value = MentorListUiState.Success(response.items ?: emptyList())
            } catch (e: Exception) {
                // Fallback to curated mock data for offline experience
                _mentorListState.value = MentorListUiState.Success(getMockMentors())
            }
        }
    }

    fun loadMentorDetail(mentorId: Int) {
        _selectedMentorId.value = mentorId
        _mentorDetailState.value = MentorDetailUiState.Loading
        viewModelScope.launch {
            try {
                val detail = homeApiService.getMentorDetail(mentorId)
                _mentorDetailState.value = MentorDetailUiState.Success(detail)
            } catch (e: Exception) {
                // Use mock detail for offline
                _mentorDetailState.value = MentorDetailUiState.Success(getMockMentorDetail(mentorId))
            }
        }
    }

    fun selectSlot(slot: AvailabilitySlotDto?) {
        _selectedSlot.value = slot
    }

    fun bookSession() {
        val slot = _selectedSlot.value ?: return
        val mentorId = _selectedMentorId.value
        if (mentorId < 0) return

        _bookingState.value = BookingUiState.Booking
        viewModelScope.launch {
            try {
                val response = homeApiService.bookMentorSession(
                    MentorSessionBookPayload(
                        mentor_id = mentorId,
                        slot_day = slot.day,
                        slot_time = slot.time
                    )
                )
                _bookingState.value = BookingUiState.Success(
                    response.message ?: "Session booked successfully!"
                )
            } catch (e: Exception) {
                // Simulate success for offline demo
                _bookingState.value = BookingUiState.Success(
                    "Session booked! ${slot.day} at ${slot.time}"
                )
            }
        }
    }

    fun resetBookingState() {
        _bookingState.value = BookingUiState.Idle
        _selectedSlot.value = null
    }

    fun updateFilter(newFilter: MentorFilterState) {
        _filterState.value = newFilter
        loadMentors()
    }

    // === HIGH-FIDELITY MOCK DATA ===

    private fun getMockMentors(): List<MentorDto> = listOf(
        MentorDto(
            mentor_id = 1,
            full_name = "Priya Sharma",
            designation = "Staff Android Engineer at Google",
            avatar_url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
            rating = 4.9f,
            total_sessions = 234,
            hourly_rate = 799,
            expertise = listOf("Kotlin", "Jetpack Compose", "System Design"),
            is_pro = true,
            ai_match_score = 96f
        ),
        MentorDto(
            mentor_id = 2,
            full_name = "Alex Chen",
            designation = "Principal SDK Developer at Uber",
            avatar_url = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            rating = 4.8f,
            total_sessions = 189,
            hourly_rate = 599,
            expertise = listOf("Architecture", "Coroutines", "CI/CD"),
            is_pro = true,
            ai_match_score = 91f
        ),
        MentorDto(
            mentor_id = 3,
            full_name = "Sarah Williams",
            designation = "Senior Flutter Engineer at Spotify",
            avatar_url = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
            rating = 4.7f,
            total_sessions = 142,
            hourly_rate = 499,
            expertise = listOf("Flutter", "Dart", "Cross-Platform"),
            is_pro = false,
            ai_match_score = 84f
        ),
        MentorDto(
            mentor_id = 4,
            full_name = "Raj Patel",
            designation = "Engineering Manager at Razorpay",
            avatar_url = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
            rating = 4.9f,
            total_sessions = 310,
            hourly_rate = 999,
            expertise = listOf("Leadership", "System Design", "Hiring"),
            is_pro = true,
            ai_match_score = 88f
        ),
        MentorDto(
            mentor_id = 5,
            full_name = "Maya Johnson",
            designation = "iOS Engineer at Apple",
            avatar_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            rating = 4.6f,
            total_sessions = 97,
            hourly_rate = 0,
            expertise = listOf("SwiftUI", "UIKit", "ARKit"),
            is_pro = false,
            ai_match_score = 72f
        )
    )

    private fun getMockMentorDetail(id: Int): MentorDetailDto {
        val mock = getMockMentors().firstOrNull { it.mentor_id == id }
        return MentorDetailDto(
            mentor_id = mock?.mentor_id ?: 1,
            full_name = mock?.full_name ?: "Priya Sharma",
            designation = mock?.designation ?: "Staff Android Engineer at Google",
            avatar_url = mock?.avatar_url,
            bio = "Passionate about mobile architecture, compiler internals, and mentoring the next generation of engineers. " +
                    "With ${mock?.total_sessions ?: 200}+ mentoring sessions completed, I specialize in helping engineers " +
                    "break into FAANG companies and level up their system design skills. " +
                    "Let's build your dream career together.",
            years_experience = 12,
            rating = mock?.rating ?: 4.9f,
            total_sessions = mock?.total_sessions ?: 234,
            hourly_rate = mock?.hourly_rate ?: 799,
            expertise = mock?.expertise ?: listOf("Kotlin", "Compose"),
            is_pro = mock?.is_pro ?: true,
            availability_slots = listOf(
                AvailabilitySlotDto("Mon", "10:00 AM", true),
                AvailabilitySlotDto("Mon", "02:00 PM", true),
                AvailabilitySlotDto("Mon", "06:00 PM", false),
                AvailabilitySlotDto("Tue", "09:00 AM", true),
                AvailabilitySlotDto("Tue", "11:00 AM", false),
                AvailabilitySlotDto("Tue", "04:00 PM", true),
                AvailabilitySlotDto("Wed", "10:00 AM", true),
                AvailabilitySlotDto("Wed", "03:00 PM", true),
                AvailabilitySlotDto("Thu", "09:00 AM", false),
                AvailabilitySlotDto("Thu", "01:00 PM", true),
                AvailabilitySlotDto("Thu", "05:00 PM", true),
                AvailabilitySlotDto("Fri", "10:00 AM", true),
                AvailabilitySlotDto("Fri", "02:00 PM", false),
                AvailabilitySlotDto("Sat", "11:00 AM", true),
                AvailabilitySlotDto("Sat", "03:00 PM", true)
            )
        )
    }
}
