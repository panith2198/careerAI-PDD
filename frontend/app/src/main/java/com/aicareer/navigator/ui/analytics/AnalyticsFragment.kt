package com.aicareer.navigator.ui.analytics

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.os.Bundle
import android.util.AttributeSet
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.CareerFitTrendDto
import com.aicareer.navigator.data.remote.DashboardMetricsResponse
import com.aicareer.navigator.data.remote.SkillProgressDto
import com.aicareer.navigator.databinding.FragmentAnalyticsBinding
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.google.android.material.chip.Chip
import com.google.android.material.progressindicator.LinearProgressIndicator
import com.google.android.material.tabs.TabLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AnalyticsFragment : Fragment() {

    private var _binding: FragmentAnalyticsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AnalyticsViewModel by viewModels()

    // Design colors (from design.md)
    private val colorViolet by lazy { Color.parseColor("#7B2FBE") }
    private val colorVioletBright by lazy { Color.parseColor("#9D4EDD") }
    private val colorCyan by lazy { Color.parseColor("#00BCD4") }
    private val colorGold by lazy { Color.parseColor("#F59E0B") }
    private val colorEmerald by lazy { Color.parseColor("#10B981") }
    private val colorRose by lazy { Color.parseColor("#F43F5E") }
    private val colorAxisText by lazy { Color.parseColor("#8A8AAA") }
    private val colorGridLine by lazy { Color.parseColor("#1A000000") }
    private val colorTextPrimary by lazy { ContextCompat.getColor(requireContext(), R.color.color_text_primary) }
    private val colorTextSecondary by lazy { ContextCompat.getColor(requireContext(), R.color.color_text_secondary) }
    private val colorTextTertiary by lazy { ContextCompat.getColor(requireContext(), R.color.color_text_tertiary) }
    private val colorSurface2 by lazy { ContextCompat.getColor(requireContext(), R.color.color_surface_2) }

    private val ANIM_STAGGER_DELAY = 40L
    private val ANIM_DURATION_NORMAL = 280L
    private val ANIM_DURATION_FAST = 150L

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAnalyticsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupTabs()
        setupDateRangeChips()
        setupExportButton()
        observeViewModel()
    }

    // ==================== TABS ====================

    private fun setupTabs() {
        binding.tabLayout.apply {
            addTab(newTab().setText("Overview"))
            addTab(newTab().setText("Skills"))
            addTab(newTab().setText("Jobs"))

            addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
                override fun onTabSelected(tab: TabLayout.Tab?) {
                    switchTab(tab?.position ?: 0)
                }
                override fun onTabUnselected(tab: TabLayout.Tab?) {}
                override fun onTabReselected(tab: TabLayout.Tab?) {}
            })
        }
        // Default to overview
        switchTab(0)
    }

    private fun switchTab(position: Int) {
        val overviewVisible = position == 0
        val skillsVisible = position == 1
        val jobsVisible = position == 2

        binding.llOverviewTab.visibility = if (overviewVisible) View.VISIBLE else View.GONE
        binding.llSkillsTab.visibility = if (skillsVisible) View.VISIBLE else View.GONE
        binding.llJobsTab.visibility = if (jobsVisible) View.VISIBLE else View.GONE

        // Entrance animation for selected tab
        val targetContainer = when (position) {
            0 -> binding.llOverviewTab
            1 -> binding.llSkillsTab
            2 -> binding.llJobsTab
            else -> return
        }
        animateTabEntrance(targetContainer)

        // Load skill trend when switching to Skills tab
        if (skillsVisible) {
            viewModel.loadSkillTrend(viewModel.selectedSkill.value)
        }
    }

    private fun animateTabEntrance(container: ViewGroup) {
        for (i in 0 until container.childCount) {
            val child = container.getChildAt(i)
            child.alpha = 0f
            child.translationY = 32f
            child.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(ANIM_DURATION_NORMAL)
                .setStartDelay(i * ANIM_STAGGER_DELAY)
                .setInterpolator(OvershootInterpolator(0.6f))
                .start()
        }
    }

    // ==================== DATE RANGE CHIPS ====================

    private fun setupDateRangeChips() {
        val chipIds = mapOf(
            R.id.chip_7d to "7d",
            R.id.chip_30d to "30d",
            R.id.chip_90d to "90d",
            R.id.chip_all to "all"
        )

        chipIds.forEach { (chipId, range) ->
            binding.root.findViewById<Chip>(chipId)?.setOnClickListener {
                viewModel.setDateRange(range)
                updateDateRangeChipStates(range)
            }
        }
    }

    private fun updateDateRangeChipStates(activeRange: String) {
        val chipMap = mapOf(
            "7d" to binding.chip7d,
            "30d" to binding.chip30d,
            "90d" to binding.chip90d,
            "all" to binding.chipAll
        )

        chipMap.forEach { (range, chip) ->
            val isActive = range == activeRange
            chip.isChecked = isActive
            chip.setChipBackgroundColorResource(
                if (isActive) R.color.color_primary else R.color.color_surface_3
            )
            chip.setTextColor(
                ContextCompat.getColor(
                    requireContext(),
                    if (isActive) R.color.color_on_primary else R.color.color_text_secondary
                )
            )
            chip.chipStrokeWidth = if (isActive) 0f else 1f.dpToPxFloat()
        }
    }

    // ==================== EXPORT BUTTON ====================

    private fun setupExportButton() {
        binding.btnExport.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.animate().scaleX(0.92f).scaleY(0.92f).setDuration(ANIM_DURATION_FAST).start()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(ANIM_DURATION_NORMAL)
                        .setInterpolator(OvershootInterpolator(2f)).start()
                    if (event.action == MotionEvent.ACTION_UP) v.performClick()
                }
            }
            true
        }
    }

    // ==================== OBSERVE VIEWMODEL ====================

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { viewModel.dashboardState.collect { handleDashboardState(it) } }
                launch { viewModel.skillTrendState.collect { handleSkillTrendState(it) } }
                launch { viewModel.dateRange.collect { updateDateRangeChipStates(it) } }
            }
        }
    }

    private fun handleDashboardState(state: DashboardUiState) {
        when (state) {
            is DashboardUiState.Loading -> {
                // Could show shimmer loading states here
            }
            is DashboardUiState.Success -> {
                bindOverviewTab(state.data)
                bindSkillsTab(state.data)
                bindJobsTab(state.data)
            }
            is DashboardUiState.Error -> {
                // Show error snackbar
            }
        }
    }

    private fun handleSkillTrendState(state: SkillTrendUiState) {
        when (state) {
            is SkillTrendUiState.Loading -> { /* shimmer */ }
            is SkillTrendUiState.Success -> {
                bindSkillTrendChart(state.data)
            }
            is SkillTrendUiState.Error -> { /* snackbar */ }
        }
    }

    // ==================== OVERVIEW TAB ====================

    private fun bindOverviewTab(data: DashboardMetricsResponse) {
        setupCareerFitChart(data.career_fit_trend.orEmpty())
        setupAssessmentChart(data)
        buildRoadmapRings(data)
    }

    private fun setupCareerFitChart(trend: List<CareerFitTrendDto>) {
        if (trend.isEmpty()) return

        val entries = trend.mapIndexed { index, dto ->
            Entry(index.toFloat(), dto.fit_score)
        }

        val currentScore = trend.lastOrNull()?.fit_score?.toInt() ?: 0
        binding.tvFitScoreCurrent.text = "${currentScore}%"

        val dataSet = LineDataSet(entries, "Career Fit").apply {
            color = colorVioletBright
            lineWidth = 2.5f
            setDrawCircles(true)
            circleRadius = 4f
            setCircleColor(colorVioletBright)
            setDrawCircleHole(true)
            circleHoleRadius = 2f
            circleHoleColor = colorSurface2
            valueTextColor = colorTextTertiary
            valueTextSize = 9f
            setDrawFilled(true)
            fillAlpha = 40
            fillColor = colorVioletBright
            mode = LineDataSet.Mode.CUBIC_BEZIER
            cubicIntensity = 0.15f
        }

        val labels = trend.mapIndexed { i, dto ->
            val parts = dto.generated_at.split("-")
            if (parts.size >= 3) "${parts[1]}/${parts[2]}" else "D${i + 1}"
        }

        binding.chartCareerFit.apply {
            this.data = LineData(dataSet)
            styleLineChart(this, labels)
            animateX(800)
        }
    }

    private fun setupAssessmentChart(data: DashboardMetricsResponse) {
        val assessments = data.assessment_scores.orEmpty()
        if (assessments.isEmpty()) return

        val entries = assessments.mapIndexed { index, dto ->
            BarEntry(index.toFloat(), dto.score)
        }

        val dataSet = BarDataSet(entries, "Scores").apply {
            // Gradient-like multiple colors per bar
            colors = assessments.map { dto ->
                when {
                    dto.score >= 85 -> colorEmerald
                    dto.score >= 70 -> colorCyan
                    dto.score >= 50 -> colorGold
                    else -> colorRose
                }
            }
            valueTextColor = colorTextTertiary
            valueTextSize = 9f
            setDrawValues(true)
        }

        val labels = assessments.map { dto ->
            val words = dto.assessment_title.split(" ")
            if (words.size > 1) words.first() else dto.assessment_title
        }

        binding.chartAssessments.apply {
            this.data = BarData(dataSet).apply {
                barWidth = 0.6f
            }
            styleBarChart(this, labels)
            animateY(800)
        }
    }

    private fun buildRoadmapRings(data: DashboardMetricsResponse) {
        val roadmaps = data.roadmap_pct.orEmpty()
        binding.llRoadmapRings.removeAllViews()

        if (roadmaps.isEmpty()) return

        roadmaps.forEach { roadmap ->
            val ringContainer = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginStart = 8.dpToPx()
                    marginEnd = 8.dpToPx()
                }
            }

            val ringView = DonutRingView(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(80.dpToPx(), 80.dpToPx())
                setProgress(roadmap.completion_pct)
                setRingColor(colorEmerald)
                setTrackColor(Color.parseColor("#10B98120"))
            }

            val titleLabel = TextView(requireContext()).apply {
                text = roadmap.title
                setTextColor(colorTextSecondary)
                textSize = 11f
                gravity = Gravity.CENTER
                maxLines = 2
                setPadding(0, 8.dpToPx(), 0, 0)
            }

            val pctLabel = TextView(requireContext()).apply {
                text = "${roadmap.completion_pct.toInt()}%"
                setTextColor(colorEmerald)
                textSize = 12f
                gravity = Gravity.CENTER
                setTypeface(typeface, android.graphics.Typeface.BOLD)
            }

            ringContainer.addView(ringView)
            ringContainer.addView(pctLabel)
            ringContainer.addView(titleLabel)
            binding.llRoadmapRings.addView(ringContainer)
        }

        // Animate rings entrance
        for (i in 0 until binding.llRoadmapRings.childCount) {
            val child = binding.llRoadmapRings.getChildAt(i)
            child.scaleX = 0f
            child.scaleY = 0f
            child.alpha = 0f
            child.animate()
                .scaleX(1f).scaleY(1f).alpha(1f)
                .setDuration(ANIM_DURATION_NORMAL + 100)
                .setStartDelay(i * 120L)
                .setInterpolator(OvershootInterpolator(1.5f))
                .start()
        }
    }

    // ==================== SKILLS TAB ====================

    private fun bindSkillsTab(data: DashboardMetricsResponse) {
        val skills = data.skill_progress.orEmpty()
        buildSkillSelectorChips(skills)
        buildSkillProgressBars(skills)
    }

    private fun buildSkillSelectorChips(skills: List<SkillProgressDto>) {
        binding.cgSkillSelector.removeAllViews()
        skills.forEach { skill ->
            val chip = Chip(requireContext()).apply {
                text = skill.skill_name
                isCheckable = true
                isChecked = skill.skill_name == viewModel.selectedSkill.value
                setChipBackgroundColorResource(
                    if (isChecked) R.color.color_primary else R.color.color_surface_3
                )
                setTextColor(
                    ContextCompat.getColor(
                        requireContext(),
                        if (isChecked) R.color.color_on_primary else R.color.color_text_secondary
                    )
                )
                chipCornerRadius = 100f
                chipStrokeWidth = if (isChecked) 0f else 1f
                chipStrokeColor = ContextCompat.getColorStateList(requireContext(), R.color.color_border)
                setOnClickListener {
                    viewModel.selectSkill(skill.skill_name)
                    // Re-render all chips
                    buildSkillSelectorChips(skills)
                }
            }
            binding.cgSkillSelector.addView(chip)
        }
    }

    private fun bindSkillTrendChart(trendData: SkillTrendData) {
        binding.tvSkillTrendTitle.text = "${trendData.skillName.uppercase()} PROGRESS"

        val userEntries = trendData.trend.map { Entry(it.day.toFloat(), it.score) }
        val cohortEntries = trendData.cohortAvg.map { Entry(it.day.toFloat(), it.score) }

        val userDataSet = LineDataSet(userEntries, "You").apply {
            color = colorVioletBright
            lineWidth = 2.5f
            setDrawCircles(false)
            setDrawFilled(true)
            fillAlpha = 30
            fillColor = colorVioletBright
            mode = LineDataSet.Mode.CUBIC_BEZIER
            cubicIntensity = 0.15f
            setDrawValues(false)
        }

        val cohortDataSet = LineDataSet(cohortEntries, "Cohort Avg").apply {
            color = colorTextTertiary
            lineWidth = 1.5f
            setDrawCircles(false)
            setDrawFilled(false)
            enableDashedLine(10f, 5f, 0f)
            mode = LineDataSet.Mode.CUBIC_BEZIER
            cubicIntensity = 0.15f
            setDrawValues(false)
        }

        val labels = (0..29).map { "D${it + 1}" }

        binding.chartSkillTrend.apply {
            this.data = LineData(userDataSet, cohortDataSet)
            styleLineChart(this, labels, showXLabels = false)
            animateX(1000)
        }
    }

    private fun buildSkillProgressBars(skills: List<SkillProgressDto>) {
        binding.llSkillBars.removeAllViews()

        skills.forEachIndexed { index, skill ->
            val row = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = 16.dpToPx()
                }
            }

            // Skill name + score row
            val labelRow = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = 6.dpToPx()
                }
            }

            val nameLabel = TextView(requireContext()).apply {
                text = skill.skill_name
                setTextColor(colorTextPrimary)
                textSize = 13f
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val levelBadge = TextView(requireContext()).apply {
                text = skill.proficiency_level?.replaceFirstChar { it.uppercase() } ?: ""
                setTextColor(when (skill.proficiency_level) {
                    "advanced" -> colorEmerald
                    "intermediate" -> colorCyan
                    else -> colorGold
                })
                textSize = 10f
                setPadding(8.dpToPx(), 2.dpToPx(), 8.dpToPx(), 2.dpToPx())
            }

            val scoreLabel = TextView(requireContext()).apply {
                text = "${skill.proficiency_score.toInt()}%"
                setTextColor(colorTextTertiary)
                textSize = 12f
                setPadding(8.dpToPx(), 0, 0, 0)
            }

            labelRow.addView(nameLabel)
            labelRow.addView(levelBadge)
            labelRow.addView(scoreLabel)

            // Progress bar
            val progressBar = LinearProgressIndicator(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                max = 100
                progress = 0
                trackThickness = 6.dpToPx()
                trackCornerRadius = 3.dpToPx()
                setIndicatorColor(when {
                    skill.proficiency_score >= 75 -> colorEmerald
                    skill.proficiency_score >= 50 -> colorCyan
                    skill.proficiency_score >= 30 -> colorGold
                    else -> colorRose
                })
                trackColor = Color.parseColor("#0000000D")
            }

            row.addView(labelRow)
            row.addView(progressBar)
            binding.llSkillBars.addView(row)

            // Animate progress bars with stagger
            progressBar.postDelayed({
                progressBar.setProgressCompat(skill.proficiency_score.toInt(), true)
            }, (index + 1) * 150L)
        }
    }

    // ==================== JOBS TAB ====================

    private fun bindJobsTab(data: DashboardMetricsResponse) {
        // Static mock values for jobs stats — in production from GET /analytics/jobs
        binding.tvAppsSent.text = "12"
        binding.tvInterviews.text = "4"
        binding.tvSavedJobs.text = "28"

        setupJobTrendChart()
    }

    private fun setupJobTrendChart() {
        val entries = listOf(
            Entry(0f, 55f),
            Entry(1f, 60f),
            Entry(2f, 58f),
            Entry(3f, 65f),
            Entry(4f, 72f),
            Entry(5f, 70f),
            Entry(6f, 78f),
            Entry(7f, 82f)
        )

        val dataSet = LineDataSet(entries, "Match Score").apply {
            color = colorEmerald
            lineWidth = 2.5f
            setDrawCircles(true)
            circleRadius = 3.5f
            setCircleColor(colorEmerald)
            setDrawCircleHole(true)
            circleHoleRadius = 2f
            circleHoleColor = colorSurface2
            setDrawFilled(true)
            fillAlpha = 25
            fillColor = colorEmerald
            mode = LineDataSet.Mode.CUBIC_BEZIER
            cubicIntensity = 0.15f
            valueTextColor = colorTextTertiary
            valueTextSize = 9f
        }

        val labels = listOf("W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8")

        binding.chartJobTrend.apply {
            this.data = LineData(dataSet)
            styleLineChart(this, labels)
            animateX(800)
        }
    }

    // ==================== CHART STYLING HELPERS ====================

    private fun styleLineChart(chart: LineChart, labels: List<String>, showXLabels: Boolean = true) {
        chart.apply {
            description.isEnabled = false
            legend.isEnabled = false
            setBackgroundColor(Color.TRANSPARENT)
            setDrawGridBackground(false)
            setTouchEnabled(true)
            isDragEnabled = true
            setScaleEnabled(false)
            setPinchZoom(false)
            setViewPortOffsets(16f, 8f, 16f, if (showXLabels) 40f else 16f)

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                textColor = colorAxisText
                textSize = 9f
                setDrawGridLines(false)
                setDrawAxisLine(false)
                granularity = 1f
                if (showXLabels && labels.isNotEmpty()) {
                    valueFormatter = IndexAxisValueFormatter(labels)
                    labelCount = minOf(labels.size, 7)
                } else {
                    setDrawLabels(false)
                }
            }

            axisLeft.apply {
                textColor = colorAxisText
                textSize = 9f
                setDrawGridLines(true)
                gridColor = colorGridLine
                gridLineWidth = 0.5f
                setDrawAxisLine(false)
                axisMinimum = 0f
            }

            axisRight.isEnabled = false
        }
    }

    private fun styleBarChart(chart: BarChart, labels: List<String>) {
        chart.apply {
            description.isEnabled = false
            legend.isEnabled = false
            setBackgroundColor(Color.TRANSPARENT)
            setDrawGridBackground(false)
            setTouchEnabled(true)
            setScaleEnabled(false)
            setPinchZoom(false)
            setViewPortOffsets(16f, 8f, 16f, 40f)
            setFitBars(true)

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                textColor = colorAxisText
                textSize = 9f
                setDrawGridLines(false)
                setDrawAxisLine(false)
                granularity = 1f
                valueFormatter = IndexAxisValueFormatter(labels)
                labelCount = labels.size
            }

            axisLeft.apply {
                textColor = colorAxisText
                textSize = 9f
                setDrawGridLines(true)
                gridColor = colorGridLine
                gridLineWidth = 0.5f
                setDrawAxisLine(false)
                axisMinimum = 0f
                axisMaximum = 100f
            }

            axisRight.isEnabled = false
        }
    }

    // ==================== UTILITY ====================

    private fun Int.dpToPx(): Int {
        return (this * resources.displayMetrics.density).toInt()
    }

    private fun Float.dpToPxFloat(): Float {
        return this * resources.displayMetrics.density
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// ==================== DONUT RING CUSTOM VIEW ====================

class DonutRingView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var progress = 0f
    private var ringColor = Color.parseColor("#10B981")
    private var trackColor = Color.parseColor("#10B98120")
    private val strokeWidth = 10f

    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        this.strokeWidth = this@DonutRingView.strokeWidth
        strokeCap = Paint.Cap.ROUND
    }

    private val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        this.strokeWidth = this@DonutRingView.strokeWidth
        strokeCap = Paint.Cap.ROUND
    }

    private val rect = RectF()

    fun setProgress(pct: Float) {
        progress = pct.coerceIn(0f, 100f)
        invalidate()
    }

    fun setRingColor(color: Int) {
        ringColor = color
        invalidate()
    }

    fun setTrackColor(color: Int) {
        trackColor = color
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val padding = strokeWidth / 2f + 4f
        rect.set(padding, padding, width - padding, height - padding)

        trackPaint.color = trackColor
        canvas.drawArc(rect, 0f, 360f, false, trackPaint)

        progressPaint.color = ringColor
        val sweepAngle = (progress / 100f) * 360f
        canvas.drawArc(rect, -90f, sweepAngle, false, progressPaint)
    }
}
