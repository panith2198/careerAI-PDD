import math
from typing import List, Dict, Set, Tuple

class BM25Okapi:
    """
    BM25Okapi Sparse Retrieval Engine.
    AI Prompt Role: BM25 retrieval engine.
    
    Standard parameters:
        k1 = 1.5
        b = 0.75
    """
    def __init__(self, corpus: List[List[str]], k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus)
        self.avg_doc_len = 0.0
        self.doc_lengths: List[int] = []
        self.doc_freqs: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.term_freqs: List[Dict[str, int]] = []

        if self.corpus_size > 0:
            self._initialize(corpus)

    def _initialize(self, corpus: List[List[str]]):
        total_len = 0
        for doc in corpus:
            doc_len = len(doc)
            self.doc_lengths.append(doc_len)
            total_len += doc_len
            
            # Count term frequencies in this document
            tf: Dict[str, int] = {}
            for term in doc:
                tf[term] = tf.get(term, 0) + 1
            self.term_freqs.append(tf)

            # Count document frequencies
            for term in tf.keys():
                self.doc_freqs[term] = self.doc_freqs.get(term, 0) + 1

        self.avg_doc_len = total_len / self.corpus_size

        # Compute IDF for all terms
        # IDF(q) = ln(1 + (N - n(q) + 0.5) / (n(q) + 0.5))
        for term, df in self.doc_freqs.items():
            num = self.corpus_size - df + 0.5
            denom = df + 0.5
            self.idf[term] = math.log(1.0 + max(num / denom, 0.0))

    def get_scores(self, query: List[str]) -> List[float]:
        """
        Calculates BM25 scores of the query against all documents in the initialized corpus.
        """
        scores = [0.0] * self.corpus_size
        if self.corpus_size == 0:
            return scores

        for term in query:
            if term not in self.idf:
                continue
            
            idf_val = self.idf[term]
            for idx in range(self.corpus_size):
                tf = self.term_freqs[idx].get(term, 0)
                if tf == 0:
                    continue
                
                doc_len = self.doc_lengths[idx]
                
                # BM25 Core Formula
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                scores[idx] += idf_val * (numerator / denominator)

        return scores

    def retrieve_top_k(self, query: List[str], k: int = 5) -> List[Tuple[int, float]]:
        """
        Retrieve top-k documents indices and scores.
        """
        scores = self.get_scores(query)
        scored_docs = [(idx, score) for idx, score in enumerate(scores)]
        scored_docs = sorted(scored_docs, key=lambda x: x[1], reverse=True)
        return scored_docs[:k]
