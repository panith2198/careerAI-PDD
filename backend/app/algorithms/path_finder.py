import heapq
from typing import List, Dict, Tuple, Set
from app.algorithms.career_graph import CareerGraph

class PathFinder:
    r"""
    Optimal Career Path Transition Planner.
    Deploys Dijkstra's Algorithm ($O((V+E) \log V)$) and A* Search ($O(b^d)$)
    to calculate optimal node transition steps over Graph structural networks.
    """
    
    @staticmethod
    def run_dijkstra(graph: CareerGraph, start_node: int, end_node: int) -> Tuple[float, List[int]]:
        """
        Dijkstra's Shortest Path Tree Algorithm to trace the cheapest acquisition path.
        Returns: Tuple of (shortest_distance, path_of_node_ids)
        """
        # Min-Heap queue format: (cumulative_cost, current_node)
        heap: List[Tuple[float, int]] = []
        distances: Dict[int, float] = {node: float("inf") for node in graph.adj.keys()}
        previous: Dict[int, int] = {node: -1 for node in graph.adj.keys()}

        if start_node not in distances:
            return float("inf"), []

        distances[start_node] = 0.0
        heapq.heappush(heap, (0.0, start_node))

        while heap:
            curr_dist, u = heapq.heappop(heap)

            if u == end_node:
                break

            if curr_dist > distances.get(u, float("inf")):
                continue

            for v, weight in graph.get_neighbors(u):
                # Relaxation step
                new_dist = curr_dist + weight
                if new_dist < distances.get(v, float("inf")):
                    distances[v] = new_dist
                    previous[v] = u
                    heapq.heappush(heap, (new_dist, v))

        # Reconstruct path backwards
        path = []
        curr = end_node
        while curr != -1:
            path.append(curr)
            curr = previous.get(curr, -1)
            
        path.reverse()
        shortest_distance = distances.get(end_node, float("inf"))
        return shortest_distance, (path if shortest_distance != float("inf") else [])

    @classmethod
    def run_a_star(
        cls, 
        graph: CareerGraph, 
        start_node: int, 
        end_node: int, 
        heuristic_fn: Dict[int, float]
    ) -> Tuple[float, List[int]]:
        """
        A* Search Algorithm utilizing dynamic heuristic estimates (e.g. market gap metrics).
        f(n) = g(n) + h(n)
        Where:
        - g(n) is actual accumulated cost to reach node n.
        - h(n) is the heuristic estimate of cost to reach the target end_node.
        """
        # Priority Queue: (f_score, current_node)
        pq: List[Tuple[float, int]] = []
        g_scores: Dict[int, float] = {node: float("inf") for node in graph.adj.keys()}
        previous: Dict[int, int] = {node: -1 for node in graph.adj.keys()}

        if start_node not in g_scores:
            return float("inf"), []

        g_scores[start_node] = 0.0
        # h_score is fetched from heuristic function table (defaulting to 0.0 if not found)
        h_start = heuristic_fn.get(start_node, 0.0)
        heapq.heappush(pq, (h_start, start_node))

        while pq:
            _, u = heapq.heappop(pq)

            if u == end_node:
                break

            for v, weight in graph.get_neighbors(u):
                # Calculate trial g_score for the neighbor
                tentative_g = g_scores[u] + weight
                if tentative_g < g_scores.get(v, float("inf")):
                    g_scores[v] = tentative_g
                    previous[v] = u
                    h_score = heuristic_fn.get(v, 0.0)
                    f_score = tentative_g + h_score
                    heapq.heappush(pq, (f_score, v))

        # Reconstruct path
        path = []
        curr = end_node
        while curr != -1:
            path.append(curr)
            curr = previous.get(curr, -1)
            
        path.reverse()
        shortest_distance = g_scores.get(end_node, float("inf"))
        return shortest_distance, (path if shortest_distance != float("inf") else [])
