package com.aicareer.navigator.ui.assessment

import android.animation.ValueAnimator
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentResultBinding
import com.github.mikephil.charting.animation.Easing
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.RadarData
import com.github.mikephil.charting.data.RadarDataSet
import com.github.mikephil.charting.data.RadarEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ResultFragment : Fragment() {

    private var _binding: FragmentResultBinding? = null
    private val binding get() = _binding!!

    private val handler = Handler(Looper.getMainLooper())
    private var streamingRunnable: Runnable? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentResultBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val score = arguments?.getInt("score", 80) ?: 80
        val percentile = arguments?.getFloat("percentile", 85f) ?: 85f
        val feedbackText = arguments?.getString("feedback") ?: "Congratulations on completing the assessment! You exhibit strong foundations."

        animateScoreGauge(score)
        setupGradeBadge(score)
        setupRadarChart(score)
        streamFeedbackText(feedbackText)

        val targetCareerId = arguments?.getInt("careerId", 0) ?: 0

        binding.btnViewRoadmap.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", targetCareerId)
            }
            findNavController().navigate(R.id.navigation_roadmap, bundle)
        }

        binding.btnViewGap.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", targetCareerId)
            }
            findNavController().navigate(R.id.action_result_to_gap, bundle)
        }

        binding.btnBackDashboard.setOnClickListener {
            findNavController().navigate(R.id.navigation_home)
        }

        if (score >= 70) {
            triggerConfettiAnimation()
        }
    }

    private fun animateScoreGauge(targetScore: Int) {
        val animator = ValueAnimator.ofInt(0, targetScore).apply {
            duration = 1200
            interpolator = DecelerateInterpolator()
            addUpdateListener { animation ->
                val animatedValue = animation.animatedValue as Int
                binding.pbScore.progress = animatedValue
                binding.tvScore.text = "$animatedValue%"
            }
        }

        // Apply gauge colors as per score tier guidelines in design.md
        val colorRes = when {
            targetScore >= 90 -> R.color.color_emerald
            targetScore >= 70 -> R.color.color_cyan
            targetScore >= 50 -> R.color.color_gold
            else -> R.color.color_rose
        }
        val indicatorColor = ContextCompat.getColor(requireContext(), colorRes)
        binding.pbScore.setIndicatorColor(indicatorColor)
        binding.tvScore.setTextColor(indicatorColor)

        animator.start()
    }

    private fun setupGradeBadge(score: Int) {
        val (gradeText, colorRes) = when {
            score >= 90 -> "GRADE A" to R.color.color_emerald
            score >= 80 -> "GRADE B" to R.color.color_cyan
            score >= 70 -> "GRADE C" to R.color.color_gold
            score >= 50 -> "GRADE D" to R.color.color_amber
            else -> "GRADE F" to R.color.color_rose
        }

        binding.tvGrade.text = gradeText
        val tintColor = ContextCompat.getColor(requireContext(), colorRes)
        binding.tvGrade.setTextColor(tintColor)
        binding.tvGrade.backgroundTintList = ContextCompat.getColorStateList(requireContext(), colorRes)?.withAlpha(30)
    }

    private fun setupRadarChart(score: Int) {
        val radarChart = binding.radarChart
        radarChart.setBackgroundColor(Color.TRANSPARENT)
        radarChart.description.isEnabled = false
        radarChart.webColor = Color.parseColor("#FFFFFF14")
        radarChart.webColorInner = Color.parseColor("#FFFFFF0A")
        radarChart.webLineWidth = 1.5f
        radarChart.webLineWidthInner = 1.0f

        val entries = ArrayList<RadarEntry>()
        // Adapt scores dynamic indicators based on dynamic score bounds
        val multiplier = score / 100f
        entries.add(RadarEntry(95f * multiplier)) // Kotlin Foundations
        entries.add(RadarEntry(85f * multiplier)) // Coroutines masterclass
        entries.add(RadarEntry(75f * multiplier)) // Dependency Injection (Hilt)
        entries.add(RadarEntry(88f * multiplier)) // Android Jetpack UI
        entries.add(RadarEntry(90f * multiplier)) // Local Room Cache

        val labels = listOf("Kotlin Foundations", "Coroutines", "D.I. (Hilt)", "Jetpack UI", "Offline Cache")

        val set = RadarDataSet(entries, "Competency Domain")
        set.color = Color.parseColor("#A855F7")
        set.fillColor = Color.parseColor("#7B2FBE")
        set.setDrawFilled(true)
        set.fillAlpha = 65
        set.lineWidth = 2f
        set.isDrawHighlightCircleEnabled = true
        set.setDrawHighlightIndicators(false)

        val data = RadarData(set)
        data.setValueTextSize(9f)
        data.setValueTextColor(Color.parseColor("#A8A8C8"))

        radarChart.data = data

        val xAxis = radarChart.xAxis
        xAxis.valueFormatter = IndexAxisValueFormatter(labels)
        xAxis.textSize = 9.5f
        xAxis.textColor = Color.parseColor("#A8A8C8")

        val yAxis = radarChart.yAxis
        yAxis.textColor = Color.parseColor("#6B6B8E")
        yAxis.textSize = 8f
        yAxis.setDrawLabels(false)
        yAxis.axisMinimum = 0f
        yAxis.axisMaximum = 100f

        radarChart.legend.isEnabled = false
        radarChart.animateXY(1000, 1000, Easing.EaseInOutQuad)
        radarChart.invalidate()
    }

    private fun streamFeedbackText(text: String) {
        var charIndex = 0
        binding.tvFeedback.text = ""
        
        streamingRunnable = object : Runnable {
            override fun run() {
                if (charIndex <= text.length) {
                    val currentText = text.substring(0, charIndex)
                    // Display typed characters + professional pulsing cursor
                    binding.tvFeedback.text = if (charIndex < text.length) "$currentText |" else currentText
                    charIndex++
                    handler.postDelayed(this, 25)
                }
            }
        }
        handler.post(streamingRunnable!!)
    }

    private fun triggerConfettiAnimation() {
        binding.lottieConfetti.apply {
            setAnimation("confetti.json")
            repeatCount = 0
            playAnimation()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        streamingRunnable?.let { handler.removeCallbacks(it) }
        _binding = null
    }
}
