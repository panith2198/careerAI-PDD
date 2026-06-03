package com.aicareer.navigator.ui.rag

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.aicareer.navigator.databinding.ItemMessageAiBinding
import com.aicareer.navigator.databinding.ItemMessageUserBinding

class ChatAdapter : ListAdapter<ChatMessage, RecyclerView.ViewHolder>(ChatDiffCallback()) {

    private val USER_TYPE = 1
    private val AI_TYPE = 2

    override fun getItemViewType(position: Int): Int {
        return if (getItem(position).isUser) USER_TYPE else AI_TYPE
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == USER_TYPE) {
            val itemBinding = ItemMessageUserBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            UserViewHolder(itemBinding)
        } else {
            val itemBinding = ItemMessageAiBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            AiViewHolder(itemBinding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = getItem(position)
        if (getItemViewType(position) == USER_TYPE) {
            (holder as UserViewHolder).bind(message)
        } else {
            (holder as AiViewHolder).bind(message)
        }
    }

    inner class UserViewHolder(private val itemBinding: ItemMessageUserBinding) :
        RecyclerView.ViewHolder(itemBinding.root) {
        fun bind(message: ChatMessage) {
            itemBinding.tvMessageText.text = message.text
            itemBinding.tvTimestamp.text = "Just Now"
        }
    }

    inner class AiViewHolder(private val itemBinding: ItemMessageAiBinding) :
        RecyclerView.ViewHolder(itemBinding.root) {
        private val markwon = io.noties.markwon.Markwon.create(itemBinding.root.context)

        fun bind(message: ChatMessage) {
            // Blinking cursor visual indicator during active streaming chunks
            val textToRender = if (message.isStreaming) "${message.text}▋" else message.text
            markwon.setMarkdown(itemBinding.tvMessageText, textToRender)

            if (message.isStreaming) {
                itemBinding.tvBadgeConfidence.text = "STREAMING..."
            } else {
                val confidencePct = message.confidence?.let { "${(it * 100).toInt()}%" } ?: "98%"
                itemBinding.tvBadgeConfidence.text = "$confidencePct CONFIDENCE"
            }

            // Expand/collapse source citation links click handler
            if (message.sources.isNullOrEmpty()) {
                itemBinding.layoutCitationToggle.visibility = View.GONE
                itemBinding.layoutCitationsContent.visibility = View.GONE
                itemBinding.dividerCitations.visibility = View.GONE
            } else {
                itemBinding.layoutCitationToggle.visibility = View.VISIBLE
                itemBinding.dividerCitations.visibility = View.VISIBLE

                val citationText = message.sources.mapIndexed { idx, src ->
                    "${idx + 1}. [${src.sourceType?.uppercase() ?: "KB"}] ${src.title}"
                }.joinToString("\n")

                itemBinding.tvCitationsContent.text = citationText
                itemBinding.tvModelUsed.text = "Model: ${message.modelUsed ?: "mistral-large-latest"}"

                itemBinding.layoutCitationToggle.setOnClickListener {
                    if (itemBinding.layoutCitationsContent.visibility == View.GONE) {
                        itemBinding.layoutCitationsContent.visibility = View.VISIBLE
                        itemBinding.tvExpandCitations.text = "HIDE RAG CITATION SOURCES"
                    } else {
                        itemBinding.layoutCitationsContent.visibility = View.GONE
                        itemBinding.tvExpandCitations.text = "VIEW RAG CITATION SOURCES"
                    }
                }
            }

            itemBinding.btnCopy.setOnClickListener {
                val clipboard = itemBinding.root.context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = android.content.ClipData.newPlainText("AI Message", message.text)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(itemBinding.root.context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    class ChatDiffCallback : DiffUtil.ItemCallback<ChatMessage>() {
        override fun areItemsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean {
            return oldItem == newItem
        }
    }
}
