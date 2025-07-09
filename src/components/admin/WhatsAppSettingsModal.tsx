import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Phone, TestTube, CheckCircle, AlertCircle, QrCode, Wifi, WifiOff, RotateCcw, Power, RefreshCw, Zap, Server, ExternalLink } from 'lucide-react';
import { db, type BusinessSettings } from '../../lib/supabase';
import { whatsappAPI, type WhatsAppStatus, type WhatsAppQR } from '../../lib/whatsapp';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    whatsapp_enabled: false,
    whatsapp_api_key: '',
    whatsapp_phone_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    connected: false,
    sessionStatus: 'disconnected',
    connectionState: 'disconnected',
    clientAvailable: false
  });
  const [qrCode, setQrCode] = useState<WhatsAppQR | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      checkWhatsAppStatus();
      
      // Poll status every 5 seconds when modal is open
      const interval = setInterval(() => {
        checkWhatsAppStatus();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoadingData(true);
      const settings = await db.settings.get();
      setFormData({
        whatsapp_enabled: settings.whatsapp_enabled || false,
        whatsapp_api_key: settings.whatsapp_api_key || '',
        whatsapp_phone_number: settings.whatsapp_phone_number || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const checkWhatsAppStatus = async () => {
    try {
      const status = await whatsappAPI.getStatus();
      setWhatsappStatus(status);
      setLastUpdate(new Date());
      
      // If not connected and client is available, try to get QR code
      if (!status.connected && status.clientAvailable && status.environment?.supported !== false) {
        const qr = await whatsappAPI.getQRCode();
        setQrCode(qr);
      } else {
        setQrCode(null);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setWhatsappStatus({
        connected: false,
        sessionStatus: 'error',
        connectionState: 'disconnected',
        clientAvailable: false,
        environment: {
          supported: false,
          reason: 'Erro ao conectar com servidor WhatsApp',
          type: 'Connection Error'
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await db.settings.update(formData);
      onSave();
      alert('Configurações do WhatsApp salvas com sucesso!');
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!formData.whatsapp_phone_number) {
      setTestResult({
        success: false,
        message: 'Por favor, configure um número de telefone para teste.'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const testMessage = `🧪 *Teste de Conexão WPPConnect*

Esta é uma mensagem de teste do sistema GM Barbearia.

Se você recebeu esta mensagem, a integração WhatsApp está funcionando perfeitamente! ✅

🔧 *Tecnologia:* WPPConnect
📱 *Status:* Conectado e operacional
⚡ *Velocidade:* Envio em tempo real

_Mensagem de teste - ${new Date().toLocaleString('pt-BR')}_

*GM Barbearia* - Tradição e qualidade! ✂️`;

      const result = await whatsappAPI.sendMessage(formData.whatsapp_phone_number, testMessage);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Mensagem de teste enviada com sucesso! Verifique seu WhatsApp.'
        });
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Falha ao enviar mensagem de teste.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao enviar mensagem de teste.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    setIsLoading(true);
    try {
      const result = await whatsappAPI.restart();
      if (result.success) {
        alert('WhatsApp reiniciado com sucesso! Aguarde a reconexão...');
        setQrCode(null);
        setTimeout(() => {
          checkWhatsAppStatus();
        }, 5000);
      } else {
        alert('Erro ao reiniciar WhatsApp: ' + result.message);
      }
    } catch (error) {
      alert('Erro ao reiniciar WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
    
    setIsLoading(true);
    try {
      const result = await whatsappAPI.disconnect();
      if (result.success) {
        alert('WhatsApp desconectado com sucesso!');
        setQrCode(null);
        checkWhatsAppStatus();
      } else {
        alert('Erro ao desconectar WhatsApp: ' + result.message);
      }
    } catch (error) {
      alert('Erro ao desconectar WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setIsLoading(true);
    try {
      const result = await whatsappAPI.generateQR();
      if (result.success) {
        alert('Gerando novo QR Code... Aguarde alguns segundos.');
        setQrCode(null);
        setTimeout(() => {
          checkWhatsAppStatus();
        }, 3000);
      } else {
        alert('Erro ao gerar QR Code: ' + result.message);
      }
    } catch (error) {
      alert('Erro ao gerar QR Code.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />;
  };

  const getSessionStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'disconnected': 'Desconectado',
      'connecting': 'Conectando',
      'qrReadSuccess': 'QR Code Lido',
      'chatsAvailable': 'Conectado',
      'error': 'Erro',
      'initializing': 'Inicializando',
      'restarting': 'Reiniciando',
      'generating_qr': 'Gerando QR Code',
      'server_offline': 'Servidor Offline',
      'unsupported_environment': 'Ambiente Não Suportado'
    };
    return statusMap[status] || status;
  };

  const isEnvironmentSupported = whatsappStatus.environment?.supported !== false;
  const isServerOffline = whatsappStatus.sessionStatus === 'server_offline' || 
                          whatsappStatus.environment?.type === 'Server Offline';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">WhatsApp WPPConnect</h2>
                <div className={`flex items-center space-x-2 text-sm ${getStatusColor(whatsappStatus.connected)}`}>
                  {getStatusIcon(whatsappStatus.connected)}
                  <span>
                    {getSessionStatusText(whatsappStatus.sessionStatus)}
                  </span>
                  <span className="text-gray-500">
                    • Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Environment Warning */}
            {!isEnvironmentSupported && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      {whatsappStatus.environment?.type || 'Ambiente Não Suportado'}
                    </h3>
                    <p className="text-red-300 mb-4">
                      {whatsappStatus.environment?.reason || 'O WhatsApp WPPConnect não pode ser executado neste ambiente.'}
                    </p>
                    
                    {isServerOffline ? (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                        <h4 className="text-white font-semibold mb-2">Como iniciar o servidor WhatsApp:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">1.</span>
                            <span className="text-gray-300">Abra um terminal separado</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">2.</span>
                            <span className="text-gray-300">Execute o comando:</span>
                          </div>
                          <div className="bg-gray-900 rounded p-3 font-mono text-green-400 text-sm">
                            npm run whatsapp:start
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">3.</span>
                            <span className="text-gray-300">Aguarde a inicialização e recarregue esta página</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                        <h4 className="text-white font-semibold mb-2">Para usar o WhatsApp, você precisa:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• VPS ou servidor Linux com Chrome instalado</li>
                          <li>• Máquina local com Chrome/Chromium</li>
                          <li>• Ambiente Docker com Chrome configurado</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-3">
                          Ambientes como WebContainer, Replit, CodeSandbox não são suportados.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-400" />
                Status do Servidor WPPConnect
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status da Sessão:</span>
                    <span className={`font-semibold ${getStatusColor(whatsappStatus.connected)}`}>
                      {getSessionStatusText(whatsappStatus.sessionStatus)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estado da Conexão:</span>
                    <span className={`font-semibold ${getStatusColor(whatsappStatus.connected)}`}>
                      {whatsappStatus.connectionState}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cliente Disponível:</span>
                    <span className={`font-semibold ${getStatusColor(whatsappStatus.clientAvailable)}`}>
                      {whatsappStatus.clientAvailable ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ambiente Suportado:</span>
                    <span className={`font-semibold ${isEnvironmentSupported ? 'text-green-400' : 'text-red-400'}`}>
                      {isEnvironmentSupported ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">QR Code Disponível:</span>
                    <span className={`font-semibold ${qrCode?.success ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {qrCode?.success ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={checkWhatsAppStatus}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar Status</span>
                  </button>
                  
                  {isEnvironmentSupported && (
                    <>
                      <button
                        onClick={handleGenerateQR}
                        disabled={isLoading || whatsappStatus.connected || !whatsappStatus.clientAvailable}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Gerar QR Code</span>
                      </button>
                      
                      <button
                        onClick={handleRestart}
                        disabled={isLoading}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reiniciar</span>
                      </button>
                      
                      <button
                        onClick={handleDisconnect}
                        disabled={isLoading || !whatsappStatus.connected}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                      >
                        <Power className="w-4 h-4" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  )}
                  
                  {isServerOffline && (
                    <a
                      href="http://localhost:3001/api/health"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Verificar Servidor</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCode && qrCode.success && qrCode.qr ? (
              <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <QrCode className="w-5 h-5 mr-2 text-yellow-400" />
                  QR Code para Conexão
                </h3>
                
                <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <img 
                      src={qrCode.qr} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold mb-2">Como conectar:</h4>
                      <ol className="text-sm text-green-300 space-y-2">
                        <li>1. Abra o WhatsApp no seu celular</li>
                        <li>2. Toque em "Mais opções" (⋮) → "Dispositivos conectados"</li>
                        <li>3. Toque em "Conectar um dispositivo"</li>
                        <li>4. Escaneie este QR Code com a câmera</li>
                      </ol>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <div className="text-sm text-blue-300 space-y-1">
                        <p><strong>Tentativa:</strong> {qrCode.attempts}</p>
                        <p><strong>Atualização:</strong> A cada 15 segundos</p>
                        <p><strong>Status:</strong> Aguardando escaneamento</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleGenerateQR}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Gerar Novo QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : !whatsappStatus.connected && whatsappStatus.clientAvailable && isEnvironmentSupported ? (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">QR Code não disponível</h3>
                  <p className="text-yellow-300 mb-4">
                    O QR Code ainda não foi gerado. Clique no botão abaixo para gerar.
                  </p>
                  <button
                    onClick={handleGenerateQR}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 mx-auto"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>{isLoading ? 'Gerando...' : 'Gerar QR Code'}</span>
                  </button>
                </div>
              </div>
            ) : whatsappStatus.connected ? (
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-400 mb-2">WhatsApp Conectado!</h3>
                  <p className="text-green-300">
                    Seu WhatsApp está conectado e pronto para enviar mensagens.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Configuration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">WPPConnect Server</h3>
                <div className="text-sm text-blue-300 space-y-2">
                  <p>✅ Servidor WPPConnect configurado</p>
                  <p>✅ Integração automática com WhatsApp Web</p>
                  <p>✅ Envio de mensagens em tempo real</p>
                  <p>✅ Reconexão automática</p>
                  <p>✅ QR Code automático</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="whatsapp_enabled"
                  checked={formData.whatsapp_enabled}
                  onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                  className="w-4 h-4 text-green-400 bg-gray-800 border-gray-700 rounded focus:ring-green-400"
                />
                <label htmlFor="whatsapp_enabled" className="text-sm font-medium text-gray-300">
                  Ativar notificações automáticas via WhatsApp
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Número para Testes (seu WhatsApp)
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp_phone_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_phone_number: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-white transition-all duration-300"
                  placeholder="11999999999"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Número para enviar mensagens de teste (apenas números, ex: 11999999999)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleTestMessage}
                  disabled={isLoading || !whatsappStatus.connected || !isEnvironmentSupported}
                  className="flex items-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4" />
                  <span>{isLoading ? 'Enviando...' : 'Enviar Teste'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm ${
                      testResult.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Mensagem de Confirmação</h3>
                <div className="bg-gray-900/50 rounded-lg p-3 text-sm text-gray-300 font-mono whitespace-pre-line">
                  {whatsappAPI.formatConfirmationMessage({
                    booking_date: '2024-12-27',
                    booking_time: '14:30',
                    total_price: 40.00,
                    client: { name: 'João Silva' },
                    service: { name: 'Corte + Barba' },
                    barber: { name: 'Carlos Silva' }
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-400/25 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettingsModal;