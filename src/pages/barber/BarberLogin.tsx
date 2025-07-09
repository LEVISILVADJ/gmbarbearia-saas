import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/auth';
import { Lock, User, ArrowLeft, Scissors, RefreshCw } from 'lucide-react';

const BarberLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password, 'barber');
    
    if (success) {
      navigate('/barbeiro/dashboard');
    } else {
      alert('Credenciais inválidas. Verifique se o barbeiro foi criado com uma senha ou use o botão "Criar Contas Barbeiros" abaixo.');
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    { name: 'Carlos Silva', email: 'carlos@gmbarbearia.com', password: 'barber123' },
    { name: 'João Santos', email: 'joao@gmbarbearia.com', password: 'barber123' },
    { name: 'Pedro Costa', email: 'pedro@gmbarbearia.com', password: 'barber123' },
    { name: 'Rafael Lima', email: 'rafael@gmbarbearia.com', password: 'barber123' }
  ];

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleCreateUsers = async () => {
    setIsCreatingUsers(true);
    
    try {
      console.log('Criando usuários barbeiros...');
      const results = await authService.createInitialUsers();
      
      const barberResults = results.filter(r => r.email.includes('barber') || r.email !== 'admin@gmbarbearia.com');
      const successful = barberResults.filter(r => r.success).length;
      
      alert(`Usuários barbeiros processados: ${successful}/${barberResults.length}\n\nTodos os barbeiros agora podem fazer login com a senha: barber123`);
      
      // Pre-fill with first barber account
      if (successful > 0) {
        setEmail('carlos@gmbarbearia.com');
        setPassword('barber123');
      }
      
    } catch (error) {
      console.error('Error creating barber users:', error);
      alert('Erro ao criar usuários barbeiros. Verifique o console para mais detalhes.');
    } finally {
      setIsCreatingUsers(false);
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
            <h1 className="text-2xl font-bold text-white">Painel do Barbeiro</h1>
            <p className="text-gray-400">Acesse sua área de trabalho</p>
          </div>

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
                  placeholder="barbeiro@gmbarbearia.com"
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
              <span>Voltar ao site</span>
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Scissors className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Contas Demo:</span>
            </div>
            
            <div className="mb-4">
              <button
                onClick={handleCreateUsers}
                disabled={isCreatingUsers}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-sm hover:from-green-700 hover:to-green-800"
              >
                <RefreshCw className={`w-4 h-4 ${isCreatingUsers ? 'animate-spin' : ''}`} />
                <span>{isCreatingUsers ? 'Criando...' : 'Criar Contas Barbeiros'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs text-gray-500 mb-2 text-center">
                Clique em qualquer barbeiro para preencher automaticamente:
              </p>
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => fillDemoAccount(account.email, account.password)}
                  className="text-left p-2 bg-gray-700/50 rounded text-xs text-gray-300 hover:bg-gray-700 hover:text-yellow-400 transition-all duration-300"
                >
                  <div className="font-medium">{account.name}</div>
                  <div className="text-gray-500">{account.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberLogin;