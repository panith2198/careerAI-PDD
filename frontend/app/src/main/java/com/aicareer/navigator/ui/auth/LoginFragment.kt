package com.aicareer.navigator.ui.auth

import android.content.Intent
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
import com.aicareer.navigator.MainActivity
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.LoginRequest
import com.aicareer.navigator.databinding.FragmentLoginBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
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
        binding.layoutSignupLink.alpha = 0f

        // Perform stagger entrance animations
        binding.ivLogo.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(100).start()
        binding.tvTitle.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(200).start()
        binding.tvSubtitle.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(300).start()
        binding.cardForm.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(600).setStartDelay(400).start()
        binding.layoutSignupLink.animate().alpha(1f).setDuration(500).setStartDelay(650).start()

        binding.tvSignup.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_register)
        }

        binding.tvForgotPassword.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_forgot_password)
        }

        binding.btnLogin.setOnClickListener {
            performLogin()
        }

        observeLoginState()
    }

    private fun performLogin() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = "Please enter a valid email address"
            return
        } else {
            binding.tilEmail.error = null
        }

        if (password.isEmpty() || password.length < 6) {
            binding.tilPassword.error = "Password must be at least 6 characters"
            return
        } else {
            binding.tilPassword.error = null
        }

        viewModel.login(LoginRequest(email, password))
    }

    private fun observeLoginState() {
        lifecycleScope.launch {
            viewModel.loginState.collectLatest { state ->
                when (state) {
                    is UiState.Idle -> {
                        binding.btnLogin.isEnabled = true
                        binding.btnLogin.text = "Sign In"
                    }
                    is UiState.Loading -> {
                        binding.btnLogin.isEnabled = false
                        binding.btnLogin.text = "Signing In..."
                    }
                    is UiState.Success -> {
                        Toast.makeText(requireContext(), "Signed In Successfully", Toast.LENGTH_SHORT).show()
                        val intent = Intent(requireActivity(), MainActivity::class.java)
                        startActivity(intent)
                        requireActivity().finish()
                    }
                    is UiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        binding.btnLogin.isEnabled = true
                        binding.btnLogin.text = "Sign In"
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
