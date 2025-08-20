import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientService } from '@/services/clientService';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getClients', () => {
    it('fetches clients with default parameters', async () => {
      const mockResponse = {
        clients: [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '11987654321',
            address: 'Rua das Flores, 123',
            notes: '',
            createdAt: '2025-01-01',
            events: []
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await clientService.getClients();

      expect(mockFetch).toHaveBeenCalledWith('/api/clients?', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('fetches clients with search parameters', async () => {
      const searchParams = {
        page: 2,
        limit: 20,
        search: 'João',
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clients: [], pagination: {} }),
      });

      await clientService.getClients(searchParams);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/clients?page=2&limit=20&search=Jo%C3%A3o&sortBy=name&sortOrder=asc',
        expect.any(Object)
      );
    });

    it('handles fetch errors correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      await expect(clientService.getClients()).rejects.toThrow('Server error');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(clientService.getClients()).rejects.toThrow('Network error');
    });
  });

  describe('getClient', () => {
    it('fetches a single client by ID', async () => {
      const mockClient = {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11987654321',
        address: 'Rua das Flores, 123',
        notes: '',
        createdAt: '2025-01-01',
        events: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockClient,
      });

      const result = await clientService.getClient('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/clients/1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockClient);
    });
  });

  describe('createClient', () => {
    it('creates a new client', async () => {
      const newClientData = {
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '11999888777',
        address: 'Av. Principal, 456',
        notes: 'Cliente VIP'
      };

      const createdClient = {
        id: '2',
        ...newClientData,
        createdAt: '2025-01-02',
        events: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdClient,
      });

      const result = await clientService.createClient(newClientData);

      expect(mockFetch).toHaveBeenCalledWith('/api/clients', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClientData),
      });

      expect(result).toEqual(createdClient);
    });

    it('handles validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        phone: '123',
        address: '',
        notes: ''
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Validation failed' }),
      });

      await expect(clientService.createClient(invalidData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateClient', () => {
    it('updates an existing client', async () => {
      const updateData = {
        name: 'João Silva Santos',
        email: 'joao.santos@email.com',
        phone: '11987654321',
        address: 'Rua das Flores, 123 - Apt 45',
        notes: 'Cliente atualizado'
      };

      const updatedClient = {
        id: '1',
        ...updateData,
        createdAt: '2025-01-01',
        events: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedClient,
      });

      const result = await clientService.updateClient('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/clients/1', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(result).toEqual(updatedClient);
    });

    it('handles client not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Client not found' }),
      });

      await expect(clientService.updateClient('999', {})).rejects.toThrow('Client not found');
    });
  });

  describe('deleteClient', () => {
    it('deletes a client', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await clientService.deleteClient('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/clients/1', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('handles client with events error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Cannot delete client with existing events' }),
      });

      await expect(clientService.deleteClient('1')).rejects.toThrow('Cannot delete client with existing events');
    });

    it('handles delete of non-existent client', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Client not found' }),
      });

      await expect(clientService.deleteClient('999')).rejects.toThrow('Client not found');
    });
  });

  describe('API request handling', () => {
    it('includes credentials in all requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clients: [], pagination: {} }),
      });

      await clientService.getClients();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      );
    });

    it('sets correct content type headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ clients: [], pagination: {} }),
      });

      await clientService.getClients();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('handles empty response correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await clientService.deleteClient('1');
      expect(result).toBeNull();
    });

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(clientService.getClients()).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });
});