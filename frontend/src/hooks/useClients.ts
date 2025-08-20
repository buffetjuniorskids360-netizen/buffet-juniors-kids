import { useState, useEffect, useCallback } from 'react';
import { Client, ClientListResponse, ClientQueryParams, CreateClientData, UpdateClientData } from '@/types/client';
import { clientService } from '@/services/clientService';

interface UseClientsState {
  clients: Client[];
  pagination: ClientListResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
}

interface UseClientsActions {
  fetchClients: (params?: ClientQueryParams) => Promise<void>;
  createClient: (data: CreateClientData) => Promise<Client>;
  updateClient: (id: string, data: UpdateClientData) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: 'name' | 'createdAt' | 'updatedAt', sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  refreshClients: () => Promise<void>;
}

export function useClients(): UseClientsState & UseClientsActions {
  const [state, setState] = useState<UseClientsState>({
    clients: [],
    pagination: null,
    loading: false,
    error: null,
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    currentPage: 1,
  });

  const fetchClients = useCallback(async (params?: ClientQueryParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await clientService.getClients(params || {
        page: 1,
        limit: 10,
      });
      
      setState(prev => ({
        ...prev,
        clients: response.clients,
        pagination: response.pagination,
        loading: false,
        currentPage: response.pagination.page,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error('Error fetching clients:', error);
    }
  }, []);

  const createClient = useCallback(async (data: CreateClientData): Promise<Client> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newClient = await clientService.createClient(data);
      
      // Refresh the client list
      await fetchClients();
      
      return newClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw error;
    }
  }, [fetchClients]);

  const updateClient = useCallback(async (id: string, data: UpdateClientData): Promise<Client> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedClient = await clientService.updateClient(id, data);
      
      // Update the client in the current list
      setState(prev => ({
        ...prev,
        clients: prev.clients.map(client => 
          client.id === id ? updatedClient : client
        ),
        loading: false,
      }));
      
      return updatedClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const deleteClient = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await clientService.deleteClient(id);
      
      // Remove the client from the current list
      setState(prev => ({
        ...prev,
        clients: prev.clients.filter(client => client.id !== id),
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
  }, []);

  const setSorting = useCallback((sortBy: 'name' | 'createdAt' | 'updatedAt', sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder, currentPage: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const refreshClients = useCallback(() => {
    return fetchClients();
  }, [fetchClients]);

  // Initial fetch
  useEffect(() => {
    fetchClients({
      page: state.currentPage,
      search: state.searchQuery,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      limit: 10,
    });
  }, [fetchClients, state.searchQuery, state.sortBy, state.sortOrder, state.currentPage]);

  return {
    ...state,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    setSearchQuery,
    setSorting,
    setPage,
    refreshClients,
  };
}