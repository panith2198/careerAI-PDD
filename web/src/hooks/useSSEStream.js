import { useState, useRef, useEffect, useCallback } from 'react';
import useAuthStore from '@/stores/authStore';

export default function useSSEStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChunk, setCurrentChunk] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setIsStreaming(false);
  }, []);

  const clearStream = useCallback(() => {
    stopStream();
    setError(null);
    setCurrentChunk('');
    setFullResponse('');
  }, [stopStream]);

  const startStream = useCallback((prompt, sessionId, customToken, onChunkReceived, onStreamCompleted) => {
    clearStream();
    setIsStreaming(true);
    setError(null);

    const token = customToken || useAuthStore.getState().token;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const runStreamWithRetry = async (attempt = 0) => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/rag/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            message: prompt,
            session_id: sessionId || null,
            collection: 'careers',
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let currentAccumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const text = parsed.text || '';
                if (text) {
                  currentAccumulated += text;
                  setFullResponse(currentAccumulated);
                  setCurrentChunk(text);
                  if (onChunkReceived) {
                    onChunkReceived(text);
                  }
                }
              } catch (err) {
                console.error('Failed to parse SSE token chunk:', err);
              }
            }
          }
        }

        // Streaming completed successfully
        setIsStreaming(false);
        if (onStreamCompleted) {
          onStreamCompleted(currentAccumulated);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Stream aborted by user.');
          return;
        }

        console.error(`Streaming attempt ${attempt + 1} failed:`, err);

        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Retrying in ${delay}ms...`);
          retryTimeoutRef.current = setTimeout(() => {
            if (!controller.signal.aborted) {
              runStreamWithRetry(attempt + 1);
            }
          }, delay);
        } else {
          setError('Failed to load response after multiple retries. Please check your connection.');
          setIsStreaming(false);
        }
      }
    };

    runStreamWithRetry(0);
  }, [clearStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isStreaming,
    currentChunk,
    fullResponse,
    accumulatedText: fullResponse, // compatibility alias
    error,
    startStream,
    stopStream,
    abortStream: stopStream, // compatibility alias
    clearStream,
  };
}
