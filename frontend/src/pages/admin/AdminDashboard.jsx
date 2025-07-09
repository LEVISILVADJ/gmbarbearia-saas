import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, authService } from '../../services/api';
import { 
  Users, 
  Building, 
  DollarSign, 
  Calendar, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false);
  const [trialDays, setTrialDays] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Verificar se o usuário é admin
    const user = authService.getCurrentUser();
    if (!user || !user.is_admin) {
      navigate('/login');
      return;
    }
    
    loadData();
  }, [currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await adminService.getStats();
      setStats(statsResponse);
      
      // Carregar tenants
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const tenantsResponse = await adminService.listTenants(params);
      setTenants(tenantsResponse.data);
      setTotalPages(Math.ceil(tenantsResponse.total / tenantsResponse.per_page));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleToggleActive = async (id) => {
    try {
      await adminService.toggleActive(id);
      loadData();
    } catch (error) {
      console.error('Erro ao ativar/desativar tenant:', error);
      alert('Erro ao ativar/desativar tenant. Tente novamente.');
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedTenant) return;
    
    try {
      setIsProcessing(true);
      await adminService.extendTrial(selectedTenant.id, trialDays);
      setShowExtendTrialModal(false);
      setSelectedTenant(null);
      loadData();
    } catch (error) {
      console.error('Erro ao estender período de teste:', error);
      alert('Erro ao estender período de teste. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      'trial': 'bg-blue-900/50 text-blue-400 border-blue-700',
      'active': 'bg-green-900/50 text-green-400 border-green-700',
      'inactive': 'bg-red-900/50 text-red-400 border-red-700'
    };
    return colors[status] || 'bg-gray-900/50 text-gray-400 border-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      'trial': 'Teste',
      'active': 'Ativo',
      'inactive': 'Inativo'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#11110f]">
      <header className="bg-gray-900/90 shadow-md border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Green Sistemas</h1>
                <p className="text-sm text-gray-400">Painel Administrativo</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-300 p-2 rounded-lg hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>
          
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">Total de Barbearias</p>
                    <p className="text-3xl font-bold text-white">{stats.total_tenants}</p>
                  </div>
                  <Building className="w-10 h-10 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-400">Barbearias Ativas</p>
                    <p className="text-3xl font-bold text-white">{stats.active_tenants}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Em Período de Teste</p>
                    <p className="text-3xl font-bold text-white">{stats.trial_tenants}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-400">Barbearias Inativas</p>
                    <p className="text-3xl font-bold text-white">{stats.inactive_tenants}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-purple-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tenants List */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-white">Barbearias</h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar barbearias..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              >
                <option value="all">Todos os Status</option>
                <option value="trial">Em Teste</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              
              <button
                onClick={loadData}
                className="p-2 text-gray-300 hover:text-yellow-400 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                title="Atualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-white">Carregando barbearias...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhuma barbearia encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Nome</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Subdomínio</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Criado em</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Fim do Teste</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200">
                        <td className="p-4">
                          <div className="font-medium text-white">{tenant.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300">{tenant.subdomain}.gmbarbearia.com</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full border ${getStatusColor(tenant.status)}`}>
                            {getStatusText(tenant.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300">{formatDate(tenant.created_at)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300">{formatDate(tenant.trial_ends_at)}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowExtendTrialModal(true);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                              title="Estender Período de Teste"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(tenant.id)}
                              className={`p-2 ${
                                tenant.status === 'inactive'
                                  ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                                  : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                              } rounded-lg transition-all duration-300`}
                              title={tenant.status === 'inactive' ? 'Ativar' : 'Desativar'}
                            >
                              {tenant.status === 'inactive' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                      {currentPage} de {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Extend Trial Modal */}
      {showExtendTrialModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Estender Período de Teste</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Estender o período de teste para <span className="text-yellow-400 font-semibold">{selectedTenant.name}</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dias Adicionais
                </label>
                <input
                  type="number"
                  min="1"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                />
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  O período de teste será estendido por {trialDays} dias a partir da data atual de expiração.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowExtendTrialModal(false);
                  setSelectedTenant(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
              >
                {isProcessing ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;