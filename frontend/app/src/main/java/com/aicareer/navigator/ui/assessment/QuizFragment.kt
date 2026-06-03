package com.aicareer.navigator.ui.assessment

import android.os.Bundle
import android.os.CountDownTimer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.AnswerPayloadDto
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.QuestionDto
import com.aicareer.navigator.data.remote.OptionDto
import com.aicareer.navigator.databinding.FragmentQuizBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class QuizFragment : Fragment() {

    @Inject
    lateinit var homeApiService: HomeApiService

    private var _binding: FragmentQuizBinding? = null
    private val binding get() = _binding!!

    private var countdownTimer: CountDownTimer? = null
    private var sessionId: String? = null
    private var currentQuestion: QuestionDto? = null
    private var selectedOptionId: Int? = null
    private var questionCounter = 1
    private val totalQuestions = 5
    private var assessmentId: Int = 1
    private var startTimeMs: Long = 0

    // Offline Adaptive Fallback Variables
    private var isOfflineMode = false
    private var offlineTheta = 0.0
    private var offlineCorrectCount = 0
    private val offlineQuestionsServed = mutableListOf<Int>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentQuizBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        assessmentId = arguments?.getInt("assessmentId", 1) ?: 1

        setupOptionClickListeners()

        binding.btnSubmit.setOnClickListener {
            submitAnswerAndAdvance()
        }

        startAssessmentSession()
    }

    private fun setupOptionClickListeners() {
        binding.btnOption1.setOnClickListener { selectOption(0, binding.btnOption1) }
        binding.btnOption2.setOnClickListener { selectOption(1, binding.btnOption2) }
        binding.btnOption3.setOnClickListener { selectOption(2, binding.btnOption3) }
        binding.btnOption4.setOnClickListener { selectOption(3, binding.btnOption4) }
    }

    private fun selectOption(optionIndex: Int, button: Button) {
        val q = currentQuestion ?: return
        if (optionIndex >= q.options.size) return
        selectedOptionId = q.options[optionIndex].id
        resetOptionButtons()
        
        button.setBackgroundResource(R.drawable.bg_quiz_option_selected)
        button.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))
    }

    private fun resetOptionButtons() {
        val normalText = ContextCompat.getColor(requireContext(), R.color.color_on_primary)
        
        binding.btnOption1.setBackgroundResource(R.drawable.bg_quiz_option)
        binding.btnOption1.setTextColor(normalText)
        binding.btnOption2.setBackgroundResource(R.drawable.bg_quiz_option)
        binding.btnOption2.setTextColor(normalText)
        binding.btnOption3.setBackgroundResource(R.drawable.bg_quiz_option)
        binding.btnOption3.setTextColor(normalText)
        binding.btnOption4.setBackgroundResource(R.drawable.bg_quiz_option)
        binding.btnOption4.setTextColor(normalText)
    }

    private fun startAssessmentSession() {
        lifecycleScope.launch {
            try {
                binding.tvQuestion.text = "Initializing adaptive assessment session..."
                val response = homeApiService.startAssessment(assessmentId)
                sessionId = response.session_id
                isOfflineMode = false
                loadQuestion(response.first_question)
            } catch (e: Exception) {
                // Fallback to offline adaptive simulation
                isOfflineMode = true
                offlineTheta = 0.0
                offlineCorrectCount = 0
                offlineQuestionsServed.clear()
                val initialQuestion = getOfflineQuestion(offlineTheta)
                loadQuestion(initialQuestion)
            }
        }
    }

    private fun loadQuestion(question: QuestionDto) {
        currentQuestion = question
        selectedOptionId = null
        resetOptionButtons()

        binding.tvQuestionNum.text = "QUESTION $questionCounter OF $totalQuestions"
        binding.tvQuestion.text = question.text
        
        // Progress percentage calculation
        val progressPercent = (questionCounter * 100) / totalQuestions
        binding.pbQuiz.setProgressCompat(progressPercent, true)

        // Set choices text and visibility
        val buttons = listOf(binding.btnOption1, binding.btnOption2, binding.btnOption3, binding.btnOption4)
        for (i in buttons.indices) {
            if (i < question.options.size) {
                buttons[i].visibility = View.VISIBLE
                buttons[i].text = "${'A' + i}      ${question.options[i].text}"
            } else {
                buttons[i].visibility = View.GONE
            }
        }

        startTimeMs = System.currentTimeMillis()
        startTimer()
    }

    private fun startTimer() {
        countdownTimer?.cancel()
        // 30 seconds per question
        countdownTimer = object : CountDownTimer(30000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsRemaining = millisUntilFinished / 1000
                binding.tvTimer.text = "${secondsRemaining}s"

                // Color indicator shift: Emerald (>50%) -> Amber (>25%) -> Rose (<=25%)
                val colorRes = when {
                    secondsRemaining > 15 -> R.color.color_emerald
                    secondsRemaining > 7 -> R.color.color_amber
                    else -> R.color.color_rose
                }
                binding.tvTimer.setTextColor(ContextCompat.getColor(requireContext(), colorRes))
            }

            override fun onFinish() {
                // Time up! Auto-select first option if none is selected, then auto-submit
                if (selectedOptionId == null && (currentQuestion?.options?.isNotEmpty() == true)) {
                    selectedOptionId = currentQuestion?.options?.first()?.id
                }
                submitAnswerAndAdvance()
            }
        }.start()
    }

    private fun submitAnswerAndAdvance() {
        if (selectedOptionId == null) {
            Toast.makeText(requireContext(), "Please select an option before proceeding.", Toast.LENGTH_SHORT).show()
            return
        }

        countdownTimer?.cancel()
        val timeTakenMs = (System.currentTimeMillis() - startTimeMs).toInt()

        lifecycleScope.launch {
            if (!isOfflineMode) {
                try {
                    val payload = AnswerPayloadDto(
                        question_id = currentQuestion?.question_id ?: 1,
                        selected_option_id = selectedOptionId ?: 0,
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
                    // Fallback to offline mode for remainder of quiz
                    isOfflineMode = true
                    advanceOffline(selectedOptionId ?: 0)
                }
            } else {
                advanceOffline(selectedOptionId ?: 0)
            }
        }
    }

    private fun advanceOffline(selectedId: Int) {
        val q = currentQuestion ?: return
        // Simple offline correct check: first option (id = 1) is always correct in backend simulation
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
        lifecycleScope.launch {
            val scoreBundle = Bundle()
            val targetCareerId = arguments?.getInt("careerId") ?: 0
            scoreBundle.putInt("careerId", targetCareerId)
            if (!isOfflineMode) {
                try {
                    val result = homeApiService.submitQuiz(sessionId ?: "")
                    scoreBundle.putInt("score", result.score.toInt())
                    scoreBundle.putFloat("percentile", result.percentile_rank)
                    scoreBundle.putString("feedback", result.mistral_feedback ?: "Good attempt!")
                    scoreBundle.putString("sessionId", sessionId)
                    
                    val missingSkills = result.gap_analysis_json?.missing_competencies?.map { it.skill_name } ?: emptyList()
                    scoreBundle.putStringArrayList("gapSkills", ArrayList(missingSkills))
                } catch (e: Exception) {
                    buildOfflineResultBundle(scoreBundle)
                }
            } else {
                buildOfflineResultBundle(scoreBundle)
            }
            findNavController().navigate(R.id.action_quiz_to_result, scoreBundle)
        }
    }

    private fun buildOfflineResultBundle(bundle: Bundle) {
        val score = (offlineCorrectCount * 100) / totalQuestions
        val percentile = 70f + (offlineTheta.toFloat() * 10f).coerceIn(-20f, 25f)
        bundle.putInt("score", score)
        bundle.putFloat("percentile", percentile)
        bundle.putString("sessionId", "offline_session")
        bundle.putString("feedback", "Offline adaptive simulation complete. Ability index (theta): ${String.format("%.2f", offlineTheta)}. Review recommended focus areas to enhance competency.")
        
        val gaps = if (score < 70) arrayListOf("Advanced Lifecycle Controls", "Custom View Optimization") else arrayListOf<String>()
        bundle.putStringArrayList("gapSkills", gaps)
    }

    // High fidelity adaptive questions offline simulation pool
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

        // Return a question that hasn't been served yet in this offline run
        val unserved = pool.firstOrNull { it.question_id !in offlineQuestionsServed } ?: pool.first()
        offlineQuestionsServed.add(unserved.question_id)
        return unserved
    }

    override fun onDestroyView() {
        super.onDestroyView()
        countdownTimer?.cancel()
        _binding = null
    }
}
