package com.aicareer.navigator.ui.jobs

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.JobDto
import com.aicareer.navigator.databinding.FragmentJobsBinding
import com.aicareer.navigator.databinding.ItemJobCardBinding
import com.google.android.material.tabs.TabLayoutMediator
import androidx.core.content.ContextCompat
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class JobsFragment : Fragment() {

    private var _binding: FragmentJobsBinding? = null
    private val binding get() = _binding!!

    // Shared Activity-scoped ViewModel to sync saved bookmarks across ViewPager2 lists in real-time!
    private val viewModel: JobsViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJobsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupViewPagerAndTabs()
        setupSearchTextWatcher()

        binding.btnFilter.setOnClickListener {
            Toast.makeText(requireContext(), "Filtering search criteria...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupViewPagerAndTabs() {
        val adapter = JobsPagerAdapter(this)
        binding.viewPager.adapter = adapter

        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> "All Jobs"
                1 -> "Saved"
                else -> "Applications"
            }
        }.attach()
    }

    private fun setupSearchTextWatcher() {
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.searchJobs(s?.toString() ?: "")
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private class JobsPagerAdapter(fragment: Fragment) : FragmentStateAdapter(fragment) {
        override fun getItemCount(): Int = 3

        override fun createFragment(position: Int): Fragment {
            return when (position) {
                0 -> JobListFragment.newInstance("ALL")
                1 -> SavedJobsFragment()
                else -> ApplicationsFragment()
            }
        }
    }
}

// Reusable dynamic List Fragment hosting different data subsets using the shared ViewModel
@AndroidEntryPoint
class JobListFragment : Fragment() {

    private val viewModel: JobsViewModel by activityViewModels()
    private var listType: String = "ALL"
    private var rvJobs: RecyclerView? = null

    companion object {
        fun newInstance(type: String): JobListFragment {
            return JobListFragment().apply {
                arguments = Bundle().apply {
                    putString("listType", type)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        listType = arguments?.getString("listType", "ALL") ?: "ALL"
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_jobs_list_sub, container, false)
        rvJobs = view.findViewById(R.id.rv_jobs_sub)
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        rvJobs?.layoutManager = LinearLayoutManager(requireContext())

        viewLifecycleOwner.lifecycleScope.launch {
            when (listType) {
                "ALL" -> {
                    viewModel.jobsState.collectLatest { state ->
                        if (state is JobsUiState.Success) {
                            bindAdapter(state.list)
                        }
                    }
                }
                "SAVED" -> {
                    viewModel.savedJobsState.collectLatest { list ->
                        bindAdapter(list)
                    }
                }
                "APPLICATIONS" -> {
                    viewModel.applicationsState.collectLatest { list ->
                        val mapped = list.map {
                            JobDto(
                                job_id = it.job_id,
                                title = it.title,
                                company = it.company,
                                location = it.location,
                                salary_min = it.salary_min,
                                salary_max = it.salary_max,
                                match_score = it.match_score
                            )
                        }
                        bindAdapter(mapped)
                    }
                }
            }
        }
    }

    private fun bindAdapter(list: List<JobDto>) {
        rvJobs?.adapter = JobListAdapter(list, { job ->
            viewModel.toggleSaveJob(job)
            rvJobs?.adapter?.notifyDataSetChanged()
        }, { job ->
            val bundle = Bundle().apply {
                putInt("jobId", job.job_id)
            }
            findNavController().navigate(R.id.action_jobs_to_detail, bundle)
        })
    }

    inner class JobListAdapter(
        private val list: List<JobDto>,
        private val onSaveClick: (JobDto) -> Unit,
        private val onItemClick: (JobDto) -> Unit
    ) : RecyclerView.Adapter<JobListAdapter.JobViewHolder>() {

        inner class JobViewHolder(val binding: ItemJobCardBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JobViewHolder {
            val binding = ItemJobCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return JobViewHolder(binding)
        }

        override fun onBindViewHolder(holder: JobViewHolder, position: Int) {
            val item = list[position]
            val binding = holder.binding

            binding.tvTitle.text = item.title
            binding.tvCompany.text = item.company ?: "Company"
            binding.tvLocation.text = item.location ?: "Location"
            binding.tvMatch.text = "${item.match_score?.toInt() ?: 80}% MATCH"
            binding.tvSalary.text = "\u20B9${item.salary_min ?: 10}L - \u20B9${item.salary_max ?: 18}L/yr"
            binding.tvSkillsPreview.text = when (item.job_id) {
                1 -> "SKILLS:  KOTLIN   COROUTINES   COMPOSE   HILT   +2"
                2 -> "SKILLS:  KOTLIN   JAVA   SPRING BOOT   DOCKER   +2"
                3 -> "SKILLS:  KOTLIN   ANDROID SDK   NDK   C++   +2"
                else -> "SKILLS:  KOTLIN   ANDROID UI   XML   FIGMA   +2"
            }

            // Save Toggle Icon visual state checks
            val isSaved = viewModel.isJobSaved(item.job_id)
            if (isSaved) {
                binding.btnSave.setIconResource(R.drawable.ic_jobs_more)
                binding.btnSave.iconTint = ContextCompat.getColorStateList(requireContext(), R.color.color_rose)
            } else {
                binding.btnSave.setIconResource(R.drawable.ic_jobs_more)
                binding.btnSave.iconTint = ContextCompat.getColorStateList(requireContext(), R.color.color_text_tertiary)
            }

            binding.btnSave.setOnClickListener {
                onSaveClick(item)
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }

        override fun getItemCount(): Int = list.size
    }
}
