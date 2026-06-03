package com.aicareer.navigator.ui.home

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.LayerDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.graphics.ColorUtils
import androidx.core.widget.NestedScrollView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.CareerDto
import com.aicareer.navigator.data.remote.JobDto
import com.aicareer.navigator.databinding.DashboardCareerCardBinding
import com.aicareer.navigator.databinding.FragmentHomeBinding
import com.aicareer.navigator.databinding.ItemJobBinding
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.google.android.material.chip.Chip
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels()
    private var activeCareerId: Int = 0

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Floating Toolbar Scroll Listener (fades to solid color_surface_1 + grid background)
        val density = resources.displayMetrics.density
        val scrollLimit = 120 * density
        binding.nestedScroll.setOnScrollChangeListener(NestedScrollView.OnScrollChangeListener { _, _, scrollY, _, _ ->
            val ratio = (scrollY.toFloat() / scrollLimit).coerceIn(0f, 1f)
            
            // Build dynamic LayerDrawable (Color + Grid)
            val surfaceColor = ContextCompat.getColor(requireContext(), R.color.color_surface_1)
            val colorDrawable = ColorDrawable(surfaceColor).apply { alpha = (ratio * 255).toInt() }
            val gridDrawable = ContextCompat.getDrawable(requireContext(), R.drawable.bg_grid)?.apply { 
                alpha = (ratio * 255).toInt() 
            }
            val layerDrawable = if (gridDrawable != null) {
                LayerDrawable(arrayOf(colorDrawable, gridDrawable))
            } else {
                colorDrawable
            }
            
            binding.toolbarFloating.background = layerDrawable
            binding.tvToolbarTitleLeft.alpha = ratio
            binding.btnBellToolbar.alpha = ratio
        })

        // Clicks Setup
        binding.btnActionMilestone.setOnClickListener {
            val bundle = Bundle().apply {
                if (activeCareerId != 0) {
                    putInt("careerId", activeCareerId)
                }
            }
            findNavController().navigate(R.id.navigation_roadmap, bundle)
        }

        binding.btnExploreCareers.setOnClickListener {
            findNavController().navigate(R.id.navigation_career)
        }

        binding.btnChatAi.setOnClickListener {
            findNavController().navigate(R.id.navigation_chat)
        }

        binding.btnJobs.setOnClickListener {
            findNavController().navigate(R.id.navigation_jobs)
        }

        binding.btnAssessments.setOnClickListener {
            findNavController().navigate(R.id.navigation_assessment)
        }

        binding.btnBell.setOnClickListener {
            findNavController().navigate(R.id.navigation_notifications)
        }

        binding.btnBellToolbar.setOnClickListener {
            findNavController().navigate(R.id.navigation_notifications)
        }

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.refreshData()
        }

        // Observe State
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.dashboardState.collectLatest { state ->
                when (state) {
                    is DashboardUiState.Loading -> {
                        binding.shimmerView.startShimmer()
                        binding.shimmerView.visibility = View.VISIBLE
                        binding.layoutContent.visibility = View.GONE
                        binding.swipeRefresh.isRefreshing = false
                    }
                    is DashboardUiState.Success -> {
                        binding.shimmerView.stopShimmer()
                        binding.shimmerView.visibility = View.GONE
                        binding.layoutContent.visibility = View.VISIBLE
                        binding.swipeRefresh.isRefreshing = false
                        bindDashboardData(state.data)
                    }
                    is DashboardUiState.Error -> {
                        binding.shimmerView.stopShimmer()
                        binding.shimmerView.visibility = View.GONE
                        binding.layoutContent.visibility = View.VISIBLE
                        binding.swipeRefresh.isRefreshing = false
                    }
                }
            }
        }
    }

    private fun bindDashboardData(data: DashboardData) {
        // Set dynamic greeting name
        val name = data.userMe?.full_name ?: "Eswar"
        binding.tvGreeting.text = "Welcome Back, $name"

        // Dynamic target career fit donut chart setup
        val activeCareerName = data.careers.firstOrNull()?.title ?: "Android Platform Architect"
        binding.tvTargetCareerName.text = activeCareerName

        // Setup Donut
        setupDonutChart(binding.chartFitDonut, 95f)

        // Career match recyclerview binder
        binding.rvCareerMatches.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        binding.rvCareerMatches.adapter = CareerAdapter(data.careers) {
            findNavController().navigate(R.id.navigation_career)
        }

        // Active roadmap learning progress
        val activeRoadmap = data.roadmapPct.firstOrNull()
        if (activeRoadmap != null) {
            binding.tvRoadmapTitle.text = activeRoadmap.title
            binding.pbRoadmap.progress = activeRoadmap.completion_pct.toInt()
            binding.tvRoadmapPct.text = "${activeRoadmap.completion_pct}%"
            activeCareerId = activeRoadmap.career_id ?: 0
        } else {
            activeCareerId = 0
        }

        // Job list binder
        binding.rvRecentJobs.layoutManager = LinearLayoutManager(requireContext())
        binding.rvRecentJobs.adapter = JobsAdapter(data.jobs) {
            findNavController().navigate(R.id.navigation_jobs)
        }
    }

    private fun setupDonutChart(chart: PieChart, score: Float) {
        chart.description.isEnabled = false
        chart.legend.isEnabled = false
        chart.isDrawHoleEnabled = true
        chart.setHoleColor(Color.TRANSPARENT)
        chart.setTransparentCircleColor(Color.TRANSPARENT)
        chart.setTransparentCircleAlpha(0)
        chart.holeRadius = 78f
        chart.setDrawCenterText(true)
        chart.centerText = "${score.toInt()}%\nFIT SCORE"
        chart.setCenterTextColor(Color.parseColor("#F8F8FF"))
        chart.setCenterTextSize(15f)

        val entries = listOf(
            PieEntry(score),
            PieEntry(100f - score)
        )

        val dataSet = PieDataSet(entries, "Career Compatibility").apply {
            colors = listOf(
                Color.parseColor("#22D3EE"), // Luminous Cyan
                Color.parseColor("#FFFFFF14") // 8% white spacer background
            )
            setDrawValues(false)
            sliceSpace = 0f
        }

        chart.data = PieData(dataSet)
        chart.invalidate()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // Horizontal Career Matches Adapter
    inner class CareerAdapter(
        private val list: List<CareerDto>,
        private val onClick: () -> Unit
    ) : RecyclerView.Adapter<CareerAdapter.CareerViewHolder>() {

        inner class CareerViewHolder(private val itemBinding: DashboardCareerCardBinding) :
            RecyclerView.ViewHolder(itemBinding.root) {
            fun bind(item: CareerDto) {
                itemBinding.tvTitle.text = item.title
                itemBinding.tvFitScore.text = "${(80..98).random()}% FIT"
                itemBinding.tvSalary.text = "₹${(item.avg_salary_min ?: 800000) / 100000}L - ₹${(item.avg_salary_max ?: 1600000) / 100000}L/yr"

                itemBinding.cgSkills.removeAllViews()
                val skills = listOf("Kotlin", "Jetpack Compose", "Coroutines", "Dagger Hilt")
                skills.take(3).forEach { skill ->
                    val chip = Chip(requireContext()).apply {
                        text = skill
                        setTextColor(Color.parseColor("#A8A8C8"))
                        setChipBackgroundColorResource(R.color.color_surface_3)
                        chipStrokeWidth = 0f
                        textSize = 10f
                    }
                    itemBinding.cgSkills.addView(chip)
                }

                itemBinding.btnExplore.setOnClickListener { onClick() }
                itemBinding.root.setOnClickListener { onClick() }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CareerViewHolder {
            val itemBinding = DashboardCareerCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return CareerViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: CareerViewHolder, position: Int) {
            holder.bind(list[position])
        }

        override fun getItemCount() = list.size
    }

    // Recent Jobs Adapter
    inner class JobsAdapter(
        private val list: List<JobDto>,
        private val onClick: () -> Unit
    ) : RecyclerView.Adapter<JobsAdapter.JobViewHolder>() {

        inner class JobViewHolder(private val itemBinding: ItemJobBinding) :
            RecyclerView.ViewHolder(itemBinding.root) {
            fun bind(item: JobDto) {
                itemBinding.tvTitle.text = item.title
                itemBinding.tvCompany.text = item.company ?: "Tech Corp"
                itemBinding.tvLocation.text = item.location ?: "Remote"
                itemBinding.tvMatch.text = "${(item.match_score ?: 90f).toInt()}% MATCH"
                itemBinding.tvSalary.text = "₹${(item.salary_min ?: 1200000) / 100000}L - ₹${(item.salary_max ?: 2200000) / 100000}L/yr"
                itemBinding.root.setOnClickListener { onClick() }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JobViewHolder {
            val itemBinding = ItemJobBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return JobViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: JobViewHolder, position: Int) {
            holder.bind(list[position])
        }

        override fun getItemCount() = list.size
    }
}
