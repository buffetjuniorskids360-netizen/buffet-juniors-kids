import { api } from '@/lib/api';

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'photo' | 'report' | 'other';
  category: string;
  fileType: string;
  size: number;
  uploadDate: string;
  description: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  clientId?: string;
  eventId?: string;
  uploadedBy: string;
  url?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  documentCount: number;
  type: 'client' | 'event' | 'administrative' | 'financial';
}

export interface DocumentFilters {
  search?: string;
  type?: string;
  status?: string;
  category?: string;
  clientId?: string;
  eventId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'uploadDate' | 'size' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentUploadData {
  name?: string;
  type: Document['type'];
  category: string;
  description?: string;
  tags?: string[];
  clientId?: string;
  eventId?: string;
}

export interface DocumentResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalSize: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

class DocumentService {
  /**
   * Get all documents with optional filtering
   */
  async getDocuments(filters: DocumentFilters = {}): Promise<DocumentResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await api.get(`/documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Falha ao carregar documentos');
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Falha ao carregar documento');
    }
  }

  /**
   * Upload a new document
   */
  async uploadDocument(file: File, data: DocumentUploadData): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', data.name || file.name);
      formData.append('type', data.type);
      formData.append('category', data.category);
      
      if (data.description) formData.append('description', data.description);
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      if (data.clientId) formData.append('clientId', data.clientId);
      if (data.eventId) formData.append('eventId', data.eventId);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Falha ao fazer upload do documento');
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, data: Partial<DocumentUploadData>): Promise<Document> {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Falha ao atualizar documento');
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(id: string, status: Document['status']): Promise<Document> {
    try {
      const response = await api.patch(`/documents/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Falha ao atualizar status do documento');
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`/documents/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Falha ao excluir documento');
    }
  }

  /**
   * Get document download URL
   */
  async getDocumentDownloadUrl(id: string): Promise<string> {
    try {
      const response = await api.get(`/documents/${id}/download-url`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error('Falha ao gerar link de download');
    }
  }

  /**
   * Download document
   */
  async downloadDocument(id: string, filename?: string): Promise<void> {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `document-${id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Falha ao baixar documento');
    }
  }

  /**
   * Get document preview URL
   */
  async getDocumentPreviewUrl(id: string): Promise<string> {
    try {
      const response = await api.get(`/documents/${id}/preview-url`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw new Error('Falha ao gerar link de visualização');
    }
  }

  /**
   * Get document folders
   */
  async getFolders(): Promise<DocumentFolder[]> {
    try {
      const response = await api.get('/documents/folders');
      return response.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      // Return default folders if API fails
      return [
        { id: '1', name: 'Contratos', documentCount: 0, type: 'administrative' },
        { id: '2', name: 'Comprovantes', documentCount: 0, type: 'financial' },
        { id: '3', name: 'Portfólio', documentCount: 0, type: 'client' },
        { id: '4', name: 'Documentos Fiscais', documentCount: 0, type: 'financial' },
        { id: '5', name: 'Fotos de Eventos', documentCount: 0, type: 'event' },
      ];
    }
  }

  /**
   * Get document statistics
   */
  async getStats(): Promise<DocumentStats> {
    try {
      const response = await api.get('/documents/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }

  /**
   * Search documents by content (if supported by backend)
   */
  async searchDocumentContent(query: string): Promise<Document[]> {
    try {
      const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching document content:', error);
      throw new Error('Falha na busca de conteúdo');
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateStatus(documentIds: string[], status: Document['status']): Promise<void> {
    try {
      await api.patch('/documents/bulk/status', {
        documentIds,
        status
      });
    } catch (error) {
      console.error('Error bulk updating status:', error);
      throw new Error('Falha na atualização em lote');
    }
  }

  async bulkDelete(documentIds: string[]): Promise<void> {
    try {
      await api.delete('/documents/bulk', {
        data: { documentIds }
      });
    } catch (error) {
      console.error('Error bulk deleting documents:', error);
      throw new Error('Falha na exclusão em lote');
    }
  }

  /**
   * Generate share link for document
   */
  async generateShareLink(id: string, expiresIn?: number): Promise<string> {
    try {
      const response = await api.post(`/documents/${id}/share`, {
        expiresIn: expiresIn || 24 * 60 * 60 // 24 hours default
      });
      return response.data.shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      throw new Error('Falha ao gerar link de compartilhamento');
    }
  }
}

export const documentService = new DocumentService();