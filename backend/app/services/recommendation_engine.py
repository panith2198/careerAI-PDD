import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.models import User, UserProfile, Career
from app.vector_store.similarity_calculator import SimilarityCalculator
from app.ai_engine.mistral_embedder import mistral_embedder

logger = logging.getLogger("recommendation_engine")

class RecommendationEngine:
    """
    Hybrid Collaborative & Content-Based Career Recommendation Engine.
    Computes cosine similarity indexing between candidate profile vectors
    and active career embedding vectors to suggest roles.
    """
    
    @staticmethod
    async def get_content_based_recommendations(
        user_id: int,
        db: AsyncSession,
        top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Runs Content-Based vector similarity filtering.
        Correlates user profile interest arrays to career embedding coordinates.
        """
        # 1. Fetch user profile embedding
        stmt_profile = select(UserProfile).where(UserProfile.user_id == user_id)
        res_profile = await db.execute(stmt_profile)
        profile = res_profile.scalar_one_or_none()
        
        if not profile or not profile.profile_embedding:
            # Fallback when profile vector embeddings are un-indexed: construct a dummy one
            # based on lexical interests parameters
            interests = profile.career_interests if profile else []
            interest_str = " ".join(interests) if interests else "Software Engineer Development"
            user_vector = await mistral_embedder.get_embedding(interest_str)
        else:
            # Load from JSON embedding vector column
            user_vector = profile.profile_embedding
            
        # 2. Fetch all careers with embeddings
        stmt_careers = select(Career).where(Career.is_active == True)
        res_careers = await db.execute(stmt_careers)
        careers = res_careers.scalars().all()
        
        scored_careers = []
        for career in careers:
            # If career vector is missing, generate it dynamically or fall back
            if not career.embedding_vector:
                career_text = f"{career.title} {career.category} {career.description[:100]}"
                career_vector = await mistral_embedder.get_embedding(career_text)
            else:
                career_vector = career.embedding_vector
                
            # Perform Cosine Similarity calculation via NumPy Vectorized Engine
            similarity = SimilarityCalculator.calculate_cosine_similarity(user_vector, career_vector)
            
            scored_careers.append((similarity, career))
            
        # Sort careers by similarity score descending
        scored_careers = sorted(scored_careers, key=lambda x: x[0], reverse=True)
        
        recommendations = []
        for rank, (score, career) in enumerate(scored_careers[:top_n], 1):
            recommendations.append({
                "career_id": career.career_id,
                "title": career.title,
                "category": career.category,
                "similarity_score": round(score * 100.0, 2),
                "rank": rank
            })
            
        logger.info(f"Collaborative recommendation run complete for user ID: {user_id}")
        return recommendations

recommendation_engine = RecommendationEngine()
