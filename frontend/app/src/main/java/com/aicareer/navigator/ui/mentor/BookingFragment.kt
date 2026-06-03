package com.aicareer.navigator.ui.mentor

import android.content.Intent
import android.os.Bundle
import android.provider.CalendarContract
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.AvailabilitySlotDto
import com.aicareer.navigator.data.remote.MentorDetailDto
import com.aicareer.navigator.databinding.FragmentBookingBinding
import com.bumptech.glide.Glide
import com.google.android.material.card.MaterialCardView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class BookingFragment : Fragment() {

    private var _binding: FragmentBookingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MentorViewModel by activityViewModels()

    private var selectedDayIndex = 0
    private var allSlots: List<AvailabilitySlotDto> = emptyList()
    private var groupedSlots: Map<String, List<AvailabilitySlotDto>> = emptyMap()
    private var dayKeys: List<String> = emptyList()
    private var currentMentor: MentorDetailDto? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.resetBookingState()

        setupBackButton()
        setupConfirmButton()
        observeMentorDetail()
        observeSelectedSlot()
        observeBookingState()
    }

    private fun setupBackButton() {
        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }
    }

    private fun observeMentorDetail() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.mentorDetailState.collectLatest { state ->
                if (state is MentorDetailUiState.Success) {
                    currentMentor = state.mentor
                    bindMentorSummary(state.mentor)
                    allSlots = state.mentor.availability_slots ?: emptyList()
                    groupedSlots = allSlots.groupBy { it.day }
                    dayKeys = groupedSlots.keys.toList()
                    buildDaySelector()
                    showSlotsForDay(0)
                }
            }
        }
    }

    private fun bindMentorSummary(mentor: MentorDetailDto) {
        binding.tvMentorName.text = mentor.full_name
        val rate = mentor.hourly_rate ?: 0
        val rateText = if (rate == 0) "FREE" else "₹$rate/hr"
        binding.tvMentorRate.text = "$rateText • ⭐ ${mentor.rating ?: 0f}"

        Glide.with(this)
            .load(mentor.avatar_url)
            .placeholder(R.color.color_surface_3)
            .circleCrop()
            .into(binding.ivMentorAvatar)
    }

    private fun buildDaySelector() {
        binding.llDaySelector.removeAllViews()

        dayKeys.forEachIndexed { index, day ->
            val dayCard = MaterialCardView(requireContext()).apply {
                layoutParams = ViewGroup.MarginLayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply { setMargins(0, 0, 10, 0) }

                radius = 100f
                strokeWidth = if (index == selectedDayIndex) 2 else 1
                strokeColor = if (index == selectedDayIndex)
                    ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
                else
                    ContextCompat.getColor(requireContext(), R.color.color_border)

                setCardBackgroundColor(
                    if (index == selectedDayIndex)
                        ContextCompat.getColor(requireContext(), R.color.color_primary_dim)
                    else
                        ContextCompat.getColor(requireContext(), R.color.color_surface_3)
                )
                cardElevation = 0f
            }

            val slotsForDay = groupedSlots[day] ?: emptyList()
            val availableCount = slotsForDay.count { it.is_available }

            val dayText = TextView(requireContext()).apply {
                text = "$day ($availableCount)"
                textSize = 13f
                typeface = android.graphics.Typeface.MONOSPACE
                setTextColor(
                    if (index == selectedDayIndex)
                        ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
                    else
                        ContextCompat.getColor(requireContext(), R.color.color_text_secondary)
                )
                setPadding(28, 14, 28, 14)
            }

            dayCard.addView(dayText)
            dayCard.setOnClickListener {
                selectedDayIndex = index
                buildDaySelector()
                showSlotsForDay(index)
            }

            binding.llDaySelector.addView(dayCard)
        }
    }

    private fun showSlotsForDay(dayIndex: Int) {
        if (dayIndex >= dayKeys.size) return
        val day = dayKeys[dayIndex]
        val slots = groupedSlots[day] ?: emptyList()

        binding.rvTimeSlots.layoutManager = GridLayoutManager(requireContext(), 3)
        binding.rvTimeSlots.adapter = TimeSlotAdapter(slots) { slot ->
            if (slot.is_available) {
                viewModel.selectSlot(slot)
            }
        }
    }

    private fun observeSelectedSlot() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.selectedSlot.collectLatest { slot ->
                if (slot != null) {
                    binding.cardSelectedSlot.visibility = View.VISIBLE
                    binding.tvSelectedSlotDetails.text = "${slot.day}, ${slot.time}"
                    binding.btnConfirm.isEnabled = true
                    binding.btnConfirm.alpha = 1f

                    // Bounce animation on the confirmation card
                    binding.cardSelectedSlot.scaleX = 0.92f
                    binding.cardSelectedSlot.scaleY = 0.92f
                    binding.cardSelectedSlot.animate()
                        .scaleX(1f).scaleY(1f)
                        .setDuration(280)
                        .setInterpolator(OvershootInterpolator(1.5f))
                        .start()
                } else {
                    binding.cardSelectedSlot.visibility = View.GONE
                    binding.btnConfirm.isEnabled = false
                    binding.btnConfirm.alpha = 0.5f
                }
            }
        }
    }

    private fun setupConfirmButton() {
        binding.btnConfirm.setOnClickListener {
            val slot = viewModel.selectedSlot.value ?: return@setOnClickListener
            val mentor = currentMentor ?: return@setOnClickListener

            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Confirm Session")
                .setMessage("Book a 1-on-1 session with ${mentor.full_name}?\n\n${slot.day} at ${slot.time}\nRate: ${if (mentor.hourly_rate == 0) "FREE" else "₹${mentor.hourly_rate}/hr"}")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Confirm") { _, _ ->
                    viewModel.bookSession()
                }
                .show()
        }
    }

    private fun observeBookingState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.bookingState.collectLatest { state ->
                when (state) {
                    is BookingUiState.Idle -> { /* Initial state */ }
                    is BookingUiState.Booking -> {
                        binding.btnConfirm.isEnabled = false
                        binding.btnConfirm.text = "Booking..."
                    }
                    is BookingUiState.Success -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                        // Launch Google Calendar intent
                        launchCalendarReminder()
                        findNavController().popBackStack(R.id.navigation_mentor, false)
                    }
                    is BookingUiState.Error -> {
                        binding.btnConfirm.isEnabled = true
                        binding.btnConfirm.text = "Confirm Booking"
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun launchCalendarReminder() {
        val slot = viewModel.selectedSlot.value ?: return
        val mentor = currentMentor ?: return
        try {
            val intent = Intent(Intent.ACTION_INSERT).apply {
                data = CalendarContract.Events.CONTENT_URI
                putExtra(CalendarContract.Events.TITLE, "Mentoring: ${mentor.full_name}")
                putExtra(CalendarContract.Events.DESCRIPTION, "1-on-1 career mentoring session with ${mentor.full_name} (${mentor.designation})")
                putExtra(CalendarContract.Events.EVENT_LOCATION, "Online / Video Call")
                putExtra(CalendarContract.EXTRA_EVENT_ALL_DAY, false)
            }
            startActivity(intent)
        } catch (_: Exception) {
            // Calendar app not available
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // === Time Slot Adapter ===

    inner class TimeSlotAdapter(
        private val slots: List<AvailabilitySlotDto>,
        private val onSelect: (AvailabilitySlotDto) -> Unit
    ) : RecyclerView.Adapter<TimeSlotAdapter.SlotVH>() {

        inner class SlotVH(view: View) : RecyclerView.ViewHolder(view) {
            val card: MaterialCardView = view as MaterialCardView
            val tvTime: TextView = view.findViewById(R.id.tv_time)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SlotVH {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_time_slot, parent, false)
            return SlotVH(view)
        }

        override fun onBindViewHolder(holder: SlotVH, position: Int) {
            val slot = slots[position]
            holder.tvTime.text = slot.time

            val selectedSlot = viewModel.selectedSlot.value

            when {
                // Currently selected slot
                selectedSlot != null && selectedSlot.day == slot.day && selectedSlot.time == slot.time -> {
                    holder.card.setCardBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_primary))
                    holder.card.strokeColor = ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
                    holder.tvTime.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))
                }
                // Available slot
                slot.is_available -> {
                    holder.card.setCardBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))
                    holder.card.strokeColor = ContextCompat.getColor(requireContext(), R.color.color_border)
                    holder.tvTime.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_primary))
                }
                // Unavailable slot
                else -> {
                    holder.card.setCardBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_2))
                    holder.card.strokeColor = ContextCompat.getColor(requireContext(), R.color.color_border)
                    holder.tvTime.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
                    holder.card.alpha = 0.5f
                }
            }

            holder.card.setOnClickListener {
                if (slot.is_available) {
                    // Bounce scale animation per design.md
                    holder.card.animate()
                        .scaleX(1.08f).scaleY(1.08f)
                        .setDuration(120)
                        .withEndAction {
                            holder.card.animate()
                                .scaleX(1f).scaleY(1f)
                                .setDuration(200)
                                .setInterpolator(OvershootInterpolator(3f))
                                .start()
                        }.start()
                    onSelect(slot)
                    notifyDataSetChanged()
                }
            }

            // Stagger entrance
            holder.itemView.alpha = 0f
            holder.itemView.translationY = 16f
            holder.itemView.animate()
                .alpha(if (slot.is_available) 1f else 0.5f)
                .translationY(0f)
                .setDuration(250)
                .setStartDelay((position * 40L))
                .start()
        }

        override fun getItemCount(): Int = slots.size
    }
}
