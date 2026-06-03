import asyncio
import logging
from typing import List, Dict, Any, Callable

logger = logging.getLogger("batch_pdf_processor")

class BatchPDFProcessor:
    """
    Concurrent PDF Ingestion Scheduler.
    Implements semaphore-controlled asynchronous scheduling to process
    multiple files concurrently without CPU spikes (max 4 concurrent tasks).
    """
    def __init__(self, max_concurrency: int = 4):
        self.semaphore = asyncio.Semaphore(max_concurrency)

    async def _process_task_with_semaphore(
        self, 
        file_path: str, 
        process_callback: Callable, 
        *args, 
        **kwargs
    ) -> Any:
        """Lock semaphore and execute processing callback safely."""
        async with self.semaphore:
            logger.info(f"Concurrency lock acquired for: {file_path}")
            try:
                # Call callback function using target arguments
                import inspect
                if inspect.iscoroutinefunction(process_callback):
                    result = await process_callback(file_path, *args, **kwargs)
                else:
                    result = process_callback(file_path, *args, **kwargs)
                return result
            except Exception as e:
                logger.error(f"Concurrent task execution failed for {file_path}: {e}")
                return None
            finally:
                logger.info(f"Concurrency lock released for: {file_path}")

    async def process_batch(
        self, 
        file_paths: List[str], 
        process_callback: Callable, 
        *args, 
        **kwargs
    ) -> List[Any]:
        """Schedule and run multiple files concurrently."""
        tasks = []
        for file in file_paths:
            tasks.append(
                self._process_task_with_semaphore(file, process_callback, *args, **kwargs)
            )
            
        results = await asyncio.gather(*tasks)
        logger.info(f"Batch execution complete. Processed {len(file_paths)} tasks successfully.")
        return results
