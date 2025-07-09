import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Send,
  User,
  Phone,
  Download,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db, supabase } from '../../lib/supabase';
import RetentionMessageModal from './RetentionMessageModal';

interface RetentionMessage {
  id: string;
  title: string;
  message_template: string;
  days_inactive: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InactiveClient {
  id: string;
  name: string;
  phone: string;
  last_visit_date: string;
  days_inactive: number;
  lastBookingFormatted: string;
}

const RetentionSettings: React.FC = () => {
  const [messages, setMessages] = useState<RetentionMessage[]>([]);
  const [inactiveClients, setInactiveClients] = useState<InactiveClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<RetentionMessage | null>(null);
  const [inactiveThreshold, setInactiveThreshold] = useState(60);
  const [lastCheckDate, setLastCheckDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load retention messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('retention_messages')
        .select('*')
        .order('days_inactive', { ascending: true });
      
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
      
      // Set inactive threshold from the first active message or default to 60
      const activeMessage = messagesData?.find(m => m.is_active);
      if (activeMessage) {
        setInactiveThreshold(activeMessage.days_inactive);
      }
      
      // Load inactive clients
      await loadInactiveClients(activeMessage?.days_inactive || 60);
      
      // Set last check date (simulated for now)
      setLastCheckDate(new Date());
      
    } catch (error) {
      console.error('Error loading retention data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInactiveClients = async (days: number) => {
    try {
      // Get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      
      if (clientsError) throw clientsError;
      
      // Get all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');
      
      if (bookingsError) throw bookingsError;
      
      // Process clients to find inactive ones
      const today = new Date();
      const inactiveDate = subDays(today, days);
      
      const processed: InactiveClient[] = [];
      
      for (const client of clientsData || []) {
        // Find client's bookings
        const clientBookings = bookingsData?.filter(b => b.client_id === client.id) || [];
        
        if (clientBookings.length === 0) continue; // Skip clients with no bookings
        
        // Find last booking date
        const lastBookingDate = clientBookings
          .map(b => new Date(b.booking_date))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        
        if (!lastBookingDate) continue;
        
        // Check if client is inactive
        if (lastBookingDate < inactiveDate) {
          const daysInactive = Math.floor((today.getTime() - lastBookingDate.getTime()) / (1000 * 60 * 60 * 24));
          
          processed.push({
            id: client.id,
            name: client.name,
            phone: client.phone,
            last_visit_date: lastBookingDate.toISOString().split('T')[0],
            days_inactive: daysInactive,
            lastBookingFormatted: format(lastBookingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
          });
        }
      }
      
      // Sort by days inactive (descending)
      processed.sort((a, b) => b.days_inactive - a.days_inactive);
      
      setInactiveClients(processed);
      
    } catch (error) {
      console.error('Error loading inactive clients:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
    
    try {
      const { error } = await supabase
        .from('retention_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== id));
      alert('Mensagem excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erro ao excluir mensagem.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // If activating this message, deactivate all others
      if (!currentStatus) {
        // Get the days_inactive for this message
        const messageToActivate = messages.find(m => m.id === id);
        if (messageToActivate) {
          setInactiveThreshold(messageToActivate.days_inactive);
          
          // Deactivate all messages
          await supabase
            .from('retention_messages')
            .update({ is_active: false })
            .neq('id', 'dummy'); // Update all rows
          
          // Activate only this message
          await supabase
            .from('retention_messages')
            .update({ is_active: true })
            .eq('id', id);
          
          // Update local state
          setMessages(messages.map(m => 
            m.id === id ? { ...m, is_active: true } : { ...m, is_active: false }
          ));
          
          // Reload inactive clients with new threshold
          await loadInactiveClients(messageToActivate.days_inactive);
        }
      } else {
        // Just deactivate this message
        await supabase
          .from('retention_messages')
          .update({ is_active: false })
          .eq('id', id);
        
        // Update local state
        setMessages(messages.map(m => 
          m.id === id ? { ...m, is_active: false } : m
        ));
      }
    } catch (error) {
      console.error('Error toggling message status:', error);
      alert('Erro ao alterar status da mensagem.');
    }
  };

  const handleSendTestMessage = async (clientId: string, messageId: string) => {
    try {
      const client = inactiveClients.find(c => c.id === clientId);
      const message = messages.find(m => m.id === messageId);
      
      if (!client || !message) {
        alert('Cliente ou mensagem não encontrados.');
        return;
      }
      
      // Format message
      let formattedMessage = message.message_template.replace('{client_name}', client.name);
      formattedMessage = formattedMessage.replace('{days_inactive}', client.days_inactive.toString());
      
      // Check if WhatsApp is enabled
      const { data: settings } = await supabase
        .from('business_settings')
        .select('whatsapp_enabled, whatsapp_phone_number')
        .single();
      
      if (!settings?.whatsapp_enabled) {
        alert('WhatsApp não está ativado nas configurações. Ative-o primeiro.');
        return;
      }
      
      // Send test message
      alert(`Mensagem de teste seria enviada para ${client.name} (${client.phone}):\n\n${formattedMessage}`);
      
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('Erro ao enviar mensagem de teste.');
    }
  };

  const runRetentionCheck = async () => {
    setIsRunningCheck(true);
    
    try {
      // Simulate running the retention check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last check date
      setLastCheckDate(new Date());
      
      // Show success message
      alert(`Verificação de clientes inativos concluída!\n\nForam encontrados ${inactiveClients.length} clientes inativos há mais de ${inactiveThreshold} dias.`);
      
    } catch (error) {
      console.error('Error running retention check:', error);
      alert('Erro ao executar verificação de clientes inativos.');
    } finally {
      setIsRunningCheck(false);
    }
  };

  const exportInactiveClientsList = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Última Visita', 'Dias Inativos'],
      ...inactiveClients.map(client => [
        client.name,
        client.phone,
        client.last_visit_date,
        client.days_inactive.toString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes_inativos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Retenção de Clientes</h2>
          <p className="text-gray-400">Gerencie clientes inativos e mensagens de retorno</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedMessage(null);
              setShowMessageModal(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Mensagem</span>
          </button>
          
          <button
            onClick={runRetentionCheck}
            disabled={isRunningCheck}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningCheck ? 'animate-spin' : ''}`} />
            <span>{isRunningCheck ? 'Verificando...' : 'Verificar Agora'}</span>
          </button>
          
          <button
            onClick={exportInactiveClientsList}
            disabled={inactiveClients.length === 0}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Lista</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-xl p-6 border border-orange-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-400">Clientes Inativos</p>
              <p className="text-3xl font-bold text-white">{inactiveClients.length}</p>
              <p className="text-sm text-orange-300 mt-1">
                Mais de {inactiveThreshold} dias sem retornar
              </p>
            </div>
            <ArrowLeft className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Mensagens Configuradas</p>
              <p className="text-3xl font-bold text-white">{messages.length}</p>
              <p className="text-sm text-blue-300 mt-1">
                {messages.filter(m => m.is_active).length} ativa(s)
              </p>
            </div>
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Última Verificação</p>
              <p className="text-xl font-bold text-white">
                {lastCheckDate 
                  ? format(lastCheckDate, "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : 'Nunca'}
              </p>
              <p className="text-sm text-green-300 mt-1">
                {lastCheckDate ? 'Automático diário' : 'Execute manualmente'}
              </p>
            </div>
            <Clock className="w-10 h-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Retention Messages */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-yellow-400" />
          Mensagens de Retorno
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma mensagem de retorno cadastrada</p>
            <button
              onClick={() => {
                setSelectedMessage(null);
                setShowMessageModal(true);
              }}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black px-6 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              Criar Primeira Mensagem
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white">{message.title}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        message.is_active 
                          ? 'bg-green-900/50 text-green-400 border border-green-700' 
                          : 'bg-gray-900/50 text-gray-400 border border-gray-700'
                      }`}>
                        {message.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                      <span>Inatividade: {message.days_inactive} dias</span>
                      <span>•</span>
                      <span>Atualizada: {format(new Date(message.updated_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(message.id, message.is_active)}
                      className={`p-2 ${
                        message.is_active 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                          : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                      } rounded-lg transition-all duration-300`}
                      title={message.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {message.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowMessageModal(true);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="text-sm text-gray-400 whitespace-pre-line font-mono">
                    {message.message_template.substring(0, 150)}
                    {message.message_template.length > 150 ? '...' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Clients */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <ArrowLeft className="w-6 h-6 mr-2 text-orange-400" />
            Clientes Inativos ({inactiveClients.length})
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Mais de {inactiveThreshold} dias sem retornar</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : inactiveClients.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum cliente inativo encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              Todos os clientes retornaram nos últimos {inactiveThreshold} dias
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inactiveClients.slice(0, 10).map((client) => (
              <div key={client.id} className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-lg p-4 border border-orange-700/30 hover:border-orange-600/50 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{client.name}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-orange-400">{client.days_inactive} dias sem retornar</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{client.phone}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Última visita: {client.lastBookingFormatted}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {messages.filter(m => m.is_active).length > 0 ? (
                      <button
                        onClick={() => handleSendTestMessage(client.id, messages.find(m => m.is_active)?.id || '')}
                        className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Mensagem</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMessage(null);
                          setShowMessageModal(true);
                        }}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Criar Mensagem</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {inactiveClients.length > 10 && (
              <div className="text-center py-4">
                <p className="text-gray-400">
                  Mostrando 10 de {inactiveClients.length} clientes inativos
                </p>
                <button
                  onClick={exportInactiveClientsList}
                  className="mt-2 flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Lista Completa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Retention Message Modal */}
      <RetentionMessageModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        onSave={loadData}
      />
    </div>
  );
};

export default RetentionSettings;