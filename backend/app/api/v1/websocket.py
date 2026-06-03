from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import logging
from app.websocket import ws_manager

router = APIRouter()
logger = logging.getLogger("websocket")

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket route supporting real-time chat, learning roadmaps, and notifications."""
    try:
        # Convert client_id safely to integer for user representation
        user_id = int(client_id)
    except ValueError:
        user_id = hash(client_id) & 0xffffffff  # Safe hash fallback for string IDs
        
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            # Await incoming message from the client
            data = await websocket.receive_text()
            logger.info(f"Received message from client {client_id}: {data}")
            
            # Simple Echo / Command processor
            response = {"status": "received", "data": f"Echo from CareerAI: {data}"}
            await ws_manager.send_personal_message(response, user_id)
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)

