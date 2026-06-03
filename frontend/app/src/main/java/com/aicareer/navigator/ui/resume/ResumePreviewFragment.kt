package com.aicareer.navigator.ui.resume

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.Bundle
import android.os.ParcelFileDescriptor
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aicareer.navigator.R
import com.aicareer.navigator.databinding.FragmentResumePreviewBinding
import com.google.android.material.chip.Chip
import com.google.android.material.tabs.TabLayout
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

@AndroidEntryPoint
class ResumePreviewFragment : Fragment() {

    private var _binding: FragmentResumePreviewBinding? = null
    private val binding get() = _binding!!

    // Shared Activity-scoped ViewModel to fetch details reactively
    private val viewModel: ResumeViewModel by activityViewModels()

    private var resumeId: Int = 1
    private var atsScore: Float = 85f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        resumeId = arguments?.getInt("resumeId") ?: 1
        atsScore = arguments?.getFloat("atsScore") ?: 85f
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentResumePreviewBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup TabLayout switches
        setupTabLayout()

        // Load parsed data
        viewModel.loadResumeDetails(resumeId)

        // Bind Observers
        observeStateFlows()

        binding.btnSaveProfile.setOnClickListener {
            Toast.makeText(requireContext(), "Resume details updated on your profile!", Toast.LENGTH_SHORT).show()
            findNavController().navigate(R.id.action_preview_to_profile)
        }
    }

    private fun setupTabLayout() {
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                when (tab?.position) {
                    0 -> {
                        binding.nsvPdfContainer.visibility = View.VISIBLE
                        binding.nsvParsedData.visibility = View.GONE
                    }
                    1 -> {
                        binding.nsvPdfContainer.visibility = View.GONE
                        binding.nsvParsedData.visibility = View.VISIBLE
                    }
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }

    private fun observeStateFlows() {
        // Observe local file path to render PDF dynamically
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.pdfFileState.collectLatest { file ->
                if (file != null) {
                    renderPdf(file)
                } else {
                    // Try to look up last selected file in cache
                    val cacheFiles = requireContext().cacheDir.listFiles()
                    val pdfFile = cacheFiles?.find { it.name.lowercase().endsWith(".pdf") }
                    if (pdfFile != null) {
                        viewModel.setPdfFile(pdfFile)
                    } else {
                        renderNoPdfAvailable()
                    }
                }
            }
        }

        // Observe parsed structured details
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.resumeDetailState.collectLatest { state ->
                when (state) {
                    is ResumeDetailUiState.Loading -> {
                        binding.tvAtsScore.text = "${atsScore.toInt()}%"
                    }
                    is ResumeDetailUiState.Success -> {
                        bindParsedData(state.detail)
                    }
                    is ResumeDetailUiState.Error -> {
                        Toast.makeText(requireContext(), "Error: ${state.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun bindParsedData(detail: ResumeDetail) {
        binding.tvAtsScore.text = "${detail.atsScore}%"
        binding.tvFeedback.text = detail.feedback

        // Bind Extracted skills chips
        binding.cgExtractedSkills.removeAllViews()
        detail.extractedSkills.forEach { skill ->
            val chip = Chip(requireContext()).apply {
                text = skill
                setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_primary))
                chipBackgroundColor = ContextCompat.getColorStateList(requireContext(), R.color.color_surface_3)
                chipStrokeColor = ContextCompat.getColorStateList(requireContext(), R.color.color_border)
                chipStrokeWidth = 1f
            }
            binding.cgExtractedSkills.addView(chip)
        }

        // Bind Recommendations list
        binding.llRecommendations.removeAllViews()
        detail.recommendations.forEach { recommendation ->
            val itemView = LayoutInflater.from(requireContext())
                .inflate(R.layout.item_skill_gap, binding.llRecommendations, false)
            
            // Customize item gap layout to hold recommendations
            val tvSkillName = itemView.findViewById<TextView>(R.id.tv_skill_name)
            val tvDesc = itemView.findViewById<TextView>(R.id.tv_status)
            
            tvSkillName.text = "ATS Recommendation"
            tvSkillName.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_cyan))
            
            tvDesc.text = recommendation
            tvDesc.setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            
            binding.llRecommendations.addView(itemView)
        }
    }

    private fun renderPdf(file: File) {
        binding.llPdfPagesHolder.removeAllViews()
        
        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val fileDescriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
                val pdfRenderer = PdfRenderer(fileDescriptor)
                val pageCount = pdfRenderer.pageCount
                
                for (i in 0 until pageCount) {
                    val page = pdfRenderer.openPage(i)
                    
                    // Render high-definition bitmap by scaling page bounds for sharp viewing
                    val scaleFactor = 2
                    val width = page.width * scaleFactor
                    val height = page.height * scaleFactor
                    
                    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                    page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                    
                    withContext(Dispatchers.Main) {
                        val imageView = ImageView(requireContext()).apply {
                            layoutParams = LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.MATCH_PARENT,
                                LinearLayout.LayoutParams.WRAP_CONTENT
                            ).apply {
                                setMargins(0, 0, 0, 24)
                            }
                            adjustViewBounds = true
                            scaleType = ImageView.ScaleType.FIT_CENTER
                            setImageBitmap(bitmap)
                        }
                        binding.llPdfPagesHolder.addView(imageView)
                    }
                    page.close()
                }
                pdfRenderer.close()
                fileDescriptor.close()
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    renderNoPdfAvailable()
                }
            }
        }
    }

    private fun renderNoPdfAvailable() {
        binding.llPdfPagesHolder.removeAllViews()
        val noPdfView = TextView(requireContext()).apply {
            text = "PDF View simulation not available. Please toggle to AI Parsed Data."
            setTextColor(ContextCompat.getColor(requireContext(), R.color.color_text_secondary))
            textSize = 16f
            gravity = android.view.Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(24, 48, 24, 48)
            }
        }
        binding.llPdfPagesHolder.addView(noPdfView)
    }

    private fun Float.sp(): Float = this

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
