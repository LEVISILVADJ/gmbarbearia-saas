import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/auth';
import { Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@gmbarbearia.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login(email, password, 'admin');
    
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Credenciais inválidas. Tente criar os usuários iniciais primeiro.');
    }
    
    setIsLoading(false);
  };

  const handleCreateInitialUsers = async () => {
    setIsInitializing(true);
    setError('');
    
    try {
      console.log('Iniciando criação automática de usuários...');
      
      // First check which users already exist
      const userCheck = await authService.checkRequiredUsers();
      console.log('Status atual dos usuários:', userCheck);
      
      // Create users automatically
      const results = await authService.createInitialUsers();
      
      // Count successful operations
      const successful = results.filter(r => r.success).length;
      const created = results.filter(r => r.status === 'created').length;
      const existing = results.filter(r => r.status === 'exists').length;
      const errors = results.filter(r => !r.success).length;
      
      setError('');
      
      let message = `Processo concluído!\n\n`;
      message += `✅ Usuários criados: ${created}\n`;
      message += `ℹ️ Usuários já existentes: ${existing}\n`;
      if (errors > 0) {
        message += `❌ Erros: ${errors}\n`;
      }
      message += `\nTotal processado: ${successful}/${results.length}`;
      
      alert(message);
      
      // If admin was created successfully, pre-fill the form
      const adminResult = results.find(r => r.email === 'admin@gmbarbearia.com');
      if (adminResult?.success) {
        setEmail('admin@gmbarbearia.com');
        setPassword('admin123');
      }
      
    } catch (error) {
      console.error('Error creating initial users:', error);
      setError(`Erro ao criar usuários: ${(error as Error).message}. Tente novamente ou verifique a configuração do Supabase.`);
    } finally {
      setIsInitializing(false);
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
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400">Faça login para acessar o sistema</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                  placeholder="admin@gmbarbearia.com"
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

          <div className="mt-6">
            <button
              onClick={handleCreateInitialUsers}
              disabled={isInitializing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 border border-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              {isInitializing ? 'Criando usuários...' : '🚀 Criar Usuários Automaticamente'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Cria automaticamente admin e barbeiros via Supabase Auth (admin123 / barber123)
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao site</span>
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              <strong className="text-yellow-400">Credenciais:</strong><br />
              E-mail: admin@gmbarbearia.com<br />
              Senha: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;