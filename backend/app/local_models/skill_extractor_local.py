from typing import List, Set, Dict
import logging

logger = logging.getLogger("skill_extractor_local")

class TrieNode:
    """Represents a single character node inside a Prefix Tree (Trie)."""
    def __init__(self):
        self.children: Dict[str, "TrieNode"] = {}
        self.is_end_of_word: bool = False
        self.canonical_name: str = ""

class Trie:
    """Highly optimized Trie (Prefix Tree) for fast O(L) multi-word skill alias lookups."""
    def __init__(self):
        self.root = TrieNode()

    def insert(self, skill_name: str):
        """Insert a skill and its lowercased canonical token representations into the Trie."""
        node = self.root
        # Process character by character
        for char in skill_name.lower():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.canonical_name = skill_name

    def search_in_text(self, text: str) -> Set[str]:
        """
        Scan input text and match registered Trie prefixes.
        Performs in-context parsing with O(L) complexity, extracting skills.
        """
        detected_skills = set()
        text_lower = text.lower()
        text_len = len(text_lower)

        # Slide matching window starting at each character position
        for i in range(text_len):
            node = self.root
            match_found = False
            match_name = ""
            
            for j in range(i, text_len):
                char = text_lower[j]
                if char not in node.children:
                    break
                node = node.children[char]
                
                # Check if we hit a complete skill leaf boundary
                if node.is_end_of_word:
                    # boundary checks (ensure skill is isolated by punctuation/spaces, not a substring of a larger word)
                    is_start_boundary = (i == 0 or not text_lower[i-1].isalnum())
                    is_end_boundary = (j == text_len - 1 or not text_lower[j+1].isalnum())
                    
                    if is_start_boundary and is_end_boundary:
                        match_found = True
                        match_name = node.canonical_name
                        
            if match_found:
                detected_skills.add(match_name)
                
        return detected_skills

class SkillExtractorLocal:
    """
    High-performance Trie-based local skill extractor.
    Scans document texts in linear time, resolving raw aliases against canonical skill names.
    """
    def __init__(self):
        self.trie = Trie()
        self._initialized = False

    def initialize_taxonomy(self, canonical_skills: List[str]):
        """Load and compile the Trie index prefix structures using standard canonical skill names."""
        for skill in canonical_skills:
            self.trie.insert(skill)
        self._initialized = True
        logger.info(f"Successfully compiled Trie Prefix Tree containing {len(canonical_skills)} skills.")

    def extract_skills(self, text: str) -> List[str]:
        """Perform linear Trie searches and return clean extracted skill names."""
        if not self._initialized:
            # Fallback taxonomy in case of empty initializations
            default_taxonomy = [
                "Python", "FastAPI", "React", "MySQL", "JavaScript", "SQL", 
                "Docker", "Kubernetes", "AWS", "Machine Learning", "Data Science", 
                "C++", "Java", "Go", "HTML", "CSS", "Git", "PyTorch", "TensorFlow"
            ]
            self.initialize_taxonomy(default_taxonomy)
            
        detected = self.trie.search_in_text(text)
        return sorted(list(detected))

skill_extractor_local = SkillExtractorLocal()
