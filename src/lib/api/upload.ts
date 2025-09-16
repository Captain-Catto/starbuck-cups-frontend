const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  message: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: Array<{
    url: string;
    key: string;
    filename: string;
    size: number;
    mimetype: string;
  }>;
  message: string;
}

export type UploadFolder = 'products' | 'categories' | 'colors' | 'avatars' | 'uploads';

class UploadAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

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
  }

  /**
   * Upload single file
   */
  async uploadSingle(file: File, folder: UploadFolder = 'uploads'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    return this.request<UploadResponse>('/admin/upload/single', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], folder: UploadFolder = 'uploads'): Promise<MultipleUploadResponse> {
    const formData = new FormData();

    // Append all files with the same field name 'images'
    files.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('folder', folder);

    return this.request<MultipleUploadResponse>('/admin/upload/multiple', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Delete file by key
   */
  async deleteFile(key: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/admin/upload/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(key: string, expires: number = 3600): Promise<{
    success: boolean;
    data: {
      url: string;
      expires: number;
    };
    message: string;
  }> {
    return this.request<{
      success: boolean;
      data: {
        url: string;
        expires: number;
      };
      message: string;
    }>(`/admin/upload/signed-url?key=${encodeURIComponent(key)}&expires=${expires}`);
  }

  /**
   * Upload files for products specifically
   */
  async uploadProductImages(files: File[]): Promise<MultipleUploadResponse> {
    return this.uploadMultiple(files, 'products');
  }

  /**
   * Upload single product image
   */
  async uploadProductImage(file: File): Promise<UploadResponse> {
    return this.uploadSingle(file, 'products');
  }
}

export const uploadAPI = new UploadAPI();