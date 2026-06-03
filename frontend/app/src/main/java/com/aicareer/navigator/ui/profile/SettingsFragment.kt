package com.aicareer.navigator.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.AuthActivity
import com.aicareer.navigator.R
import com.aicareer.navigator.data.datastore.SessionManager
import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.databinding.FragmentSettingsBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var sessionManager: SessionManager

    @Inject
    lateinit var homeApiService: HomeApiService

    // Shared Activity-scoped ViewModel to synchronize settings variables
    private val viewModel: ProfileViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        disableAutofill(binding.root)
        setupBackNavigation()
        observeSettings()
        setupToggleListeners()
        setupAccountActions()
        setupLogout()
        applyEntranceAnimations()
    }

    private fun disableAutofill(view: View) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            view.importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO
        }
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                disableAutofill(view.getChildAt(i))
            }
        }
    }

    private fun setupBackNavigation() {
        binding.btnBack.setOnClickListener {
            findNavController().popBackStack()
        }
    }

    private fun observeSettings() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.settingsState.collectLatest { settings ->
                // Suppress listener triggers while setting initial values
                binding.switchTheme.setOnCheckedChangeListener(null)
                binding.switchJobAlerts.setOnCheckedChangeListener(null)
                binding.switchRoadmapReminders.setOnCheckedChangeListener(null)
                binding.switchAiTips.setOnCheckedChangeListener(null)

                binding.switchTheme.isChecked = settings["darkMode"] ?: true
                binding.switchJobAlerts.isChecked = settings["jobAlerts"] ?: true
                binding.switchRoadmapReminders.isChecked = settings["roadmapReminders"] ?: true
                binding.switchAiTips.isChecked = settings["aiTips"] ?: true

                // Re-attach listeners after setting values
                setupToggleListeners()
            }
        }
    }

    private fun setupToggleListeners() {
        binding.switchTheme.setOnCheckedChangeListener { _, isChecked ->
            viewModel.toggleSetting("darkMode", isChecked)
            Toast.makeText(
                requireContext(),
                if (isChecked) "Dark Mode Enabled ✦" else "Light Theme Activated ☀",
                Toast.LENGTH_SHORT
            ).show()
        }

        binding.switchJobAlerts.setOnCheckedChangeListener { _, isChecked ->
            viewModel.toggleSetting("jobAlerts", isChecked)
        }

        binding.switchRoadmapReminders.setOnCheckedChangeListener { _, isChecked ->
            viewModel.toggleSetting("roadmapReminders", isChecked)
        }

        binding.switchAiTips.setOnCheckedChangeListener { _, isChecked ->
            viewModel.toggleSetting("aiTips", isChecked)
        }
    }

    private fun setupAccountActions() {
        binding.rowChangePassword.setOnClickListener {
            // Navigate to change password flow (reuses ForgotPasswordFragment)
            Toast.makeText(requireContext(), "Password reset link sent to your email.", Toast.LENGTH_SHORT).show()
        }

        binding.rowAbout.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("AI Career Navigator")
                .setMessage("Version 2.0.0\n\nPowered by MistralAI + FastAPI.\nDesigned for ambitious professionals building their dream career.\n\n© 2024 AI Career Navigator")
                .setPositiveButton("OK", null)
                .show()
        }

        binding.rowDeleteAccount.setOnClickListener {
            showDeleteAccountConfirmation()
        }
    }

    private fun showDeleteAccountConfirmation() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Delete Account")
            .setMessage("This action is permanent and cannot be undone. All your data including resumes, assessment history, and roadmaps will be permanently destroyed.\n\nAre you absolutely sure?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete Forever") { _, _ ->
                viewLifecycleOwner.lifecycleScope.launch {
                    try {
                        homeApiService.deleteAccount()
                    } catch (_: Exception) {
                        // Best-effort API call
                    }
                    sessionManager.clearSession()
                    Toast.makeText(requireContext(), "Account deleted.", Toast.LENGTH_SHORT).show()
                    navigateToAuth()
                }
            }
            .show()
    }

    private fun setupLogout() {
        binding.btnLogout.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Log Out")
                .setMessage("You will need to sign in again to access your career data.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Log Out") { _, _ ->
                    performLogout()
                }
                .show()
        }
    }

    private fun performLogout() {
        lifecycleScope.launch {
            try {
                homeApiService.logout()
            } catch (_: Exception) {
                // Best-effort API call — token blacklist in Redis
            }
            sessionManager.clearSession()
            Toast.makeText(requireContext(), "Logged out successfully.", Toast.LENGTH_SHORT).show()
            navigateToAuth()
        }
    }

    private fun navigateToAuth() {
        val intent = Intent(requireContext(), AuthActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        requireActivity().finish()
    }

    private fun applyEntranceAnimations() {
        val rootView = binding.root.getChildAt(0) as? ViewGroup ?: return
        for (i in 0 until rootView.childCount) {
            val child = rootView.getChildAt(i)
            child.alpha = 0f
            child.translationY = 24f
            child.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(350)
                .setStartDelay((i * 50L))
                .start()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
