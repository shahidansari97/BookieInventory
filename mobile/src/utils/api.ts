import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return { data, success: true };
    } catch (error) {
      return { 
        data: {} as T, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
    // Demo implementation - replace with actual API call
    if ((username === 'admin' && password === 'admin123') || 
        (username === 'assistant' && password === 'assistant123')) {
      
      const token = `demo_token_${username}_${Date.now()}`;
      await SecureStore.setItemAsync('auth_token', token);
      
      return {
        token,
        user: {
          username,
          role: username === 'admin' ? 'bookie' : 'assistant'
        }
      };
    }
    return null;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();