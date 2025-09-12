import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

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
      console.error('API request failed:', endpoint, error);
      return { 
        data: null as T, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
    try {
      const response = await this.request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.success && response.data) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
  }

  // Add specific API methods for mobile app
  async getProfiles(): Promise<ApiResponse<any[]>> {
    const response = await this.get<any[]>('/profiles');
    if (!response.success) {
      return { data: [], success: false, error: response.error };
    }
    return response;
  }

  async getTransactions(page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: any[]; pagination: any }>> {
    const response = await this.get<{ data: any[]; pagination: any }>(`/transactions?page=${page}&limit=${limit}`);
    if (!response.success) {
      return { data: { data: [], pagination: { page: 1, limit, total: 0, hasNext: false, hasPrevious: false } }, success: false, error: response.error };
    }
    return response;
  }

  async createTransaction(transactionData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/transactions', transactionData);
  }

  async getLedgerEntries(period?: string): Promise<ApiResponse<any[]>> {
    const endpoint = period ? `/ledger?period=${period}` : '/ledger';
    const response = await this.get<any[]>(endpoint);
    if (!response.success) {
      return { data: [], success: false, error: response.error };
    }
    return response;
  }

  async calculateLedger(period: string): Promise<ApiResponse<any>> {
    return this.post<any>('/ledger/calculate', { period });
  }

  async getReports(period?: string, type?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (type) params.append('type', type);
    const endpoint = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.get<any>(endpoint);
    if (!response.success) {
      return { data: null, success: false, error: response.error };
    }
    return response;
  }

  async getAuditLogs(page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: any[]; pagination: any }>> {
    const response = await this.get<{ data: any[]; pagination: any }>(`/audit?page=${page}&limit=${limit}`);
    if (!response.success) {
      return { data: { data: [], pagination: { page: 1, limit, total: 0, hasNext: false, hasPrevious: false } }, success: false, error: response.error };
    }
    return response;
  }

  async getUsers(): Promise<ApiResponse<any[]>> {
    const response = await this.get<any[]>('/users');
    if (!response.success) {
      return { data: [], success: false, error: response.error };
    }
    return response;
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/users', userData);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
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