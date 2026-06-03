package com.aicareer.navigator.ui.auth

import android.os.Bundle
import android.os.CountDownTimer
import android.text.Editable
import android.text.TextWatcher
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.ResetPasswordPayload
import com.aicareer.navigator.databinding.FragmentOtpBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.Locale

@AndroidEntryPoint
class OtpFragment : Fragment() {

    private var _binding: FragmentOtpBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels()

    private var countDownTimer: CountDownTimer? = null
    private var email: String = ""
    private var isForgotPassword: Boolean = false
    
    private lateinit var pinBoxes: List<EditText>

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOtpBinding.inflate(inflater, container, false)
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

        email = arguments?.getString("email") ?: "your email"
        isForgotPassword = arguments?.getBoolean("isForgotPassword") ?: false

        pinBoxes = listOf(
            binding.etOtp1,
            binding.etOtp2,
            binding.etOtp3,
            binding.etOtp4,
            binding.etOtp5,
            binding.etOtp6
        )

        setupOtpGridInputs()

        if (isForgotPassword) {
            binding.tvTitle.text = "Reset Password"
            binding.tvSubtitle.text = "Enter the 6-digit OTP sent to $email along with your new password."
            binding.tilNewPassword.visibility = View.VISIBLE
            binding.tilConfirmPassword.visibility = View.VISIBLE
            binding.btnVerify.text = "Reset Password & Login"
        } else {
            binding.tvSubtitle.text = "We sent a 6-digit code to $email."
        }

        binding.btnVerify.setOnClickListener {
            highlightErrorBorders(false) // Reset error states on re-attempt
            if (isForgotPassword) {
                performPasswordReset()
            } else {
                verifyOtp()
            }
        }

        binding.btnBackToLogin.setOnClickListener {
            findNavController().popBackStack()
        }

        startResendTimer()
        observeOtpState()
        observeResetPasswordState()
    }

    private fun setupOtpGridInputs() {
        // Automatically focus the first pin input box
        pinBoxes[0].post { pinBoxes[0].requestFocus() }

        for (i in 0 until 6) {
            // Forward Focus progression
            pinBoxes[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    if (s != null && s.length == 1) {
                        if (i < 5) {
                            pinBoxes[i + 1].requestFocus()
                        }
                    }
                }

                override fun afterTextChanged(s: Editable?) {}
            })

            // Backspace/Delete focus shifts backwards cleanly
            pinBoxes[i].setOnKeyListener { _, keyCode, event ->
                if (event.action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_DEL) {
                    if (pinBoxes[i].text.toString().isEmpty()) {
                        if (i > 0) {
                            pinBoxes[i - 1].text?.clear()
                            pinBoxes[i - 1].requestFocus()
                        }
                    } else {
                        pinBoxes[i].text?.clear()
                    }
                    true
                } else {
                    false
                }
            }
        }
    }

    private fun getOtpCode(): String {
        val sb = StringBuilder()
        for (box in pinBoxes) {
            sb.append(box.text.toString().trim())
        }
        return sb.toString()
    }

    private fun highlightErrorBorders(hasError: Boolean) {
        val bgDrawable = if (hasError) R.drawable.bg_otp_box_error else R.drawable.bg_otp_box
        for (box in pinBoxes) {
            box.setBackgroundResource(bgDrawable)
        }
    }

    private fun startResendTimer() {
        countDownTimer?.cancel()
        
        countDownTimer = object : CountDownTimer(300000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val totalSeconds = millisUntilFinished / 1000
                val minutes = totalSeconds / 60
                val seconds = totalSeconds % 60
                val btnText = if (isForgotPassword) "Reset Password & Login" else "Verify & Continue"
                binding.btnVerify.text = String.format(Locale.getDefault(), "$btnText (%02d:%02d)", minutes, seconds)
            }

            override fun onFinish() {
                binding.btnVerify.text = if (isForgotPassword) "Reset Password & Login" else "Verify & Continue"
                Toast.makeText(requireContext(), "You can request to resend the code now", Toast.LENGTH_SHORT).show()
            }
        }.start()
    }

    private fun verifyOtp() {
        val code = getOtpCode()

        if (code.length < 6) {
            Toast.makeText(requireContext(), "Please enter the full 6-digit OTP", Toast.LENGTH_SHORT).show()
            highlightErrorBorders(true)
            return
        }

        viewModel.verifyOtp(email, code)
    }

    private fun performPasswordReset() {
        val code = getOtpCode()
        val newPassword = binding.etNewPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()

        if (code.length < 6) {
            Toast.makeText(requireContext(), "Please enter the full 6-digit OTP", Toast.LENGTH_SHORT).show()
            highlightErrorBorders(true)
            return
        }

        if (newPassword.isEmpty() || newPassword.length < 6) {
            binding.tilNewPassword.error = "Password must be at least 6 characters"
            return
        } else {
            binding.tilNewPassword.error = null
        }

        if (confirmPassword != newPassword) {
            binding.tilConfirmPassword.error = "Passwords do not match"
            return
        } else {
            binding.tilConfirmPassword.error = null
        }

        viewModel.resetPassword(ResetPasswordPayload(email, code, newPassword))
    }

    private fun observeOtpState() {
        lifecycleScope.launch {
            viewModel.otpState.collectLatest { state ->
                when (state) {
                    is UiState.Idle -> {
                        if (!isForgotPassword) {
                            binding.btnVerify.isEnabled = true
                        }
                    }
                    is UiState.Loading -> {
                        if (!isForgotPassword) {
                            binding.btnVerify.isEnabled = false
                            binding.btnVerify.text = "Verifying..."
                        }
                    }
                    is UiState.Success -> {
                        Toast.makeText(requireContext(), "OTP Verified!", Toast.LENGTH_SHORT).show()
                        findNavController().navigate(R.id.action_otp_to_onboarding)
                    }
                    is UiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        highlightErrorBorders(true) // Display Rose error borders
                        binding.btnVerify.isEnabled = true
                        startResendTimer()
                    }
                }
            }
        }
    }

    private fun observeResetPasswordState() {
        lifecycleScope.launch {
            viewModel.resetPasswordState.collectLatest { state ->
                when (state) {
                    is UiState.Idle -> {
                        if (isForgotPassword) {
                            binding.btnVerify.isEnabled = true
                            binding.btnVerify.text = "Reset Password & Login"
                        }
                    }
                    is UiState.Loading -> {
                        if (isForgotPassword) {
                            binding.btnVerify.isEnabled = false
                            binding.btnVerify.text = "Resetting..."
                        }
                    }
                    is UiState.Success -> {
                        Toast.makeText(requireContext(), "Password Reset Successfully! Logging you in...", Toast.LENGTH_LONG).show()
                        findNavController().navigate(R.id.action_otp_to_onboarding)
                    }
                    is UiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        highlightErrorBorders(true) // Display Rose error borders
                        binding.btnVerify.isEnabled = true
                        startResendTimer()
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        countDownTimer?.cancel()
        _binding = null
    }
}
