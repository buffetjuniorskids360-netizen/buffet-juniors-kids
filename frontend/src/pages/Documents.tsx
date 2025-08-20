import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText,
  Upload,
  Download,
  ArrowLeft,
  Trash2,
  Plus,
  Search,
  FileImage,
  FileSpreadsheet,
  FileCheck,
  File,
  Folder,
  FolderOpen,
  RefreshCw,
  Share,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';

interface Document {
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

interface DocumentFolder {
  id: string;
  name: string;
  documentCount: number;
  type: 'client' | 'event' | 'administrative' | 'financial';
}

// Utility function for status icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'rejected': return <AlertCircle className="w-4 h-4 text-red-600" />;
    default: return null;
  }
};

export default function Documents() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for demo data (will be replaced with API integration)
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrato - Festa Sofia.pdf',
      type: 'contract',
      category: 'Contratos',
      fileType: 'pdf',
      size: 245760,
      uploadDate: '2025-08-10',
      description: 'Contrato assinado para festa de aniversário da Sofia',
      tags: ['contrato', 'assinado', 'sofia'],
      status: 'approved',
      clientId: 'client_001',
      eventId: 'event_001',
      uploadedBy: 'Admin'
    },
    {
      id: '2',
      name: 'Recibo - Pagamento João.jpg',
      type: 'receipt',
      category: 'Comprovantes',
      fileType: 'jpg',
      size: 156340,
      uploadDate: '2025-08-09',
      description: 'Comprovante de pagamento da entrada',
      tags: ['recibo', 'pagamento', 'entrada'],
      status: 'approved',
      clientId: 'client_002',
      uploadedBy: 'Admin'
    },
    {
      id: '3',
      name: 'Fotos - Decoração Temática.zip',
      type: 'photo',
      category: 'Portfólio',
      fileType: 'zip',
      size: 5242880,
      uploadDate: '2025-08-08',
      description: 'Fotos da decoração para portfólio',
      tags: ['portfolio', 'decoracao', 'tematica'],
      status: 'pending',
      eventId: 'event_002',
      uploadedBy: 'Admin'
    }
  ]);

  const [folders] = useState<DocumentFolder[]>([
    { id: '1', name: 'Contratos', documentCount: 15, type: 'administrative' },
    { id: '2', name: 'Comprovantes', documentCount: 23, type: 'financial' },
    { id: '3', name: 'Portfólio', documentCount: 45, type: 'client' },
    { id: '4', name: 'Documentos Fiscais', documentCount: 12, type: 'financial' },
    { id: '5', name: 'Fotos de Eventos', documentCount: 67, type: 'event' },
  ]);

  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'other' as Document['type'],
    category: '',
    description: '',
    tags: '',
    clientId: '',
    eventId: '',
  });

  // Sample data for dropdowns
  const documentTypes = [
    { value: 'contract', label: 'Contrato', icon: FileCheck },
    { value: 'invoice', label: 'Nota Fiscal', icon: FileSpreadsheet },
    { value: 'receipt', label: 'Comprovante', icon: FileText },
    { value: 'photo', label: 'Foto', icon: FileImage },
    { value: 'report', label: 'Relatório', icon: FileText },
    { value: 'other', label: 'Outro', icon: File },
  ];

  const categories = [
    'Contratos',
    'Comprovantes',
    'Portfólio',
    'Documentos Fiscais',
    'Fotos de Eventos',
    'Relatórios',
    'Administrativo',
    'Outros'
  ];

  // Helper functions

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImage className="w-5 h-5 text-blue-600" />;
      case 'xlsx':
      case 'xls':
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      default: return <File className="w-5 h-5 text-slate-600" />;
    }
  };

  const getFolderIcon = (type: string, isOpen = false) => {
    const IconComponent = isOpen ? FolderOpen : Folder;
    switch (type) {
      case 'client': return <IconComponent className="w-5 h-5 text-blue-600" />;
      case 'event': return <IconComponent className="w-5 h-5 text-purple-600" />;
      case 'administrative': return <IconComponent className="w-5 h-5 text-orange-600" />;
      case 'financial': return <IconComponent className="w-5 h-5 text-green-600" />;
      default: return <IconComponent className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const file = files[0];
      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadForm.name || file.name,
        type: uploadForm.type,
        category: uploadForm.category,
        fileType: file.name.split('.').pop() || 'unknown',
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        description: uploadForm.description,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: 'pending',
        clientId: uploadForm.clientId || undefined,
        eventId: uploadForm.eventId || undefined,
        uploadedBy: 'Admin'
      };

      setDocuments([newDocument, ...documents]);
      setIsUploading(false);
      setShowUploadDialog(false);
      resetUploadForm();
    }, 2000);
  };

  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      type: 'other',
      category: '',
      description: '',
      tags: '',
      clientId: '',
      eventId: '',
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Document['status']) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status: newStatus } : doc
    ));
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewDialog(true);
  };

  const handleDownloadDocument = (document: Document) => {
    // In a real application, this would download the actual file
    console.log('Downloading document:', document.name);
    // Simulate download
    const link = window.document.createElement('a');
    link.href = '#'; // In real app, this would be the actual file URL
    link.download = document.name;
    link.click();
  };

  const canPreviewFile = (fileType: string): boolean => {
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    return previewableTypes.includes(fileType.toLowerCase());
  };

  // Apply filters and update document counts
  useEffect(() => {
    let filtered = [...documents];

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    if (selectedFolder !== 'all') {
      const folder = folders.find(f => f.id === selectedFolder);
      if (folder) {
        filtered = filtered.filter(doc => doc.category === folder.name);
      }
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filterType, filterStatus, selectedFolder, folders]);

  // Initialize with demo data - this ensures the page works immediately
  useEffect(() => {
    // Simulate loading state
    setIsUploading(false);
  }, []);

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 w-full"
      style={{ padding: '24px 16px' }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
          style={{ marginBottom: '32px' }}
        >
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-3 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div style={{ gap: '8px' }} className="flex flex-col">
                <h1 className="text-3xl font-bold text-slate-900">Documentos</h1>
                <p className="text-slate-600 mt-2">
                  Gerencie contratos, comprovantes e arquivos
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2">
                  <Upload className="h-4 w-4" />
                  Upload Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload de Documento</DialogTitle>
                </DialogHeader>
                <DocumentUploadForm
                  uploadForm={uploadForm}
                  setUploadForm={setUploadForm}
                  documentTypes={documentTypes}
                  categories={categories}
                  onFileSelect={handleFileUpload}
                  isUploading={isUploading}
                  fileInputRef={fileInputRef}
                />
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          style={{ marginBottom: '40px' }}
        >
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Total de Documentos</p>
                    <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Aprovados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {documents.filter(d => d.status === 'approved').length}
                    </p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {documents.filter(d => d.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tamanho Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                    </p>
                  </div>
                  <Folder className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className={CARD_STYLES.primary}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  Pastas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedFolder('all')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedFolder === 'all'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span className="font-medium">Todos os Documentos</span>
                    </div>
                    <span className="text-sm text-slate-500">{documents.length}</span>
                  </div>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFolderIcon(folder.type, selectedFolder === folder.id)}
                        <span className="font-medium">{folder.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">{folder.documentCount}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Documents List */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card className={CARD_STYLES.primary}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterStatus('all');
                      setSelectedFolder('all');
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card className={CARD_STYLES.primary}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Documentos ({filteredDocuments.length})</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    title="Atualizar lista"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      Nenhum documento encontrado
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md">
                      {searchQuery || filterType !== 'all' || filterStatus !== 'all' || selectedFolder !== 'all'
                        ? 'Tente ajustar os filtros para encontrar os documentos que você procura.'
                        : 'Faça upload do seu primeiro documento para começar a organizar seus arquivos.'
                      }
                    </p>
                    {(!searchQuery && filterType === 'all' && filterStatus === 'all' && selectedFolder === 'all') && (
                      <Button onClick={() => setShowUploadDialog(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Primeiro Documento
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                          <TableHead className="hidden md:table-cell">Categoria</TableHead>
                          <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
                          <TableHead className="hidden lg:table-cell">Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getFileIcon(document.fileType)}
                              <div>
                                <p className="font-medium">{document.name}</p>
                                <p className="text-sm text-slate-500">{document.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline">
                              {documentTypes.find(t => t.value === document.type)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{document.category}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatFileSize(document.size)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {new Date(document.uploadDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(document.status)}
                              <Select
                                value={document.status}
                                onValueChange={(value: Document['status']) => 
                                  handleStatusChange(document.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="approved">Aprovado</SelectItem>
                                  <SelectItem value="rejected">Rejeitado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewDocument(document)}
                                disabled={!canPreviewFile(document.fileType)}
                                title={canPreviewFile(document.fileType) ? 'Visualizar documento' : 'Tipo de arquivo não suportado para visualização'}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadDocument(document)}
                                title="Baixar documento"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Compartilhar documento"
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDocument(document.id)}
                                title="Excluir documento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Document Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedDocument && getFileIcon(selectedDocument.fileType)}
                {selectedDocument?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <DocumentPreview document={selectedDocument} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

// Upload Form Component
interface DocumentUploadFormProps {
  uploadForm: any;
  setUploadForm: (form: any) => void;
  documentTypes: any[];
  categories: string[];
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function DocumentUploadForm({
  uploadForm,
  setUploadForm,
  documentTypes,
  categories,
  onFileSelect,
  isUploading,
  fileInputRef
}: DocumentUploadFormProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a synthetic event object
      const syntheticEvent = {
        target: { files },
        currentTarget: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      onFileSelect(syntheticEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          isDragOver ? 'text-blue-600' : 'text-slate-400'
        }`} />
        <p className="text-lg font-medium text-slate-700 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-sm text-slate-500 mb-4">
          PDF, JPG, PNG, ZIP até 10MB
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.zip,.xlsx,.xls,.doc,.docx"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Nome do Documento
          </label>
          <Input
            value={uploadForm.name}
            onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
            placeholder="Nome personalizado (opcional)"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Tipo
          </label>
          <Select 
            value={uploadForm.type} 
            onValueChange={(value) => setUploadForm({...uploadForm, type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Categoria
        </label>
        <Select 
          value={uploadForm.category} 
          onValueChange={(value) => setUploadForm({...uploadForm, category: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Descrição
        </label>
        <Textarea
          value={uploadForm.description}
          onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
          placeholder="Descreva o documento..."
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Tags (separadas por vírgula)
        </label>
        <Input
          value={uploadForm.tags}
          onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
          placeholder="contrato, assinado, cliente..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            ID do Cliente (opcional)
          </label>
          <Input
            value={uploadForm.clientId}
            onChange={(e) => setUploadForm({...uploadForm, clientId: e.target.value})}
            placeholder="client_001"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            ID do Evento (opcional)
          </label>
          <Input
            value={uploadForm.eventId}
            onChange={(e) => setUploadForm({...uploadForm, eventId: e.target.value})}
            placeholder="event_001"
          />
        </div>
      </div>

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">Enviando documento...</span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Document Preview Component
interface DocumentPreviewProps {
  document: Document;
}

function DocumentPreview({ document }: DocumentPreviewProps) {
  const renderPreview = () => {
    const fileType = document.fileType.toLowerCase();
    
    switch (fileType) {
      case 'pdf':
        return (
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">Documento PDF</p>
                <p className="text-sm text-slate-500 mb-4">
                  Visualização em desenvolvimento. Use o botão de download para abrir o arquivo.
                </p>
                <Button variant="outline" onClick={() => window.open('#', '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-center h-96 bg-slate-50">
              <div className="text-center">
                <FileImage className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">Imagem</p>
                <p className="text-sm text-slate-500 mb-4">
                  Preview da imagem seria exibido aqui
                </p>
                <div className="w-64 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-slate-600">Imagem Preview</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">Tipo de arquivo não suportado</p>
                <p className="text-sm text-slate-500 mb-4">
                  Visualização não disponível para arquivos {fileType.toUpperCase()}
                </p>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Arquivo
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Info */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-600">Tamanho:</span>
            <p className="text-slate-800">{formatFileSize(document.size)}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Tipo:</span>
            <p className="text-slate-800">{document.fileType.toUpperCase()}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Data:</span>
            <p className="text-slate-800">
              {new Date(document.uploadDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Status:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(document.status)}
              <span className="text-slate-800 capitalize">{document.status}</span>
            </div>
          </div>
        </div>
        
        {document.description && (
          <div className="mt-4">
            <span className="font-medium text-slate-600">Descrição:</span>
            <p className="text-slate-800 mt-1">{document.description}</p>
          </div>
        )}
        
        {document.tags.length > 0 && (
          <div className="mt-4">
            <span className="font-medium text-slate-600">Tags:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {renderPreview()}
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
        <div className="text-sm text-slate-500">
          Enviado por {document.uploadedBy}
        </div>
      </div>
    </div>
  );
}

// Helper function for file size formatting (moved outside component)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}