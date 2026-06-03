from typing import List, Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from app.core.exceptions import PermissionDeniedException

class PermissionTrieNode:
    def __init__(self):
        # Maps token string to child node
        self.children: Dict[str, PermissionTrieNode] = {}
        self.is_wildcard: bool = False
        self.is_leaf: bool = False

class PermissionTrie:
    """
    Trie structure for prefix permission matching.
    Supports namespaces separated by colons (e.g. 'career:recommend:create').
    Wildcard '*' matching allows hierarchy matches (e.g. 'career:*' covers 'career:read').
    """
    def __init__(self):
        self.root = PermissionTrieNode()

    def insert(self, permission: str):
        node = self.root
        tokens = permission.strip().split(":")
        
        for token in tokens:
            if token == "*":
                node.is_wildcard = True
                return
            if token not in node.children:
                node.children[token] = PermissionTrieNode()
            node = node.children[token]
        node.is_leaf = True

    def check(self, required_permission: str) -> bool:
        """
        Check if required_permission matches any registered paths in the Trie.
        """
        tokens = required_permission.strip().split(":")
        return self._search_node(self.root, tokens, 0)

    def _search_node(self, node: PermissionTrieNode, tokens: List[str], index: int) -> bool:
        if node.is_wildcard:
            return True
            
        if index == len(tokens):
            return node.is_leaf or node.is_wildcard

        token = tokens[index]
        
        # 1. Exact token match
        if token in node.children:
            if self._search_node(node.children[token], tokens, index + 1):
                return True
                
        # 2. General Wildcard match on parent node
        if "*" in node.children:
            return True
            
        return False

# Mapping of roles to general permission prefixes
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "student": [
        "user:me:*",
        "career:read",
        "career:recommend:read",
        "assessment:read",
        "assessment:take",
        "roadmap:read",
        "roadmap:create",
        "job:read",
        "job:apply",
        "notification:*"
    ],
    "mentor": [
        "user:me:*",
        "career:read",
        "assessment:read",
        "job:read",
        "mentor:profile:*",
        "mentor:sessions:*",
        "notification:*"
    ],
    "admin": [
        "*"  # Superuser access
    ]
}

class RBACChecker:
    """
    RBAC Permission Evaluator.
    AI Prompt Role: Permission checker.
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, user_role: str) -> bool:
        """
        Evaluate if a user role matches the required permission scope.
        """
        allowed_permissions = ROLE_PERMISSIONS.get(user_role, [])
        trie = PermissionTrie()
        for perm in allowed_permissions:
            trie.insert(perm)
            
        return trie.check(self.required_permission)

def verify_rbac_permission(required_permission: str):
    """
    FastAPI dependency factory injecting RBAC validations.
    """
    checker = RBACChecker(required_permission)
    
    def dependency(current_user: Any = None):
        # Mock / Dynamic checking: current_user must have role attribute mapped from JWT or database
        role = getattr(current_user, "role", "student")
        if not checker(role):
            raise PermissionDeniedException(
                message=f"Access denied. Missing permission: {required_permission}"
            )
        return True
        
    return dependency
