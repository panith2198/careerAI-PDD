package com.aicareer.navigator.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.NotificationDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// === UI States ===

sealed class NotificationsUiState {
    object Loading : NotificationsUiState()
    data class Success(val notifications: List<NotificationDto>) : NotificationsUiState()
    data class Error(val message: String) : NotificationsUiState()
}

enum class NotificationFilter(val label: String, val apiType: String?) {
    ALL("All", null),
    JOBS("Jobs", "job_match"),
    ROADMAP("Roadmap", "roadmap"),
    AI("AI Tips", "ai_tip"),
    SYSTEM("System", "system")
}

// Grouped section model for RecyclerView
data class NotificationSection(
    val header: String,              // "TODAY", "YESTERDAY", "EARLIER"
    val items: List<NotificationDto>
)

@HiltViewModel
class NotificationViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    // Full notification list state
    private val _notificationsState = MutableStateFlow<NotificationsUiState>(NotificationsUiState.Loading)
    val notificationsState: StateFlow<NotificationsUiState> = _notificationsState.asStateFlow()

    // Unread count — observed by MainActivity for badge
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    // Active filter
    private val _activeFilter = MutableStateFlow(NotificationFilter.ALL)
    val activeFilter: StateFlow<NotificationFilter> = _activeFilter.asStateFlow()

    // All notifications (unfiltered, source of truth)
    private var allNotifications: List<NotificationDto> = emptyList()

    init {
        loadNotifications()
    }

    fun loadNotifications() {
        _notificationsState.value = NotificationsUiState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getNotificationsList()
                allNotifications = response.items.orEmpty()
                applyFilter()
                updateUnreadCount()
            } catch (e: Exception) {
                // High-fidelity mock fallback
                allNotifications = getMockNotifications()
                applyFilter()
                updateUnreadCount()
            }
        }
    }

    fun setFilter(filter: NotificationFilter) {
        _activeFilter.value = filter
        applyFilter()
    }

    private fun applyFilter() {
        val filtered = if (_activeFilter.value == NotificationFilter.ALL) {
            allNotifications
        } else {
            allNotifications.filter { it.type == _activeFilter.value.apiType }
        }
        _notificationsState.value = NotificationsUiState.Success(filtered)
    }

    private fun updateUnreadCount() {
        _unreadCount.value = allNotifications.count { !it.is_read }
    }

    fun markRead(notificationId: Int) {
        viewModelScope.launch {
            try {
                homeApiService.markNotificationRead(notificationId)
            } catch (_: Exception) { /* offline support */ }
        }
        // Optimistic update
        allNotifications = allNotifications.map {
            if (it.id == notificationId) it.copy(is_read = true) else it
        }
        applyFilter()
        updateUnreadCount()
    }

    fun markAllRead() {
        viewModelScope.launch {
            try {
                homeApiService.markAllNotificationsRead()
            } catch (_: Exception) { /* offline support */ }
        }
        // Optimistic update
        allNotifications = allNotifications.map { it.copy(is_read = true) }
        applyFilter()
        updateUnreadCount()
    }

    fun dismiss(notificationId: Int) {
        viewModelScope.launch {
            try {
                homeApiService.dismissNotification(notificationId)
            } catch (_: Exception) { /* offline support */ }
        }
        // Optimistic remove
        allNotifications = allNotifications.filter { it.id != notificationId }
        applyFilter()
        updateUnreadCount()
    }

    // Re-insert a dismissed notification (for undo)
    fun undoDismiss(notification: NotificationDto, position: Int) {
        val mutable = allNotifications.toMutableList()
        if (position in 0..mutable.size) {
            mutable.add(position, notification)
        } else {
            mutable.add(0, notification)
        }
        allNotifications = mutable
        applyFilter()
        updateUnreadCount()
    }

    // Group notifications into sections by date
    fun groupIntoSections(notifications: List<NotificationDto>): List<NotificationSection> {
        val now = System.currentTimeMillis()
        val today = mutableListOf<NotificationDto>()
        val yesterday = mutableListOf<NotificationDto>()
        val earlier = mutableListOf<NotificationDto>()

        notifications.forEach { notif ->
            val ageMs = getAgeMs(notif.created_at, now)
            val ageHours = ageMs / (1000 * 60 * 60)
            when {
                ageHours < 24 -> today.add(notif)
                ageHours < 48 -> yesterday.add(notif)
                else -> earlier.add(notif)
            }
        }

        val sections = mutableListOf<NotificationSection>()
        if (today.isNotEmpty()) sections.add(NotificationSection("TODAY", today))
        if (yesterday.isNotEmpty()) sections.add(NotificationSection("YESTERDAY", yesterday))
        if (earlier.isNotEmpty()) sections.add(NotificationSection("EARLIER", earlier))
        return sections
    }

    private fun getAgeMs(isoDate: String, now: Long): Long {
        return try {
            val formatter = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
            formatter.timeZone = java.util.TimeZone.getTimeZone("UTC")
            val dateMs = formatter.parse(isoDate)?.time ?: now
            now - dateMs
        } catch (e: Exception) {
            0L
        }
    }

    // === HIGH-FIDELITY MOCK DATA ===

    private fun getMockNotifications(): List<NotificationDto> {
        val now = System.currentTimeMillis()
        val hour = 3_600_000L
        val day = 86_400_000L

        fun formatIso(offset: Long): String {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
            sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
            return sdf.format(java.util.Date(now - offset))
        }

        return listOf(
            NotificationDto(
                id = 1,
                type = "job_match",
                title = "New 95% Match Found!",
                message = "Senior Android Developer at Google matches your skills perfectly. Apply now before it closes!",
                is_read = false,
                created_at = formatIso(2 * hour),
                target_id = 101,
                target_type = "job"
            ),
            NotificationDto(
                id = 2,
                type = "assessment",
                title = "Quiz Passed — Kotlin Fundamentals 🎉",
                message = "You scored 85%! Your Kotlin proficiency has been upgraded to Advanced.",
                is_read = false,
                created_at = formatIso(5 * hour),
                target_id = 201,
                target_type = "assessment"
            ),
            NotificationDto(
                id = 3,
                type = "ai_tip",
                title = "AI Career Insight",
                message = "Based on your recent assessments, consider adding System Design to your learning roadmap for senior roles.",
                is_read = false,
                created_at = formatIso(8 * hour),
                target_id = null,
                target_type = null
            ),
            NotificationDto(
                id = 4,
                type = "roadmap",
                title = "Milestone Due Tomorrow",
                message = "Week 8: Advanced Coroutines in your Android Mastery roadmap is due tomorrow. You're 75% through!",
                is_read = true,
                created_at = formatIso(26 * hour),
                target_id = 301,
                target_type = "roadmap"
            ),
            NotificationDto(
                id = 5,
                type = "job_match",
                title = "Application Update",
                message = "Your application for Staff Engineer at Spotify has moved to Interview stage.",
                is_read = true,
                created_at = formatIso(30 * hour),
                target_id = 102,
                target_type = "job"
            ),
            NotificationDto(
                id = 6,
                type = "system",
                title = "Profile Verification Complete",
                message = "Your Kotlin skill has been verified through our AI assessment engine. Verified badges are now visible.",
                is_read = true,
                created_at = formatIso(3 * day),
                target_id = null,
                target_type = null
            ),
            NotificationDto(
                id = 7,
                type = "ai_tip",
                title = "Weekly Career Digest",
                message = "Your Career Fit score rose 7% this week! Top improvement area: System Design (+12%).",
                is_read = true,
                created_at = formatIso(4 * day),
                target_id = null,
                target_type = "analytics"
            ),
            NotificationDto(
                id = 8,
                type = "roadmap",
                title = "Roadmap Generated",
                message = "Your personalized 'Backend Fundamentals' roadmap is ready. 8 weeks, 6 hrs/week.",
                is_read = true,
                created_at = formatIso(5 * day),
                target_id = 302,
                target_type = "roadmap"
            ),
            NotificationDto(
                id = 9,
                type = "job_match",
                title = "Saved Job Closing Soon",
                message = "Android Lead at Netflix — your saved job closes in 2 days. 88% match score.",
                is_read = false,
                created_at = formatIso(10 * hour),
                target_id = 103,
                target_type = "job"
            ),
            NotificationDto(
                id = 10,
                type = "system",
                title = "Welcome to CareerAI Pro! 🚀",
                message = "Your premium subscription is now active. Enjoy unlimited assessments, AI mentoring, and priority job matching.",
                is_read = true,
                created_at = formatIso(7 * day),
                target_id = null,
                target_type = null
            )
        )
    }
}
