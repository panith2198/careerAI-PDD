package com.aicareer.navigator.ui.roadmap

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentMilestoneDetailBinding
import com.aicareer.navigator.databinding.ItemResourceBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MilestoneDetailFragment : Fragment() {

    private var _binding: FragmentMilestoneDetailBinding? = null
    private val binding get() = _binding!!

    // Bind to the shared Activity-scoped ViewModel to sync completed ticks instantly!
    private val viewModel: RoadmapViewModel by activityViewModels()

    private var milestoneId: String = "m1"
    private var isCompleted: Boolean = false
    private var roadmapId: Int = 101

    private val studyResources = mutableListOf<StudyResource>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMilestoneDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        milestoneId = arguments?.getString("milestoneId", "m1") ?: "m1"
        isCompleted = arguments?.getBoolean("completed", false) ?: false
        roadmapId = arguments?.getInt("roadmapId", 101) ?: 101

        val title = arguments?.getString("title") ?: "Kotlin Coroutines & Flow"
        val desc = arguments?.getString("desc") ?: "Master asynchronous streams, structured concurrency scopes..."
        val week = arguments?.getString("week") ?: "Weeks 1-4"
        val phase = arguments?.getInt("phase", 1) ?: 1
        val projectTitle = arguments?.getString("projectTitle") ?: "Build a Dynamic Async Search App"
        val projectDesc = arguments?.getString("projectDesc") ?: "Apply your concurrency..."
        val resourcesJson = arguments?.getString("resourcesJson")

        // Parse resources list from JSON arguments
        studyResources.clear()
        if (!resourcesJson.isNullOrEmpty()) {
            try {
                val gson = com.google.gson.Gson()
                val typeToken = object : com.google.gson.reflect.TypeToken<List<Map<String, Any>>>() {}.type
                val resourcesList = gson.fromJson<List<Map<String, Any>>>(resourcesJson, typeToken)
                
                resourcesList?.forEach { res ->
                    val resTitle = res["title"] as? String ?: "Study Guide"
                    val resType = res["type"] as? String ?: "ARTICLE"
                    val resAuthor = res["author"] as? String ?: "AI Career Coach"
                    val resCountText = res["countText"] as? String ?: "5 MIN READ"
                    val resUrl = res["url"] as? String ?: "https://github.com"
                    
                    studyResources.add(StudyResource(resTitle, resType, resAuthor, resCountText, resUrl))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        
        if (studyResources.isEmpty()) {
            studyResources.addAll(listOf(
                StudyResource("Kotlin Coroutines Deep Dive", "VIDEO COURSE", "By JetBrains Academy", "12 LESSONS", "https://kotlinlang.org/docs/coroutines-overview.html"),
                StudyResource("Advanced Android Concurrency Guides", "ARTICLE", "By Android Developers team", "8 READS", "https://developer.android.com/kotlin/coroutines"),
                StudyResource("Testing Asynchronous Flows & LiveData", "TUTORIAL", "By Android Caching Experts", "10 STEPS", "https://developer.android.com/kotlin/flow")
            ))
        }

        setupUIStates(title, desc, week, phase, projectTitle, projectDesc)
        setupActionListeners()

        binding.rvResources.layoutManager = LinearLayoutManager(requireContext())
        binding.rvResources.adapter = ResourceAdapter(studyResources) { resource ->
            openExternalLink(resource.url)
        }

        // Initially hide the toolbar background and title
        binding.clToolbar.background?.mutate()?.alpha = 0
        
        binding.scrollView.setOnScrollChangeListener(androidx.core.widget.NestedScrollView.OnScrollChangeListener { _, _, scrollY, _, _ ->
            val threshold = 140f // DP threshold for transition
            val density = resources.displayMetrics.density
            val thresholdPx = threshold * density
            
            val alpha = (scrollY.toFloat() / thresholdPx).coerceIn(0f, 1f)
            binding.tvToolbarTitle.alpha = alpha
            
            // Set grid background tint alpha based on scroll
            val alphaInt = (alpha * 255).toInt()
            binding.clToolbar.background?.mutate()?.alpha = alphaInt
        })
    }

    private fun setupUIStates(title: String, desc: String, week: String, phase: Int, projectTitle: String, projectDesc: String) {
        binding.tvMilestoneTitle.text = title
        binding.tvMilestoneDesc.text = desc
        binding.badgePhaseWeek.text = "PHASE $phase • ${week.uppercase()}"
        
        binding.tvProjectTitle.text = projectTitle
        binding.tvProjectDesc.text = projectDesc
        
        binding.tvToolbarTitle.text = title
        
        updateCompletionButtonState()
    }

    private fun setupActionListeners() {
        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        binding.btnCheckpoint.setOnClickListener {
            // Navigate to dynamic quiz checklist checkpoint
            val bundle = Bundle().apply {
                putInt("assessmentId", 1) // dynamic mock check
            }
            findNavController().navigate(R.id.navigation_quiz, bundle)
        }

        binding.btnComplete.setOnClickListener {
            toggleCompletionState()
        }
    }

    private fun toggleCompletionState() {
        isCompleted = !isCompleted
        viewModel.toggleMilestoneCompletion(roadmapId, milestoneId, isCompleted)
        updateCompletionButtonState()
        
        val statusText = if (isCompleted) "completed ✓" else "unmarked."
        Toast.makeText(requireContext(), "Milestone marked as $statusText", Toast.LENGTH_SHORT).show()
    }

    private fun updateCompletionButtonState() {
        if (isCompleted) {
            binding.tvCompleteText.text = "Milestone Completed ✓"
            binding.btnComplete.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
            binding.tvCompleteText.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_emerald))
            binding.ivCompleteIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
        } else {
            binding.tvCompleteText.text = "Mark Milestone Complete"
            binding.btnComplete.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
            binding.tvCompleteText.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_surface_1))
            binding.ivCompleteIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_1)
        }
    }

    private fun openExternalLink(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Could not open external course resource.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    data class StudyResource(
        val title: String,
        val type: String,
        val author: String,
        val countText: String,
        val url: String
    )

    inner class ResourceAdapter(
        private val list: List<StudyResource>,
        private val onLinkClick: (StudyResource) -> Unit
    ) : RecyclerView.Adapter<ResourceAdapter.ResourceViewHolder>() {

        inner class ResourceViewHolder(val itemBinding: ItemResourceBinding) :
            RecyclerView.ViewHolder(itemBinding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ResourceViewHolder {
            val itemBinding = ItemResourceBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ResourceViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: ResourceViewHolder, position: Int) {
            val item = list[position]
            val binding = holder.itemBinding

            binding.tvTitle.text = item.title
            binding.tvType.text = item.type
            binding.tvAuthor.text = item.author
            binding.tvLessonsCount.text = item.countText

            // Set dynamic icon based on resource type
            val iconRes = when (item.type) {
                "VIDEO COURSE" -> R.drawable.ic_play_resource
                "ARTICLE" -> R.drawable.ic_article_resource
                else -> R.drawable.ic_beaker
            }
            binding.ivResourceIcon.setImageResource(iconRes)

            binding.root.setOnClickListener {
                onLinkClick(item)
            }
        }

        override fun getItemCount(): Int = list.size
    }
}
