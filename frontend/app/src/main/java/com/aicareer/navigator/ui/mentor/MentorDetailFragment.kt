package com.aicareer.navigator.ui.mentor

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.AvailabilitySlotDto
import com.aicareer.navigator.databinding.FragmentMentorDetailBinding
import com.bumptech.glide.Glide
import com.google.android.material.chip.Chip
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MentorDetailFragment : Fragment() {

    private var _binding: FragmentMentorDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MentorViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMentorDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupToolbar()
        observeMentorDetail()
        setupBookingButton()
        applyEntranceAnimations()
    }

    private fun setupToolbar() {
        binding.toolbar.setNavigationOnClickListener {
            findNavController().popBackStack()
        }
    }

    private fun observeMentorDetail() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.mentorDetailState.collectLatest { state ->
                when (state) {
                    is MentorDetailUiState.Loading -> {
                        // Show loading state (could add shimmer here)
                    }
                    is MentorDetailUiState.Success -> {
                        bindMentorDetail(state.mentor)
                    }
                    is MentorDetailUiState.Error -> {
                        binding.tvBio.text = state.message
                    }
                }
            }
        }
    }

    private fun bindMentorDetail(mentor: com.aicareer.navigator.data.remote.MentorDetailDto) {
        // Header
        binding.tvName.text = mentor.full_name
        binding.tvDesignation.text = mentor.designation ?: "Senior Engineer"

        // Avatar with parallax effect
        Glide.with(this)
            .load(mentor.avatar_url)
            .placeholder(R.color.color_surface_3)
            .error(R.color.color_surface_2)
            .circleCrop()
            .into(binding.ivAvatar)

        // Stats row
        binding.tvRatingValue.text = "${mentor.rating ?: 0f}"
        binding.tvSessionsValue.text = "${mentor.total_sessions ?: 0}"
        binding.tvExperienceValue.text = "${mentor.years_experience ?: 0}y"

        val rate = mentor.hourly_rate ?: 0
        binding.tvRateValue.text = if (rate == 0) "FREE" else "₹$rate"

        // Bio
        binding.tvBio.text = mentor.bio ?: "No bio available."

        // Expertise chips
        binding.cgExpertise.removeAllViews()
        mentor.expertise?.forEach { skill ->
            val chip = Chip(requireContext()).apply {
                text = skill
                textSize = 12f
                setTextColor(ContextCompat.getColor(context, R.color.color_text_primary))
                chipBackgroundColor = ContextCompat.getColorStateList(context, R.color.color_surface_3)
                chipStrokeColor = ContextCompat.getColorStateList(context, R.color.color_border_violet)
                chipStrokeWidth = 1f
                chipCornerRadius = 100f
                isClickable = false
                chipMinHeight = 32f
            }
            binding.cgExpertise.addView(chip)
        }

        // PRO Badge
        binding.cardProBadge.visibility = if (mentor.is_pro == true) View.VISIBLE else View.GONE

        // Availability preview
        bindAvailabilityPreview(mentor.availability_slots ?: emptyList())

        // Bottom bar
        binding.tvBottomRate.text = if (rate == 0) "FREE" else "₹$rate/hr"
        val availableCount = mentor.availability_slots?.count { it.is_available } ?: 0
        binding.tvBottomAvailability.text = "$availableCount slots available"
    }

    private fun bindAvailabilityPreview(slots: List<AvailabilitySlotDto>) {
        binding.llAvailabilityPreview.removeAllViews()

        if (slots.isEmpty()) {
            val emptyText = TextView(requireContext()).apply {
                text = "No availability data yet."
                setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
                textSize = 13f
            }
            binding.llAvailabilityPreview.addView(emptyText)
            return
        }

        // Group slots by day and show first 5 days
        val grouped = slots.groupBy { it.day }
        grouped.entries.take(5).forEach { (day, daySlots) ->
            val rowView = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 0, 0, 10) }
            }

            // Day label
            val dayLabel = TextView(requireContext()).apply {
                text = day.uppercase()
                textSize = 11f
                typeface = android.graphics.Typeface.MONOSPACE
                setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
                layoutParams = LinearLayout.LayoutParams(56, LinearLayout.LayoutParams.WRAP_CONTENT)
            }
            rowView.addView(dayLabel)

            // Slot pills
            daySlots.forEach { slot ->
                val pill = TextView(requireContext()).apply {
                    text = slot.time
                    textSize = 10f
                    typeface = android.graphics.Typeface.MONOSPACE
                    setPadding(12, 6, 12, 6)

                    if (slot.is_available) {
                        setTextColor(ContextCompat.getColor(requireContext(), R.color.color_emerald))
                        setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_emerald_dim))
                    } else {
                        setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
                        setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))
                    }

                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { setMargins(4, 0, 4, 0) }
                }
                rowView.addView(pill)
            }

            binding.llAvailabilityPreview.addView(rowView)
        }
    }

    private fun setupBookingButton() {
        binding.btnBookSession.setOnClickListener {
            // Scale press animation per design.md
            it.animate().scaleX(0.96f).scaleY(0.96f).setDuration(100)
                .withEndAction {
                    it.animate().scaleX(1f).scaleY(1f).setDuration(150).start()
                    findNavController().navigate(R.id.action_detail_to_booking)
                }.start()
        }
    }

    private fun applyEntranceAnimations() {
        // Avatar scale-in
        binding.ivAvatar.scaleX = 0.8f
        binding.ivAvatar.scaleY = 0.8f
        binding.ivAvatar.alpha = 0f
        binding.ivAvatar.animate()
            .scaleX(1f).scaleY(1f).alpha(1f)
            .setDuration(450)
            .setStartDelay(100)
            .start()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
