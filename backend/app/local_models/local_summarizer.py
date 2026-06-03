import logging
from app.local_models.model_manager import model_manager

logger = logging.getLogger("local_summarizer")

class LocalSummarizer:
    """
    Abstractive/Extractive Summarization specialist utilizing HuggingFace's bart-large-cnn
    to compile dense, highly readable summaries of long resumes or JDs.
    """
    
    @staticmethod
    def generate_summary(text: str, max_length: int = 150, min_length: int = 40) -> str:
        """Generate abstractive summary of long input texts."""
        if not text:
            return ""

        # Limit input length to prevent token crashes in dense models
        truncated_text = text[:4000]

        summarizer = model_manager.load_model("summarizer")
        
        # 1. Fallback when pipelines are unconfigured
        if not summarizer or summarizer == "fallback":
            logger.warning("Local Summarizer in fallback mode. Executing basic line truncate.")
            # Simply truncate text to first few lines as a clean fallback summary
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            fallback_text = " ".join(lines[:3])
            return f"[Summary Fallback] {fallback_text}..."

        # 2. Pipeline summarization
        try:
            results = summarizer(
                truncated_text, 
                max_length=max_length, 
                min_length=min_length, 
                do_sample=False
            )
            summary_text = results[0]["summary_text"]
            logger.info("Successfully completed abstractive document summarization.")
            return summary_text.strip()
        except Exception as e:
            logger.error(f"Local summarizer pipeline failed: {e}")
            return text[:200] + "..."

local_summarizer = LocalSummarizer()
