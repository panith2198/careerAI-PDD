package com.aicareer.navigator.ui.profile

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.SkillDto
import com.aicareer.navigator.data.remote.UserSkillAddPayload
import com.aicareer.navigator.data.remote.UserSkillDto
import com.aicareer.navigator.databinding.FragmentSkillsBinding
import com.aicareer.navigator.databinding.ItemSkillGapBinding
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SkillsFragment : Fragment() {

    private var _binding: FragmentSkillsBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var homeApiService: HomeApiService

    private lateinit var adapter: UserSkillsAdapter
    private var allSkills = mutableListOf<UserSkillDto>()
    private var autocompleteList = mutableListOf<SkillDto>()
    private var selectedSkillFromSearch: SkillDto? = null

    private val proficiencyLevels = listOf("beginner", "intermediate", "advanced", "expert")
    private val skillSources = listOf("self", "assessment", "ai", "resume")

    private var currentStep = 1
    private var isEditMode = false
    private var editingUserSkillId: Int? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSkillsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Toolbar back action
        binding.toolbar.findViewById<View>(R.id.btn_back)?.setOnClickListener {
            if (binding.svWizardContainer.visibility == View.VISIBLE) {
                if (currentStep > 1) {
                    moveToStep(currentStep - 1)
                } else {
                    exitWizardMode()
                }
            } else {
                findNavController().popBackStack()
            }
        }

        setupRecyclerView()
        setupSpinnersAndAutocompletes()
        loadUserSkills()

        binding.btnTriggerAddWizard.setOnClickListener {
            enterWizardMode(editItem = null)
        }

        binding.btnImproveSkills.setOnClickListener {
            findNavController().navigate(R.id.action_skills_to_assessment)
        }

        // Wizard navigation button click listeners
        binding.btnPrev.setOnClickListener {
            if (currentStep > 1) {
                moveToStep(currentStep - 1)
            } else {
                exitWizardMode()
            }
        }

        binding.btnNextSave.setOnClickListener {
            handleNextOrSave()
        }
    }

    private fun setupRecyclerView() {
        binding.rvSkills.layoutManager = LinearLayoutManager(requireContext())
        adapter = UserSkillsAdapter(emptyList()) { skill ->
            // Tapping a skill opens it in EDIT wizard mode
            enterWizardMode(editItem = skill)
        }
        binding.rvSkills.adapter = adapter

        // Setup swipe-to-delete skill
        val swipeHandler = object : ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT) {
            override fun onMove(
                recyclerView: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                target: RecyclerView.ViewHolder
            ): Boolean = false

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val position = viewHolder.adapterPosition
                val targetSkill = adapter.currentList[position]

                viewLifecycleOwner.lifecycleScope.launch {
                    try {
                        homeApiService.deleteUserSkill(targetSkill.user_skill_id)
                        Toast.makeText(requireContext(), "Removed: ${targetSkill.skill_name}", Toast.LENGTH_SHORT).show()
                        loadUserSkills()
                    } catch (e: Exception) {
                        // Offline mock deletion
                        allSkills.removeAt(position)
                        adapter.updateData(allSkills)
                        Snackbar.make(binding.root, "Removed ${targetSkill.skill_name} offline", Snackbar.LENGTH_LONG).show()
                    }
                }
            }
        }
        ItemTouchHelper(swipeHandler).attachToRecyclerView(binding.rvSkills)
    }

    private fun setupSpinnersAndAutocompletes() {
        // Proficiency levels exposed dropdown menu
        val profAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, proficiencyLevels.map { it.uppercase() })
        binding.spProficiencyLevel.setAdapter(profAdapter)

        // Sources exposed dropdown menu
        val sourceAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, skillSources.map { it.uppercase() })
        binding.spSkillSource.setAdapter(sourceAdapter)

        // Autocomplete search setup
        val searchAdapter = ArrayAdapter<String>(requireContext(), android.R.layout.simple_dropdown_item_1line)
        binding.actvSkillSearch.setAdapter(searchAdapter)

        binding.actvSkillSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val prefix = s?.toString() ?: ""
                if (prefix.length >= 2) {
                    viewLifecycleOwner.lifecycleScope.launch {
                        try {
                            val results = homeApiService.autocompleteSkills(prefix)
                            autocompleteList = results.toMutableList()
                            searchAdapter.clear()
                            searchAdapter.addAll(results.map { it.skill_name })
                            searchAdapter.notifyDataSetChanged()
                        } catch (e: Exception) {
                            val fallbacks = getMockTaxonomy().filter { it.skill_name.contains(prefix, ignoreCase = true) }
                            autocompleteList = fallbacks.toMutableList()
                            searchAdapter.clear()
                            searchAdapter.addAll(fallbacks.map { it.skill_name })
                            searchAdapter.notifyDataSetChanged()
                        }
                    }
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.actvSkillSearch.onItemClickListener = AdapterView.OnItemClickListener { parent, view, position, id ->
            val selection = parent.getItemAtPosition(position) as String
            val selected = autocompleteList.find { it.skill_name == selection }
            if (selected != null) {
                selectedSkillFromSearch = selected
                binding.tvSelectedSkillBadge.text = "Selected: ${selected.skill_name}"
                binding.tvSelectedSkillBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald_dim)
                binding.tvSelectedSkillBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_emerald))
            }
        }
    }

    private fun loadUserSkills() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val me = homeApiService.getMe()
                allSkills = (me.skills ?: emptyList()).toMutableList()
                adapter.updateData(allSkills)
            } catch (e: Exception) {
                val mockSkills = mutableListOf(
                    UserSkillDto(1, 1, "Kotlin programming", "expert", 3f),
                    UserSkillDto(2, 2, "Android UI & XML Layouts", "expert", 3f),
                    UserSkillDto(3, 3, "Jetpack Compose", "advanced", 2f),
                    UserSkillDto(4, 4, "Hilt Dependency injection", "advanced", 1.5f)
                )
                allSkills = mockSkills
                adapter.updateData(allSkills)
            }
        }
    }

    private fun enterWizardMode(editItem: UserSkillDto?) {
        binding.clListContainer.visibility = View.GONE
        binding.svWizardContainer.visibility = View.VISIBLE

        if (editItem != null) {
            isEditMode = true
            editingUserSkillId = editItem.user_skill_id
            selectedSkillFromSearch = SkillDto(editItem.skill_id, editItem.skill_name)
            
            binding.actvSkillSearch.setText(editItem.skill_name)
            binding.tvSelectedSkillBadge.text = "Editing: ${editItem.skill_name}"
            binding.tvSelectedSkillBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_emerald_dim)
            binding.tvSelectedSkillBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_emerald))

            // Step 2 values
            binding.spProficiencyLevel.setText(editItem.proficiency_level.uppercase(), false)
            binding.etYearsExperience.setText(editItem.years_of_experience.toString())

            // Step 3 default
            binding.spSkillSource.setText(skillSources[0].uppercase(), false)
            binding.swConfirmDeclaration.isChecked = true
        } else {
            isEditMode = false
            editingUserSkillId = null
            selectedSkillFromSearch = null
            binding.actvSkillSearch.text.clear()
            binding.tvSelectedSkillBadge.text = "No skill selected yet"
            binding.tvSelectedSkillBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
            binding.tvSelectedSkillBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            binding.etYearsExperience.setText("1.0")
            binding.spProficiencyLevel.setText(proficiencyLevels[1].uppercase(), false) // default intermediate
            binding.spSkillSource.setText(skillSources[0].uppercase(), false) // default self
            binding.swConfirmDeclaration.isChecked = false
        }

        moveToStep(1)
    }

    private fun exitWizardMode() {
        binding.clListContainer.visibility = View.VISIBLE
        binding.svWizardContainer.visibility = View.GONE
        loadUserSkills()
    }

    private fun moveToStep(step: Int) {
        currentStep = step

        binding.llStep1Container.visibility = if (step == 1) View.VISIBLE else View.GONE
        binding.llStep2Container.visibility = if (step == 2) View.VISIBLE else View.GONE
        binding.llStep3Container.visibility = if (step == 3) View.VISIBLE else View.GONE

        // Indicators style toggles
        when (step) {
            1 -> {
                binding.tvWizardTitle.text = "Step 1: Choose Skill Taxonomy"
                binding.tvWizardDesc.text = "Select the technology domain or canonical engineering skill."
                binding.btnNextSave.text = "Next Step"

                binding.tvIndicatorStep1.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary)
                binding.tvIndicatorStep1.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))

                binding.viewLine1.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))

                binding.tvIndicatorStep2.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                binding.tvIndicatorStep2.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            }
            2 -> {
                binding.tvWizardTitle.text = "Step 2: Experience & Level"
                binding.tvWizardDesc.text = "Define your practical years of exposure and declared proficiency bar."
                binding.btnNextSave.text = "Next Step"

                binding.tvIndicatorStep1.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary_muted)
                binding.tvIndicatorStep1.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))

                binding.viewLine1.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_primary))

                binding.tvIndicatorStep2.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary)
                binding.tvIndicatorStep2.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))

                binding.viewLine2.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))

                binding.tvIndicatorStep3.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                binding.tvIndicatorStep3.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            }
            3 -> {
                binding.tvWizardTitle.text = "Step 3: Verification & Source"
                binding.tvWizardDesc.text = "Identify how this skill was acquired and sign the declaration."
                binding.btnNextSave.text = "Confirm & Save"

                binding.tvIndicatorStep2.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary_muted)
                binding.tvIndicatorStep2.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))

                binding.viewLine2.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_primary))

                binding.tvIndicatorStep3.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary)
                binding.tvIndicatorStep3.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))
            }
        }
    }

    private fun handleNextOrSave() {
        when (currentStep) {
            1 -> {
                if (selectedSkillFromSearch == null) {
                    Toast.makeText(requireContext(), "Please search and select a skill from taxonomy first!", Toast.LENGTH_SHORT).show()
                    return
                }
                moveToStep(2)
            }
            2 -> {
                val expStr = binding.etYearsExperience.text?.toString()?.trim() ?: ""
                val exp = expStr.toFloatOrNull()
                if (exp == null || exp < 0.0f) {
                    Toast.makeText(requireContext(), "Please enter a valid non-negative years of experience!", Toast.LENGTH_SHORT).show()
                    return
                }
                moveToStep(3)
            }
            3 -> {
                if (!binding.swConfirmDeclaration.isChecked) {
                    Toast.makeText(requireContext(), "Please confirm the declaration switch before saving!", Toast.LENGTH_SHORT).show()
                    return
                }
                saveOrUpdateSkill()
            }
        }
    }

    private fun saveOrUpdateSkill() {
        val selectedSkill = selectedSkillFromSearch ?: return
        val selectedLevel = binding.spProficiencyLevel.text.toString().trim().lowercase()
        val level = if (selectedLevel in proficiencyLevels) selectedLevel else "intermediate"
        val yearsExp = binding.etYearsExperience.text?.toString()?.trim()?.toFloatOrNull() ?: 1.0f
        
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                if (isEditMode && editingUserSkillId != null) {
                    // Update flow: Retrofit supports add and delete. For clean update we can delete then add,
                    // or simulate offline updates if needed.
                    try {
                        homeApiService.deleteUserSkill(editingUserSkillId!!)
                    } catch (e: Exception) {
                        // ignore if missing
                    }
                }
                
                // Add/Create live user skill binding
                val response = homeApiService.addUserSkill(
                    UserSkillAddPayload(
                        skill_id = selectedSkill.skill_id,
                        proficiency_level = level,
                        years_experience = yearsExp
                    )
                )
                Toast.makeText(requireContext(), "Successfully saved: ${selectedSkill.skill_name}!", Toast.LENGTH_SHORT).show()
                exitWizardMode()
            } catch (e: Exception) {
                // Offline mock fallback
                val mockId = editingUserSkillId ?: (100..999).random()
                val skillDto = UserSkillDto(
                    user_skill_id = mockId,
                    skill_id = selectedSkill.skill_id,
                    skill_name = selectedSkill.skill_name,
                    proficiency_level = level,
                    years_of_experience = yearsExp
                )
                
                if (isEditMode) {
                    allSkills.removeAll { it.user_skill_id == editingUserSkillId }
                }
                allSkills.add(skillDto)
                adapter.updateData(allSkills)
                Toast.makeText(requireContext(), "Saved offline: ${selectedSkill.skill_name}!", Toast.LENGTH_SHORT).show()
                exitWizardMode()
            }
        }
    }

    private fun getMockTaxonomy(): List<SkillDto> {
        return listOf(
            SkillDto(1, "Kotlin programming"),
            SkillDto(2, "Android UI & XML Layouts"),
            SkillDto(3, "Jetpack Compose"),
            SkillDto(4, "Hilt Dependency injection"),
            SkillDto(5, "Room Local Caching"),
            SkillDto(6, "Retrofit API Networking"),
            SkillDto(7, "JUnit Testing Framework"),
            SkillDto(8, "SQL"),
            SkillDto(9, "Python"),
            SkillDto(10, "React")
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    inner class UserSkillsAdapter(
        var currentList: List<UserSkillDto>,
        private val onItemClick: (UserSkillDto) -> Unit
    ) : RecyclerView.Adapter<UserSkillsAdapter.SkillViewHolder>() {

        inner class SkillViewHolder(val binding: ItemSkillGapBinding) :
            RecyclerView.ViewHolder(binding.root)

        fun updateData(newList: List<UserSkillDto>) {
            currentList = newList
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SkillViewHolder {
            val binding = ItemSkillGapBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return SkillViewHolder(binding)
        }

        override fun onBindViewHolder(holder: SkillViewHolder, position: Int) {
            val item = currentList[position]
            val binding = holder.binding

            binding.tvSkillName.text = item.skill_name
            binding.tvStatus.text = item.proficiency_level.uppercase()
            binding.tvStatus.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))

            // Experience badge
            binding.badgePriority.text = "${item.years_of_experience} YRS EXP"
            binding.badgePriority.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_cyan_dim)
            binding.badgePriority.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))

            // Bind column values
            binding.tvCurrentLevelVal.text = "Novice"
            binding.tvYearsExperienceVal.text = String.format("%.1f", item.years_of_experience)
            binding.tvRequiredLevelVal.text = "Proficient"

            // Course card details
            binding.llExpandableContent.visibility = View.VISIBLE
            binding.tvCourseTitle.text = "Competency level is self-declared as ${item.proficiency_level.uppercase()}."
            binding.tvCourseProvider.text = "Acquisition Source: SELF"

            // Set dynamic icon and tint based on skill name
            val nameLower = item.skill_name.lowercase()
            if (nameLower.contains("python")) {
                binding.ivTechIcon.setImageResource(R.drawable.ic_system_gear)
                binding.ivTechIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary_bright)
            } else if (nameLower.contains("sql")) {
                binding.ivTechIcon.setImageResource(R.drawable.ic_shield)
                binding.ivTechIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_cyan)
            } else {
                binding.ivTechIcon.setImageResource(R.drawable.ic_ai_sparkle)
                binding.ivTechIcon.imageTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary_bright)
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }

        override fun getItemCount(): Int = currentList.size
    }
}
