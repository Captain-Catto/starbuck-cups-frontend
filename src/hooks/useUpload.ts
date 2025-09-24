import { useAppSelector } from '@/store';
import type { UploadFolder } from '@/lib/api/upload';

export const useUpload = () => {
  const token = useAppSelector((state) => state.auth.token);

  const uploadSingle = async (file: File, folder: UploadFolder = 'uploads') => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/upload/single`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const uploadMultiple = async (files: File[], folder: UploadFolder = 'uploads') => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin/upload/multiple`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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