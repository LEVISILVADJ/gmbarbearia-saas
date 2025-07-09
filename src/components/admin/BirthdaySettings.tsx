import React, { useState, useEffect } from 'react';
import { 
  Gift, 
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
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db, supabase } from '../../lib/supabase';
import BirthdayMessageModal from './BirthdayMessageModal';

interface BirthdayMessage {
  id: string;
  title: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ClientWithBirthday {
  id: string;
  name: string;
  phone: string;
  birth_date: string;
  hasBirthdayToday: boolean;
  hasBirthdayThisMonth: boolean;
  birthdayFormatted: string;
}

const BirthdaySettings: React.FC = () => {
  const [messages, setMessages] = useState<BirthdayMessage[]>([]);
  const [clients, setClients] = useState<ClientWithBirthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<BirthdayMessage | null>(null);
  const [birthdaysToday, setBirthdaysToday] = useState<ClientWithBirthday[]>([]);
  const [birthdaysThisMonth, setBirthdaysThisMonth] = useState<ClientWithBirthday[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load birthday messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('birthday_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
      
      // Load clients with birth dates
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .not('birth_date', 'is', null)
        .order('name');
      
      if (clientsError) throw clientsError;
      
      // Process clients data
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      
      const processedClients = (clientsData || []).map(client => {
        const birthDate = client.birth_date ? new Date(client.birth_date) : null;
        const hasBirthdayToday = birthDate ? 
          birthDate.getDate() === currentDay && birthDate.getMonth() === currentMonth : false;
        const hasBirthdayThisMonth = birthDate ? birthDate.getMonth() === currentMonth : false;
        const birthdayFormatted = birthDate ? 
          format(birthDate, "dd 'de' MMMM", { locale: ptBR }) : '';
        
        return {
          ...client,
          hasBirthdayToday,
          hasBirthdayThisMonth,
          birthdayFormatted
        };
      });
      
      setClients(processedClients);
      
      // Filter birthdays
      setBirthdaysToday(processedClients.filter(c => c.hasBirthdayToday));
      setBirthdaysThisMonth(processedClients.filter(c => c.hasBirthdayThisMonth && !c.hasBirthdayToday));
      
    } catch (error) {
      console.error('Error loading birthday data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
    
    try {
      const { error } = await supabase
        .from('birthday_messages')
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
      const { error } = await supabase
        .from('birthday_messages')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setMessages(messages.map(m => 
        m.id === id ? { ...m, is_active: !currentStatus } : m
      ));
    } catch (error) {
      console.error('Error toggling message status:', error);
      alert('Erro ao alterar status da mensagem.');
    }
  };

  const handleSendTestMessage = async (clientId: string, messageId: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      const message = messages.find(m => m.id === messageId);
      
      if (!client || !message) {
        alert('Cliente ou mensagem não encontrados.');
        return;
      }
      
      // Format message
      const formattedMessage = message.message_template.replace('{client_name}', client.name);
      
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

  const exportBirthdayList = () => {
    const allBirthdays = [...birthdaysToday, ...birthdaysThisMonth];
    const csvContent = [
      ['Nome', 'Telefone', 'Data de Aniversário', 'Aniversário Hoje'],
      ...allBirthdays.map(client => [
        client.name,
        client.phone,
        client.birth_date,
        client.hasBirthdayToday ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aniversariantes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Aniversariantes</h2>
          <p className="text-gray-400">Gerencie mensagens e aniversariantes</p>
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
            onClick={exportBirthdayList}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Lista</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/30 rounded-xl p-6 border border-pink-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-400">Aniversariantes Hoje</p>
              <p className="text-3xl font-bold text-white">{birthdaysToday.length}</p>
            </div>
            <Gift className="w-10 h-10 text-pink-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Aniversariantes do Mês</p>
              <p className="text-3xl font-bold text-white">
                {birthdaysThisMonth.length + birthdaysToday.length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Clientes com Data de Nascimento</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
            <User className="w-10 h-10 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Birthday Messages */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-yellow-400" />
          Mensagens de Aniversário
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
            <p className="text-gray-400">Nenhuma mensagem de aniversário cadastrada</p>
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
                    <p className="text-sm text-gray-400 mt-1">
                      Atualizada em: {format(new Date(message.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
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

      {/* Today's Birthdays */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Gift className="w-6 h-6 mr-2 text-pink-400" />
          Aniversariantes de Hoje
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
        ) : birthdaysToday.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum aniversariante para hoje</p>
          </div>
        ) : (
          <div className="space-y-4">
            {birthdaysToday.map((client) => (
              <div key={client.id} className="bg-gradient-to-br from-pink-900/20 to-pink-800/20 rounded-lg p-4 border border-pink-700/30 hover:border-pink-600/50 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{client.name}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-pink-400">{client.birthdayFormatted}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{client.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {messages.filter(m => m.is_active).length > 0 ? (
                      <button
                        onClick={() => handleSendTestMessage(client.id, messages.find(m => m.is_active)?.id || '')}
                        className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
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
          </div>
        )}
      </div>

      {/* This Month's Birthdays */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-purple-400" />
          Aniversariantes do Mês
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        ) : birthdaysThisMonth.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum aniversariante para este mês</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birthdaysThisMonth.map((client) => (
              <div key={client.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{client.name}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-purple-400">{client.birthdayFormatted}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{client.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Birthday Message Modal */}
      <BirthdayMessageModal
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

export default BirthdaySettings;