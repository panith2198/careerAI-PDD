import logging
from typing import Dict, Any, List
from app.rag_engine.retriever import Retriever
from app.rag_engine.reranker import reranker
from app.rag_engine.context_compressor import ContextCompressor
from app.ai_engine.prompt_builder import PromptBuilder
from app.ai_engine.mistral_client import mistral_client

logger = logging.getLogger("rag_chain")

class RagChain:
    """
    RAG Orchestration Chain implementing the Pipeline design pattern.
    Runs asynchronous retrieval, RRF, cross-encoder rerank, context pruning,
    and forwards prompt templates to MistralAI.
    """
    
    @staticmethod
    async def query_rag_flow(query: str, collection_name: str = "careers") -> Dict[str, Any]:
        """
        Execute RAG Pipeline flow:
        1. Retrieve dense (top-20) and sparse (top-20) chunks.
        2. Reciprocal Rank Fusion (RRF k=60) compiles top-30 candidate pool.
        3. CrossEncoder ms-marco reranking filters candidate list down to top-5.
        4. Context pruner compresses text blocks.
        5. Prompt builder templates Magic Prompt structure.
        6. Submits to MistralAI for stream or complete response.
        """
        logger.info(f"RAG Chain triggered for collection: '{collection_name}' with query: '{query}'")
        
        # 1. Retrieve candidates utilizing hybrid dense + sparse paths + RRF
        candidates = await Retriever.retrieve(query, collection_name)
        
        if not candidates:
            # Fallback when search returns empty collections
            fallback_answer = "I could not locate any active documents in my career knowledge catalogs relating to your query. Please index references via administrative panels."
            return {
                "answer": fallback_answer,
                "context_documents": []
            }
            
        # 2. Score and sort candidates via ms-marco cross-encoder down to top-5
        top_5_docs = reranker.rerank(query, candidates, top_n=5)
        
        # 3. Dynamic Context token compression using compressor pruner
        compressed_chunks = ContextCompressor.compress_chunks(
            [doc.page_content for doc in top_5_docs]
        )
        
        # 4. Formulate Context Prompt
        prompt = PromptBuilder.build_rag_chat_prompt(query, compressed_chunks)
        
        # 5. Call MistralAI Chat Completion
        logger.info("Executing chat query with MistralAI model...")
        answer = await mistral_client.chat_completion(
            prompt=prompt,
            system_prompt="You are a professional, helpful Career Knowledge Assistant."
        )
        
        # Return response including detailed citations
        cited_sources = []
        for doc in top_5_docs:
            cited_sources.append({
                "source": doc.metadata.get("source"),
                "title": doc.metadata.get("title"),
                "page": doc.metadata.get("page")
            })
            
        return {
            "answer": answer,
            "context_documents": cited_sources
        }
