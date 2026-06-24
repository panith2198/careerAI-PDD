import random
from typing import List, Dict, Tuple, Any
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

class RecommendationEngineAlg:
    """
    Core Recommendation Algorithms Engine.
    Executes collaborative filtering (via SVD Matrix Factorization) 
    and content-based filtering algorithms using scikit-learn and RandomForest model prediction.
    AI Prompt Role: Recommendation strategist.
    """
    
    @staticmethod
    def calculate_rule_based_fit(
        user_skills: List[Dict[str, Any]],
        career_skills: List[Dict[str, Any]]
    ) -> float:
        """
        Calculates a structured rule-based fit score (0.0 to 1.0) for a single career.
        Takes user_skills and career_skills as lists of dictionaries.
        """
        if not career_skills:
            return 1.0
            
        PROF_MAP = {"beginner": 0.25, "intermediate": 0.5, "advanced": 0.75, "expert": 1.0}
        def get_prof_value(level: str) -> float:
            return PROF_MAP.get(str(level).lower().strip(), 0.5)

        # Map user skills by name for easy lookup
        user_skills_map = {us["skill_name"].lower().strip(): us for us in user_skills}

        total_possible_weight = 0.0
        user_earned_weight = 0.0

        must_have_required = []
        must_have_possessed = []

        for cs in career_skills:
            importance = cs.get("importance", "must_have")
            # Weightage based on importance
            if importance == "must_have":
                skill_weight = 5.0
                must_have_required.append(cs["skill_name"].lower().strip())
            elif importance == "good_to_have":
                skill_weight = 2.0
            else:
                skill_weight = 1.0
                
            # Apply custom weightage if specified in DB
            db_weightage = cs.get("weightage", 1.0)
            skill_weight *= db_weightage
            
            total_possible_weight += skill_weight

            c_skill_name = cs["skill_name"].lower().strip()
            if c_skill_name in user_skills_map:
                us = user_skills_map[c_skill_name]
                if importance == "must_have":
                    must_have_possessed.append(c_skill_name)
                    
                # 1. Proficiency Match
                user_val = get_prof_value(us.get("proficiency_level", "intermediate"))
                req_val = get_prof_value(cs.get("min_proficiency", "intermediate"))
                
                if user_val >= req_val:
                    prof_factor = 1.0
                else:
                    prof_factor = user_val / req_val if req_val > 0 else 1.0

                # 2. Experience Boost (up to +10%)
                yoe = float(us.get("years_of_experience", 0.0))
                exp_boost = 0.02 * min(yoe, 5.0)

                # 3. Verification Boost (+5%)
                ver_boost = 0.05 if us.get("is_verified", False) else 0.0

                skill_score = skill_weight * prof_factor * (1.0 + exp_boost + ver_boost)
                # Cap individual skill score contribution to prevent excessive boost
                user_earned_weight += min(skill_score, skill_weight * 1.25)

        if total_possible_weight == 0.0:
            return 1.0

        base_score = user_earned_weight / total_possible_weight
        
        # Must-have penalty: if user is missing must_have skills, apply penalty
        if must_have_required:
            must_have_ratio = len(must_have_possessed) / len(must_have_required)
            # Penalty multiplier goes from 0.1 (0 must_have) to 1.0 (all must_have)
            penalty_multiplier = 0.1 + 0.9 * must_have_ratio
            base_score *= penalty_multiplier

        return min(max(base_score, 0.0), 1.0)

    @staticmethod
    def recommend_careers(
        user_skills: List[Any],
        careers_skills_taxonomy: Dict[str, List[Any]],
        top_n: int = 3
    ) -> List[Tuple[float, str]]:
        """
        Recommends careers based on content similarity and machine learning predictions.
        Trains a RandomForestClassifier on synthetic profile vectors generated from the career taxonomy
        to predict career fit probabilities, combined with TF-IDF cosine similarity.
        """
        if not user_skills or not careers_skills_taxonomy:
            return []

        # 1. Normalize user skills to a standard structure: List[Dict]
        norm_user_skills = []
        for us in user_skills:
            if isinstance(us, str):
                norm_user_skills.append({
                    "skill_name": us,
                    "proficiency_level": "intermediate",
                    "years_of_experience": 1.0,
                    "is_verified": False
                })
            elif isinstance(us, dict):
                norm_user_skills.append({
                    "skill_name": us.get("skill_name", ""),
                    "proficiency_level": us.get("proficiency_level", "intermediate"),
                    "years_of_experience": float(us.get("years_of_experience", 1.0)),
                    "is_verified": bool(us.get("is_verified", False))
                })

        # 2. Normalize taxonomy to a standard structure: Dict[str, List[Dict]]
        norm_taxonomy = {}
        for name, skills in careers_skills_taxonomy.items():
            norm_list = []
            for sk in skills:
                if isinstance(sk, str):
                    norm_list.append({
                        "skill_name": sk,
                        "importance": "must_have",
                        "min_proficiency": "intermediate",
                        "weightage": 1.0
                    })
                elif isinstance(sk, dict):
                    norm_list.append({
                        "skill_name": sk.get("skill_name", ""),
                        "importance": sk.get("importance", "must_have"),
                        "min_proficiency": sk.get("min_proficiency", "intermediate"),
                        "weightage": float(sk.get("weightage", 1.0))
                    })
            norm_taxonomy[name] = norm_list

        career_names = list(norm_taxonomy.keys())
        
        # 3. Build a global vocabulary of skills (using normalized skill names)
        all_skills = sorted(list(set(
            [sk["skill_name"].lower().strip() for sk in norm_user_skills] + 
            [sk["skill_name"].lower().strip() for skills in norm_taxonomy.values() for sk in skills]
        )))
        skill_to_idx = {skill: idx for idx, skill in enumerate(all_skills)}
        num_features = len(all_skills)

        PROF_MAP = {"beginner": 0.25, "intermediate": 0.5, "advanced": 0.75, "expert": 1.0}
        def get_prof_value(level: str) -> float:
            return PROF_MAP.get(str(level).lower().strip(), 0.5)

        def vectorize_skills(skills: List[Dict[str, Any]]) -> np.ndarray:
            vec = np.zeros(num_features, dtype=np.float32)
            for sk in skills:
                cleaned = sk["skill_name"].lower().strip()
                if cleaned in skill_to_idx:
                    vec[skill_to_idx[cleaned]] = get_prof_value(sk.get("proficiency_level", "intermediate"))
            return vec

        # 4. Generate synthetic training dataset for classifier training
        X_train = []
        y_train = []
        
        for career_idx, name in enumerate(career_names):
            core_skills = norm_taxonomy[name]
            if not core_skills:
                continue
                
            # Base perfect profile vector (skills set to their min required levels)
            X_train.append(vectorize_skills(core_skills))
            y_train.append(career_idx)
            
            # Partial profile simulations (e.g. 70% and 85% of required skills)
            n_skills = len(core_skills)
            for pct in [0.85, 0.70]:
                n_select = max(1, int(n_skills * pct))
                for _ in range(3):  # Generate 3 variations
                    sampled = random.sample(core_skills, n_select)
                    # Simulating random drops and lower proficiency levels
                    sampled_vectors = []
                    for sk in sampled:
                        prof_choices = ["beginner", "intermediate", "advanced", "expert"]
                        rand_prof = random.choice(prof_choices)
                        sampled_vectors.append({
                            "skill_name": sk["skill_name"],
                            "proficiency_level": rand_prof
                        })
                    X_train.append(vectorize_skills(sampled_vectors))
                    y_train.append(career_idx)
            
            # Simulated profiles with core skills + irrelevant noise skills
            other_skills = [s for s in all_skills if s not in [cs["skill_name"].lower().strip() for cs in core_skills]]
            for _ in range(2):
                noise = [{"skill_name": cs["skill_name"], "proficiency_level": cs["min_proficiency"]} for cs in core_skills]
                if other_skills:
                    for noise_s in random.sample(other_skills, min(len(other_skills), 2)):
                        noise.append({
                            "skill_name": noise_s,
                            "proficiency_level": random.choice(["beginner", "intermediate"])
                        })
                X_train.append(vectorize_skills(noise))
                y_train.append(career_idx)

        X_train = np.array(X_train, dtype=np.float32)
        y_train = np.array(y_train, dtype=np.int32)

        # 5. Train Random Forest Classifier
        # Set max_depth and min_samples_split to ensure generalization
        clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
        clf.fit(X_train, y_train)

        # Predict probability for the current user
        X_user = vectorize_skills(norm_user_skills).reshape(1, -1)
        pred_probs = clf.predict_proba(X_user)[0]

        # 6. Compute TF-IDF Cosine Similarity baseline
        # Use underscores for spaces to match multi-word skills precisely as single tokens
        def tokenize_skill(name: str) -> str:
            return name.lower().strip().replace(" ", "_")

        user_skills_doc = " ".join([tokenize_skill(sk["skill_name"]) for sk in norm_user_skills])
        career_docs = [" ".join([tokenize_skill(sk["skill_name"]) for sk in norm_taxonomy[name]]) for name in career_names]
        
        documents = [user_skills_doc] + career_docs
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        cos_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

        # 7. Hybrid ranking calculations
        scored_recommendations = []
        max_prob = float(np.max(pred_probs))
        
        for career_idx, name in enumerate(career_names):
            ml_prob = float(pred_probs[career_idx])
            cos_sim = float(cos_sims[career_idx])
            
            # Normalize probability relative to max predicted probability to prevent scale suppression
            scaled_ml_score = (ml_prob / max_prob) if max_prob > 0.0 else 0.0
            
            # Compute rule-based fit score
            rule_score = RecommendationEngineAlg.calculate_rule_based_fit(norm_user_skills, norm_taxonomy[name])
            
            # Hybrid formula: 30% ML Prob + 30% TF-IDF Cos Sim + 40% Rule-Based Score
            hybrid_score = 0.3 * scaled_ml_score + 0.3 * cos_sim + 0.4 * rule_score
            scored_recommendations.append((hybrid_score, name))

        # Sort recommendations by similarity score descending
        scored_recommendations = sorted(scored_recommendations, key=lambda x: x[0], reverse=True)
        return scored_recommendations[:top_n]

    @staticmethod
    def run_svd_matrix_factorization(
        ratings_matrix: List[List[float]],
        latent_features: int = 2
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Industry-level Singular Value Decomposition (SVD) Matrix Factorization using scikit-learn.
        Decomposes R (m x n) into user latent vectors P (m x k) and item latent vectors Q (n x k)
        such that R ≈ P x Q^T.
        """
        if not ratings_matrix or not ratings_matrix[0]:
            return [], []
            
        R = np.array(ratings_matrix, dtype=np.float32)
        # Handle cases where ratings matrix has smaller dimensions than latent features
        n_features = min(latent_features, R.shape[0], R.shape[1] - 1)
        if n_features < 1:
            n_features = 1
            
        svd = TruncatedSVD(n_components=n_features, random_state=42)
        P = svd.fit_transform(R)
        Q = svd.components_.T
        
        return P.tolist(), Q.tolist()
