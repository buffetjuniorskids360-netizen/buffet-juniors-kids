import { useState, useEffect, useCallback } from 'react';
import { 
  documentService, 
  Document, 
  DocumentFolder, 
  DocumentFilters, 
  DocumentStats,
  DocumentUploadData 
} from '@/services/documentService';

interface UseDocumentsOptions {
  initialFilters?: DocumentFilters;
  autoFetch?: boolean;
}

interface UseDocumentsReturn {
  // Data
  documents: Document[];
  folders: DocumentFolder[];
  stats: DocumentStats | null;
  
  // State
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  
  // Filters
  filters: DocumentFilters;
  
  // Actions
  fetchDocuments: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  fetchStats: () => Promise<void>;
  uploadDocument: (file: File, data: DocumentUploadData) => Promise<Document | null>;
  updateDocument: (id: string, data: Partial<DocumentUploadData>) => Promise<Document | null>;
  updateDocumentStatus: (id: string, status: Document['status']) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string, filename?: string) => Promise<boolean>;
  generateShareLink: (id: string, expiresIn?: number) => Promise<string | null>;
  
  // Filter management
  setFilters: (filters: Partial<DocumentFilters>) => void;
  resetFilters: () => void;
  
  // Bulk operations
  bulkUpdateStatus: (documentIds: string[], status: Document['status']) => Promise<boolean>;
  bulkDelete: (documentIds: string[]) => Promise<boolean>;
  
  // Utility
  refreshAll: () => Promise<void>;
}

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const { initialFilters = {}, autoFetch = true } = options;

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFiltersState] = useState<DocumentFilters>({
    page: 1,
    limit: 20,
    sortBy: 'uploadDate',
    sortOrder: 'desc',
    ...initialFilters
  });

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentService.getDocuments(filters);
      
      setDocuments(response.documents);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const foldersData = await documentService.getFolders();
      setFolders(foldersData);
    } catch (err) {
      console.error('Error fetching folders:', err);
      // Use default folders on error
      setFolders([
        { id: '1', name: 'Contratos', documentCount: 0, type: 'administrative' },
        { id: '2', name: 'Comprovantes', documentCount: 0, type: 'financial' },
        { id: '3', name: 'Portfólio', documentCount: 0, type: 'client' },
        { id: '4', name: 'Documentos Fiscais', documentCount: 0, type: 'financial' },
        { id: '5', name: 'Fotos de Eventos', documentCount: 0, type: 'event' },
      ]);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await documentService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Calculate stats from current documents if API fails
      if (documents.length > 0) {
        const calculatedStats: DocumentStats = {
          total: documents.length,
          approved: documents.filter(d => d.status === 'approved').length,
          pending: documents.filter(d => d.status === 'pending').length,
          rejected: documents.filter(d => d.status === 'rejected').length,
          totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
          byType: documents.reduce((acc, doc) => {
            acc[doc.type] = (acc[doc.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byCategory: documents.reduce((acc, doc) => {
            acc[doc.category] = (acc[doc.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        setStats(calculatedStats);
      }
    }
  }, [documents]);

  // Upload document
  const uploadDocument = useCallback(async (file: File, data: DocumentUploadData): Promise<Document | null> => {
    try {
      setUploading(true);
      setError(null);
      
      const newDocument = await documentService.uploadDocument(file, data);
      
      // Add to documents list
      setDocuments(prev => [newDocument, ...prev]);
      
      // Refresh stats
      await fetchStats();
      
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(errorMessage);
      console.error('Error uploading document:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, [fetchStats]);

  // Update document
  const updateDocument = useCallback(async (id: string, data: Partial<DocumentUploadData>): Promise<Document | null> => {
    try {
      setError(null);
      
      const updatedDocument = await documentService.updateDocument(id, data);
      
      // Update in documents list
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? updatedDocument : doc
      ));
      
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar documento';
      setError(errorMessage);
      console.error('Error updating document:', err);
      return null;
    }
  }, []);

  // Update document status
  const updateDocumentStatus = useCallback(async (id: string, status: Document['status']): Promise<Document | null> => {
    try {
      setError(null);
      
      const updatedDocument = await documentService.updateDocumentStatus(id, status);
      
      // Update in documents list
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? updatedDocument : doc
      ));
      
      // Refresh stats
      await fetchStats();
      
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(errorMessage);
      console.error('Error updating document status:', err);
      return null;
    }
  }, [fetchStats]);

  // Delete document
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await documentService.deleteDocument(id);
      
      // Remove from documents list
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Refresh stats
      await fetchStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir documento';
      setError(errorMessage);
      console.error('Error deleting document:', err);
      return false;
    }
  }, [fetchStats]);

  // Download document
  const downloadDocument = useCallback(async (id: string, filename?: string): Promise<boolean> => {
    try {
      setError(null);
      
      await documentService.downloadDocument(id, filename);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao baixar documento';
      setError(errorMessage);
      console.error('Error downloading document:', err);
      return false;
    }
  }, []);

  // Generate share link
  const generateShareLink = useCallback(async (id: string, expiresIn?: number): Promise<string | null> => {
    try {
      setError(null);
      
      const shareLink = await documentService.generateShareLink(id, expiresIn);
      return shareLink;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar link de compartilhamento';
      setError(errorMessage);
      console.error('Error generating share link:', err);
      return null;
    }
  }, []);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (documentIds: string[], status: Document['status']): Promise<boolean> => {
    try {
      setError(null);
      
      await documentService.bulkUpdateStatus(documentIds, status);
      
      // Update documents in state
      setDocuments(prev => prev.map(doc => 
        documentIds.includes(doc.id) ? { ...doc, status } : doc
      ));
      
      // Refresh stats
      await fetchStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na atualização em lote';
      setError(errorMessage);
      console.error('Error bulk updating status:', err);
      return false;
    }
  }, [fetchStats]);

  // Bulk delete
  const bulkDelete = useCallback(async (documentIds: string[]): Promise<boolean> => {
    try {
      setError(null);
      
      await documentService.bulkDelete(documentIds);
      
      // Remove documents from state
      setDocuments(prev => prev.filter(doc => !documentIds.includes(doc.id)));
      
      // Refresh stats
      await fetchStats();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na exclusão em lote';
      setError(errorMessage);
      console.error('Error bulk deleting documents:', err);
      return false;
    }
  }, [fetchStats]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<DocumentFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      page: 1,
      limit: 20,
      sortBy: 'uploadDate',
      sortOrder: 'desc'
    });
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchDocuments(),
      fetchFolders(),
      fetchStats()
    ]);
  }, [fetchDocuments, fetchFolders, fetchStats]);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
    }
  }, [fetchDocuments, autoFetch]);

  // Fetch folders and stats on mount
  useEffect(() => {
    if (autoFetch) {
      fetchFolders();
    }
  }, [fetchFolders, autoFetch]);

  // Fetch stats when documents change
  useEffect(() => {
    if (documents.length > 0 && autoFetch) {
      fetchStats();
    }
  }, [fetchStats, documents.length, autoFetch]);

  return {
    // Data
    documents,
    folders,
    stats,
    
    // State
    loading,
    uploading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    
    // Filters
    filters,
    
    // Actions
    fetchDocuments,
    fetchFolders,
    fetchStats,
    uploadDocument,
    updateDocument,
    updateDocumentStatus,
    deleteDocument,
    downloadDocument,
    generateShareLink,
    
    // Filter management
    setFilters,
    resetFilters,
    
    // Bulk operations
    bulkUpdateStatus,
    bulkDelete,
    
    // Utility
    refreshAll
  };
}