package com.aicareer.navigator.ui.career

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.CareerRecommendDto
import com.aicareer.navigator.databinding.FragmentCareerRecommendBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CareerRecommendFragment : Fragment() {

    private var _binding: FragmentCareerRecommendBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CareerViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCareerRecommendBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvRecommendations.layoutManager = LinearLayoutManager(requireContext())

        // Fetch dynamic AI recommendations
        viewModel.generateRecommendations(forceRefresh = false)

        // Observe
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.recommendState.collectLatest { state ->
                when (state) {
                    is RecommendState.Loading -> {
                        binding.tvDesc.text = "Consulting AI model for fit indices..."
                    }
                    is RecommendState.Success -> {
                        binding.tvDesc.text = "Citations model: ${state.response.model_used}. Generated at: ${state.response.generated_at}"
                        binding.rvRecommendations.adapter = AIRecommendationsAdapter(state.response.careers ?: emptyList())
                    }
                    is RecommendState.Error -> {
                        binding.tvDesc.text = "AI consultation failed."
                    }
                    else -> {}
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class AIRecommendationsAdapter(
        private val list: List<CareerRecommendDto>
    ) : RecyclerView.Adapter<AIRecommendationsAdapter.RecommendViewHolder>() {

        private val expandedStates = MutableList(list.size) { false }

        inner class RecommendViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvTitle: TextView = view.findViewById(R.id.tv_title)
            val tvSalary: TextView = view.findViewById(R.id.tv_salary)
            val tvFitScore: TextView = view.findViewById(R.id.tv_fit_score)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecommendViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_career, parent, false)
            return RecommendViewHolder(view)
        }

        override fun onBindViewHolder(holder: RecommendViewHolder, position: Int) {
            val item = list[position]
            holder.tvTitle.text = item.title
            holder.tvFitScore.text = "${item.fit_score.toInt()}% FIT"

            val missingSkills = item.gap_skills?.get("missing") ?: emptyList()
            holder.tvSalary.text = if (expandedStates[position]) {
                "AI Reasoning: Overlap ratio is ${item.reasoning?.get("match_ratio")}. Gaps: ${missingSkills.joinToString()}"
            } else {
                "Click to expand AI reasoning & missing skill gaps."
            }

            holder.itemView.setOnClickListener {
                expandedStates[position] = !expandedStates[position]
                notifyItemChanged(position)
            }

            holder.itemView.setOnLongClickListener {
                findNavController().navigate(R.id.navigation_career)
                true
            }
        }

        override fun getItemCount(): Int = list.size
    }
}
