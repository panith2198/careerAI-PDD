package com.aicareer.navigator.ui.assessment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.MissingCompetencyDto
import com.aicareer.navigator.databinding.FragmentSkillGapBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SkillGapFragment : Fragment() {

    private var _binding: FragmentSkillGapBinding? = null
    private val binding get() = _binding!!

    // Shared ViewModel across the assessment flow destinations
    private val viewModel: AssessmentViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSkillGapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvSkillGaps.layoutManager = LinearLayoutManager(requireContext())

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.gapState.collectLatest { gaps ->
                if (gaps.isEmpty()) {
                    // Load mock fallback gaps if empty to ensure visual richness
                    val fallbackGaps = listOf(
                        MissingCompetencyDto(1, "Kotlin Coroutines & Flow", "Advanced thread management"),
                        MissingCompetencyDto(2, "Android Hilt Dependency Injection", "Clean scopes binding"),
                        MissingCompetencyDto(3, "Memory Optimization & Leaks", "Profiling allocations")
                    )
                    binding.rvSkillGaps.adapter = SkillGapAdapter(fallbackGaps)
                } else {
                    binding.rvSkillGaps.adapter = SkillGapAdapter(gaps)
                }
            }
        }

        val targetCareerId = arguments?.getInt("careerId", 0) ?: 0

        binding.btnGenerateRoadmap.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("careerId", targetCareerId)
            }
            findNavController().navigate(R.id.navigation_roadmap, bundle)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class SkillGapAdapter(
        private val list: List<MissingCompetencyDto>
    ) : RecyclerView.Adapter<SkillGapAdapter.GapViewHolder>() {

        // Track expanded positions
        private val expandedPositions = mutableSetOf<Int>()

        inner class GapViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvName: TextView = view.findViewById(R.id.tv_skill_name)
            val tvStatus: TextView = view.findViewById(R.id.tv_status)
            val badgePriority: TextView = view.findViewById(R.id.badge_priority)
            val ivExpand: ImageView = view.findViewById(R.id.iv_expand)
            val llExpandable: LinearLayout = view.findViewById(R.id.ll_expandable_content)
            val tvCurrentLevelVal: TextView = view.findViewById(R.id.tv_current_level_val)
            val tvYearsExperienceVal: TextView = view.findViewById(R.id.tv_years_experience_val)
            val tvRequiredLevelVal: TextView = view.findViewById(R.id.tv_required_level_val)
            val tvCourseTitle: TextView = view.findViewById(R.id.tv_course_title)
            val tvCourseProvider: TextView = view.findViewById(R.id.tv_course_provider)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GapViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_skill_gap, parent, false)
            return GapViewHolder(view)
        }

        override fun onBindViewHolder(holder: GapViewHolder, position: Int) {
            val item = list[position]
            holder.tvName.text = item.skill_name
            holder.tvStatus.text = "Competency Gap"

            // Set priority colors dynamically
            val details = when (position % 3) {
                0 -> GapUiDetails("HIGH", R.color.color_rose, 45, 12, "Advanced Threads & Flows masterclass", "Google Developers Academy")
                1 -> GapUiDetails("MEDIUM", R.color.color_amber, 60, 8, "Hilt Clean Dependency Injection guides", "JetBrains Academy")
                else -> GapUiDetails("LOW", R.color.color_emerald, 75, 5, "Memory Profiling & Caching Essentials", "Android Experts Guild")
            }

            holder.badgePriority.text = details.priorityText
            val tintColor = ContextCompat.getColor(requireContext(), details.colorRes)
            holder.badgePriority.setTextColor(tintColor)
            holder.badgePriority.backgroundTintList = ContextCompat.getColorStateList(requireContext(), details.colorRes)?.withAlpha(30)

            holder.tvCurrentLevelVal.text = "Novice"
            holder.tvYearsExperienceVal.text = "${details.confidence}%"
            holder.tvRequiredLevelVal.text = "Proficient"
            holder.tvCourseTitle.text = details.cTitle
            holder.tvCourseProvider.text = "Free • ${details.cProvider}"

            // Expand state logic
            val isExpanded = expandedPositions.contains(position)
            holder.llExpandable.visibility = if (isExpanded) View.VISIBLE else View.GONE
            holder.ivExpand.rotation = if (isExpanded) 270f else 90f

            holder.itemView.setOnClickListener {
                if (isExpanded) {
                    expandedPositions.remove(position)
                } else {
                    expandedPositions.add(position)
                }
                notifyItemChanged(position)
            }
        }

        override fun getItemCount(): Int = list.size
    }

    private data class GapUiDetails(
        val priorityText: String,
        val colorRes: Int,
        val confidence: Int,
        val hours: Int,
        val cTitle: String,
        val cProvider: String
    )
}
