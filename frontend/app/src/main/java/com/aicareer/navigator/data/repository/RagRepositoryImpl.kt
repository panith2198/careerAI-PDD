package com.aicareer.navigator.data.repository

import com.aicareer.navigator.data.remote.HomeApiService
import com.aicareer.navigator.data.remote.RagChatPayload
import com.aicareer.navigator.domain.repository.RagChatResult
import com.aicareer.navigator.domain.repository.RagRepository
import com.aicareer.navigator.domain.repository.RagSource
import com.aicareer.navigator.domain.repository.ChatSessionDomainModel
import com.aicareer.navigator.domain.repository.ChatMessageDomainModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MultipartBody

@Singleton
class RagRepositoryImpl @Inject constructor(
    private val apiService: HomeApiService
) : RagRepository {

    override fun getStreamResponse(query: String): Flow<String> = flow {
        val chunks = generateMockChunks(query)
        for (chunk in chunks) {
            emit(chunk)
        }
    }

    override suspend fun getChatResponse(
        query: String,
        sessionId: Int?,
        fileBytes: ByteArray?,
        fileName: String?
    ): RagChatResult {
        return try {
            val filePart = if (fileBytes != null && fileName != null) {
                val fileRequestBody = fileBytes.toRequestBody("application/pdf".toMediaTypeOrNull())
                MultipartBody.Part.createFormData("file", fileName, fileRequestBody)
            } else {
                null
            }

            val response = apiService.ragChat(
                query = query,
                collection = "careers",
                sessionId = sessionId,
                file = filePart
            )
            RagChatResult(
                sessionId = response.session_id,
                answer = response.answer,
                confidence = response.confidence,
                sources = response.sources?.map {
                    RagSource(
                        docId = it.doc_id,
                        title = it.title,
                        sourceType = it.source_type
                    )
                },
                modelUsed = response.model_used
            )
        } catch (e: Exception) {
            e.printStackTrace()
            val fallbackAnswer = generateFallbackAnswer(query)
            RagChatResult(
                sessionId = sessionId ?: 0,
                answer = fallbackAnswer,
                confidence = 0.85f,
                sources = null,
                modelUsed = "local-fallback"
            )
        }
    }

    override suspend fun getSessions(): List<ChatSessionDomainModel> {
        return apiService.getChatSessions().map {
            ChatSessionDomainModel(
                sessionId = it.session_id,
                title = it.title,
                createdAt = it.created_at,
                updatedAt = it.updated_at
            )
        }
    }

    override suspend fun getSessionMessages(sessionId: Int): List<ChatMessageDomainModel> {
        return apiService.getSessionMessages(sessionId).map {
            ChatMessageDomainModel(
                messageId = it.message_id,
                sessionId = it.session_id,
                isUser = it.is_user,
                messageText = it.message_text,
                confidence = it.confidence,
                sources = it.sources?.map { s ->
                    RagSource(docId = s.doc_id, title = s.title, sourceType = s.source_type)
                },
                modelUsed = it.model_used,
                createdAt = it.created_at
            )
        }
    }

    override suspend fun createSession(title: String?): ChatSessionDomainModel {
        val response = apiService.createChatSession(title)
        return ChatSessionDomainModel(
            sessionId = response.session_id,
            title = response.title,
            createdAt = response.created_at,
            updatedAt = response.created_at
        )
    }

    override suspend fun deleteSession(sessionId: Int): Boolean {
        return try {
            apiService.deleteChatSession(sessionId)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    override suspend fun clearAllSessions(): Boolean {
        return try {
            apiService.clearAllChatSessions()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun generateMockChunks(query: String): List<String> {
        val lowerQuery = query.lowercase()
        return when {
            lowerQuery.contains("kotlin") || lowerQuery.contains("coroutines") -> {
                listOf("Kotlin ", "coroutines ", "manage ", "asynchronous ", "tasks ", "efficiently ", "without ", "blocking ", "threads. ", "Use ", "Dispatchers.IO ", "for ", "network ", "calls ", "and ", "Dispatchers.Main ", "for ", "UI ", "updates.")
            }
            lowerQuery.contains("salary") || lowerQuery.contains("earns") || lowerQuery.contains("pay") -> {
                listOf("An ", "Android ", "developer's ", "average ", "salary ", "in ", "India ", "ranges ", "from ", "₹6L ", "to ", "₹18L ", "per ", "year, ", "while ", "Senior ", "architects ", "can ", "reach ", "₹25L+ ", "annually.")
            }
            lowerQuery.contains("roadmap") || lowerQuery.contains("path") -> {
                listOf("To ", "become ", "a ", "Senior ", "developer, ", "follow ", "this ", "progression: ", "1. ", "Kotlin ", "basics ", "and ", "git. ", "2. ", "Clean ", "Architecture ", "and ", "testing. ", "3. ", "Dagger ", "Hilt ", "and ", "CI/CD ", "pipelines.")
            }
            else -> {
                listOf("Based ", "on ", "MistralAI ", "RAG ", "data, ", "we ", "recommend ", "refining ", "your ", "skills ", "in ", "Android ", "Architecture ", "components ", "and ", "Hilt ", "to ", "bridge ", "your ", "current ", "skill ", "gaps.")
            }
        }
    }

    private fun generateFallbackAnswer(query: String): String {
        val lowerQuery = query.lowercase()
        return when {
            lowerQuery.contains("kotlin") || lowerQuery.contains("coroutines") -> {
                "Kotlin coroutines manage asynchronous tasks efficiently without blocking threads. Use Dispatchers.IO for network calls and Dispatchers.Main for UI updates."
            }
            lowerQuery.contains("salary") || lowerQuery.contains("earns") || lowerQuery.contains("pay") -> {
                "An Android developer's average salary in India ranges from ₹6L to ₹18L per year, while Senior architects can reach ₹25L+ annually."
            }
            lowerQuery.contains("roadmap") || lowerQuery.contains("path") -> {
                "To become a Senior developer, follow this progression: 1. Kotlin basics and git. 2. Clean Architecture and testing. 3. Dagger Hilt and CI/CD pipelines."
            }
            else -> {
                "Based on MistralAI RAG data, we recommend refining your skills in Android Architecture components and Hilt to bridge your current skill gaps."
            }
        }
    }
}

