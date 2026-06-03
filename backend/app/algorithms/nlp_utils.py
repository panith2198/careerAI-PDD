import re
from typing import List, Dict, Set, Any, Optional

class TrieNode:
    def __init__(self):
        self.children: Dict[str, TrieNode] = {}
        self.is_end: bool = False
        self.metadata: Dict[str, Any] = {}

class SkillTrie:
    """
    Trie structure for extremely fast O(L) multi-word skill lookup, 
    where L is length of words in skill candidate query.
    """
    def __init__(self):
        self.root = TrieNode()

    def insert(self, skill_name: str, metadata: Optional[Dict[str, Any]] = None):
        node = self.root
        # Standardize terms by tokenizing on whitespace
        words = [w.lower().strip() for w in re.split(r'\s+', skill_name) if w.strip()]
        if not words:
            return
        
        for w in words:
            if w not in node.children:
                node.children[w] = TrieNode()
            node = node.children[w]
            
        node.is_end = True
        if metadata:
            node.metadata.update(metadata)
        node.metadata["canonical_name"] = skill_name

    def search_in_tokens(self, tokens: List[str]) -> List[Dict[str, Any]]:
        """
        Scan a list of text tokens and extract matching multi-word skills from Trie.
        """
        matches = []
        n = len(tokens)
        
        i = 0
        while i < n:
            node = self.root
            j = i
            last_match = None
            last_match_index = -1
            
            # Walk the Trie down
            while j < n and tokens[j].lower() in node.children:
                node = node.children[tokens[j].lower()]
                if node.is_end:
                    last_match = node.metadata
                    last_match_index = j
                j += 1
                
            if last_match:
                matches.append(last_match)
                # Skip forward past match
                i = last_match_index + 1
            else:
                i += 1
                
        return matches

class NLPUtils:
    """
    Text preprocessing and high-performance search utilities.
    AI Prompt Role: Text preprocessor.
    
    Includes:
        - Boyer-Moore exact string pattern matching.
        - Skill entity tagging via SkillTrie.
        - Text tokenization and stopword removal.
    """
    
    # Standard English Stopwords list
    STOPWORDS: Set[str] = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", 
        "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", 
        "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", 
        "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", 
        "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", 
        "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", 
        "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", 
        "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", 
        "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", 
        "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", 
        "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", 
        "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
        "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", 
        "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", 
        "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", 
        "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
        "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", 
        "yours", "yourself", "yourselves"
    }

    @staticmethod
    def preprocess_text(text: str) -> List[str]:
        """
        Tokenize input string, convert to lowercase, strip non-alphanumeric, 
        and filter out standard stopwords.
        """
        if not text:
            return []
        
        # Lowercase and split on non-alphanumeric words
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if w not in NLPUtils.STOPWORDS]

    @staticmethod
    def boyer_moore_search(text: str, pattern: str) -> List[int]:
        """
        Boyer-Moore pattern matching algorithm for extremely fast exact match lookups.
        Returns a list of 0-based character start indices where the pattern occurs in text.
        """
        if not pattern or not text:
            return []

        occurrences = []
        n = len(text)
        m = len(pattern)
        
        if m > n:
            return []

        # 1. Build bad character heuristic jump table
        bad_char = {}
        for idx in range(m):
            bad_char[pattern[idx]] = idx

        # 2. Search pattern
        s = 0  # shift of the pattern with respect to text
        while s <= n - m:
            j = m - 1
            
            # Keep reducing index j of pattern while characters of pattern and text are matching at shift s
            while j >= 0 and pattern[j] == text[s + j]:
                j -= 1
                
            if j < 0:
                occurrences.append(s)
                # Shift pattern so that the next character in text aligns with its last occurrence in pattern.
                # If there's no character, shift pattern by 1.
                s += (m - bad_char.get(text[s + m], -1)) if s + m < n else 1
            else:
                # Shift pattern by aligning bad character with its last occurrence in pattern.
                c = text[s + j]
                s += max(1, j - bad_char.get(c, -1))
                
        return occurrences
