import { useState } from 'react';
import { motion } from 'framer-motion';
import { useClients } from '@/hooks/useClients';
import { Client, CreateClientData, UpdateClientData } from '@/types/client';
import ClientForm from '@/components/ClientForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonDataTable, SkeletonForm } from '@/components/ui/skeleton';
import { usePageLoading, useLoadingNotifications } from '@/contexts/LoadingContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  Phone,
  Mail,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';

export default function Clients() {
  const {
    clients,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    setSorting,
    setPage,
    createClient,
    updateClient,
    deleteClient,
  } = useClients();

  const [, setLocation] = useLocation();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditForm(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedClient) {
      try {
        await deleteClient(selectedClient.id);
        setShowDeleteConfirm(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleCreateClient = async (data: CreateClientData | UpdateClientData) => {
    try {
      // For create form, we know it's CreateClientData
      await createClient(data as CreateClientData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const handleUpdateClient = async (data: CreateClientData | UpdateClientData) => {
    if (!selectedClient) return;
    
    try {
      // For update form, we know it's UpdateClientData
      await updateClient(selectedClient.id, data as UpdateClientData);
      setShowEditForm(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedClient(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  if (error) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen bg-slate-50 p-6 w-full"
      >
        <div className="max-w-7xl mx-auto">
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Erro ao carregar clientes</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 p-6 w-full"
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
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div style={{ gap: '8px' }} className="flex flex-col">
                <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
                <p className="text-slate-600 mt-2">
                  Gerencie os clientes do seu buffet
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </motion.div>

        {/* Search and Stats */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          style={{ marginBottom: '40px' }}
        >
          <motion.div variants={itemVariants} className="md:col-span-3">
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600" style={{ marginBottom: '8px' }}>
                    {pagination?.total || 0}
                  </p>
                  <p className="text-sm text-slate-600">Total de Clientes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Clients Table */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardHeader style={{ paddingBottom: '24px' }}>
              <CardTitle className="flex items-center justify-between text-slate-900">
                <span>Lista de Clientes</span>
                {loading && (
                  <Badge variant="secondary" className="animate-pulse">
                    Carregando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '24px', paddingTop: '0' }}>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <SkeletonDataTable rows={5} columns={4} hasActions={true} />
                </motion.div>
              ) : clients.length === 0 ? (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto" style={{ marginBottom: '24px' }}>
                    <Users className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900" style={{ marginBottom: '16px' }}>Nenhum cliente encontrado</h3>
                  <p className="text-slate-600" style={{ marginBottom: '32px' }}>
                    {searchQuery 
                      ? 'Tente ajustar os filtros de busca ou adicionar um novo cliente.'
                      : 'Comece adicionando seu primeiro cliente.'}
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-3 px-6 py-3"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Cliente
                  </Button>
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                          onClick={() => setSorting('name', 'asc')}
                        >
                          Nome
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">Contato</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Endereço</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                          onClick={() => setSorting('createdAt', 'desc')}
                        >
                          Cadastro
                        </TableHead>
                        <TableHead className="w-[100px] text-slate-700 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <motion.tr 
                          key={client.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell>
                            <div style={{ gap: '6px' }}>
                              <p className="font-medium text-slate-900" style={{ marginBottom: '4px' }}>{client.name}</p>
                              {client.notes && (
                                <p className="text-sm text-slate-500 truncate max-w-[200px]">
                                  {client.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ gap: '8px' }} className="space-y-2">
                              {client.phone && (
                                <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px' }}>
                                  <Phone className="h-4 w-4 text-blue-500" />
                                  {formatPhone(client.phone)}
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px' }}>
                                  <Mail className="h-4 w-4 text-green-500" />
                                  {client.email}
                                </div>
                              )}
                              {!client.phone && !client.email && (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.address ? (
                              <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px' }}>
                                <MapPin className="h-4 w-4 text-purple-500" />
                                <span className="truncate max-w-[200px]">{client.address}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {formatDate(client.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(client)}
                                  className="hover:bg-slate-50"
                                  style={{ gap: '12px', padding: '12px 16px' }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(client)}
                                  className="text-red-600 hover:bg-red-50"
                                  style={{ gap: '12px', padding: '12px 16px' }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center justify-between border-t border-slate-200"
                  style={{ marginTop: '32px', paddingTop: '24px' }}
                >
                  <p className="text-sm text-slate-600">
                    Mostrando {clients.length} de {pagination.total} clientes
                  </p>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="border-slate-300"
                      style={{ padding: '8px 16px' }}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-slate-600" style={{ padding: '0 8px' }}>
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="border-slate-300"
                      style={{ padding: '8px 16px' }}
                    >
                      Próxima
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Client Form Modals */}
        <ClientForm
          isOpen={showCreateForm}
          onClose={handleCloseCreateForm}
          onSubmit={handleCreateClient}
          isLoading={loading}
        />

        <ClientForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateClient}
          client={selectedClient}
          isLoading={loading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Excluir Cliente"
          description={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"?`}
          isLoading={loading}
        />
      </div>
    </motion.div>
  );
}