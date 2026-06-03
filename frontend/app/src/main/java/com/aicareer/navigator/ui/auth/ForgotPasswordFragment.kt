package com.aicareer.navigator.ui.auth

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentForgotPasswordBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ForgotPasswordFragment : Fragment() {

    private var _binding: FragmentForgotPasswordBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentForgotPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initial state for entrance animations
        binding.ivLogo.alpha = 0f
        binding.ivLogo.translationY = -40f
        binding.tvTitle.alpha = 0f
        binding.tvTitle.translationY = -40f
        binding.tvSubtitle.alpha = 0f
        binding.tvSubtitle.translationY = -40f
        binding.cardForm.alpha = 0f
        binding.cardForm.scaleX = 0.92f
        binding.cardForm.scaleY = 0.92f
        binding.btnBackToLogin.alpha = 0f

        // Perform stagger entrance animations
        binding.ivLogo.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(100).start()
        binding.tvTitle.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(200).start()
        binding.tvSubtitle.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(300).start()
        binding.cardForm.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(600).setStartDelay(400).start()
        binding.btnBackToLogin.animate().alpha(1f).setDuration(500).setStartDelay(650).start()

        binding.btnReset.setOnClickListener {
            performPasswordReset()
        }

        binding.btnBackToLogin.setOnClickListener {
            findNavController().popBackStack()
        }

        observeForgotPasswordState()
    }

    private fun performPasswordReset() {
        val email = binding.etEmail.text.toString().trim()

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = "Please enter a valid email address"
            return
        } else {
            binding.tilEmail.error = null
        }

        viewModel.forgotPassword(email)
    }

    private fun observeForgotPasswordState() {
        lifecycleScope.launch {
            viewModel.forgotPasswordState.collectLatest { state ->
                when (state) {
                    is UiState.Idle -> {
                        binding.btnReset.isEnabled = true
                        binding.btnReset.text = "Send Instructions"
                    }
                    is UiState.Loading -> {
                        binding.btnReset.isEnabled = false
                        binding.btnReset.text = "Sending..."
                    }
                    is UiState.Success -> {
                        Toast.makeText(requireContext(), "Reset OTP Sent to your email", Toast.LENGTH_LONG).show()
                        val bundle = Bundle().apply {
                            putString("email", binding.etEmail.text.toString().trim())
                            putBoolean("isForgotPassword", true)
                        }
                        findNavController().navigate(R.id.action_forgot_password_to_otp, bundle)
                    }
                    is UiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        binding.btnReset.isEnabled = true
                        binding.btnReset.text = "Send Instructions"
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
