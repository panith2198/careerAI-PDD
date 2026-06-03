import logging
from typing import Literal

logger = logging.getLogger("ai_router")

class AIRouter:
    """
    Decides routing paths dynamically between high-reasoning external LLMs
    (e.g., MistralAI) and local CPU models (e.g., spaCy NER, all-MiniLM)
    to optimize token budgets, latency parameters, and privacy levels.
    """

    @staticmethod
    def route_task(
        task_type: Literal["reasoning", "extraction", "embedding", "reranking"],
        network_available: bool = True
    ) -> Literal["mistral", "local"]:
        """
        Calculates optimal task execution path.
        * reasoning: routed to 'mistral' due to high-reasoning context.
        * extraction: routed to 'local' (spaCy en_core_web_trf) for low latency CPU parsing.
        * embedding: routed to 'mistral' (native mistral-embed) if online, otherwise fallback to 'local' (all-MiniLM).
        * reranking: routed to 'local' (ms-marco-MiniLM-L-6-v2) to eliminate API costs.
        """
        # Strict offline overrides
        if not network_available:
            logger.info("Network is unavailable. Enforcing local routing path.")
            return "local"

        if task_type == "reasoning":
            # Roadmaps and fit reasoning require advanced open-weight logic
            return "mistral"
            
        elif task_type == "extraction":
            # Local spaCy parses profiles under 100ms
            return "local"
            
        elif task_type == "embedding":
            # Preferred mistral-embed for semantic fidelity
            return "mistral"
            
        elif task_type == "reranking":
            # Always route reranking locally (ms-marco cross encoder) for zero API costs
            return "local"
            
        return "local"
