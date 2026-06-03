package com.aicareer.navigator.ui.auth

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.data.remote.RegisterRequest
import com.aicareer.navigator.databinding.FragmentRegisterBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initial state for entrance animations
        binding.ivLogo.alpha = 0f
        binding.ivLogo.translationY = -40f
        binding.tvTitle.alpha = 0f
        binding.tvTitle.translationY = -40f
        binding.tvStepIndicator.alpha = 0f
        binding.tvStepIndicator.translationY = -20f
        binding.cardForm.alpha = 0f
        binding.cardForm.scaleX = 0.92f
        binding.cardForm.scaleY = 0.92f
        binding.layoutLoginLink.alpha = 0f

        // Perform stagger entrance animations
        binding.ivLogo.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(100).start()
        binding.tvTitle.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(200).start()
        binding.tvStepIndicator.animate().alpha(1f).translationY(0f).setDuration(500).setStartDelay(300).start()
        binding.cardForm.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(600).setStartDelay(400).start()
        binding.layoutLoginLink.animate().alpha(1f).setDuration(500).setStartDelay(650).start()

        setupStepDropdowns()

        binding.btnNext.setOnClickListener {
            if (validateStep1()) {
                showStep2()
            }
        }

        binding.btnBack.setOnClickListener {
            showStep1()
        }

        binding.btnRegister.setOnClickListener {
            if (validateStep2()) {
                performRegistration()
            }
        }

        binding.tvLogin.setOnClickListener {
            findNavController().popBackStack()
        }

        observeRegisterState()
    }

    private fun setupStepDropdowns() {
        val educations = listOf("B.Tech / BE", "BCA / MCA", "B.Sc / M.Sc Computer Science", "Self-Taught / Other")
        val educationAdapter = ArrayAdapter(requireContext(), R.layout.item_dropdown_popup, educations)
        binding.etEducation.setAdapter(educationAdapter)

        val cities = listOf("Bangalore", "Pune", "Mumbai", "Hyderabad", "Delhi NCR", "Chennai", "Remote")
        val cityAdapter = ArrayAdapter(requireContext(), R.layout.item_dropdown_popup, cities)
        binding.etCity.setAdapter(cityAdapter)
    }

    private fun showStep1() {
        binding.layoutStep1.visibility = View.VISIBLE
        binding.layoutStep2.visibility = View.GONE
        binding.tvStepIndicator.text = "STEP 1 OF 2"
    }

    private fun showStep2() {
        binding.layoutStep1.visibility = View.GONE
        binding.layoutStep2.visibility = View.VISIBLE
        binding.tvStepIndicator.text = "STEP 2 OF 2"
    }

    private fun validateStep1(): Boolean {
        val name = binding.etName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (name.isEmpty()) {
            binding.tilName.error = "Name cannot be empty"
            return false
        } else {
            binding.tilName.error = null
        }

        if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = "Enter a valid email address"
            return false
        } else {
            binding.tilEmail.error = null
        }

        if (password.isEmpty() || password.length < 6) {
            binding.tilPassword.error = "Password must be at least 6 characters"
            return false
        } else {
            binding.tilPassword.error = null
        }

        return true
    }

    private fun validateStep2(): Boolean {
        val phone = binding.etPhone.text.toString().trim()
        val education = binding.etEducation.text.toString().trim()
        val city = binding.etCity.text.toString().trim()

        if (phone.isEmpty() || phone.length < 10) {
            binding.tilPhone.error = "Please enter a valid 10-digit phone number"
            return false
        } else {
            binding.tilPhone.error = null
        }

        if (education.isEmpty()) {
            binding.tilEducation.error = "Education is required"
            return false
        } else {
            binding.tilEducation.error = null
        }

        if (city.isEmpty()) {
            binding.tilCity.error = "City is required"
            return false
        } else {
            binding.tilCity.error = null
        }

        return true
    }

    private fun performRegistration() {
        val name = binding.etName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        viewModel.register(RegisterRequest(full_name = name, email = email, password = password))
    }

    private fun observeRegisterState() {
        lifecycleScope.launch {
            viewModel.registerState.collectLatest { state ->
                when (state) {
                    is UiState.Idle -> {
                        binding.btnRegister.isEnabled = true
                        binding.btnRegister.text = "Register"
                    }
                    is UiState.Loading -> {
                        binding.btnRegister.isEnabled = false
                        binding.btnRegister.text = "Creating Account..."
                    }
                    is UiState.Success -> {
                        Toast.makeText(requireContext(), "Verification OTP Sent", Toast.LENGTH_SHORT).show()
                        val bundle = bundleOf("email" to binding.etEmail.text.toString().trim())
                        findNavController().navigate(R.id.action_register_to_otp, bundle)
                    }
                    is UiState.Error -> {
                        Toast.makeText(requireContext(), state.message, Toast.LENGTH_SHORT).show()
                        binding.btnRegister.isEnabled = true
                        binding.btnRegister.text = "Register"
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
