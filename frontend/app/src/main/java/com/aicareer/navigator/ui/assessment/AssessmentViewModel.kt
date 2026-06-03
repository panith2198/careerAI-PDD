package com.aicareer.navigator.ui.assessment

import android.os.CountDownTimer
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.data.remote.AnswerPayloadDto
import com.aicareer.navigator.data.remote.AssessmentDto
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.QuestionDto
import com.aicareer.navigator.data.remote.OptionDto
import com.aicareer.navigator.data.remote.SubmitQuizResponse
import com.aicareer.navigator.data.remote.MissingCompetencyDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AssessmentListUiState {
    object Loading : AssessmentListUiState()
    data class Success(val list: List<AssessmentDto>) : AssessmentListUiState()
    data class Error(val message: String) : AssessmentListUiState()
}

enum class QuizUiState {
    IDLE, STARTED, ANSWERING, SUBMITTING, DONE
}

@HiltViewModel
class AssessmentViewModel @Inject constructor(
    private val homeApiService: HomeApiService
) : ViewModel() {

    // 1. Assessment List State
    private val _assessmentListState = MutableStateFlow<AssessmentListUiState>(AssessmentListUiState.Loading)
    val assessmentListState: StateFlow<AssessmentListUiState> = _assessmentListState.asStateFlow()

    // 2. Quiz States
    private val _quizState = MutableStateFlow<QuizUiState>(QuizUiState.IDLE)
    val quizState: StateFlow<QuizUiState> = _quizState.asStateFlow()

    private val _currentQuestion = MutableStateFlow<QuestionDto?>(null)
    val currentQuestion: StateFlow<QuestionDto?> = _currentQuestion.asStateFlow()

    private val _timerState = MutableStateFlow<Int>(30)
    val timerState: StateFlow<Int> = _timerState.asStateFlow()

    private val _resultState = MutableStateFlow<SubmitQuizResponse?>(null)
    val resultState: StateFlow<SubmitQuizResponse?> = _resultState.asStateFlow()

    private val _gapState = MutableStateFlow<List<MissingCompetencyDto>>(emptyList())
    val gapState: StateFlow<List<MissingCompetencyDto>> = _gapState.asStateFlow()

    // Timer & Session reference tracking
    private var countdownTimer: CountDownTimer? = null
    private var sessionId: String? = null
    private var assessmentId: Int = 1
    private var questionCounter = 1
    private val totalQuestions = 5
    private var startTimeMs: Long = 0

    // Offline mode trackers
    private var isOfflineMode = false
    private var offlineTheta = 0.0
    private var offlineCorrectCount = 0
    private val offlineQuestionsServed = mutableListOf<Int>()

    init {
        loadAssessments()
    }

    fun loadAssessments(careerId: Int? = null) {
        _assessmentListState.value = AssessmentListUiState.Loading
        viewModelScopeScopeLaunch(careerId)
    }

    private fun viewModelScopeScopeLaunch(careerId: Int?) {
        viewModelScope.launch {
            try {
                val response = homeApiService.getAssessmentsList(careerId)
                _assessmentListState.value = AssessmentListUiState.Success(response.items ?: emptyList())
            } catch (e: Exception) {
                _assessmentListState.value = AssessmentListUiState.Success(getMockAssessments())
            }
        }
    }

    // 3. Quiz State Machine functions
    fun startQuizSession(id: Int) {
        assessmentId = id
        questionCounter = 1
        _quizState.value = QuizUiState.STARTED
        _resultState.value = null
        _gapState.value = emptyList()

        viewModelScope.launch {
            try {
                isOfflineMode = false
                val response = homeApiService.startAssessment(id)
                sessionId = response.session_id
                _quizState.value = QuizUiState.ANSWERING
                loadQuestion(response.first_question)
            } catch (e: Exception) {
                // Fallback simulation parameters
                isOfflineMode = true
                offlineTheta = 0.0
                offlineCorrectCount = 0
                offlineQuestionsServed.clear()
                val initialQuestion = getOfflineQuestion(offlineTheta)
                _quizState.value = QuizUiState.ANSWERING
                loadQuestion(initialQuestion)
            }
        }
    }

    private fun loadQuestion(question: QuestionDto) {
        _currentQuestion.value = question
        startTimeMs = System.currentTimeMillis()
        startTimer()
    }

    private fun startTimer() {
        countdownTimer?.cancel()
        _timerState.value = 30
        countdownTimer = object : CountDownTimer(30000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                _timerState.value = (millisUntilFinished / 1000).toInt()
            }

            override fun onFinish() {
                _timerState.value = 0
                // Auto submit first choice on timeout to avoid blocking
                val current = _currentQuestion.value
                if (current != null && current.options.isNotEmpty()) {
                    submitAnswer(current.options.first().id)
                }
            }
        }.start()
    }

    fun submitAnswer(selectedOptionId: Int) {
        countdownTimer?.cancel()
        val timeTakenMs = (System.currentTimeMillis() - startTimeMs).toInt()

        viewModelScope.launch {
            if (!isOfflineMode) {
                try {
                    val payload = AnswerPayloadDto(
                        question_id = _currentQuestion.value?.question_id ?: 1,
                        selected_option_id = selectedOptionId,
                        time_taken_ms = timeTakenMs
                    )
                    val response = homeApiService.submitAnswer(sessionId ?: "", payload)
                    if (response.next_question != null && questionCounter < totalQuestions) {
                        questionCounter++
                        loadQuestion(response.next_question)
                    } else {
                        concludeQuizAndSubmit()
                    }
                } catch (e: Exception) {
                    isOfflineMode = true
                    advanceOffline(selectedOptionId)
                }
            } else {
                advanceOffline(selectedOptionId)
            }
        }
    }

    private fun advanceOffline(selectedId: Int) {
        // First option is correct in mock check
        val isCorrect = selectedId == 1
        if (isCorrect) {
            offlineCorrectCount++
            offlineTheta += 0.6
        } else {
            offlineTheta -= 0.6
        }

        if (questionCounter < totalQuestions) {
            questionCounter++
            val nextQ = getOfflineQuestion(offlineTheta)
            loadQuestion(nextQ)
        } else {
            concludeQuizAndSubmit()
        }
    }

    private fun concludeQuizAndSubmit() {
        _quizState.value = QuizUiState.SUBMITTING
        viewModelScope.launch {
            if (!isOfflineMode) {
                try {
                    val result = homeApiService.submitQuiz(sessionId ?: "")
                    _resultState.value = result
                    _gapState.value = result.gap_analysis_json?.missing_competencies ?: emptyList()
                    _quizState.value = QuizUiState.DONE
                } catch (e: Exception) {
                    buildOfflineResult()
                }
            } else {
                buildOfflineResult()
            }
        }
    }

    private fun buildOfflineResult() {
        val score = (offlineCorrectCount * 100) / totalQuestions
        val percentile = 70f + (offlineTheta.toFloat() * 10f).coerceIn(-20f, 25f)
        
        val gapsList = mutableListOf<MissingCompetencyDto>()
        if (score < 70) {
            gapsList.add(MissingCompetencyDto(101, "Advanced Lifecycle Controls", "Focus on screen config recovery"))
            gapsList.add(MissingCompetencyDto(102, "Custom View Optimization", "Focus on onDraw calculations"))
        }

        val result = SubmitQuizResponse(
            score = score.toFloat(),
            percentile_rank = percentile,
            gap_analysis_json = com.aicareer.navigator.data.remote.GapAnalysisDto(gapsList),
            mistral_feedback = "Offline adaptive simulation complete. Ability index (theta): ${String.format("%.2f", offlineTheta)}. Review recommended focus areas to enhance competency."
        )

        _resultState.value = result
        _gapState.value = gapsList
        _quizState.value = QuizUiState.DONE
    }

    override fun onCleared() {
        super.onCleared()
        countdownTimer?.cancel()
    }

    private fun getMockAssessments(): List<AssessmentDto> {
        return listOf(
            AssessmentDto(1, "Kotlin Fundamentals Quiz", 4, 1, "mle", "medium", 10, 20),
            AssessmentDto(2, "Android Architecture & Jetpack", 4, 2, "mle", "hard", 12, 25),
            AssessmentDto(3, "CI/CD & Memory Optimization", 4, 3, "mle", "medium", 8, 15)
        )
    }

    private fun getOfflineQuestion(theta: Double): QuestionDto {
        val difficulty = when {
            theta > 0.5 -> "HARD"
            theta < -0.5 -> "EASY"
            else -> "MEDIUM"
        }

        val pool = when (difficulty) {
            "HARD" -> listOf(
                QuestionDto(1, "What does the 'reified' keyword enable in Kotlin inline functions?", "HARD", listOf(
                    OptionDto(1, "Access to the generic type class object at runtime"),
                    OptionDto(2, "Automatic compilation optimization for complex classes"),
                    OptionDto(3, "Subclass restriction checks inside closures"),
                    OptionDto(4, "Immediate coroutine memory garbage collection")
                )),
                QuestionDto(2, "Under what condition will custom view onDraw trigger massive allocation leaks?", "HARD", listOf(
                    OptionDto(1, "Initializing complex Paint objects or Path builders on every call"),
                    OptionDto(2, "Invoking invalidate() from inside the constructor flow"),
                    OptionDto(3, "Using hardware accelerated canvas layers explicitly"),
                    OptionDto(4, "Calculating dynamic bounds using non-static float metrics")
                ))
            )
            "EASY" -> listOf(
                QuestionDto(3, "What is the standard root layout recommended for complex interactive views?", "EASY", listOf(
                    OptionDto(1, "ConstraintLayout"),
                    OptionDto(2, "LinearLayout"),
                    OptionDto(3, "FrameLayout"),
                    OptionDto(4, "AbsoluteLayout")
                )),
                QuestionDto(4, "How is a read-only variable declared in modern Kotlin?", "EASY", listOf(
                    OptionDto(1, "val"),
                    OptionDto(2, "var"),
                    OptionDto(3, "const var"),
                    OptionDto(4, "let")
                ))
            )
            else -> listOf(
                QuestionDto(5, "Which Coroutine Dispatcher should be used for disk or network bound task flows?", "MEDIUM", listOf(
                    OptionDto(1, "Dispatchers.IO"),
                    OptionDto(2, "Dispatchers.Main"),
                    OptionDto(3, "Dispatchers.Default"),
                    OptionDto(4, "Dispatchers.Unconfined")
                )),
                QuestionDto(6, "Which architectural component caches data locally in Jetpack?", "MEDIUM", listOf(
                    OptionDto(1, "Room Database"),
                    OptionDto(2, "LiveData"),
                    OptionDto(3, "DataBinding"),
                    OptionDto(4, "SafeArgs")
                ))
            )
        }

        val unserved = pool.firstOrNull { it.question_id !in offlineQuestionsServed } ?: pool.first()
        offlineQuestionsServed.add(unserved.question_id)
        return unserved
    }
}
