package com.aicareer.navigator.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.aicareer.navigator.databinding.FragmentAdminBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AdminDashboardFragment : Fragment() {

    private var _binding: FragmentAdminBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnUploadKb.setOnClickListener {
            binding.btnUploadKb.isEnabled = false
            binding.btnUploadKb.text = "Uploading KB Document..."
            lifecycleScope.launch {
                delay(1200) // Latency simulation
                Toast.makeText(requireContext(), "Knowledge base document updated successfully!", Toast.LENGTH_SHORT).show()
                binding.btnUploadKb.isEnabled = true
                binding.btnUploadKb.text = "Upload Knowledge Base"
            }
        }

        binding.btnRetrain.setOnClickListener {
            binding.btnRetrain.isEnabled = false
            binding.btnRetrain.text = "Retraining AI Model..."
            lifecycleScope.launch {
                delay(1500) // Retraining simulation
                Toast.makeText(requireContext(), "Matching model retrained successfully!", Toast.LENGTH_SHORT).show()
                binding.btnRetrain.isEnabled = true
                binding.btnRetrain.text = "Retrain Matching Model"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
