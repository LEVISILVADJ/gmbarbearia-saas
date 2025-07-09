import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  Gift,
  Star,
  History,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react';
import { db, type Client, type Booking } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientModal from './ClientModal';

interface ClientWithStats extends Client {
  totalBookings: number;
  totalSpent: number;
  hasBirthday: boolean;
  lastVisit?: string;
  favoriteService?: string;
  loyaltyPoints: number;
  averageRating: number;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, bookingsData] = await Promise.all([
        db.clients.getAll(),
        db.bookings.getAll()
      ]);
      
      setBookings(bookingsData);
      
      // Calculate client statistics
      const clientsWithStats: ClientWithStats[] = clientsData.map(client => {
        const clientBookings = bookingsData.filter(b => b.client_id === client.id);
        const completedBookings = clientBookings.filter(b => b.status === 'concluido');
        
        // Check if today is client's birthday
        const hasBirthday = client.birth_date ? 
          new Date(client.birth_date).getDate() === new Date().getDate() && 
          new Date(client.birth_date).getMonth() === new Date().getMonth() 
          : false;
        
        const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
        const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per R$ 10 spent
        
        const lastBooking = clientBookings
          .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())[0];
        
        // Find most frequent service
        const serviceCount: { [key: string]: number } = {};
        completedBookings.forEach(booking => {
          const serviceName = booking.service?.name || 'Desconhecido';
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });
        
        const favoriteService = Object.keys(serviceCount).reduce((a, b) => 
          serviceCount[a] > serviceCount[b] ? a : b, Object.keys(serviceCount)[0]
        );

        return {
          ...client,
          totalBookings: clientBookings.length,
          totalSpent,
          hasBirthday,
          lastVisit: lastBooking?.booking_date,
          favoriteService,
          loyaltyPoints,
          averageRating: 4.5 + Math.random() * 0.5 // Simulated rating
        };
      });
      
      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getClientTier = (points: number) => {
    if (points >= 500) return { name: 'Diamante', color: 'text-blue-400', icon: '💎' };
    if (points >= 200) return { name: 'Ouro', color: 'text-yellow-400', icon: '🥇' };
    if (points >= 100) return { name: 'Prata', color: 'text-gray-400', icon: '🥈' };
    return { name: 'Bronze', color: 'text-orange-400', icon: '🥉' };
  };

  const getClientHistory = (clientId: string) => {
    return bookings
      .filter(b => b.client_id === clientId)
      .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
  };

  const renderClientCard = (client: ClientWithStats) => {
    const tier = getClientTier(client.loyaltyPoints);
    
    return (
      <div key={client.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-yellow-400/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{client.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${tier.color} flex items-center space-x-1`}>
                  <span>{tier.icon}</span>
                  <span>{tier.name}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">{client.loyaltyPoints} pontos</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedClient(client);
                setShowHistoryModal(true);
              }}
              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
              title="Ver histórico"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedClient(client);
                setIsCreatingClient(true);
              }}
              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all duration-300"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{client.phone}</span>
          </div>
          
          {client.birth_date && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(client.birth_date).toLocaleDateString('pt-BR')}</span>
              {client.hasBirthday && (
                <span className="bg-pink-900/50 text-pink-400 border border-pink-700 px-2 py-0.5 text-xs rounded-full">
                  Aniversário Hoje! 🎂
                </span>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{client.totalBookings}</div>
              <div className="text-xs text-gray-400">Agendamentos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                R$ {client.totalSpent.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs text-gray-400">Total Gasto</div>
            </div>
          </div>
          
          {client.lastVisit && (
            <div className="text-center pt-2">
              <div className="text-sm text-gray-400">
                Última visita: {format(parseISO(client.lastVisit), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          )}
          
          {client.favoriteService && (
            <div className="text-center">
              <div className="text-sm text-yellow-400">
                ❤️ {client.favoriteService}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClientHistory = () => {
    if (!selectedClient) return null;
    
    const history = getClientHistory(selectedClient.id);
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Histórico do Cliente</h2>
                <p className="text-gray-400">{selectedClient.name}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Client stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{selectedClient.totalBookings}</div>
                <div className="text-sm text-gray-400">Total de Visitas</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  R$ {selectedClient.totalSpent.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-gray-400">Total Gasto</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{selectedClient.loyaltyPoints}</div>
                <div className="text-sm text-gray-400">Pontos de Fidelidade</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {selectedClient.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Avaliação Média</div>
              </div>
            </div>
            
            {/* Booking history */}
            <h3 className="text-lg font-semibold text-white mb-4">Histórico de Agendamentos</h3>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum agendamento encontrado</p>
              ) : (
                history.map((booking) => (
                  <div key={booking.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            {format(parseISO(booking.booking_date), 'dd', { locale: ptBR })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(parseISO(booking.booking_date), 'MMM', { locale: ptBR })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{booking.service?.name}</h4>
                          <p className="text-sm text-gray-400">
                            {booking.barber?.name} • {booking.booking_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          R$ {booking.total_price.toFixed(2).replace('.', ',')}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          booking.status === 'concluido' ? 'bg-green-900/50 text-green-400' :
                          booking.status === 'cancelado' ? 'bg-red-900/50 text-red-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopClients = () => {
    const topClients = [...clients]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Award className="w-6 h-6 mr-2 text-yellow-400" />
          Top 5 Clientes VIP
        </h3>
        
        <div className="space-y-4">
          {topClients.map((client, index) => {
            const tier = getClientTier(client.loyaltyPoints);
            
            return (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{client.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${tier.color}`}>{tier.icon} {tier.name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-400">{client.totalBookings} visitas</span>
                      {client.hasBirthday && (
                        <span className="text-pink-400">🎂</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    R$ {client.totalSpent.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-sm text-gray-400">{client.loyaltyPoints} pontos</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão de Clientes</h2>
          <p className="text-gray-400">Gerencie seus clientes e programa de fidelidade</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
            />
          </div>
          
          <button
            onClick={() => {
              setSelectedClient(null);
              setIsCreatingClient(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Total de Clientes</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Faturamento Total</p>
              <p className="text-3xl font-bold text-white">
                R$ {clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Clientes VIP</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.loyaltyPoints >= 200).length}
              </p>
            </div>
            <Award className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Ticket Médio</p>
              <p className="text-3xl font-bold text-white">
                R$ {clients.length > 0 ? (clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.reduce((sum, c) => sum + c.totalBookings, 0) || 0).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>
            <Star className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {renderTopClients()}

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-900/50 rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-700">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(renderClientCard)}
        </div>
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={isCreatingClient}
        onClose={() => {
          setIsCreatingClient(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={() => {
          loadData();
          setIsCreatingClient(false);
          setSelectedClient(null);
        }}
      />
      
      {/* History Modal */}
      {showHistoryModal && renderClientHistory()}
    </div>
  );
};

export default ClientManagement;