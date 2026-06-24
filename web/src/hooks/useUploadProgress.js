import { useState, useCallback } from 'react';

export default function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const performUpload = useCallback(async (fileOrFn, uploadFn) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      let result;
      if (typeof fileOrFn === 'function') {
        result = await fileOrFn((percent) => {
          setProgress(percent);
        });
      } else if (typeof uploadFn === 'function') {
        result = await uploadFn(fileOrFn, (percent) => {
          setProgress(percent);
        });
      } else {
        throw new Error('An upload function must be provided to performUpload');
      }
      setUploading(false);
      return result;
    } catch (err) {
      setUploading(false);
      setProgress(0);
      setError(err);
      throw err;
    }
  }, []);

  return {
    progress,
    uploading,
    error,
    performUpload,
    setProgress,
  };
}
