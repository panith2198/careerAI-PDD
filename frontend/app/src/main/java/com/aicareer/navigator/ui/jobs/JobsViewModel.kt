package com.aicareer.navigator.ui.jobs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.JobDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class JobsUiState {
    object Loading : JobsUiState()
    data class Success(val list: List<JobDto>) : JobsUiState()
    data class Error(val message: String) : JobsUiState()
}

sealed class JobDetailUiState {
    object Loading : JobDetailUiState()
    data class Success(val detail: JobDetail) : JobDetailUiState()
    data class Error(val message: String) : JobDetailUiState()
}

data class JobDetail(
    val job_id: Int,
    val title: String,
    val company: String,
    val location: String,
    val salary_min: Int,
    val salary_max: Int,
    val match_score: Float,
    val description: String,
    val required_skills: List<String>,
    val matched_skills: List<String>,
    val interview_tips: List<String>,
    var applicationStatus: String? = null
)

@HiltViewModel
class JobsViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    private val _jobsState = MutableStateFlow<JobsUiState>(JobsUiState.Loading)
    val jobsState: StateFlow<JobsUiState> = _jobsState.asStateFlow()

    private val _jobDetailState = MutableStateFlow<JobDetailUiState>(JobDetailUiState.Loading)
    val jobDetailState: StateFlow<JobDetailUiState> = _jobDetailState.asStateFlow()

    private val _savedJobsState = MutableStateFlow<List<JobDto>>(emptyList())
    val savedJobsState: StateFlow<List<JobDto>> = _savedJobsState.asStateFlow()

    private val _applicationsState = MutableStateFlow<List<JobDetail>>(emptyList())
    val applicationsState: StateFlow<List<JobDetail>> = _applicationsState.asStateFlow()

    private var allJobsList = listOf<JobDto>()
    private val detailsCache = mutableMapOf<Int, JobDetail>()

    init {
        loadJobs()
        initializeDefaultApplications()
    }

    fun loadJobs() {
        _jobsState.value = JobsUiState.Loading
        viewModelScope.launch {
            try {
                val response = homeApiService.getJobsList()
                val items = response.items ?: emptyList()
                allJobsList = items
                _jobsState.value = JobsUiState.Success(items)
            } catch (e: Exception) {
                // High-fidelity fallback offline lists
                val fallback = getMockJobs()
                allJobsList = fallback
                _jobsState.value = JobsUiState.Success(fallback)
            }
        }
    }

    fun loadJobDetail(jobId: Int) {
        _jobDetailState.value = JobDetailUiState.Loading
        viewModelScope.launch {
            // Check cache or generate detail view state
            val cached = detailsCache[jobId]
            if (cached != null) {
                // Keep the application status synced from applications state
                val appStatus = _applicationsState.value.find { it.job_id == jobId }?.applicationStatus
                cached.applicationStatus = appStatus
                _jobDetailState.value = JobDetailUiState.Success(cached)
            } else {
                val job = allJobsList.find { it.job_id == jobId }
                val detail = if (job != null) {
                    generateDetailForJob(job)
                } else {
                    val mock = getMockJobs().find { it.job_id == jobId } ?: getMockJobs().first()
                    generateDetailForJob(mock)
                }
                val appStatus = _applicationsState.value.find { it.job_id == jobId }?.applicationStatus
                detail.applicationStatus = appStatus
                detailsCache[jobId] = detail
                _jobDetailState.value = JobDetailUiState.Success(detail)
            }
        }
    }

    fun searchJobs(query: String) {
        if (query.isEmpty()) {
            _jobsState.value = JobsUiState.Success(allJobsList)
        } else {
            val filtered = allJobsList.filter {
                it.title.contains(query, ignoreCase = true) ||
                (it.company ?: "").contains(query, ignoreCase = true) ||
                (it.location ?: "").contains(query, ignoreCase = true)
            }
            _jobsState.value = JobsUiState.Success(filtered)
        }
    }

    fun toggleSaveJob(job: JobDto) {
        val currentSaved = _savedJobsState.value.toMutableList()
        val index = currentSaved.indexOfFirst { it.job_id == job.job_id }
        if (index != -1) {
            currentSaved.removeAt(index)
        } else {
            currentSaved.add(job)
        }
        _savedJobsState.value = currentSaved
    }

    fun unsaveJobById(jobId: Int) {
        val currentSaved = _savedJobsState.value.toMutableList()
        val index = currentSaved.indexOfFirst { it.job_id == jobId }
        if (index != -1) {
            currentSaved.removeAt(index)
            _savedJobsState.value = currentSaved
        }
    }

    fun isJobSaved(jobId: Int): Boolean {
        return _savedJobsState.value.any { it.job_id == jobId }
    }

    fun applyToJob(jobId: Int) {
        viewModelScope.launch {
            val job = allJobsList.find { it.job_id == jobId }
            val detail = job?.let { generateDetailForJob(it) } ?: getMockJobs().find { it.job_id == jobId }?.let { generateDetailForJob(it) }
            
            detail?.let {
                it.applicationStatus = "APPLIED"
                val currentApps = _applicationsState.value.toMutableList()
                if (!currentApps.any { app -> app.job_id == jobId }) {
                    currentApps.add(0, it)
                    _applicationsState.value = currentApps
                }
                
                // Keep the active details cached copy updated as well
                detailsCache[jobId]?.applicationStatus = "APPLIED"
                if (_jobDetailState.value is JobDetailUiState.Success) {
                    val currentSuccess = _jobDetailState.value as JobDetailUiState.Success
                    if (currentSuccess.detail.job_id == jobId) {
                        _jobDetailState.value = JobDetailUiState.Success(currentSuccess.detail.apply { applicationStatus = "APPLIED" })
                    }
                }
            }
        }
    }

    private fun initializeDefaultApplications() {
        val mockJobs = getMockJobs()
        val app1 = generateDetailForJob(mockJobs[1]).apply { applicationStatus = "UNDER REVIEW" }
        val app2 = generateDetailForJob(mockJobs[2]).apply { applicationStatus = "APPLIED" }
        _applicationsState.value = listOf(app1, app2)
    }

    private fun generateDetailForJob(job: JobDto): JobDetail {
        val (skills, matched) = when (job.job_id) {
            1 -> listOf("Kotlin", "Coroutines", "Jetpack Compose", "Hilt", "Room", "Dagger", "DataBinding") to listOf("Kotlin", "Coroutines", "Hilt", "Room")
            2 -> listOf("Kotlin", "Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker") to listOf("Kotlin", "Java", "Docker")
            3 -> listOf("Android SDK", "Kotlin", "C++", "NDK", "System Architecture", "Performance Tuning") to listOf("Kotlin", "Android SDK")
            else -> listOf("Kotlin", "Android UI", "XML Layouts", "Material Components", "Figma Integration") to listOf("Kotlin", "Android UI", "XML Layouts")
        }

        val tips = when (job.job_id) {
            1 -> listOf(
                "Prepare for deep-dive questions on Kotlin Coroutines dispatchers, Flows (StateFlow vs SharedFlow), and structured concurrency.",
                "Review Hilt custom component structures and dependency scope bindings across multi-module setups.",
                "Be ready to white-board an offline-first architectural sync pattern using Room database flow streaming."
            )
            2 -> listOf(
                "Expect system design questions about concurrency limits and thread pooling configurations in Spring Boot/JVM environments.",
                "Review schema design optimization strategies for high throughput PostgreSQL setups."
            )
            else -> listOf(
                "Focus heavily on demonstrating high-fidelity pixel-perfect UI rendering, custom view custom drawing, and gesture-driven animations.",
                "Prepare examples of optimizing RecyclerView performance using DiffUtil and custom payloads."
            )
        }

        val desc = """
            We are looking for a highly skilled and passionate professional to join our world-class engineering team. 
            In this role, you will design, implement, and maintain scalable, robust mobile systems. 
            You will collaborate with cross-functional teams to build next-generation applications centered on user satisfaction and premium performance.
            
            ### Key Responsibilities:
            * Build beautiful, fluid, responsive user interfaces following premium Material Design Guidelines.
            * Optimize application architectures for maximum speed, reliable caching, and efficient network calls.
            * Write clean, maintainable, and thoroughly unit-tested code in Kotlin.
            * Mentor junior engineers and collaborate through comprehensive peer reviews.
        """.trimIndent()

        return JobDetail(
            job_id = job.job_id,
            title = job.title,
            company = job.company ?: "Company Labs",
            location = job.location ?: "Bengaluru (Hybrid)",
            salary_min = job.salary_min ?: 12,
            salary_max = job.salary_max ?: 20,
            match_score = job.match_score ?: 80f,
            description = desc,
            required_skills = skills,
            matched_skills = matched,
            interview_tips = tips
        )
    }

    private fun getMockJobs(): List<JobDto> {
        return listOf(
            JobDto(1, "Senior Android Engineer", "Google Dev Labs", "Bangalore (Hybrid)", 12, 20, 92f),
            JobDto(2, "Kotlin Platform Developer", "FinTech ScaleUp", "Pune (Remote)", 14, 22, 85f),
            JobDto(3, "Mobile SDK Architect", "Unicorn Labs", "Mumbai (Onsite)", 18, 28, 78f),
            JobDto(4, "Android UI/UX Developer", "Design Hub", "Delhi (Hybrid)", 8, 14, 88f)
        )
    }
}
