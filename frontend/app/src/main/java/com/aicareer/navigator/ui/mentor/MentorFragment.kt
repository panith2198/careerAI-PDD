package com.aicareer.navigator.ui.mentor

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.MentorDto
import com.aicareer.navigator.databinding.FragmentMentorBinding
import com.bumptech.glide.Glide
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MentorFragment : Fragment() {

    private var _binding: FragmentMentorBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MentorViewModel by activityViewModels()

    private lateinit var mentorAdapter: MentorListAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMentorBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupFilterChips()
        observeMentorList()
        applyEntranceAnimations()
    }

    private fun setupRecyclerView() {
        mentorAdapter = MentorListAdapter { mentor ->
            viewModel.loadMentorDetail(mentor.mentor_id)
            findNavController().navigate(R.id.action_mentor_to_detail)
        }

        binding.rvMentors.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = mentorAdapter
            setHasFixedSize(false)
            // Violet edge glow
            edgeEffectFactory = object : RecyclerView.EdgeEffectFactory() {
                override fun createEdgeEffect(view: RecyclerView, direction: Int): android.widget.EdgeEffect {
                    return android.widget.EdgeEffect(view.context).apply {
                        color = ContextCompat.getColor(view.context, R.color.color_primary)
                    }
                }
            }
        }
    }

    private fun setupFilterChips() {
        binding.chipAll.setOnClickListener { activateChip(binding.chipAll); viewModel.updateFilter(MentorFilterState()) }
        binding.chipTopRated.setOnClickListener { activateChip(binding.chipTopRated); viewModel.updateFilter(MentorFilterState(minRating = 4.5f)) }
        binding.chipFree.setOnClickListener { activateChip(binding.chipFree); viewModel.updateFilter(MentorFilterState(isFree = true)) }
        binding.chipAndroid.setOnClickListener { activateChip(binding.chipAndroid); viewModel.updateFilter(MentorFilterState(skill = "Android")) }
        binding.chipDesign.setOnClickListener { activateChip(binding.chipDesign); viewModel.updateFilter(MentorFilterState(skill = "System Design")) }
    }

    private fun activateChip(active: Chip) {
        val chips = listOf(binding.chipAll, binding.chipTopRated, binding.chipFree, binding.chipAndroid, binding.chipDesign)
        chips.forEach { chip ->
            if (chip == active) {
                chip.setChipBackgroundColorResource(R.color.color_primary)
                chip.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))
            } else {
                chip.setChipBackgroundColorResource(R.color.color_surface_3)
                chip.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            }
        }
    }

    private fun observeMentorList() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.mentorListState.collectLatest { state ->
                when (state) {
                    is MentorListUiState.Loading -> {
                        binding.progressLoading.visibility = View.VISIBLE
                        binding.rvMentors.visibility = View.GONE
                        binding.llEmptyState.visibility = View.GONE
                    }
                    is MentorListUiState.Success -> {
                        binding.progressLoading.visibility = View.GONE
                        if (state.mentors.isEmpty()) {
                            binding.rvMentors.visibility = View.GONE
                            binding.llEmptyState.visibility = View.VISIBLE
                        } else {
                            binding.rvMentors.visibility = View.VISIBLE
                            binding.llEmptyState.visibility = View.GONE
                            mentorAdapter.submitList(state.mentors)
                        }
                    }
                    is MentorListUiState.Error -> {
                        binding.progressLoading.visibility = View.GONE
                        binding.rvMentors.visibility = View.GONE
                        binding.llEmptyState.visibility = View.VISIBLE
                    }
                }
            }
        }
    }

    private fun applyEntranceAnimations() {
        binding.rvMentors.alpha = 0f
        binding.rvMentors.translationY = 40f
        binding.rvMentors.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(450)
            .setStartDelay(150)
            .start()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // === Inner RecyclerView Adapter ===

    inner class MentorListAdapter(
        private val onClick: (MentorDto) -> Unit
    ) : RecyclerView.Adapter<MentorListAdapter.MentorVH>() {

        private var items: List<MentorDto> = emptyList()

        fun submitList(newList: List<MentorDto>) {
            items = newList
            notifyDataSetChanged()
        }

        inner class MentorVH(view: View) : RecyclerView.ViewHolder(view) {
            val ivAvatar: ImageView = view.findViewById(R.id.iv_avatar)
            val tvName: TextView = view.findViewById(R.id.tv_name)
            val tvDesignation: TextView = view.findViewById(R.id.tv_designation)
            val tvRating: TextView = view.findViewById(R.id.tv_rating)
            val tvSessions: TextView = view.findViewById(R.id.tv_sessions)
            val tvRate: TextView = view.findViewById(R.id.tv_rate)
            val tvMatchBadge: TextView = view.findViewById(R.id.tv_match_badge)
            val tvProBadge: TextView = view.findViewById(R.id.tv_pro_badge)
            val cgExpertise: ChipGroup = view.findViewById(R.id.cg_expertise)
            val btnBook: View = view.findViewById(R.id.btn_book)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MentorVH {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_mentor_card, parent, false)
            return MentorVH(view)
        }

        override fun onBindViewHolder(holder: MentorVH, position: Int) {
            val mentor = items[position]

            holder.tvName.text = mentor.full_name
            holder.tvDesignation.text = mentor.designation ?: "Engineer"
            holder.tvRating.text = "⭐ ${mentor.rating ?: 0f}"
            holder.tvSessions.text = "  (${mentor.total_sessions ?: 0} sessions)"

            // Rate display
            val rate = mentor.hourly_rate ?: 0
            if (rate == 0) {
                holder.tvRate.text = "FREE"
                holder.tvRate.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.color_emerald))
            } else {
                holder.tvRate.text = "₹${rate}/hr"
                holder.tvRate.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.color_emerald))
            }

            // AI Match badge
            val matchScore = mentor.ai_match_score
            if (matchScore != null && matchScore > 0) {
                holder.tvMatchBadge.text = "${matchScore.toInt()}%"
                holder.tvMatchBadge.visibility = View.VISIBLE
            } else {
                holder.tvMatchBadge.visibility = View.GONE
            }

            // PRO badge
            holder.tvProBadge.visibility = if (mentor.is_pro == true) View.VISIBLE else View.GONE

            // Avatar
            Glide.with(holder.itemView.context)
                .load(mentor.avatar_url)
                .placeholder(R.color.color_surface_3)
                .error(R.color.color_surface_2)
                .circleCrop()
                .into(holder.ivAvatar)

            // Expertise chips
            holder.cgExpertise.removeAllViews()
            mentor.expertise?.take(3)?.forEach { skill ->
                val chip = Chip(holder.itemView.context).apply {
                    text = skill
                    textSize = 11f
                    setTextColor(ContextCompat.getColor(context, R.color.color_text_secondary))
                    chipBackgroundColor = ContextCompat.getColorStateList(context, R.color.color_surface_3)
                    chipStrokeColor = ContextCompat.getColorStateList(context, R.color.color_border)
                    chipStrokeWidth = 1f
                    chipCornerRadius = 100f
                    isClickable = false
                    chipMinHeight = 28f
                }
                holder.cgExpertise.addView(chip)
            }

            // Item entrance animation (stagger 40ms per design.md)
            holder.itemView.alpha = 0f
            holder.itemView.translationY = 20f
            holder.itemView.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(280)
                .setStartDelay((position * 40L))
                .start()

            // Click handlers
            holder.itemView.setOnClickListener { onClick(mentor) }
            holder.btnBook.setOnClickListener { onClick(mentor) }
        }

        override fun getItemCount(): Int = items.size
    }
}
