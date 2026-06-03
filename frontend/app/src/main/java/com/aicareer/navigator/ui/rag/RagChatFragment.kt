package com.aicareer.navigator.ui.rag

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.aicareer.navigator.databinding.FragmentChatBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class RagChatFragment : Fragment() {

    private var _binding: FragmentChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: RagViewModel by viewModels()
    private lateinit var chatAdapter: ChatAdapter

    private var selectedPdfBytes: ByteArray? = null
    private var selectedPdfName: String? = null

    private val selectPdfLauncher = registerForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.GetContent()
    ) { uri: android.net.Uri? ->
        if (uri != null) {
            try {
                val context = requireContext()
                val inputStream = context.contentResolver.openInputStream(uri)
                selectedPdfBytes = inputStream?.readBytes()

                // Extract PDF name from content resolver
                selectedPdfName = null
                context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) {
                            selectedPdfName = cursor.getString(nameIndex)
                        }
                    }
                }
                if (selectedPdfName == null) {
                    selectedPdfName = "document.pdf"
                }

                // Update UI preview card
                binding.tvPdfName.text = selectedPdfName
                binding.layoutPdfPreview.visibility = View.VISIBLE

            } catch (e: Exception) {
                e.printStackTrace()
                android.widget.Toast.makeText(requireContext(), "Failed to read PDF file.", android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        chatAdapter = ChatAdapter()
        binding.rvChatMessages.layoutManager = LinearLayoutManager(requireContext())
        binding.rvChatMessages.adapter = chatAdapter

        // Attachment buttons
        binding.btnAttachPdf.setOnClickListener {
            selectPdfLauncher.launch("application/pdf")
        }

        binding.btnRemovePdf.setOnClickListener {
            clearSelectedPdf()
        }

        // Session Management controls clicks
        binding.btnNewChat.setOnClickListener {
            viewModel.startNewSession()
        }

        binding.btnDeleteChat.setOnClickListener {
            val options = arrayOf("Delete Current Session", "Clear All Sessions History")
            androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Manage Chat Sessions")
                .setItems(options) { _, which ->
                    if (which == 0) {
                        viewModel.deleteCurrentSession()
                    } else {
                        viewModel.clearAllSessionsHistory()
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        binding.btnSelectSession.setOnClickListener {
            val sessions = viewModel.sessionsList.value
            if (sessions.isEmpty()) {
                android.widget.Toast.makeText(requireContext(), "No past sessions found.", android.widget.Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val titles = sessions.map { it.title }.toTypedArray()
            androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Select Chat Session")
                .setItems(titles) { _, which ->
                    val selectedSession = sessions[which]
                    viewModel.loadHistoryForSession(selectedSession.sessionId)
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        // Suggested chips clicks
        binding.chipQ1.setOnClickListener { sendMessage("How do I become an Android Architect?") }
        binding.chipQ2.setOnClickListener { sendMessage("What is the average salary for DevOps?") }
        binding.chipQ3.setOnClickListener { sendMessage("Show my career roadmap milestones") }

        binding.btnSend.setOnClickListener {
            val query = binding.etChatInput.text.toString().trim()
            if (query.isNotEmpty() || selectedPdfBytes != null) {
                binding.etChatInput.text.clear()
                sendMessage(query, selectedPdfBytes, selectedPdfName)
                clearSelectedPdf()
            }
        }

        // Observe chat messages history
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.chatHistory.collectLatest { history ->
                chatAdapter.submitList(history) {
                    // Scroll to bottom on updates
                    if (history.isNotEmpty()) {
                        binding.rvChatMessages.scrollToPosition(history.size - 1)
                    }
                }
            }
        }

        // Observe streaming states
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.streamingState.collectLatest { state ->
                when (state) {
                    is StreamingUiState.Idle -> {
                        binding.pbThinking.visibility = View.GONE
                        binding.tvHeaderStatus.text = "Connected"
                    }
                    is StreamingUiState.Thinking -> {
                        binding.pbThinking.visibility = View.VISIBLE
                        binding.tvHeaderStatus.text = "Thinking..."
                    }
                    is StreamingUiState.Streaming -> {
                        binding.pbThinking.visibility = View.GONE
                        binding.tvHeaderStatus.text = "Streaming..."
                    }
                    is StreamingUiState.Completed -> {
                        binding.pbThinking.visibility = View.GONE
                        binding.tvHeaderStatus.text = "Connected"
                    }
                }
            }
        }

        // Observe sessions list & active session id to update active session title
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.sessionsList.collectLatest { sessions ->
                val currentId = viewModel.currentSessionId
                val activeSession = sessions.find { it.sessionId == currentId }
                binding.tvActiveSessionTitle.text = activeSession?.title ?: "New Chat Session"
            }
        }
    }

    private fun sendMessage(query: String, fileBytes: ByteArray? = null, fileName: String? = null) {
        viewModel.sendMessage(query, fileBytes, fileName)
    }

    private fun clearSelectedPdf() {
        selectedPdfBytes = null
        selectedPdfName = null
        binding.layoutPdfPreview.visibility = View.GONE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
