import { useAppSelector } from '@/store';
import { uploadAPI, type UploadFolder } from '@/lib/api/upload';

export const useUpload = () => {
  const token = useAppSelector((state) => state.auth.token);

  const uploadSingle = async (file: File, folder: UploadFolder = 'uploads') => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Temporarily override the request method to use current token
    const originalRequest = uploadAPI.request;
    (uploadAPI as any).request = async function<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    };

    try {
      const result = await uploadAPI.uploadSingle(file, folder);
      return result;
    } finally {
      // Restore original request method
      (uploadAPI as any).request = originalRequest;
    }
  };

  const uploadMultiple = async (files: File[], folder: UploadFolder = 'uploads') => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Temporarily override the request method to use current token
    const originalRequest = uploadAPI.request;
    (uploadAPI as any).request = async function<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    };

    try {
      const result = await uploadAPI.uploadMultiple(files, folder);
      return result;
    } finally {
      // Restore original request method
      (uploadAPI as any).request = originalRequest;
    }
  };

  const uploadProductImages = async (files: File[]) => {
    return uploadMultiple(files, 'products');
  };

  const uploadProductImage = async (file: File) => {
    return uploadSingle(file, 'products');
  };

  return {
    uploadSingle,
    uploadMultiple,
    uploadProductImages,
    uploadProductImage,
    isAuthenticated: !!token,
  };
};