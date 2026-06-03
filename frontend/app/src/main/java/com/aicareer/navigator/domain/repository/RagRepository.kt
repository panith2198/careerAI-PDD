package com.aicareer.navigator.domain.repository

import kotlinx.coroutines.flow.Flow

data class RagSource(
    val docId: Int,
    val title: String,
    val sourceType: String?
)

data class RagChatResult(
    val sessionId: Int,
    val answer: String,
    val confidence: Float,
    val sources: List<RagSource>?,
    val modelUsed: String?
)

data class ChatSessionDomainModel(
    val sessionId: Int,
    val title: String,
    val createdAt: String,
    val updatedAt: String
)

data class ChatMessageDomainModel(
    val messageId: Int,
    val sessionId: Int,
    val isUser: Boolean,
    val messageText: String,
    val confidence: Float?,
    val sources: List<RagSource>?,
    val modelUsed: String?,
    val createdAt: String
)

interface RagRepository {
    fun getStreamResponse(query: String): Flow<String>
    suspend fun getChatResponse(query: String, sessionId: Int? = null, fileBytes: ByteArray? = null, fileName: String? = null): RagChatResult
    suspend fun getSessions(): List<ChatSessionDomainModel>
    suspend fun getSessionMessages(sessionId: Int): List<ChatMessageDomainModel>
    suspend fun createSession(title: String? = null): ChatSessionDomainModel
    suspend fun deleteSession(sessionId: Int): Boolean
    suspend fun clearAllSessions(): Boolean
}

