import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Obter subdomínio da URL se estiver presente
  const params = new URLSearchParams(location.search);
  const subdomain = params.get('subdomain');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ 
        email, 
        password,
        subdomain // Incluir subdomínio se estiver presente
      });
      
      // Verificar se o usuário tem acesso a algum tenant
      if (response.tenants && response.tenants.length > 0) {
        // Se tiver apenas um tenant, selecionar automaticamente
        if (response.tenants.length === 1) {
          const tenant = response.tenants[0];
          
          // Verificar se o tenant está ativo
          if (!tenant.is_active) {
            if (tenant.status === 'trial' && tenant.trial_ends_at) {
              // Período de teste expirado
              navigate(`/subscription?subdomain=${tenant.subdomain}`);
              return;
            } else {
              setError('Esta barbearia está inativa. Entre em contato com o suporte.');
              setIsLoading(false);
              return;
            }
          }
          
          // Redirecionar para o dashboard do tenant
          navigate(`/dashboard?subdomain=${tenant.subdomain}`);
        } else {
          // Se tiver múltiplos tenants, redirecionar para a seleção
          navigate('/select-tenant');
        }
      } else if (response.user.is_admin) {
        // Se for admin do sistema, redirecionar para o painel admin
        navigate('/admin');
      } else {
        setError('Você não tem acesso a nenhuma barbearia.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      if (error.code === 'trial_expired') {
        navigate(`/subscription?subdomain=${subdomain}`);
        return;
      }
      
      setError(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11110f] via-gray-900 to-[#11110f] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5"></div>
      <div className="relative max-w-md w-full">
        <div className="bg-gray-900/80 rounded-xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img 
                src="/WhatsApp Image 2025-06-26 at 08.22.png" 
                alt="GM Barbearia Logo" 
                className="w-16 h-16 mx-auto rounded-full shadow-lg shadow-yellow-400/20"
              />
              <div className="absolute inset-0 rounded-full bg-yellow-400/10 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {subdomain ? `Login - ${subdomain}.gmbarbearia.com` : 'Login'}
            </h1>
            <p className="text-gray-400">Acesse sua conta para gerenciar sua barbearia</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50 hover:scale-105"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao início</span>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300">
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;