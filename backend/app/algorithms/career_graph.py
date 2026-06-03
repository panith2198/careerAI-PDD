from typing import Dict, List, Tuple, Any, Set

class CareerGraph:
    """
    Directed Weighted Graph Representation.
    Nodes = Career Roles / Skill Nodes
    Edges = Transition Pathways
    Weights = Difficulty / Importance indices
    """
    def __init__(self):
        # Adjacency List: node_id -> list of (neighbor_id, weight)
        self.adj: Dict[int, List[Tuple[int, float]]] = {}
        # Metadata map: node_id -> string properties
        self.nodes_metadata: Dict[int, Dict[str, Any]] = {}

    def add_node(self, node_id: int, metadata: Dict[str, Any]):
        """Register a node in the career graph."""
        if node_id not in self.adj:
            self.adj[node_id] = []
        self.nodes_metadata[node_id] = metadata

    def add_edge(self, u: int, v: int, weight: float):
        """Add a directed edge between node u and v with an associated difficulty weight."""
        if u not in self.adj:
            self.adj[u] = []
        if v not in self.adj:
            self.adj[v] = []
        self.adj[u].append((v, weight))

    def get_neighbors(self, u: int) -> List[Tuple[int, float]]:
        """Retrieve all neighbor nodes of vertex u with edge weights."""
        return self.adj.get(u, [])

    def run_bfs(self, start_node: int) -> List[int]:
        """
        Breadth-First Search (BFS) to explore roles layer-by-layer.
        Useful for broad role level mappings. Complexity: O(V + E)
        """
        if start_node not in self.adj:
            return []

        visited: Set[int] = {start_node}
        queue: List[int] = [start_node]
        traversal_order: List[int] = []

        while queue:
            curr = queue.pop(0)
            traversal_order.append(curr)

            for neighbor, _ in self.get_neighbors(curr):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        return traversal_order

    def run_dfs(self, start_node: int) -> List[int]:
        """
        Depth-First Search (DFS) implementation to explore career trajectory deep down.
        Complexity: O(V + E)
        """
        if start_node not in self.adj:
            return []

        visited: Set[int] = set()
        traversal_order: List[int] = []

        def dfs_visit(u: int):
            visited.add(u)
            traversal_order.append(u)
            for neighbor, _ in self.get_neighbors(u):
                if neighbor not in visited:
                    dfs_visit(neighbor)

        dfs_visit(start_node)
        return traversal_order

