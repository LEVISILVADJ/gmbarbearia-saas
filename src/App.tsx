import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BarberLogin from './pages/barber/BarberLogin';
import BarberDashboard from './pages/barber/BarberDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { testSupabaseConnection } from './lib/supabase';
import { AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');
  
  // Only log in development
  if (import.meta.env.DEV) {
    console.log('App component rendering');
  }
  
  // Check if Supabase environment variables are available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    setConnectionStatus('checking');
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url' || supabaseKey === 'your_supabase_anon_key') {
      setConnectionStatus('error');
      setConnectionError('Variáveis de ambiente do Supabase não configuradas');
      return;
    }
    
    try {
      const connected = await testSupabaseConnection();
      if (connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setConnectionError('Não foi possível conectar ao Supabase. Verifique as credenciais.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError((error as Error).message);
    }
  };
  
  if (import.meta.env.DEV) {
    console.log('Supabase URL available:', !!supabaseUrl);
    console.log('Supabase Key available:', !!supabaseKey);
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key length:', supabaseKey ? supabaseKey.length : 0);
  }
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url' || supabaseKey === 'your_supabase_anon_key') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Configuração Necessária</h1>
          <p className="text-gray-300 mb-4">
            As variáveis de ambiente do Supabase não estão configuradas.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left text-sm">
            <p className="text-gray-400 mb-2">Configure as seguintes variáveis:</p>
            <ul className="text-gray-300 space-y-1">
              <li>• VITE_SUPABASE_URL</li>
              <li>• VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold mb-2">Conectando ao Supabase...</h1>
          <p className="text-gray-400">Verificando conexão com o banco de dados</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Configuração Necessária</h1>
          <p className="text-gray-300 mb-4">
            Erro ao conectar com o Supabase:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left text-sm mb-4">
            <p className="text-red-300">{connectionError}</p>
          </div>
          <button
            onClick={checkConnection}
            className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agendar" element={<BookingPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/barbeiro/login" element={<BarberLogin />} />
            <Route path="/barbeiro/dashboard" element={<BarberDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;