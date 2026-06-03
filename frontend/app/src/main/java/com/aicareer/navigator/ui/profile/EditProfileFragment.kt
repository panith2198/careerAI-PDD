package com.aicareer.navigator.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentEditProfileBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class EditProfileFragment : Fragment() {

    private var _binding: FragmentEditProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by activityViewModels()

    private val workModes = listOf("remote", "onsite", "hybrid")
    private val educationLevels = listOf("12th", "diploma", "btech", "mtech", "mba", "phd")

    private var currentStep = 1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEditProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Toolbar back action
        binding.toolbar.findViewById<View>(R.id.btn_back)?.setOnClickListener {
            if (currentStep > 1) {
                moveToStep(currentStep - 1)
            } else {
                findNavController().popBackStack()
            }
        }

        setupSpinnersAndAutocompletes()
        observeProfileState()

        // Wizard button controls
        binding.btnPrev.setOnClickListener {
            if (currentStep > 1) {
                moveToStep(currentStep - 1)
            }
        }

        binding.btnNextSave.setOnClickListener {
            handleNextOrSave()
        }

        // Initialize state indicators
        moveToStep(1)
    }

    private fun setupSpinnersAndAutocompletes() {
        val workAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, workModes.map { it.uppercase() })
        binding.spWorkMode.setAdapter(workAdapter)

        val eduAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, educationLevels.map { it.uppercase() })
        binding.spEducationLevel.setAdapter(eduAdapter)

        val cities = listOf("Bengaluru", "Pune", "Mumbai", "Delhi", "Hyderabad", "Chennai")
        val citiesAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, cities)
        binding.actvCity.setAdapter(citiesAdapter)
    }

    private fun observeProfileState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.profileState.collectLatest { state ->
                if (state is ProfileUiState.Success) {
                    val me = state.response
                    binding.etName.setText(me.full_name ?: "")
                    binding.etBio.setText(me.profile?.preferred_work_mode ?: "Android Developer")
                    binding.actvCity.setText(me.profile?.city ?: "")
                    binding.etState.setText(me.profile?.state ?: "")

                    binding.spWorkMode.setText((me.profile?.preferred_work_mode ?: "hybrid").uppercase(), false)
                    binding.spEducationLevel.setText((me.profile?.education_level ?: "btech").uppercase(), false)

                    binding.etFieldOfStudy.setText(me.profile?.field_of_study ?: "")
                    binding.etInstitutionName.setText(me.profile?.institution_name ?: "")
                    binding.etGraduationYear.setText((me.profile?.graduation_year ?: 2026).toString())

                    binding.etSalary.setText((me.profile?.expected_salary_min ?: 12).toString())
                    binding.etLinkedinUrl.setText(me.profile?.linkedin_url ?: "")
                    binding.etGithubUrl.setText(me.profile?.github_url ?: "")
                }
            }
        }
    }

    private fun moveToStep(step: Int) {
        currentStep = step

        // Update step counter text indicator
        binding.tvStepCounter.text = "Step $step of 3"

        // Toggle container visibility
        binding.llStep1Container.visibility = if (step == 1) View.VISIBLE else View.GONE
        binding.llStep2Container.visibility = if (step == 2) View.VISIBLE else View.GONE
        binding.llStep3Container.visibility = if (step == 3) View.VISIBLE else View.GONE

        // Toggle previous button
        binding.btnPrev.visibility = if (step == 1) View.GONE else View.VISIBLE

        // Change wizard title, text, and header icons
        when (step) {
            1 -> {
                binding.ivWizardHeaderIcon.setImageResource(R.drawable.ic_profile)
                binding.tvWizardTitle.text = "Step 1: Identity & Location"
                binding.tvWizardDesc.text = "Set up your primary identity and preferred location details."
                binding.btnNextSave.text = "Next Step"
                
                // Colors for indicators
                binding.tvIndicatorStep1.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_primary)
                binding.tvIndicatorStep1.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_on_primary))
                
                binding.viewLine1.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.color_surface_3))
                
                binding.tvIndicatorStep2.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                binding.tvIndicatorStep2.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            }
            2 -> {
                binding.ivWizardHeaderIcon.setImageResource(R.drawable.ic_education)
                binding.tvWizardTitle.text = "Step 2: Academic Background"
                binding.tvWizardDesc.text = "Specify your highest qualification, specialization major, and institute."
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
                binding.ivWizardHeaderIcon.setImageResource(R.drawable.ic_trend_up)
                binding.tvWizardTitle.text = "Step 3: Preferences & Links"
                binding.tvWizardDesc.text = "Set your expected salary bar and professional portfolio web profiles."
                binding.btnNextSave.text = "Save Changes"

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
                val fullName = binding.etName.text?.toString()?.trim() ?: ""
                if (fullName.isEmpty()) {
                    Toast.makeText(requireContext(), "Full name is required!", Toast.LENGTH_SHORT).show()
                    return
                }
                moveToStep(2)
            }
            2 -> {
                val study = binding.etFieldOfStudy.text?.toString()?.trim() ?: ""
                val college = binding.etInstitutionName.text?.toString()?.trim() ?: ""
                if (study.isEmpty() || college.isEmpty()) {
                    Toast.makeText(requireContext(), "Degree study and college are required!", Toast.LENGTH_SHORT).show()
                    return
                }
                moveToStep(3)
            }
            3 -> {
                saveAllChanges()
            }
        }
    }

    private fun saveAllChanges() {
        val fullName = binding.etName.text?.toString()?.trim() ?: "Eswar"
        val bio = binding.etBio.text?.toString()?.trim() ?: "Software Developer"
        val city = binding.actvCity.text?.toString()?.trim() ?: "Bengaluru"
        val state = binding.etState.text?.toString()?.trim() ?: "Karnataka"
        val workModeSelected = binding.spWorkMode.text.toString().trim().lowercase()
        val workMode = if (workModeSelected in workModes) workModeSelected else "hybrid"
        
        val eduLevelSelected = binding.spEducationLevel.text.toString().trim().lowercase()
        val eduLevel = if (eduLevelSelected in educationLevels) eduLevelSelected else "btech"
        val fieldOfStudy = binding.etFieldOfStudy.text?.toString()?.trim() ?: "Computer Science"
        val institutionName = binding.etInstitutionName.text?.toString()?.trim() ?: "IIT"
        val gradYear = binding.etGraduationYear.text?.toString()?.trim()?.toIntOrNull() ?: 2026

        val salary = binding.etSalary.text?.toString()?.trim()?.toIntOrNull() ?: 12
        val linkedin = binding.etLinkedinUrl.text?.toString()?.trim() ?: ""
        val github = binding.etGithubUrl.text?.toString()?.trim() ?: ""

        viewModel.updateProfile(
            fullName = fullName,
            bio = bio,
            city = city,
            state = state,
            preferredWorkMode = workMode,
            expectedSalaryMin = salary,
            educationLevel = eduLevel,
            fieldOfStudy = fieldOfStudy,
            institutionName = institutionName,
            graduationYear = gradYear,
            linkedinUrl = linkedin,
            githubUrl = github
        )

        Toast.makeText(requireContext(), "Smart Profile updated successfully!", Toast.LENGTH_SHORT).show()
        findNavController().popBackStack()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
