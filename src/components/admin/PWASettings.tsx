import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Bell, 
  Wifi, 
  WifiOff, 
  Settings, 
  Check, 
  X,
  RefreshCw,
  Globe,
  Shield
} from 'lucide-react';

const PWASettings: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'loading' | 'registered' | 'error'>('loading');

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          setServiceWorkerStatus('registered');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          setServiceWorkerStatus('error');
        }
      }
    };

    checkInstallation();
    registerServiceWorker();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification('GM Barbearia', {
          body: 'Notificações ativadas com sucesso!',
          icon: '/WhatsApp Image 2025-06-26 at 08.22.png'
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste do sistema GM Barbearia.',
        icon: '/WhatsApp Image 2025-06-26 at 08.22.png',
        badge: '/WhatsApp Image 2025-06-26 at 08.22.png'
      });
    }
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-400' : 'text-red-400';
    }
    
    switch (status) {
      case 'granted': return 'text-green-400';
      case 'denied': return 'text-red-400';
      case 'registered': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />;
    }
    
    switch (status) {
      case 'granted': return <Check className="w-5 h-5" />;
      case 'denied': return <X className="w-5 h-5" />;
      case 'registered': return <Check className="w-5 h-5" />;
      case 'error': return <X className="w-5 h-5" />;
      case 'loading': return <RefreshCw className="w-5 h-5 animate-spin" />;
      default: return <RefreshCw className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Configurações PWA</h2>
        <p className="text-gray-400">Configure o aplicativo web progressivo</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Status da Conexão</p>
              <p className={`text-lg font-bold ${getStatusColor(isOnline)}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className={getStatusColor(isOnline)}>
              {isOnline ? <Wifi className="w-8 h-8" /> : <WifiOff className="w-8 h-8" />}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">App Instalado</p>
              <p className={`text-lg font-bold ${getStatusColor(isInstalled)}`}>
                {isInstalled ? 'Sim' : 'Não'}
              </p>
            </div>
            <div className={getStatusColor(isInstalled)}>
              <Smartphone className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Notificações</p>
              <p className={`text-lg font-bold ${getStatusColor(notificationPermission)}`}>
                {notificationPermission === 'granted' ? 'Ativadas' : 
                 notificationPermission === 'denied' ? 'Negadas' : 'Pendente'}
              </p>
            </div>
            <div className={getStatusColor(notificationPermission)}>
              <Bell className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Service Worker</p>
              <p className={`text-lg font-bold ${getStatusColor(serviceWorkerStatus)}`}>
                {serviceWorkerStatus === 'registered' ? 'Ativo' : 
                 serviceWorkerStatus === 'error' ? 'Erro' : 'Carregando'}
              </p>
            </div>
            <div className={getStatusColor(serviceWorkerStatus)}>
              {getStatusIcon(serviceWorkerStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Installation Section */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Download className="w-6 h-6 mr-2 text-yellow-400" />
          Instalação do App
        </h3>
        
        <div className="space-y-4">
          {!isInstalled ? (
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">App não instalado</h4>
              <p className="text-blue-300 text-sm mb-4">
                Instale o app para ter acesso rápido e funcionalidades offline.
              </p>
              
              {installPrompt ? (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar App</span>
                </button>
              ) : (
                <div className="text-sm text-gray-400">
                  <p>Para instalar o app:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Chrome: Menu → Instalar GM Barbearia</li>
                    <li>Safari: Compartilhar → Adicionar à Tela Inicial</li>
                    <li>Edge: Menu → Apps → Instalar este site como app</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">App instalado com sucesso!</h4>
              <p className="text-green-300 text-sm">
                O app está instalado e pode ser acessado diretamente da tela inicial.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Bell className="w-6 h-6 mr-2 text-yellow-400" />
          Notificações Push
        </h3>
        
        <div className="space-y-4">
          {notificationPermission === 'default' && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">Ativar Notificações</h4>
              <p className="text-yellow-300 text-sm mb-4">
                Receba notificações sobre novos agendamentos e lembretes importantes.
              </p>
              <button
                onClick={requestNotificationPermission}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <Bell className="w-4 h-4" />
                <span>Ativar Notificações</span>
              </button>
            </div>
          )}
          
          {notificationPermission === 'granted' && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">Notificações ativadas</h4>
              <p className="text-green-300 text-sm mb-4">
                Você receberá notificações sobre eventos importantes.
              </p>
              <button
                onClick={sendTestNotification}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <Bell className="w-4 h-4" />
                <span>Enviar Teste</span>
              </button>
            </div>
          )}
          
          {notificationPermission === 'denied' && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Notificações bloqueadas</h4>
              <p className="text-red-300 text-sm">
                Para ativar as notificações, acesse as configurações do navegador e permita notificações para este site.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-yellow-400" />
          Funcionalidades PWA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Modo Offline</h4>
                <p className="text-sm text-gray-400">Acesse dados básicos mesmo sem internet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">App Nativo</h4>
                <p className="text-sm text-gray-400">Experiência similar a um app nativo</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Notificações Push</h4>
                <p className="text-sm text-gray-400">Receba alertas importantes em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Segurança HTTPS</h4>
                <p className="text-sm text-gray-400">Conexão segura e criptografada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Status */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-yellow-400" />
          Status do Cache
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {serviceWorkerStatus === 'registered' ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-400">Service Worker</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {isOnline ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-400">Conectividade</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {isInstalled ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-400">Instalação</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWASettings;