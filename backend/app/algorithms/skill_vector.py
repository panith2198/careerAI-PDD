import math
from typing import List, Dict, Set

class SkillVector:
    """
    Skill Vectorizer.
    Transforms raw skillset strings into high-dimensional TF-IDF representations,
    evaluating cosine similarity metrics in $O(n \times d)$ space.
    """
    
    @staticmethod
    def compute_tf_idf_vectors(
        documents: List[List[str]]
    ) -> List[Dict[str, float]]:
        """
        Calculates TF-IDF vector matrices for lists of tokenized skills.
        TF = Term Frequency; IDF = Inverse Document Frequency.
        """
        if not documents:
            return []

        num_docs = len(documents)
        
        # 1. Calculate Document Frequency (DF) for each unique skill term
        df: Dict[str, int] = {}
        for doc in documents:
            unique_terms = set(doc)
            for term in unique_terms:
                df[term] = df.get(term, 0) + 1

        # 2. Calculate Inverse Document Frequency (IDF)
        # IDF(t) = log(1 + NumDocs / (1 + DF(t)))
        idf: Dict[str, float] = {}
        for term, doc_freq in df.items():
            idf[term] = math.log(1.0 + (num_docs / (1.0 + doc_freq)))

        # 3. Calculate TF-IDF vectors
        vectors = []
        for doc in documents:
            vector: Dict[str, float] = {}
            # Count word term occurrences
            counts: Dict[str, int] = {}
            for term in doc:
                counts[term] = counts.get(term, 0) + 1
                
            for term, count in counts.items():
                # Term Frequency (TF) = count / doc length
                tf = count / len(doc)
                vector[term] = tf * idf.get(term, 0.0)
                
            vectors.append(vector)
            
        return vectors

    @staticmethod
    def calculate_cosine_similarity(
        vec_a: Dict[str, float], 
        vec_b: Dict[str, float]
    ) -> float:
        """
        Calculate cosine similarity between two sparse TF-IDF dictionaries.
        Formula: Dot Product / (Norm A * Norm B)
        """
        if not vec_a or not vec_b:
            return 0.0

        # Calculate Dot Product
        dot_product = 0.0
        for term, val_a in vec_a.items():
            if term in vec_b:
                dot_product += val_a * vec_b[term]

        # Calculate Norm A
        norm_a = math.sqrt(sum(val ** 2 for val in vec_a.values()))
        # Calculate Norm B
        norm_b = math.sqrt(sum(val ** 2 for val in vec_b.values()))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        return dot_product / (norm_a * norm_b)
