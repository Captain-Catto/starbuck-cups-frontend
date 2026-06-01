const API_BASE_URL = "/api";

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

export type UploadFolder =
  | "products"
  | "categories"
  | "colors"
  | "avatars"
  | "uploads";

class UploadAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadSingle(
    file: File,
    folder: UploadFolder = "uploads"
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    return this.request<UploadResponse>("/admin/upload/single", {
      method: "POST",
      body: formData,
    });
  }

  async uploadMultiple(
    files: File[],
    folder: UploadFolder = "uploads"
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("folder", folder);

    return this.request<MultipleUploadResponse>("/admin/upload/multiple", {
      method: "POST",
      body: formData,
    });
  }

  async deleteFile(key: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/admin/upload/delete?key=${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  }

  async getSignedUrl(key: string, expires = 3600): Promise<{
    success: boolean;
    data: {
      url: string;
      expires: number;
    };
    message: string;
  }> {
    return this.request(
      `/admin/upload/signed-url?key=${encodeURIComponent(key)}&expires=${expires}`
    );
  }

  async uploadProductImages(files: File[]): Promise<MultipleUploadResponse> {
    return this.uploadMultiple(files, "products");
  }

  async uploadProductImage(file: File): Promise<UploadResponse> {
    return this.uploadSingle(file, "products");
  }
}

export const uploadAPI = new UploadAPI();

