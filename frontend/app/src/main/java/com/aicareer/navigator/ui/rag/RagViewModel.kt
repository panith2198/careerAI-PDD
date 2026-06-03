package com.aicareer.navigator.ui.rag

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aicareer.navigator.domain.repository.RagSource
import com.aicareer.navigator.domain.repository.ChatSessionDomainModel
import com.aicareer.navigator.domain.usecase.RagUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

sealed class StreamingUiState {
    object Idle : StreamingUiState()
    object Thinking : StreamingUiState()
    object Streaming : StreamingUiState()
    object Completed : StreamingUiState()
}

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val isStreaming: Boolean = false,
    val confidence: Float? = null,
    val sources: List<RagSource>? = null,
    val modelUsed: String? = null
)

@HiltViewModel
class RagViewModel @Inject constructor(
    private val ragUseCase: RagUseCase
) : ViewModel() {

    private val _chatHistory = MutableStateFlow<List<ChatMessage>>(emptyList())
    val chatHistory: StateFlow<List<ChatMessage>> = _chatHistory.asStateFlow()

    private val _streamingState = MutableStateFlow<StreamingUiState>(StreamingUiState.Idle)
    val streamingState: StateFlow<StreamingUiState> = _streamingState.asStateFlow()

    private val _sessionsList = MutableStateFlow<List<ChatSessionDomainModel>>(emptyList())
    val sessionsList: StateFlow<List<ChatSessionDomainModel>> = _sessionsList.asStateFlow()

    var currentSessionId: Int? = null
        private set

    init {
        loadLatestSessionOrInit()
    }

    fun loadLatestSessionOrInit() {
        viewModelScope.launch {
            try {
                _streamingState.value = StreamingUiState.Thinking
                val sessions = ragUseCase.getSessions()
                _sessionsList.value = sessions
                if (sessions.isNotEmpty()) {
                    val latestSession = sessions.first() // Backend orders desc by created_at
                    currentSessionId = latestSession.sessionId
                    loadHistoryForSession(latestSession.sessionId)
                } else {
                    _chatHistory.value = listOf(
                        ChatMessage(
                            text = "Hello! Ask me any career, skill assessment, or pathway questions.",
                            isUser = false,
                            confidence = 0.98f,
                            modelUsed = "mistral-large-latest"
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _chatHistory.value = listOf(
                    ChatMessage(
                        text = "Hello! Ask me any career, skill assessment, or pathway questions.",
                        isUser = false,
                        confidence = 0.98f,
                        modelUsed = "mistral-large-latest"
                    )
                )
            } finally {
                _streamingState.value = StreamingUiState.Idle
            }
        }
    }

    fun loadHistoryForSession(sessionId: Int) {
        viewModelScope.launch {
            try {
                _streamingState.value = StreamingUiState.Thinking
                val messages = ragUseCase.getSessionMessages(sessionId)
                currentSessionId = sessionId
                
                val domainMessages = messages.map { msg ->
                    ChatMessage(
                        id = msg.messageId.toString(),
                        text = msg.messageText,
                        isUser = msg.isUser,
                        isStreaming = false,
                        confidence = msg.confidence,
                        sources = msg.sources,
                        modelUsed = msg.modelUsed
                    )
                }
                
                if (domainMessages.isNotEmpty()) {
                    _chatHistory.value = domainMessages
                } else {
                    _chatHistory.value = listOf(
                        ChatMessage(
                            text = "Hello! This is a fresh chat session. Ask me any career questions.",
                            isUser = false,
                            confidence = 0.98f,
                            modelUsed = "mistral-large-latest"
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _streamingState.value = StreamingUiState.Idle
            }
        }
    }

    fun startNewSession(title: String? = null) {
        viewModelScope.launch {
            try {
                _streamingState.value = StreamingUiState.Thinking
                val newSession = ragUseCase.createSession(title)
                currentSessionId = newSession.sessionId
                
                // Refresh sessions list
                val sessions = ragUseCase.getSessions()
                _sessionsList.value = sessions
                
                _chatHistory.value = listOf(
                    ChatMessage(
                        text = "Started new chat: ${newSession.title}. Ask me anything!",
                        isUser = false,
                        confidence = 0.98f,
                        modelUsed = "mistral-large-latest"
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _streamingState.value = StreamingUiState.Idle
            }
        }
    }

    fun deleteCurrentSession() {
        val sessionId = currentSessionId ?: return
        viewModelScope.launch {
            try {
                _streamingState.value = StreamingUiState.Thinking
                val success = ragUseCase.deleteSession(sessionId)
                if (success) {
                    currentSessionId = null
                    loadLatestSessionOrInit()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _streamingState.value = StreamingUiState.Idle
            }
        }
    }

    fun clearAllSessionsHistory() {
        viewModelScope.launch {
            try {
                _streamingState.value = StreamingUiState.Thinking
                val success = ragUseCase.clearAllSessions()
                if (success) {
                    currentSessionId = null
                    _sessionsList.value = emptyList()
                    _chatHistory.value = listOf(
                        ChatMessage(
                            text = "Hello! All sessions have been cleared. Ask me any career questions to start a new chat.",
                            isUser = false,
                            confidence = 0.98f,
                            modelUsed = "mistral-large-latest"
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _streamingState.value = StreamingUiState.Idle
            }
        }
    }

    fun sendMessage(query: String, fileBytes: ByteArray? = null, fileName: String? = null) {
        val currentList = _chatHistory.value.toMutableList()

        // 1. Add User Message
        val userMsgText = if (fileName != null) "$query\n[📎 $fileName]" else query
        val userMsg = ChatMessage(text = userMsgText, isUser = true)
        currentList.add(userMsg)
        _chatHistory.value = currentList

        // 2. Add AI placeholder message
        val aiMsgId = UUID.randomUUID().toString()
        val placeholderAiMsg = ChatMessage(id = aiMsgId, text = "", isUser = false, isStreaming = true)
        currentList.add(placeholderAiMsg)
        _chatHistory.value = currentList.toList()

        _streamingState.value = StreamingUiState.Thinking

        viewModelScope.launch {
            try {
                // Fetch response from RAG use case
                val result = ragUseCase(query, currentSessionId, fileBytes, fileName)
                
                // Update current session ID with the one returned from server
                val isNewSession = currentSessionId != result.sessionId
                currentSessionId = result.sessionId
                
                if (isNewSession) {
                    // Refresh sessions list
                    _sessionsList.value = ragUseCase.getSessions()
                }
                
                _streamingState.value = StreamingUiState.Streaming

                val fullAnswer = result.answer
                val words = fullAnswer.split(" ")
                var accumulatedText = ""

                for ((index, word) in words.withIndex()) {
                    delay(30) // Fast typing animation
                    accumulatedText += (if (index == 0) "" else " ") + word
                    updateMessage(
                        id = aiMsgId,
                        text = accumulatedText,
                        isStreaming = true,
                        confidence = result.confidence,
                        sources = result.sources,
                        modelUsed = result.modelUsed
                    )
                }

                // Completed streaming successfully
                updateMessage(
                    id = aiMsgId,
                    text = fullAnswer,
                    isStreaming = false,
                    confidence = result.confidence,
                    sources = result.sources,
                    modelUsed = result.modelUsed
                )
                _streamingState.value = StreamingUiState.Completed
            } catch (e: Exception) {
                e.printStackTrace()
                updateMessage(
                    id = aiMsgId,
                    text = "I'm sorry, I'm having trouble retrieving a response right now. Please try again later.",
                    isStreaming = false
                )
                _streamingState.value = StreamingUiState.Completed
            }
        }
    }

    private fun updateMessage(
        id: String,
        text: String,
        isStreaming: Boolean,
        confidence: Float? = null,
        sources: List<RagSource>? = null,
        modelUsed: String? = null
    ) {
        val currentList = _chatHistory.value.map { msg ->
            if (msg.id == id) {
                msg.copy(
                    text = text,
                    isStreaming = isStreaming,
                    confidence = confidence,
                    sources = sources,
                    modelUsed = modelUsed
                )
            } else {
                msg
            }
        }
        _chatHistory.value = currentList
    }
}

