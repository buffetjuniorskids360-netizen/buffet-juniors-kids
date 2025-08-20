import { Client, CreateClientData, UpdateClientData, ClientListResponse, ClientQueryParams } from '@/types/client';

const API_BASE = '/api/clients';

// Helper function for API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const clientService = {
  // Get all clients with pagination and search
  async getClients(params: ClientQueryParams = {}): Promise<ClientListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE}?${searchParams.toString()}`;
    console.log('🔍 Fetching clients:', url);
    
    return apiRequest(url);
  },

  // Get single client by ID
  async getClient(id: string): Promise<Client> {
    console.log('🔍 Fetching client:', id);
    return apiRequest(`${API_BASE}/${id}`);
  },

  // Create new client
  async createClient(data: CreateClientData): Promise<Client> {
    console.log('➕ Creating client:', data.name);
    return apiRequest(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update existing client
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    console.log('✏️ Updating client:', id, data);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    console.log('🗑️ Deleting client:', id);
    return apiRequest(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
  },
};

export default clientService;