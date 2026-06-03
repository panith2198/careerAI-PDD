package com.aicareer.navigator.ui.career

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.CareerDetailResponse
import com.aicareer.navigator.data.remote.CareerSkillDto
import com.aicareer.navigator.databinding.FragmentCareerDetailBinding
import com.aicareer.navigator.databinding.ItemCareerSkillBinding
import com.bumptech.glide.Glide
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CareerDetailFragment : Fragment() {

    private var _binding: FragmentCareerDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CareerDetailViewModel by viewModels()
    private var currentCareerId: Int? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCareerDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Read safe args or default
        val careerSlug = arguments?.getString("careerSlug") ?: "android-platform-architect"

        // Wires Nav Actions
        binding.btnRoadmap.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", currentCareerId ?: 1)
                putString("careerTitle", binding.tvTitle.text.toString())
            }
            findNavController().navigate(R.id.navigation_roadmap, bundle)
        }

        binding.btnAssessment.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", currentCareerId ?: 1)
            }
            findNavController().navigate(R.id.navigation_assessment, bundle)
        }

        binding.btnCareerPath.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", currentCareerId ?: 1)
            }
            findNavController().navigate(R.id.navigation_roadmap, bundle) // redirects to path roadmap planner
        }

        binding.btnFindJobs.setOnClickListener {
            findNavController().navigate(R.id.navigation_jobs)
        }

        // Custom back button click
        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        // Custom bookmark button click
        binding.btnBookmark.setOnClickListener {
            binding.ivBookmark.isSelected = !binding.ivBookmark.isSelected
            binding.ivBookmark.imageTintList = android.content.res.ColorStateList.valueOf(
                if (binding.ivBookmark.isSelected) {
                    androidx.core.content.ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
                } else {
                    androidx.core.content.ContextCompat.getColor(requireContext(), R.color.color_text_primary)
                }
            )
        }

        // Scroll Offset Listener for Dynamic Toolbar background (Color + Grid) & Title Fade
        binding.appBar.addOnOffsetChangedListener(com.google.android.material.appbar.AppBarLayout.OnOffsetChangedListener { appBarLayout, verticalOffset ->
            val scrollLimit = appBarLayout.totalScrollRange.toFloat()
            val ratio = if (scrollLimit > 0) (-verticalOffset.toFloat() / scrollLimit).coerceIn(0f, 1f) else 0f
            
            // Build dynamic LayerDrawable (Color + Grid)
            val surfaceColor = androidx.core.content.ContextCompat.getColor(requireContext(), R.color.color_surface_1)
            val colorDrawable = android.graphics.drawable.ColorDrawable(surfaceColor).apply { alpha = (ratio * 255).toInt() }
            val gridDrawable = androidx.core.content.ContextCompat.getDrawable(requireContext(), R.drawable.bg_grid)?.apply { 
                alpha = (ratio * 255).toInt() 
            }
            val layerDrawable = if (gridDrawable != null) {
                android.graphics.drawable.LayerDrawable(arrayOf(colorDrawable, gridDrawable))
            } else {
                colorDrawable
            }
            
            binding.toolbarCareer.background = layerDrawable
            binding.tvToolbarTitle.alpha = ratio
        })

        // Fetch Details
        viewModel.loadCareerDetails(careerSlug)

        // State flow observation
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.detailState.collectLatest { state ->
                when (state) {
                    is CareerDetailState.Loading -> {
                        // Latency/Shimmer state indicators
                    }
                    is CareerDetailState.Success -> {
                        bindCareerDetails(state.data)
                    }
                    is CareerDetailState.Error -> {
                        // Error fallback state UI
                    }
                }
            }
        }
    }

    private fun bindCareerDetails(data: CareerDetailResponse) {
        currentCareerId = data.career_id
        binding.tvTitle.text = data.title
        binding.tvToolbarTitle.text = data.title
        binding.tvCategory.text = (data.category ?: "MOBILE ENGINEERING").uppercase()
        binding.tvDifficulty.text = (data.difficulty_level ?: "ADVANCED").uppercase()
        binding.tvDescription.text = data.description

        // Glide parallax header banner
        Glide.with(this)
            .load("https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80")
            .placeholder(R.color.color_surface_2)
            .error(R.color.color_surface_3)
            .into(binding.ivCareerBanner)

        // Configure BarChart for Salary distribution
        setupSalaryBarChart(binding.chartSalary, data.avg_salary_min ?: 600000, data.avg_salary_max ?: 1800000)

        // Configure Skill recyclerView competency progress
        binding.rvSkills.layoutManager = LinearLayoutManager(requireContext())
        binding.rvSkills.adapter = SkillCompetencyAdapter(data.skills ?: emptyList())

        // Configure LineChart for Projected growth demand index
        setupGrowthLineChart(binding.chartGrowth, data.demand_score ?: 85f)
    }

    private fun setupSalaryBarChart(chart: BarChart, min: Int, max: Int) {
        chart.description.isEnabled = false
        chart.legend.isEnabled = false
        chart.setDrawGridBackground(false)

        // Salary Entries
        val entries = listOf(
            BarEntry(0f, min.toFloat() / 100000f),
            BarEntry(1f, (min + max).toFloat() / 200000f),
            BarEntry(2f, max.toFloat() / 100000f)
        )

        val dataSet = BarDataSet(entries, "Salary Distribution").apply {
            colors = listOf(
                Color.parseColor("#7B2FBE"), // Entry: Violet
                Color.parseColor("#9D4EDD"), // Mid: Bright Violet
                Color.parseColor("#00D4FF")  // Lead: Luminous Cyan
            )
            valueTextColor = Color.parseColor("#F8F8FF")
            valueTextSize = 10f
        }

        chart.data = BarData(dataSet)

        val labels = listOf("Entry", "Average", "Lead")
        chart.xAxis.apply {
            valueFormatter = IndexAxisValueFormatter(labels)
            textColor = Color.parseColor("#A8A8C8")
            position = com.github.mikephil.charting.components.XAxis.XAxisPosition.BOTTOM
            setDrawGridLines(false)
        }

        chart.axisLeft.apply {
            textColor = Color.parseColor("#A8A8C8")
            axisMinimum = 0f
            setDrawGridLines(true)
            gridColor = Color.parseColor("#FFFFFF14")
        }

        chart.axisRight.isEnabled = false
        chart.invalidate()
    }

    private fun setupGrowthLineChart(chart: LineChart, baseDemand: Float) {
        chart.description.isEnabled = false
        chart.legend.isEnabled = false
        chart.setDrawGridBackground(false)

        val entries = listOf(
            Entry(2023f, baseDemand - 12f),
            Entry(2024f, baseDemand - 6f),
            Entry(2025f, baseDemand),
            Entry(2026f, baseDemand + 8f),
            Entry(2027f, baseDemand + 15f)
        )

        val dataSet = LineDataSet(entries, "Demand Growth").apply {
            color = Color.parseColor("#00D4FF") // Cyan Timeline Line
            valueTextColor = Color.parseColor("#A8A8C8")
            valueTextSize = 10f
            lineWidth = 3f
            setDrawCircles(true)
            setCircleColor(Color.parseColor("#00D4FF"))
            circleRadius = 4f
            setDrawFilled(true)
            fillColor = Color.parseColor("#00D4FF")
            fillAlpha = 25
        }

        chart.data = LineData(dataSet)

        chart.xAxis.apply {
            valueFormatter = IndexAxisValueFormatter(listOf("2023", "2024", "2025", "2026", "2027"))
            textColor = Color.parseColor("#A8A8C8")
            position = com.github.mikephil.charting.components.XAxis.XAxisPosition.BOTTOM
            setDrawGridLines(false)
        }

        chart.axisLeft.apply {
            textColor = Color.parseColor("#A8A8C8")
            setDrawGridLines(true)
            gridColor = Color.parseColor("#FFFFFF14")
        }

        chart.axisRight.isEnabled = false
        chart.invalidate()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // Nested Skill adapter class
    inner class SkillCompetencyAdapter(
        private val list: List<CareerSkillDto>
    ) : RecyclerView.Adapter<SkillCompetencyAdapter.SkillViewHolder>() {

        inner class SkillViewHolder(private val itemBinding: ItemCareerSkillBinding) :
            RecyclerView.ViewHolder(itemBinding.root) {
            fun bind(item: CareerSkillDto) {
                itemBinding.tvSkillName.text = item.name
                val valProficiency = (50..95).random()
                itemBinding.pbProficiency.progress = valProficiency
                itemBinding.tvProficiencyVal.text = "${valProficiency}%"
                
                val iconResId = when {
                    item.name.contains("Kotlin", ignoreCase = true) -> R.drawable.ic_kotlin
                    item.name.contains("Android", ignoreCase = true) || item.name.contains("Architecture", ignoreCase = true) -> R.drawable.ic_android
                    item.name.contains("Compose", ignoreCase = true) -> R.drawable.ic_compose
                    item.name.contains("Flow", ignoreCase = true) || item.name.contains("Coroutine", ignoreCase = true) || item.name.contains("Asynchronous", ignoreCase = true) -> R.drawable.ic_code
                    item.name.contains("Gradle", ignoreCase = true) || item.name.contains("Build", ignoreCase = true) -> R.drawable.ic_elephant
                    item.name.contains("Testing", ignoreCase = true) || item.name.contains("Test", ignoreCase = true) -> R.drawable.ic_beaker
                    else -> R.drawable.ic_code
                }
                itemBinding.ivSkillIcon.setImageResource(iconResId)
                
                val tintColor = when (iconResId) {
                    R.drawable.ic_kotlin -> Color.parseColor("#FF5B00")
                    R.drawable.ic_android -> Color.parseColor("#00FFCC")
                    R.drawable.ic_compose -> Color.parseColor("#22D3EE")
                    R.drawable.ic_code -> Color.parseColor("#A78BFA")
                    R.drawable.ic_elephant -> Color.parseColor("#10B981")
                    R.drawable.ic_beaker -> Color.parseColor("#F43F5E")
                    else -> Color.parseColor("#9D99B8")
                }
                itemBinding.ivSkillIcon.setColorFilter(tintColor)
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SkillViewHolder {
            val itemBinding = ItemCareerSkillBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return SkillViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: SkillViewHolder, position: Int) {
            holder.bind(list[position])
        }

        override fun getItemCount() = list.size
    }
}
