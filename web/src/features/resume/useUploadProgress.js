import { useState, useCallback } from 'react';
import { uploadResume } from './resume.api';

export default function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const performUpload = useCallback(async (file) => {
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadResume(file, (percent) => {
        setProgress(percent);
      });
      setUploading(false);
      return result;
    } catch (err) {
      setUploading(false);
      setProgress(0);
      throw err;
    }
  }, []);

  return {
    progress,
    uploading,
    performUpload,
  };
}
