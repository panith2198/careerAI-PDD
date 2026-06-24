package com.aicareer.navigator.ui.notifications

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.NotificationDto
import com.aicareer.navigator.databinding.FragmentNotificationsBinding
import com.google.android.material.chip.Chip
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: NotificationViewModel by viewModels()

    private lateinit var sectionedAdapter: SectionedNotificationAdapter

    // Design tokens
    private val ANIM_STAGGER_DELAY = 40L
    private val ANIM_DURATION_NORMAL = 280L
    private val ANIM_DURATION_FAST = 150L

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupFilterChips()
        setupMarkAllRead()
        setupSwipeGestures()
        observeViewModel()
    }

    // ==================== RECYCLERVIEW ====================

    private fun setupRecyclerView() {
        sectionedAdapter = SectionedNotificationAdapter(
            onItemClick = { notification -> handleNotificationTap(notification) }
        )
        binding.rvNotifications.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = sectionedAdapter
            itemAnimator?.apply {
                addDuration = ANIM_DURATION_NORMAL
                removeDuration = ANIM_DURATION_FAST
            }
        }
    }

    // ==================== FILTER CHIPS ====================

    private fun setupFilterChips() {
        val chipMap = mapOf(
            R.id.chip_all to NotificationFilter.ALL,
            R.id.chip_jobs to NotificationFilter.JOBS,
            R.id.chip_roadmap to NotificationFilter.ROADMAP,
            R.id.chip_ai to NotificationFilter.AI,
            R.id.chip_system to NotificationFilter.SYSTEM
        )

        chipMap.forEach { (chipId, filter) ->
            binding.root.findViewById<Chip>(chipId)?.setOnClickListener {
                viewModel.setFilter(filter)
            }
        }
    }

    private fun updateFilterChipStates(activeFilter: NotificationFilter) {
        val chipMap = mapOf(
            NotificationFilter.ALL to binding.chipAll,
            NotificationFilter.JOBS to binding.chipJobs,
            NotificationFilter.ROADMAP to binding.chipRoadmap,
            NotificationFilter.AI to binding.chipAi,
            NotificationFilter.SYSTEM to binding.chipSystem
        )

        chipMap.forEach { (filter, chip) ->
            chip.isChecked = filter == activeFilter
        }
    }

    // ==================== MARK ALL READ ====================

    private fun setupMarkAllRead() {
        binding.btnMarkAllRead.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.animate().scaleX(0.92f).scaleY(0.92f).setDuration(ANIM_DURATION_FAST).start()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(ANIM_DURATION_NORMAL)
                        .setInterpolator(OvershootInterpolator(2f)).start()
                    if (event.action == MotionEvent.ACTION_UP) {
                        viewModel.markAllRead()
                        v.performClick()
                    }
                }
            }
            true
        }
    }

    // ==================== SWIPE GESTURES ====================

    private fun setupSwipeGestures() {
        val itemTouchHelper = ItemTouchHelper(object : ItemTouchHelper.SimpleCallback(
            0, ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT
        ) {
            override fun onMove(
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                target: RecyclerView.ViewHolder
            ): Boolean = false

            override fun getSwipeDirs(
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder
            ): Int {
                // Only allow swiping on notification items (not section headers)
                if (viewHolder is SectionedNotificationAdapter.HeaderViewHolder) return 0
                return super.getSwipeDirs(recyclerView, viewHolder)
            }

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val position = viewHolder.adapterPosition
                val item = sectionedAdapter.getNotificationAtPosition(position) ?: return

                when (direction) {
                    ItemTouchHelper.LEFT -> {
                        // Swipe left = Delete (rose)
                        val originalPosition = sectionedAdapter.getGlobalNotificationIndex(item)
                        viewModel.dismiss(item.id)
                        Snackbar.make(binding.root, "Notification dismissed", Snackbar.LENGTH_LONG)
                            .setAction("Undo") {
                                viewModel.undoDismiss(item, originalPosition)
                            }
                            .setBackgroundTint(
                                ContextCompat.getColor(requireContext(), R.color.color_surface_2)
                            )
                            .setTextColor(
                                ContextCompat.getColor(requireContext(), R.color.color_text_primary)
                            )
                            .setActionTextColor(
                                ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
                            )
                            .show()
                    }
                    ItemTouchHelper.RIGHT -> {
                        // Swipe right = Mark read (emerald)
                        viewModel.markRead(item.id)
                        sectionedAdapter.notifyItemChanged(position)
                    }
                }
            }

            override fun onChildDraw(
                c: Canvas,
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                dX: Float,
                dY: Float,
                actionState: Int,
                isCurrentlyActive: Boolean
            ) {
                if (viewHolder is SectionedNotificationAdapter.HeaderViewHolder) return

                val itemView = viewHolder.itemView
                val paint = Paint(Paint.ANTI_ALIAS_FLAG)
                val cornerRadius = 14f * resources.displayMetrics.density
                val margin = 16f * resources.displayMetrics.density
                val vPad = 3f * resources.displayMetrics.density

                if (dX < 0) {
                    // Swipe left — rose "Delete" reveal
                    paint.color = Color.parseColor("#F43F5E")
                    val rect = RectF(
                        itemView.right.toFloat() + dX + margin,
                        itemView.top.toFloat() + vPad,
                        itemView.right.toFloat() - margin,
                        itemView.bottom.toFloat() - vPad
                    )
                    c.drawRoundRect(rect, cornerRadius, cornerRadius, paint)

                    // "Delete" text
                    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                        color = Color.WHITE
                        textSize = 13f * resources.displayMetrics.density
                        textAlign = Paint.Align.CENTER
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                    }
                    c.drawText(
                        "Delete",
                        (itemView.right - margin - 48f * resources.displayMetrics.density),
                        (itemView.top + itemView.height / 2f + 5f * resources.displayMetrics.density),
                        textPaint
                    )
                } else if (dX > 0) {
                    // Swipe right — emerald "Read" reveal
                    paint.color = Color.parseColor("#10B981")
                    val rect = RectF(
                        itemView.left.toFloat() + margin,
                        itemView.top.toFloat() + vPad,
                        itemView.left.toFloat() + dX - margin,
                        itemView.bottom.toFloat() - vPad
                    )
                    c.drawRoundRect(rect, cornerRadius, cornerRadius, paint)

                    // "Read" text
                    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                        color = Color.WHITE
                        textSize = 13f * resources.displayMetrics.density
                        textAlign = Paint.Align.CENTER
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                    }
                    c.drawText(
                        "Read",
                        (itemView.left + margin + 48f * resources.displayMetrics.density),
                        (itemView.top + itemView.height / 2f + 5f * resources.displayMetrics.density),
                        textPaint
                    )
                }

                super.onChildDraw(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive)
            }
        })
        itemTouchHelper.attachToRecyclerView(binding.rvNotifications)
    }

    // ==================== OBSERVE VIEWMODEL ====================

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { viewModel.notificationsState.collect { handleState(it) } }
                launch { viewModel.unreadCount.collect { updateBadge(it) } }
                launch { viewModel.activeFilter.collect { updateFilterChipStates(it) } }
            }
        }
    }

    private fun handleState(state: NotificationsUiState) {
        when (state) {
            is NotificationsUiState.Loading -> {
                binding.progressLoading.visibility = View.VISIBLE
                binding.rvNotifications.visibility = View.GONE
                binding.llEmptyState.visibility = View.GONE
            }
            is NotificationsUiState.Success -> {
                binding.progressLoading.visibility = View.GONE
                if (state.notifications.isEmpty()) {
                    binding.rvNotifications.visibility = View.GONE
                    binding.llEmptyState.visibility = View.VISIBLE
                    animateEmptyState()
                } else {
                    binding.rvNotifications.visibility = View.VISIBLE
                    binding.llEmptyState.visibility = View.GONE
                    val sections = viewModel.groupIntoSections(state.notifications)
                    sectionedAdapter.submitSections(sections)
                    animateListEntrance()
                }
            }
            is NotificationsUiState.Error -> {
                binding.progressLoading.visibility = View.GONE
                binding.rvNotifications.visibility = View.GONE
                binding.llEmptyState.visibility = View.VISIBLE
            }
        }
    }

    private fun updateBadge(count: Int) {
        binding.tvUnreadBadge.apply {
            if (count > 0) {
                text = if (count > 99) "99+" else count.toString()
                visibility = View.VISIBLE
                // Pulse animation
                scaleX = 0f
                scaleY = 0f
                animate().scaleX(1f).scaleY(1f)
                    .setDuration(ANIM_DURATION_NORMAL)
                    .setInterpolator(OvershootInterpolator(2f))
                    .start()
            } else {
                visibility = View.GONE
            }
        }
    }

    // ==================== NAVIGATION ====================

    private fun handleNotificationTap(notification: NotificationDto) {
        // Mark as read on tap
        if (!notification.is_read) {
            viewModel.markRead(notification.id)
        }

        // Navigate to relevant screen based on type
        try {
            when (notification.target_type) {
                "job" -> findNavController().navigate(R.id.navigation_job_detail)
                "roadmap" -> findNavController().navigate(R.id.navigation_roadmap)
                "assessment" -> findNavController().navigate(R.id.navigation_result)
                "analytics" -> findNavController().navigate(R.id.navigation_analytics)
                else -> { /* No navigation for system or typeless notifications */ }
            }
        } catch (e: Exception) {
            // Navigation action may not exist for all destinations
        }
    }

    // ==================== ANIMATIONS ====================

    private fun animateListEntrance() {
        binding.rvNotifications.post {
            for (i in 0 until binding.rvNotifications.childCount) {
                val child = binding.rvNotifications.getChildAt(i)
                child.alpha = 0f
                child.translationY = 24f
                child.animate()
                    .alpha(1f)
                    .translationY(0f)
                    .setDuration(ANIM_DURATION_NORMAL)
                    .setStartDelay(i * ANIM_STAGGER_DELAY)
                    .setInterpolator(OvershootInterpolator(0.6f))
                    .start()
            }
        }
    }

    private fun animateEmptyState() {
        binding.llEmptyState.apply {
            alpha = 0f
            scaleX = 0.9f
            scaleY = 0.9f
            animate()
                .alpha(1f)
                .scaleX(1f).scaleY(1f)
                .setDuration(ANIM_DURATION_NORMAL + 100)
                .setInterpolator(OvershootInterpolator(1.2f))
                .start()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // ==================== SECTIONED ADAPTER ====================

    inner class SectionedNotificationAdapter(
        private val onItemClick: (NotificationDto) -> Unit
    ) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

        private val TYPE_HEADER = 0
        private val TYPE_ITEM = 1

        // Flat list: mixed headers (String) and items (NotificationDto)
        private val flatList = mutableListOf<Any>()

        fun submitSections(sections: List<NotificationSection>) {
            flatList.clear()
            sections.forEach { section ->
                flatList.add(section.header)    // String = header
                flatList.addAll(section.items)  // NotificationDto = item
            }
            notifyDataSetChanged()
        }

        fun getNotificationAtPosition(position: Int): NotificationDto? {
            return flatList.getOrNull(position) as? NotificationDto
        }

        fun getGlobalNotificationIndex(notification: NotificationDto): Int {
            return flatList.indexOfFirst { it is NotificationDto && (it as NotificationDto).id == notification.id }
        }

        override fun getItemViewType(position: Int): Int {
            return if (flatList[position] is String) TYPE_HEADER else TYPE_ITEM
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
            return if (viewType == TYPE_HEADER) {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.item_notification_header, parent, false)
                HeaderViewHolder(view)
            } else {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.item_notification, parent, false)
                NotificationViewHolder(view)
            }
        }

        override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
            when (holder) {
                is HeaderViewHolder -> holder.bind(flatList[position] as String)
                is NotificationViewHolder -> holder.bind(flatList[position] as NotificationDto)
            }
        }

        override fun getItemCount(): Int = flatList.size

        // ---- Header ViewHolder ----
        inner class HeaderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            private val tvHeader: TextView = view.findViewById(R.id.tv_section_header)
            fun bind(header: String) {
                tvHeader.text = header
            }
        }

        // ---- Notification ViewHolder ----
        inner class NotificationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            private val cardNotification = view.findViewById<com.google.android.material.card.MaterialCardView>(R.id.card_notification)
            private val vUnreadDot: View = view.findViewById(R.id.v_unread_dot)
            private val vIconBg: View = view.findViewById(R.id.v_icon_bg)
            private val ivCategoryIcon: ImageView = view.findViewById(R.id.iv_category_icon)
            private val tvTitle: TextView = view.findViewById(R.id.tv_title)
            private val tvMessage: TextView = view.findViewById(R.id.tv_message)
            private val tvTime: TextView = view.findViewById(R.id.tv_time)

            fun bind(notification: NotificationDto) {
                tvTitle.text = notification.title
                tvMessage.text = notification.message
                tvTime.text = formatTimeAgo(notification.created_at)

                // Unread styling per design.md
                if (!notification.is_read) {
                    cardNotification.setCardBackgroundColor(
                        ContextCompat.getColor(requireContext(), R.color.color_surface_2)
                    )
                    vUnreadDot.visibility = View.VISIBLE
                    tvTitle.setTypeface(tvTitle.typeface, android.graphics.Typeface.BOLD)
                } else {
                    cardNotification.setCardBackgroundColor(
                        ContextCompat.getColor(requireContext(), R.color.color_surface_1)
                    )
                    vUnreadDot.visibility = View.GONE
                    tvTitle.setTypeface(tvTitle.typeface, android.graphics.Typeface.NORMAL)
                }

                // Category icon + background color
                val (iconRes, iconTint, bgColor) = getCategoryStyle(notification.type)
                ivCategoryIcon.setImageResource(iconRes)
                ivCategoryIcon.setColorFilter(iconTint)
                val bgDrawable = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(bgColor)
                }
                vIconBg.background = bgDrawable

                // Press animation + click
                itemView.setOnTouchListener { v, event ->
                    when (event.action) {
                        MotionEvent.ACTION_DOWN -> {
                            v.animate().scaleX(0.97f).scaleY(0.97f).setDuration(ANIM_DURATION_FAST).start()
                        }
                        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                            v.animate().scaleX(1f).scaleY(1f).setDuration(ANIM_DURATION_NORMAL)
                                .setInterpolator(OvershootInterpolator(1.5f)).start()
                            if (event.action == MotionEvent.ACTION_UP) {
                                onItemClick(notification)
                                v.performClick()
                            }
                        }
                    }
                    true
                }
            }

            private fun getCategoryStyle(type: String): Triple<Int, Int, Int> {
                val ctx = requireContext()
                return when (type) {
                    "job_match" -> Triple(
                        R.drawable.ic_jobs,
                        ContextCompat.getColor(ctx, R.color.color_primary_bright),
                        Color.parseColor("#7B2FBE20")
                    )
                    "roadmap" -> Triple(
                        R.drawable.ic_roadmap,
                        ContextCompat.getColor(ctx, R.color.color_emerald),
                        Color.parseColor("#10B98120")
                    )
                    "assessment" -> Triple(
                        R.drawable.ic_assessment_check,
                        ContextCompat.getColor(ctx, R.color.color_cyan),
                        Color.parseColor("#00BCD420")
                    )
                    "ai_tip" -> Triple(
                        R.drawable.ic_ai_sparkle,
                        ContextCompat.getColor(ctx, R.color.color_cyan),
                        Color.parseColor("#00BCD420")
                    )
                    "system" -> Triple(
                        R.drawable.ic_system_gear,
                        ContextCompat.getColor(ctx, R.color.color_text_tertiary),
                        Color.parseColor("#8A8AAA20")
                    )
                    else -> Triple(
                        R.drawable.ic_chat,
                        ContextCompat.getColor(ctx, R.color.color_text_secondary),
                        Color.parseColor("#4A4A6A20")
                    )
                }
            }

            private fun formatTimeAgo(isoDate: String): String {
                return try {
                    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
                    sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
                    val dateMs = sdf.parse(isoDate)?.time ?: return ""
                    val diffMs = System.currentTimeMillis() - dateMs
                    val minutes = diffMs / 60_000
                    val hours = minutes / 60
                    val days = hours / 24

                    when {
                        minutes < 1 -> "now"
                        minutes < 60 -> "${minutes}m"
                        hours < 24 -> "${hours}h"
                        days < 7 -> "${days}d"
                        days < 30 -> "${days / 7}w"
                        else -> "${days / 30}mo"
                    }
                } catch (e: Exception) {
                    ""
                }
            }
        }
    }
}
