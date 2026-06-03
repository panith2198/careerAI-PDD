package com.aicareer.navigator.ui.jobs

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentJobDetailBinding
import com.google.android.material.chip.Chip
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class JobDetailFragment : Fragment() {

    private var _binding: FragmentJobDetailBinding? = null
    private val binding get() = _binding!!

    // Shared Activity-scoped ViewModel to synchronize status updates reactively
    private val viewModel: JobsViewModel by activityViewModels()
    private var jobId: Int = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Retrieve jobId from arguments/SafeArgs. Defaulting to 1 if none found.
        jobId = arguments?.getInt("jobId") ?: 1
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJobDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup Toolbar back button
        binding.toolbar.setNavigationOnClickListener {
            findNavController().popBackStack()
        }
        binding.btnShare.setOnClickListener {
            Toast.makeText(requireContext(), "Share link ready for this role.", Toast.LENGTH_SHORT).show()
        }
        binding.btnSave.setOnClickListener {
            Toast.makeText(requireContext(), "Job updates enabled.", Toast.LENGTH_SHORT).show()
        }

        // Setup expandable AI Tips panel click listener with rotation animation
        setupTipsExpandable()

        // Load details for this job
        viewModel.loadJobDetail(jobId)

        // Bind observers to shared ViewModel details state
        observeJobDetail()
    }

    private fun setupTipsExpandable() {
        binding.rlTipsHeader.setOnClickListener {
            val isExpanded = binding.llTipsExpanded.visibility == View.VISIBLE
            if (isExpanded) {
                binding.llTipsExpanded.visibility = View.GONE
                binding.ivTipsArrow.animate().rotation(0f).setDuration(200).start()
            } else {
                binding.llTipsExpanded.visibility = View.VISIBLE
                binding.ivTipsArrow.animate().rotation(180f).setDuration(200).start()
            }
        }
    }

    private fun observeJobDetail() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.jobDetailState.collectLatest { state ->
                when (state) {
                    is JobDetailUiState.Loading -> {
                        binding.tvTitle.text = "Loading details..."
                    }
                    is JobDetailUiState.Success -> {
                        val detail = state.detail
                        bindJobDetail(detail)
                    }
                    is JobDetailUiState.Error -> {
                        Toast.makeText(requireContext(), "Error: ${state.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun bindJobDetail(detail: JobDetail) {
        binding.tvTitle.text = detail.title
        binding.collapsingToolbar.title = detail.title
        binding.tvCompanyLoc.text = "${detail.company} • ${detail.location}"
        binding.tvMatch.text = "${detail.match_score.toInt()}% MATCH"
        binding.tvSalary.text = "\u20B9${detail.salary_min}L - \u20B9${detail.salary_max}L/yr"
        binding.tvDesc.text = detail.description.substringBefore("###").trim()

        // Highlight matching skills in Emerald and non-matching in gray/tertiary colors
        binding.cgSkills.removeAllViews()
        detail.required_skills.forEach { skill ->
            val isMatched = detail.matched_skills.contains(skill)
            val chip = Chip(requireContext()).apply {
                text = skill
                setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_primary))
                chipStrokeWidth = 1f
                
                if (isMatched) {
                    chipBackgroundColor = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald_dim)
                    chipStrokeColor = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                } else {
                    chipBackgroundColor = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                    chipStrokeColor = ContextCompat.getColorStateList(requireContext(), R.color.color_border)
                }
            }
            binding.cgSkills.addView(chip)
        }

        // Bind AI Tips bullet list representation
        val tipsText = detail.interview_tips.joinToString("\n\n") { "• $it" }
        binding.tvTipsContent.text = tipsText

        // Save toggle state rendering
        updateSaveButtonVisuals(viewModel.isJobSaved(detail.job_id))

        binding.btnTopSave.setOnClickListener {
            // Re-fetch simple representation
            val jobRepresentation = com.aicareer.navigator.data.remote.JobDto(
                job_id = detail.job_id,
                title = detail.title,
                company = detail.company,
                location = detail.location,
                salary_min = detail.salary_min,
                salary_max = detail.salary_max,
                match_score = detail.match_score
            )
            viewModel.toggleSaveJob(jobRepresentation)
            updateSaveButtonVisuals(viewModel.isJobSaved(detail.job_id))
            Toast.makeText(
                requireContext(),
                if (viewModel.isJobSaved(detail.job_id)) "Added to bookmarks!" else "Removed from bookmarks!",
                Toast.LENGTH_SHORT
            ).show()
        }

        // Dynamic apply states rendering
        if (detail.applicationStatus == "APPLIED" || detail.applicationStatus == "UNDER REVIEW") {
            binding.btnApply.text = "Applied"
            binding.btnApply.isEnabled = false
            binding.btnApply.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))
            binding.btnApply.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
        } else {
            binding.btnApply.text = "Apply Now"
            binding.btnApply.isEnabled = true
            binding.btnApply.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary)
            binding.btnApply.setOnClickListener {
                // Apply directly and transition into Applied pipeline list representation
                viewModel.applyToJob(detail.job_id)
                Toast.makeText(requireContext(), "Application submitted successfully!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateSaveButtonVisuals(isSaved: Boolean) {
        if (isSaved) {
            binding.btnTopSave.setIconResource(R.drawable.ic_bookmark)
            binding.btnTopSave.iconTint = ContextCompat.getColorStateList(requireContext(), R.color.color_primary_bright)
        } else {
            binding.btnTopSave.setIconResource(R.drawable.ic_bookmark)
            binding.btnTopSave.iconTint = ContextCompat.getColorStateList(requireContext(), R.color.color_text_secondary)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
