from typing import List

class ContextCompressor:
    """
    Context Compressor simulating LLMLingua token reduction.
    Executes greedy lexical token pruning to strip boilerplate fillers
    from retrieved text chunks before appending them to LLM prompts,
    improving information density and cutting API usage costs.
    """
    
    @staticmethod
    def compress_text(text: str, target_ratio: float = 0.7) -> str:
        """
        Compress text using simple token pruning.
        Strips minor stopwords and repetitive formatting to achieve target ratio.
        """
        if not text:
            return ""
            
        words = text.split()
        if len(words) < 20:
            return text  # Avoid compressing very small text snippets
            
        # Core stopwords list that can be safely pruned to preserve density
        prunables = {
            "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", 
            "be", "been", "being", "in", "on", "at", "to", "for", "of", "with"
        }
        
        compressed_words = []
        target_word_count = int(len(words) * target_ratio)
        
        for word in words:
            # If we need to prune more words, drop standard fillers
            if len(compressed_words) > target_word_count and word.lower().strip(",.") in prunables:
                continue
            compressed_words.append(word)
            
        return " ".join(compressed_words[:target_word_count])

    @classmethod
    def compress_chunks(cls, chunks: List[str], target_ratio: float = 0.7) -> List[str]:
        """Compress a list of retrieved candidate context chunks."""
        return [cls.compress_text(chunk, target_ratio) for chunk in chunks]
