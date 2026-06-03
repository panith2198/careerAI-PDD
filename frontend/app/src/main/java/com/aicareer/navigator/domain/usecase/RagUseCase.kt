package com.aicareer.navigator.domain.usecase

import com.aicareer.navigator.domain.repository.ChatSessionDomainModel
import com.aicareer.navigator.domain.repository.ChatMessageDomainModel
import com.aicareer.navigator.domain.repository.RagChatResult
import com.aicareer.navigator.domain.repository.RagRepository
import javax.inject.Inject

class RagUseCase @Inject constructor(
    private val repository: RagRepository
) {
    suspend operator fun invoke(
        query: String,
        sessionId: Int? = null,
        fileBytes: ByteArray? = null,
        fileName: String? = null
    ): RagChatResult {
        return repository.getChatResponse(query, sessionId, fileBytes, fileName)
    }

    suspend fun getSessions(): List<ChatSessionDomainModel> {
        return repository.getSessions()
    }

    suspend fun getSessionMessages(sessionId: Int): List<ChatMessageDomainModel> {
        return repository.getSessionMessages(sessionId)
    }

    suspend fun createSession(title: String? = null): ChatSessionDomainModel {
        return repository.createSession(title)
    }

    suspend fun deleteSession(sessionId: Int): Boolean {
        return repository.deleteSession(sessionId)
    }

    suspend fun clearAllSessions(): Boolean {
        return repository.clearAllSessions()
    }
}
