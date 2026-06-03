package com.aicareer.navigator.ui.assessment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.AssessmentDto
import com.aicareer.navigator.databinding.FragmentAssessmentListBinding
import com.aicareer.navigator.databinding.ItemAssessmentCardBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AssessmentListFragment : Fragment() {

    private var _binding: FragmentAssessmentListBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AssessmentViewModel by activityViewModels()
    private var allAssessments = listOf<AssessmentDto>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAssessmentListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvAssessments.layoutManager = LinearLayoutManager(requireContext())

        val careerId = arguments?.getInt("careerId")
        if (careerId != null && careerId != 0) {
            viewModel.loadAssessments(careerId)
        } else {
            viewModel.loadAssessments()
        }

        // Clicks dynamic chip filters
        binding.chipAll.setOnClickListener { filterList("") }
        binding.chipKotlin.setOnClickListener { filterList("Kotlin") }
        binding.chipArchitecture.setOnClickListener { filterList("Architecture") }

        // State flows
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.assessmentListState.collectLatest { state ->
                when (state) {
                    is AssessmentListUiState.Loading -> {
                        binding.tvDesc.text = "Loading dynamic quiz profiles from database cache..."
                    }
                    is AssessmentListUiState.Success -> {
                        binding.tvDesc.text = "Evaluate your skills, generate gap analysis, and receive tailored roadmaps."
                        allAssessments = state.list
                        filterList("") // default shows all
                    }
                    is AssessmentListUiState.Error -> {
                        binding.tvDesc.text = "Failed to load skills assessments."
                    }
                }
            }
        }
    }

    private fun filterList(keyword: String) {
        val filtered = if (keyword.isEmpty()) {
            allAssessments
        } else {
            allAssessments.filter { it.title.contains(keyword, ignoreCase = true) }
        }

        if (filtered.isEmpty()) {
            binding.tvEmptyState.visibility = View.VISIBLE
            binding.rvAssessments.visibility = View.GONE
        } else {
            binding.tvEmptyState.visibility = View.GONE
            binding.rvAssessments.visibility = View.VISIBLE
        }

        binding.rvAssessments.adapter = AssessmentAdapter(filtered) { assessment ->
            val bundle = Bundle().apply {
                putInt("assessmentId", assessment.assessment_id)
                putInt("careerId", assessment.career_id ?: 0)
            }
            findNavController().navigate(R.id.action_assessment_to_quiz, bundle)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class AssessmentAdapter(
        private val list: List<AssessmentDto>,
        private val onClick: (AssessmentDto) -> Unit
    ) : RecyclerView.Adapter<AssessmentAdapter.AssessmentViewHolder>() {

        inner class AssessmentViewHolder(private val itemBinding: ItemAssessmentCardBinding) :
            RecyclerView.ViewHolder(itemBinding.root) {
            fun bind(item: AssessmentDto) {
                itemBinding.tvTitle.text = item.title
                itemBinding.tvDesc.text = "Adaptive assessment mapping ${item.total_questions} MLE criteria."
                itemBinding.tvQuestionsCount.text = "${item.total_questions} Qs"
                itemBinding.tvTimeLimit.text = "${item.time_limit_minutes} mins"
                itemBinding.tvDifficulty.text = (item.difficulty ?: "MEDIUM").uppercase()

                // Dynamically load tech logo icons based on keyword matching
                val titleLower = item.title.lowercase()
                val logoRes = when {
                    titleLower.contains("kotlin") -> R.drawable.ic_kotlin
                    titleLower.contains("android") -> R.drawable.ic_android
                    titleLower.contains("devops") -> R.drawable.ic_rocket
                    else -> R.drawable.ic_code
                }
                itemBinding.ivAssessmentLogo.setImageResource(logoRes)

                itemBinding.btnStart.setOnClickListener { onClick(item) }
                itemBinding.root.setOnClickListener { onClick(item) }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AssessmentViewHolder {
            val itemBinding = ItemAssessmentCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return AssessmentViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: AssessmentViewHolder, position: Int) {
            holder.bind(list[position])
        }

        override fun getItemCount(): Int = list.size
    }
}
