package com.aicareer.navigator.ui.jobs

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentApplicationsBinding
import com.aicareer.navigator.databinding.ItemJobCardBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ApplicationsFragment : Fragment() {

    private var _binding: FragmentApplicationsBinding? = null
    private val binding get() = _binding!!

    // Shared Activity-scoped ViewModel
    private val viewModel: JobsViewModel by activityViewModels()
    private lateinit var adapter: ApplicationsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentApplicationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        observeApplications()
    }

    private fun setupRecyclerView() {
        binding.rvApplications.layoutManager = LinearLayoutManager(requireContext())
        adapter = ApplicationsAdapter(emptyList()) { jobDetail ->
            // Click listener navigates directly to Job Details
            val bundle = Bundle().apply {
                putInt("jobId", jobDetail.job_id)
            }
            findNavController().navigate(R.id.navigation_job_detail, bundle)
        }
        binding.rvApplications.adapter = adapter
    }

    private fun observeApplications() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.applicationsState.collectLatest { list ->
                adapter.updateData(list)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class ApplicationsAdapter(
        private var currentList: List<JobDetail>,
        private val onItemClick: (JobDetail) -> Unit
    ) : RecyclerView.Adapter<ApplicationsAdapter.AppViewHolder>() {

        inner class AppViewHolder(val binding: ItemJobCardBinding) :
            RecyclerView.ViewHolder(binding.root)

        fun updateData(newList: List<JobDetail>) {
            currentList = newList
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AppViewHolder {
            val binding = ItemJobCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return AppViewHolder(binding)
        }

        override fun onBindViewHolder(holder: AppViewHolder, position: Int) {
            val item = currentList[position]
            val binding = holder.binding

            binding.tvTitle.text = item.title
            binding.tvCompany.text = item.company
            binding.tvLocation.text = item.location
            binding.tvSalary.text = "\u20B9${item.salary_min}L - \u20B9${item.salary_max}L/yr"
            binding.tvSkillsPreview.text = "SKILLS:  ${item.matched_skills.take(4).joinToString("   ") { it.uppercase() }}   +2"

            // Applications use the trailing overflow action shown in the pipeline design.
            binding.btnSave.visibility = View.VISIBLE
            binding.btnSave.setIconResource(R.drawable.ic_jobs_more)
            binding.btnSave.isClickable = false

            // Style the Match/Status badge matching pipeline properties
            val status = item.applicationStatus ?: "APPLIED"
            binding.tvMatch.text = status

            when (status.uppercase()) {
                "APPLIED" -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_cyan_dim)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))
                }
                "UNDER REVIEW" -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_gold_dim)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_gold))
                }
                "INTERVIEWING", "INTERVIEW" -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_cyan_dim)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))
                }
                "OFFERED" -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald_dim)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_emerald))
                }
                "REJECTED" -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_rose_dim)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_rose))
                }
                else -> {
                    binding.tvMatch.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                    binding.tvMatch.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
                }
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }

        override fun getItemCount(): Int = currentList.size
    }
}
