from typing import List, Dict, Any
import logging

logger = logging.getLogger("context_manager")

class ContextManager:
    """
    Manages chat conversation history, estimates prompt lengths, and implements
    a Sliding Window strategy to keep prompts within active token budgets (8192 context).
    """
    def __init__(self, max_token_budget: int = 8192):
        self.max_token_budget = max_token_budget

    @staticmethod
    def estimate_token_count(text: str) -> int:
        """
        Estimate token lengths using standard lexical scaling.
        Approximates ~4 characters per token for typical technical English text.
        """
        if not text:
            return 0
        return max(1, len(text) // 4)

    def prune_conversation_history(
        self, 
        system_prompt: str, 
        history: List[Dict[str, str]], 
        user_message: str
    ) -> List[Dict[str, str]]:
        """
        Implements a sliding window over chat logs. Prunes older items until
        the aggregate token count is within the max token boundary.
        """
        system_tokens = self.estimate_token_count(system_prompt)
        user_tokens = self.estimate_token_count(user_message)
        
        allowed_history_budget = self.max_token_budget - system_tokens - user_tokens - 100 # 100 token buffer
        
        pruned_history = list(history)
        current_history_tokens = sum(self.estimate_token_count(msg["content"]) for msg in pruned_history)
        
        # Sliding Window loop
        while pruned_history and current_history_tokens > allowed_history_budget:
            # Pop the oldest user-assistant exchange (first 2 entries)
            removed = pruned_history.pop(0)
            logger.info(f"Context budget exceeded. Sliding window pruned message block: {removed['role']}")
            current_history_tokens = sum(self.estimate_token_count(msg["content"]) for msg in pruned_history)
            
        return pruned_history
