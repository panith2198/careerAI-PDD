import logging
from typing import Dict, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")

class WebSocketConnectionManager:
    """
    Manages live user socket connections globally.
    Enables targeted unicast messages and global broadcast alerts.
    """
    def __init__(self):
        # user_id -> set of active WebSockets (allows multi-device sessions)
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Active sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket.")

    async def send_personal_message(self, message: Dict[str, Any], user_id: int):
        """Send target JSON payload to a specific user (all open sockets)."""
        if user_id not in self.active_connections:
            return
            
        dead_sockets = set()
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send websocket message to User {user_id}: {e}")
                dead_sockets.add(websocket)

        # Cleanup failed sockets
        for ws in dead_sockets:
            self.disconnect(user_id, ws)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast JSON payload to all active connections globally."""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

# Global singleton connection manager instance
ws_manager = WebSocketConnectionManager()
