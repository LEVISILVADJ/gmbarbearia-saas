import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  LogOut,
  User,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  Eye,
  XCircle,
  PlayCircle,
  PauseCircle,
  Star,
  Target,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { db, type Booking, type Barber } from '../../lib/supabase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BarberDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agenda');
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedBarber) {
      loadBookingsForBarber(selectedBarber.id, selectedDate);
    }
  }, [selectedBarber, selectedDate]);

  const loadInitialData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load all barbers first
      const barbersData = await db.barbers.getAll();
      setAllBarbers(barbersData);
      
      // Try to find the current user's barber profile
      let currentBarber = null;
      try {
        currentBarber = await db.barbers.getByUserId(user.id);
        setSelectedBarber(currentBarber);
      } catch (error) {
        console.log('Current user is not a barber, showing all barbers');
        // If current user is not a barber (e.g., admin), select first barber
        if (barbersData.length > 0) {
          setSelectedBarber(barbersData[0]);
        }
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setAllBarbers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingsForBarber = async (barberId: string, date: string) => {
    try {
      const bookingsData = await db.bookings.getByBarber(barberId, date);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await db.bookings.update(bookingId, { status: newStatus as any });
      if (selectedBarber) {
        await loadBookingsForBarber(selectedBarber.id, selectedDate);
      }
      
      const statusMessages = {
        'confirmado': 'Agendamento confirmado!',
        'em_andamento': 'Serviço iniciado!',
        'concluido': 'Serviço concluído!',
        'cancelado': 'Agendamento cancelado!'
      };
      
      alert(statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado!');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const getDateRangeBookings = () => {
    const today = new Date();
    let startDate: Date, endDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = endDate = today;
        break;
      case 'week':
        startDate = startOfWeek(today, { locale: ptBR });
        endDate = endOfWeek(today, { locale: ptBR });
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return [];
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        return [];
    }

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  const calculateStats = () => {
    const rangeBookings = getDateRangeBookings();
    const completedBookings = rangeBookings.filter(b => b.status === 'concluido');
    
    return {
      totalBookings: rangeBookings.length,
      completedBookings: completedBookings.length,
      totalRevenue: completedBookings.reduce((sum, b) => sum + b.total_price, 0),
      pendingBookings: rangeBookings.filter(b => ['agendado', 'confirmado'].includes(b.status)).length,
      inProgressBookings: rangeBookings.filter(b => b.status === 'em_andamento').length,
      cancelledBookings: rangeBookings.filter(b => b.status === 'cancelado').length,
      averageTicket: completedBookings.length > 0 ? completedBookings.reduce((sum, b) => sum + b.total_price, 0) / completedBookings.length : 0
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    const colors = {
      'agendado': 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
      'confirmado': 'bg-green-900/50 text-green-400 border-green-700',
      'em_andamento': 'bg-blue-900/50 text-blue-400 border-blue-700',
      'concluido': 'bg-gray-900/50 text-gray-400 border-gray-700',
      'cancelado': 'bg-red-900/50 text-red-400 border-red-700'
    };
    return colors[status as keyof typeof colors] || colors.agendado;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'agendado': Clock,
      'confirmado': CheckCircle,
      'em_andamento': PlayCircle,
      'concluido': CheckCircle,
      'cancelado': XCircle
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1) 
      : addDays(currentDate, 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const renderBarberSelector = () => (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Users className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Selecionar Barbeiro</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allBarbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => setSelectedBarber(barber)}
            className={`group relative p-4 rounded-xl transition-all duration-300 border ${
              selectedBarber?.id === barber.id
                ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50 ring-2 ring-yellow-400/30'
                : 'bg-gray-800/50 border-gray-700 hover:border-yellow-400/30 hover:bg-gray-800/70'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <img
                  src={barber.photo_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300'}
                  alt={barber.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 transition-all duration-300 ${
                    selectedBarber?.id === barber.id
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/25'
                      : 'border-gray-600 group-hover:border-yellow-400/50'
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300';
                  }}
                />
                {selectedBarber?.id === barber.id && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h4 className={`font-semibold transition-colors duration-300 ${
                  selectedBarber?.id === barber.id
                    ? 'text-yellow-400'
                    : 'text-white group-hover:text-yellow-400'
                }`}>
                  {barber.name}
                </h4>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">{barber.rating}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{barber.experience_years} anos</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSelectedBarberInfo = () => {
    if (!selectedBarber) return null;

    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative">
            <img
              src={selectedBarber.photo_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300'}
              alt={selectedBarber.name}
              className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-yellow-400/50 shadow-2xl shadow-yellow-400/20"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300';
              }}
            />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
              <Star className="w-4 h-4 text-black fill-current" />
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{selectedBarber.name}</h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-semibold">{selectedBarber.rating}</span>
                <span className="text-gray-400 text-sm">avaliação</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold">{selectedBarber.experience_years}</span>
                <span className="text-gray-400 text-sm">anos de experiência</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {selectedBarber.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gradient-to-r from-yellow-400/10 to-orange-500/10 text-yellow-400 text-sm px-3 py-1 rounded-full border border-yellow-400/20"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgenda = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Agenda Diária</h2>
          <p className="text-gray-400">
            {selectedBarber ? `Agenda de ${selectedBarber.name}` : 'Selecione um barbeiro para ver a agenda'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700">
            <button
              onClick={() => navigateDate('prev')}
              className="p-3 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 rounded-l-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 bg-transparent border-0 text-white focus:outline-none focus:ring-0 min-w-[140px] text-center"
            />
            <button
              onClick={() => navigateDate('next')}
              className="p-3 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 rounded-r-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Hoje
          </button>
        </div>
      </div>

      {!selectedBarber ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-700">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Selecione um barbeiro acima para visualizar a agenda</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-6 bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-10 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-700">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum agendamento para esta data</p>
          <p className="text-gray-500 text-sm mt-2">
            {format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <div className="text-sm text-gray-400">
                {bookings.length} agendamento{bookings.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {bookings
            .sort((a, b) => a.booking_time.localeCompare(b.booking_time))
            .map((booking) => (
            <div key={booking.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 hover:border-yellow-400/30 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-white text-lg">{booking.booking_time}</span>
                    <span className={`px-3 py-1 text-sm rounded-full border flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{booking.client?.name}</h3>
                  <p className="text-gray-400 mb-2">{booking.service?.name}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span>📞</span>
                      <span>{booking.client?.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>{booking.service?.duration_minutes} min</span>
                    </span>
                    <span className="text-green-400 font-semibold flex items-center space-x-1">
                      <span>💰</span>
                      <span>R$ {booking.total_price.toFixed(2).replace('.', ',')}</span>
                    </span>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong>Observações:</strong> {booking.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                  {booking.status === 'agendado' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmado')}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar</span>
                    </button>
                  )}
                  
                  {booking.status === 'confirmado' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'em_andamento')}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Iniciar</span>
                    </button>
                  )}
                  
                  {booking.status === 'em_andamento' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'concluido')}
                      className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Concluir</span>
                    </button>
                  )}
                  
                  {!['concluido', 'cancelado'].includes(booking.status) && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelado')}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFinanceiro = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Relatório Financeiro</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </select>
          
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              />
            </>
          )}
          
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-6 border border-green-700/50 hover:border-green-600/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Faturamento Total</p>
              <p className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-6 border border-blue-700/50 hover:border-blue-600/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Serviços Concluídos</p>
              <p className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                {stats.completedBookings}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-6 border border-yellow-700/50 hover:border-yellow-600/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                R$ {stats.averageTicket.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <Target className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-6 border border-purple-700/50 hover:border-purple-600/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Total de Agendamentos</p>
              <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                {stats.totalBookings}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Resumo do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg border border-yellow-400/20">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-sm text-gray-400">Faturamento Total</div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 rounded-lg">
            <div className="text-3xl font-bold text-white mb-2">{stats.completedBookings}</div>
            <div className="text-sm text-gray-400">Serviços Concluídos</div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 rounded-lg">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-400">Taxa de Conclusão</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#11110f]">
      {/* Header */}
      <header className="bg-gray-900/80 shadow-sm border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/WhatsApp Image 2025-06-26 at 08.22.png" 
                alt="GM Barbearia Logo" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-white">GM Barbearia</h1>
                <p className="text-sm text-gray-400">Painel do Barbeiro</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{user?.name || 'Barbeiro'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'agenda'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/25'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-yellow-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'financeiro'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/25'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-yellow-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Financeiro</span>
          </button>
        </div>

        {/* Barber Selector */}
        {renderBarberSelector()}

        {/* Selected Barber Info */}
        {renderSelectedBarberInfo()}

        {/* Content */}
        {activeTab === 'agenda' && renderAgenda()}
        {activeTab === 'financeiro' && renderFinanceiro()}
      </div>
    </div>
  );
};

export default BarberDashboard;