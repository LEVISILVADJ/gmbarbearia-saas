import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantService, authService } from '../services/api';
import { Building, ArrowRight, LogOut, Plus, Clock, AlertCircle } from 'lucide-react';

const SelectTenant = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    
    // Carregar tenants do usuário
    const userTenants = tenantService.getUserTenants();
    setTenants(userTenants || []);
    setIsLoading(false);
  }, []);

  const handleSelectTenant = (tenant) => {
    // Verificar se o tenant está ativo
    if (!tenant.is_active) {
      if (tenant.status === 'trial' && tenant.trial_ends_at) {
        // Período de teste expirado
        navigate(`/subscription?subdomain=${tenant.subdomain}`);
        return;
      } else {
        alert('Esta barbearia está inativa. Entre em contato com o suporte.');
        return;
      }
    }
    
    // Selecionar tenant e redirecionar para o dashboard
    tenantService.selectTenant(tenant);
    navigate(`/dashboard?subdomain=${tenant.subdomain}`);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getRemainingDays = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11110f] via-gray-900 to-[#11110f]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Selecione sua Barbearia</h1>
            <p className="text-gray-400">Olá, {user?.name}! Escolha qual barbearia deseja acessar.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-300 p-2 rounded-lg hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

        {tenants.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-8 text-center">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-4">Você não tem barbearias</h2>
            <p className="text-gray-400 mb-6">Você ainda não tem acesso a nenhuma barbearia. Crie uma nova ou peça para ser adicionado a uma existente.</p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Nova Barbearia</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 hover:border-yellow-400/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-black font-bold text-2xl">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{tenant.name}</h2>
                      <p className="text-gray-400">{tenant.subdomain}.gmbarbearia.com</p>
                      
                      {tenant.status === 'trial' && tenant.trial_ends_at && (
                        <div className="flex items-center mt-2">
                          <Clock className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-yellow-400">
                            {getRemainingDays(tenant.trial_ends_at) > 0 ? (
                              `Período de teste: ${getRemainingDays(tenant.trial_ends_at)} dias restantes`
                            ) : (
                              'Período de teste expirado'
                            )}
                          </span>
                        </div>
                      )}
                      
                      {!tenant.is_active && (
                        <div className="flex items-center mt-2">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-1" />
                          <span className="text-sm text-red-400">
                            Barbearia inativa
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSelectTenant(tenant)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/25"
                  >
                    <span>Acessar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-6">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Nova Barbearia</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTenant;