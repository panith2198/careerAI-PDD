package com.aicareer.navigator.ui.roadmap

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.RoadmapGeneratePayloadDto
import com.aicareer.navigator.databinding.FragmentRoadmapBinding
import com.aicareer.navigator.databinding.ItemMilestoneBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class RoadmapFragment : Fragment() {

    @Inject
    lateinit var homeApiService: HomeApiService

    private var _binding: FragmentRoadmapBinding? = null
    private val binding get() = _binding!!

    private val handler = Handler(Looper.getMainLooper())
    private var activeRoadmapId: Int? = null
    private var targetCareerId: Int = 0
    private var targetCareerTitle: String = "Career Role"
    
    // Phase Accordion State Tracking
    private var isPhase1Expanded = true
    private var isPhase2Expanded = false
    private var isPhase3Expanded = false

    // Offline / Online state flags
    private var isOfflineMode = false
    private var offlineCompletionPct = 30f
    private var offlineMilestones = mutableListOf<MilestoneDto>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRoadmapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val argCareerId = arguments?.getInt("careerId") ?: 0
        if (argCareerId != 0) {
            targetCareerId = argCareerId
        }
        targetCareerTitle = arguments?.getString("careerTitle") ?: "Career Role"

        setupAccordionClickListeners()
        
        binding.btnGenerate.setOnClickListener {
            triggerRoadmapGeneration()
        }

        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }

        checkActiveRoadmaps()
    }

    private fun setupAccordionClickListeners() {
        binding.clPhase1Header.setOnClickListener {
            isPhase1Expanded = !isPhase1Expanded
            binding.rvPhase1.visibility = if (isPhase1Expanded) View.VISIBLE else View.GONE
            binding.ivPhase1Arrow.rotation = if (isPhase1Expanded) 90f else 0f
        }

        binding.clPhase2Header.setOnClickListener {
            isPhase2Expanded = !isPhase2Expanded
            binding.rvPhase2.visibility = if (isPhase2Expanded) View.VISIBLE else View.GONE
            binding.ivPhase2Arrow.rotation = if (isPhase2Expanded) 90f else 0f
        }

        binding.clPhase3Header.setOnClickListener {
            isPhase3Expanded = !isPhase3Expanded
            binding.rvPhase3.visibility = if (isPhase3Expanded) View.VISIBLE else View.GONE
            binding.ivPhase3Arrow.rotation = if (isPhase3Expanded) 90f else 0f
        }
    }

    private fun checkActiveRoadmaps() {
        lifecycleScope.launch {
            try {
                binding.clLoading.visibility = View.VISIBLE
                val response = homeApiService.getRoadmapsList()
                val active = response.items?.firstOrNull { 
                    (it.status == "active" || it.status == "draft") && (targetCareerId == 0 || it.career_id == targetCareerId)
                }
                
                if (active != null) {
                    activeRoadmapId = active.roadmap_id
                    active.career_id?.let { targetCareerId = it }
                    isOfflineMode = false
                    fetchRoadmapDetails(active.roadmap_id)
                } else {
                    binding.clLoading.visibility = View.GONE
                    binding.svGenerateRoadmap.visibility = View.VISIBLE
                    binding.nsvRoadmapContent.visibility = View.GONE
                }
            } catch (e: Exception) {
                // Fallback offline rich state parameters
                isOfflineMode = true
                activeRoadmapId = 101
                binding.clLoading.visibility = View.GONE
                setupOfflineRoadmap()
            }
        }
    }

    private fun fetchRoadmapDetails(id: Int) {
        lifecycleScope.launch {
            try {
                binding.clLoading.visibility = View.VISIBLE
                val details = homeApiService.getRoadmapDetails(id)
                
                // Parse dynamic milestones phase array safely
                val completedMilestones = (details.milestones_json?.get("completed_milestones") as? List<*>)
                    ?.mapNotNull { it as? String } ?: emptyList()
                val phasesList = details.milestones_json?.get("phases") as? List<*>
                val parsedMilestones = mutableListOf<MilestoneDto>()
                
                phasesList?.forEachIndexed { phaseIndex, phaseObj ->
                    val phaseMap = phaseObj as? Map<*, *>
                    if (phaseMap != null) {
                        val weeksText = phaseMap["weeks"] as? String ?: "Weeks"
                        val topicsList = phaseMap["topics"] as? List<*>
                        
                        topicsList?.forEachIndexed { topicIndex, topicObj ->
                            if (topicObj is Map<*, *>) {
                                val title = topicObj["title"] as? String ?: ""
                                val desc = topicObj["description"] as? String ?: ""
                                val milestoneId = topicObj["topic_id"] as? String ?: "m_${phaseIndex}_$topicIndex"
                                
                                // Extract resources safely
                                val resources = topicObj["resources"] as? List<*>
                                val parsedResources = mutableListOf<Map<String, Any>>()
                                resources?.forEach { resObj ->
                                    if (resObj is Map<*, *>) {
                                        val resMap = mutableMapOf<String, Any>()
                                        resObj.forEach { (k, v) ->
                                            if (k is String && v != null) {
                                                resMap[k] = v
                                            }
                                        }
                                        parsedResources.add(resMap)
                                    }
                                }
                                
                                // Extract project safely
                                val project = topicObj["portfolio_project"] as? Map<*, *>
                                val projectTitle = project?.get("title") as? String ?: "Milestone Capstone Project"
                                val projectDesc = project?.get("description") as? String ?: "Build a real-world project to apply your learnings."
                                
                                parsedMilestones.add(
                                    MilestoneDto(
                                        id = milestoneId,
                                        week = weeksText,
                                        phase = phaseIndex + 1,
                                        title = title,
                                        desc = desc,
                                        completed = completedMilestones.contains(milestoneId),
                                        resources = parsedResources,
                                        projectTitle = projectTitle,
                                        projectDesc = projectDesc
                                    )
                                )
                            } else if (topicObj is String) {
                                val milestoneId = "m_${phaseIndex}_$topicIndex"
                                parsedMilestones.add(
                                    MilestoneDto(
                                        id = milestoneId,
                                        week = weeksText,
                                        phase = phaseIndex + 1,
                                        title = topicObj,
                                        desc = "Target core skill coverage on $topicObj.",
                                        completed = completedMilestones.contains(milestoneId),
                                        resources = null,
                                        projectTitle = null,
                                        projectDesc = null
                                    )
                                )
                            }
                        }
                    }
                }

                if (parsedMilestones.isEmpty()) {
                    setupOfflineRoadmap()
                } else {
                    displayRoadmap(details.title, details.completion_pct, parsedMilestones)
                }
            } catch (e: Exception) {
                android.util.Log.e("RoadmapFragment", "Error parsing roadmap details", e)
                setupOfflineRoadmap()
            } finally {
                binding.clLoading.visibility = View.GONE
            }
        }
    }

    private fun setupOfflineRoadmap() {
        binding.svGenerateRoadmap.visibility = View.GONE
        binding.nsvRoadmapContent.visibility = View.VISIBLE
        
        offlineMilestones = mutableListOf(
            // Phase 1 (Foundation)
            MilestoneDto("m1", "Weeks 1-4", 1, "Fundamentals of $targetCareerTitle", "Master core concepts, tools, setup, and base syntax required for a career as $targetCareerTitle.", true, null, null, null),
            MilestoneDto("m2", "Weeks 1-4", 1, "Core Environment & Workflows", "Set up developer workstation, control systems, and initialize test projects.", false, null, null, null),
            
            // Phase 2 (Intermediate)
            MilestoneDto("m3", "Weeks 5-8", 2, "$targetCareerTitle Architecture", "Construct decoupled project layers with solid dependency interfaces and design guidelines.", false, null, null, null),
            MilestoneDto("m4", "Weeks 5-8", 2, "Data Management & Services", "Implement reliable database caching mechanisms, API sync, and persistence schemas.", false, null, null, null),
            
            // Phase 3 (Advanced)
            MilestoneDto("m5", "Weeks 9-12", 3, "Optimization & Performance", "Trace memory allocations, analyze bottlenecks, and profile production ready modules.", false, null, null, null),
            MilestoneDto("m6", "Weeks 9-12", 3, "CI/CD & Production Deployment", "Configure pipeline integration rules, auto test rules, and release assets.", false, null, null, null)
        )

        displayRoadmap("AI roadmap to $targetCareerTitle Expert", offlineCompletionPct, offlineMilestones)
    }

    private fun displayRoadmap(title: String, completionPct: Float, list: List<MilestoneDto>) {
        binding.svGenerateRoadmap.visibility = View.GONE
        binding.nsvRoadmapContent.visibility = View.VISIBLE
        
        binding.tvSubtitle.text = title
        binding.tvOverallPct.text = "${completionPct.toInt()}%"
        binding.pbOverall.setProgressCompat(completionPct.toInt(), true)
        binding.tvMotivationSub.text = "You're on your way to becoming a $targetCareerTitle Expert!"

        // Separate milestones by phase
        val phase1List = list.filter { it.phase == 1 }
        val phase2List = list.filter { it.phase == 2 }
        val phase3List = list.filter { it.phase == 3 }

        // Setup Phase Progress Indicators
        val p1Pct = (phase1List.count { it.completed } * 100f / phase1List.size.coerceAtLeast(1)).toInt()
        val p2Pct = (phase2List.count { it.completed } * 100f / phase2List.size.coerceAtLeast(1)).toInt()
        val p3Pct = (phase3List.count { it.completed } * 100f / phase3List.size.coerceAtLeast(1)).toInt()

        binding.pbPhase1.setProgressCompat(p1Pct, true)
        binding.pbPhase2.setProgressCompat(p2Pct, true)
        binding.pbPhase3.setProgressCompat(p3Pct, true)

        // Bind Phase RecyclerView adapters
        binding.rvPhase1.layoutManager = LinearLayoutManager(requireContext())
        binding.rvPhase1.adapter = MilestoneAdapter(phase1List) { milestone, isChecked ->
            toggleMilestoneState(milestone, isChecked)
        }

        binding.rvPhase2.layoutManager = LinearLayoutManager(requireContext())
        binding.rvPhase2.adapter = MilestoneAdapter(phase2List) { milestone, isChecked ->
            toggleMilestoneState(milestone, isChecked)
        }

        binding.rvPhase3.layoutManager = LinearLayoutManager(requireContext())
        binding.rvPhase3.adapter = MilestoneAdapter(phase3List) { milestone, isChecked ->
            toggleMilestoneState(milestone, isChecked)
        }
    }

    private fun toggleMilestoneState(milestone: MilestoneDto, isChecked: Boolean) {
        lifecycleScope.launch {
            if (!isOfflineMode) {
                try {
                    val id = activeRoadmapId ?: return@launch
                    val payload = com.aicareer.navigator.data.remote.MilestoneUpdatePayloadDto(
                        milestone_id = milestone.id,
                        completed = isChecked
                    )
                    val response = homeApiService.updateMilestone(id, payload)
                    fetchRoadmapDetails(id)
                } catch (e: Exception) {
                    toggleOfflineState(milestone, isChecked)
                }
            } else {
                toggleOfflineState(milestone, isChecked)
            }
        }
    }

    private fun toggleOfflineState(milestone: MilestoneDto, isChecked: Boolean) {
        milestone.completed = isChecked
        val list = offlineMilestones
        val totalCount = list.size
        val doneCount = list.count { it.completed }
        offlineCompletionPct = (doneCount * 100f) / totalCount
        
        displayRoadmap("AI roadmap to $targetCareerTitle Expert", offlineCompletionPct, list)
    }

    private fun triggerRoadmapGeneration() {
        val hours = binding.etHours.text.toString().toIntOrNull() ?: 15
        val months = binding.etMonths.text.toString().toIntOrNull() ?: 3

        lifecycleScope.launch {
            try {
                binding.clLoading.visibility = View.VISIBLE
                updateLoadingUI(0)

                val payload = RoadmapGeneratePayloadDto(
                    career_id = targetCareerId,
                    hours_per_week = hours,
                    target_months = months
                )
                val response = homeApiService.generateRoadmap(payload)
                activeRoadmapId = response.roadmap_id
                
                // Animate progress up to 100% over 4 seconds
                for (p in 1..100) {
                    delay(40)
                    updateLoadingUI(p)
                }
                
                isOfflineMode = false
                fetchRoadmapDetails(response.roadmap_id)
            } catch (e: Exception) {
                // Animate progress for fallback scenario too so it looks premium
                for (p in 1..100) {
                    delay(20)
                    updateLoadingUI(p)
                }
                isOfflineMode = true
                activeRoadmapId = 101
                setupOfflineRoadmap()
            } finally {
                binding.clLoading.visibility = View.GONE
            }
        }
    }

    private fun updateLoadingUI(progress: Int) {
        if (_binding == null) return
        binding.pbLoadingProgress.progress = progress
        binding.tvLoadingPct.text = "$progress%"
        
        val colorPrimaryBright = ContextCompat.getColor(requireContext(), R.color.color_primary_bright)
        val colorTextPrimary = ContextCompat.getColor(requireContext(), R.color.color_text_primary)
        val colorTextTertiary = ContextCompat.getColor(requireContext(), R.color.color_text_tertiary)
        val colorEmerald = ContextCompat.getColor(requireContext(), R.color.color_emerald)
        
        when {
            progress < 25 -> {
                binding.tvLoadingStatus.text = "Analyzing your skill profile..."
                
                // Step 1: In progress
                binding.ivStep1Icon.setImageResource(R.drawable.bg_pulse_dot_cyan)
                binding.ivStep1Icon.imageTintList = null
                binding.tvStep1Title.setTextColor(colorTextPrimary)
                binding.tvStep1Title.setTypeface(null, android.graphics.Typeface.BOLD)
                binding.tvStep1Status.text = "In progress"
                binding.tvStep1Status.setTextColor(colorPrimaryBright)
                
                // Steps 2, 3, 4: Pending
                setStepPending(binding.ivStep2Icon, binding.tvStep2Title, binding.tvStep2Status)
                setStepPending(binding.ivStep3Icon, binding.tvStep3Title, binding.tvStep3Status)
                setStepPending(binding.ivStep4Icon, binding.tvStep4Title, binding.tvStep4Status)
            }
            progress in 25..49 -> {
                binding.tvLoadingStatus.text = "Mapping prerequisite concepts..."
                
                // Step 1: Completed
                binding.ivStep1Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep1Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep1Title.setTextColor(colorTextTertiary)
                binding.tvStep1Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep1Status.text = "Completed"
                binding.tvStep1Status.setTextColor(colorEmerald)
                
                // Step 2: In progress
                binding.ivStep2Icon.setImageResource(R.drawable.bg_pulse_dot_cyan)
                binding.ivStep2Icon.imageTintList = null
                binding.tvStep2Title.setTextColor(colorTextPrimary)
                binding.tvStep2Title.setTypeface(null, android.graphics.Typeface.BOLD)
                binding.tvStep2Status.text = "In progress"
                binding.tvStep2Status.setTextColor(colorPrimaryBright)
                
                // Steps 3, 4: Pending
                setStepPending(binding.ivStep3Icon, binding.tvStep3Title, binding.tvStep3Status)
                setStepPending(binding.ivStep4Icon, binding.tvStep4Title, binding.tvStep4Status)
            }
            progress in 50..74 -> {
                binding.tvLoadingStatus.text = "Optimizing learning sequence..."
                
                // Step 1: Completed
                binding.ivStep1Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep1Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep1Title.setTextColor(colorTextTertiary)
                binding.tvStep1Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep1Status.text = "Completed"
                binding.tvStep1Status.setTextColor(colorEmerald)
                
                // Step 2: Completed
                binding.ivStep2Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep2Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep2Title.setTextColor(colorTextTertiary)
                binding.tvStep2Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep2Status.text = "Completed"
                binding.tvStep2Status.setTextColor(colorEmerald)
                
                // Step 3: In progress
                binding.ivStep3Icon.setImageResource(R.drawable.bg_pulse_dot_cyan)
                binding.ivStep3Icon.imageTintList = null
                binding.tvStep3Title.setTextColor(colorTextPrimary)
                binding.tvStep3Title.setTypeface(null, android.graphics.Typeface.BOLD)
                binding.tvStep3Status.text = "In progress"
                binding.tvStep3Status.setTextColor(colorPrimaryBright)
                
                // Step 4: Pending
                setStepPending(binding.ivStep4Icon, binding.tvStep4Title, binding.tvStep4Status)
            }
            else -> {
                binding.tvLoadingStatus.text = "Finalizing personalized roadmap..."
                
                // Step 1, 2, 3: Completed
                binding.ivStep1Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep1Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep1Title.setTextColor(colorTextTertiary)
                binding.tvStep1Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep1Status.text = "Completed"
                binding.tvStep1Status.setTextColor(colorEmerald)
                
                binding.ivStep2Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep2Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep2Title.setTextColor(colorTextTertiary)
                binding.tvStep2Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep2Status.text = "Completed"
                binding.tvStep2Status.setTextColor(colorEmerald)
                
                binding.ivStep3Icon.setImageResource(R.drawable.ic_check)
                binding.ivStep3Icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvStep3Title.setTextColor(colorTextTertiary)
                binding.tvStep3Title.setTypeface(null, android.graphics.Typeface.NORMAL)
                binding.tvStep3Status.text = "Completed"
                binding.tvStep3Status.setTextColor(colorEmerald)
                
                // Step 4: In progress
                binding.ivStep4Icon.setImageResource(R.drawable.bg_pulse_dot_cyan)
                binding.ivStep4Icon.imageTintList = null
                binding.tvStep4Title.setTextColor(colorTextPrimary)
                binding.tvStep4Title.setTypeface(null, android.graphics.Typeface.BOLD)
                binding.tvStep4Status.text = "In progress"
                binding.tvStep4Status.setTextColor(colorPrimaryBright)
            }
        }
    }
    
    private fun setStepPending(icon: android.widget.ImageView, titleView: android.widget.TextView, statusView: android.widget.TextView) {
        val colorTextTertiary = ContextCompat.getColor(requireContext(), R.color.color_text_tertiary)
        icon.setImageResource(R.drawable.bg_indicator_dot_inactive)
        icon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_text_tertiary)
        titleView.setTextColor(colorTextTertiary)
        titleView.setTypeface(null, android.graphics.Typeface.NORMAL)
        statusView.text = "Pending"
        statusView.setTextColor(colorTextTertiary)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    data class MilestoneDto(
        val id: String,
        val week: String,
        val phase: Int,
        val title: String,
        val desc: String,
        var completed: Boolean,
        val resources: List<Map<String, Any>>? = null,
        val projectTitle: String? = null,
        val projectDesc: String? = null
    )

    inner class MilestoneAdapter(
        private val list: List<MilestoneDto>,
        private val onCheckChanged: (MilestoneDto, Boolean) -> Unit
    ) : RecyclerView.Adapter<MilestoneAdapter.MilestoneViewHolder>() {

        inner class MilestoneViewHolder(val itemBinding: com.aicareer.navigator.databinding.ItemMilestoneCardBinding) :
            RecyclerView.ViewHolder(itemBinding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MilestoneViewHolder {
            val itemBinding = com.aicareer.navigator.databinding.ItemMilestoneCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return MilestoneViewHolder(itemBinding)
        }

        override fun onBindViewHolder(holder: MilestoneViewHolder, position: Int) {
            val item = list[position]
            val binding = holder.itemBinding

            binding.tvStep.text = item.week.uppercase()
            binding.tvTitle.text = item.title

            // Prevent event trigger recursion during binding
            binding.cbComplete.setOnCheckedChangeListener(null)
            binding.cbComplete.isChecked = item.completed

            // Configure dynamic resource text chips as per design.md parameters
            binding.tvResourcesCount.text = "${item.resources?.size ?: 2} Resources"
            binding.tvEstimatedHours.text = "12 hrs"

            // Render status icons based on completion checklist
            if (item.completed) {
                binding.ivStatusIcon.setImageResource(R.drawable.ic_bookmark)
                binding.ivStatusIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald)
                binding.tvTitle.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_tertiary))
            } else {
                binding.ivStatusIcon.setImageResource(R.drawable.ic_arrow_right)
                binding.ivStatusIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_text_secondary)
                binding.tvTitle.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_primary))
            }

            binding.cbComplete.setOnCheckedChangeListener { _, isChecked ->
                onCheckChanged(item, isChecked)
            }

            binding.root.setOnClickListener {
                // Navigate to milestone detail screen with arguments
                val bundle = Bundle().apply {
                    putString("milestoneId", item.id)
                    putBoolean("completed", item.completed)
                    putInt("roadmapId", activeRoadmapId ?: 101)
                    putString("title", item.title)
                    putString("desc", item.desc)
                    putString("week", item.week)
                    putInt("phase", item.phase)
                    putString("projectTitle", item.projectTitle)
                    putString("projectDesc", item.projectDesc)
                    
                    // Convert resources to JSON string
                    val gson = com.google.gson.Gson()
                    putString("resourcesJson", gson.toJson(item.resources))
                }
                findNavController().navigate(R.id.action_roadmap_to_detail, bundle)
            }
        }

        override fun getItemCount(): Int = list.size
    }
}
