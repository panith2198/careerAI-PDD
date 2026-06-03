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
import com.aicareer.navigator.data.remote.CareerGraphResponse
import com.aicareer.navigator.databinding.FragmentCareerPathBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CareerPathFragment : Fragment() {

    private var _binding: FragmentCareerPathBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CareerViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCareerPathBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvMilestones.layoutManager = LinearLayoutManager(requireContext())

        // Load dynamic Dijkstra path from "Android Developer" to "Android Platform Architect"
        viewModel.loadCareerPath("Android Developer", "Android Platform Architect")

        // Observe
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.careerPathState.collectLatest { state ->
                when (state) {
                    is CareerPathState.Loading -> {
                        binding.tvDesc.text = "Loading transition roadmap metrics..."
                    }
                    is CareerPathState.Success -> {
                        bindPathData(state.path)
                    }
                    is CareerPathState.Error -> {
                        binding.tvDesc.text = "Failed to load dynamic transitions."
                    }
                    else -> {}
                }
            }
        }
    }

    private fun bindPathData(data: CareerGraphResponse) {
        binding.tvDesc.text = "Visualizing transition with ${data.hops} hops. Transition difficulty metric: ${data.total_weight}."
        val stepsList = data.path ?: emptyList()
        binding.rvMilestones.adapter = PathProgressAdapter(stepsList)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class PathProgressAdapter(
        private val list: List<String>
    ) : RecyclerView.Adapter<PathProgressAdapter.PathViewHolder>() {

        inner class PathViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val tvStep: TextView = view.findViewById(R.id.tv_step)
            val tvTitle: TextView = view.findViewById(R.id.tv_title)
            val tvDesc: TextView = view.findViewById(R.id.tv_desc)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PathViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_milestone, parent, false)
            return PathViewHolder(view)
        }

        override fun onBindViewHolder(holder: PathViewHolder, position: Int) {
            val item = list[position]
            holder.tvStep.text = "STEP ${position + 1} OF ${list.size}"
            holder.tvTitle.text = item
            holder.tvDesc.text = "Required skills: Kotlin, System Optimization, Clean Architecture models."
            
            holder.itemView.setOnClickListener {
                // Tapping navigates back or refreshes detail screen
                findNavController().navigate(R.id.navigation_career)
            }
        }

        override fun getItemCount(): Int = list.size
    }
}
