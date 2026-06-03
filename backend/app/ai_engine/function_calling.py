from typing import Dict, Any, List, Callable, Optional
import json
import logging

logger = logging.getLogger("function_calling")

class ToolRegistry:
    """Registers and routes Mistral tool-calling functions dynamically."""
    def __init__(self):
        self.tools: Dict[str, Dict[str, Any]] = {}
        self.callbacks: Dict[str, Callable] = {}

    def register_tool(self, name: str, description: str, parameters: Dict[str, Any], callback: Callable):
        """Register a Python callback function as a callable LLM tool."""
        self.tools[name] = {
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": parameters
            }
        }
        self.callbacks[name] = callback
        logger.info(f"Registered tool function callback: {name}")

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Retrieve registered tool properties formatted for Mistral schema integration."""
        return list(self.tools.values())

    async def execute_tool_call(self, name: str, arguments_json_str: str) -> Optional[Any]:
        """Parse arguments and safely execute registered tool callbacks."""
        if name not in self.callbacks:
            logger.error(f"Execution failed: Tool '{name}' is not registered in the callback manager.")
            return None
            
        try:
            args = json.loads(arguments_json_str) if arguments_json_str else {}
            callback = self.callbacks[name]
            
            # Execute async callbacks if declared, otherwise run synchronously
            import inspect
            if inspect.iscoroutinefunction(callback):
                result = await callback(**args)
            else:
                result = callback(**args)
                
            return result
        except Exception as e:
            logger.error(f"Error executing callback for tool '{name}': {e}")
            return None

# Global registry instance for system-wide tool calling
tool_registry = ToolRegistry()
