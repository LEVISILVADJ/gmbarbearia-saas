import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  BarChart3, 
  PieChart, 
  Download, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  Activity,
  FileText,
  Eye
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, subWeeks, subMonths, parseISO, addDays, isSameDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Booking, type Barber, type Service, type Client } from '../../lib/supabase';

interface ReportsViewProps {
  bookings: Booking[];
  barbers: Barber[];
  services: Service[];
  clients: Client[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ bookings, barbers, services, clients }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');

  // Calcular período baseado no tipo de relatório
  const getDateRange = () => {
    switch (reportType) {
      case 'daily':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
          label: format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
        };
      case 'weekly':
        const weekStart = startOfWeek(selectedDate, { locale: ptBR });
        const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
        return {
          start: weekStart,
          end: weekEnd,
          label: `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`
        };
      case 'monthly':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return {
          start: monthStart,
          end: monthEnd,
          label: format(selectedDate, 'MMMM \'de\' yyyy', { locale: ptBR })
        };
      default:
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
          label: format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
        };
    }
  };

  // Filtrar agendamentos baseado nos filtros
  const filteredBookings = useMemo(() => {
    const { start, end } = getDateRange();
    
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.booking_date);
      const isInDateRange = bookingDate >= start && bookingDate <= end;
      const matchesBarber = selectedBarber === 'all' || booking.barber_id === selectedBarber;
      const matchesService = selectedService === 'all' || booking.service_id === selectedService;
      
      return isInDateRange && matchesBarber && matchesService;
    });
  }, [bookings, reportType, selectedDate, selectedBarber, selectedService]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const completedBookings = filteredBookings.filter(b => b.status === 'concluido');
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelado');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
    const averageTicket = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
    
    // Estatísticas por barbeiro
    const barberStats = barbers.map(barber => {
      const barberBookings = filteredBookings.filter(b => b.barber_id === barber.id);
      const barberCompleted = barberBookings.filter(b => b.status === 'concluido');
      const barberRevenue = barberCompleted.reduce((sum, b) => sum + b.total_price, 0);
      
      return {
        barber,
        totalBookings: barberBookings.length,
        completedBookings: barberCompleted.length,
        revenue: barberRevenue,
        averageTicket: barberCompleted.length > 0 ? barberRevenue / barberCompleted.length : 0,
        completionRate: barberBookings.length > 0 ? (barberCompleted.length / barberBookings.length) * 100 : 0
      };
    }).filter(stat => stat.totalBookings > 0);

    // Estatísticas por serviço
    const serviceStats = services.map(service => {
      const serviceBookings = filteredBookings.filter(b => b.service_id === service.id);
      const serviceCompleted = serviceBookings.filter(b => b.status === 'concluido');
      const serviceRevenue = serviceCompleted.reduce((sum, b) => sum + b.total_price, 0);
      
      return {
        service,
        totalBookings: serviceBookings.length,
        completedBookings: serviceCompleted.length,
        revenue: serviceRevenue
      };
    }).filter(stat => stat.totalBookings > 0);

    // Estatísticas por dia (para relatórios semanais e mensais)
    const dailyStats = [];
    if (reportType !== 'daily') {
      const { start, end } = getDateRange();
      let currentDate = start;
      
      while (currentDate <= end) {
        const dayBookings = filteredBookings.filter(b => 
          isSameDay(parseISO(b.booking_date), currentDate)
        );
        const dayCompleted = dayBookings.filter(b => b.status === 'concluido');
        const dayRevenue = dayCompleted.reduce((sum, b) => sum + b.total_price, 0);
        
        dailyStats.push({
          date: currentDate,
          totalBookings: dayBookings.length,
          completedBookings: dayCompleted.length,
          revenue: dayRevenue
        });
        
        currentDate = addDays(currentDate, 1);
      }
    }

    return {
      totalBookings: filteredBookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: cancelledBookings.length,
      pendingBookings: filteredBookings.filter(b => ['agendado', 'confirmado'].includes(b.status)).length,
      inProgressBookings: filteredBookings.filter(b => b.status === 'em_andamento').length,
      totalRevenue,
      averageTicket,
      completionRate: filteredBookings.length > 0 ? (completedBookings.length / filteredBookings.length) * 100 : 0,
      cancellationRate: filteredBookings.length > 0 ? (cancelledBookings.length / filteredBookings.length) * 100 : 0,
      barberStats,
      serviceStats,
      dailyStats
    };
  }, [filteredBookings, barbers, services, reportType]);

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate;
    switch (reportType) {
      case 'daily':
        newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
        break;
      case 'weekly':
        newDate = direction === 'prev' ? subWeeks(selectedDate, 1) : addDays(selectedDate, 7);
        break;
      case 'monthly':
        newDate = direction === 'prev' ? subMonths(selectedDate, 1) : addDays(selectedDate, 30);
        break;
      default:
        newDate = selectedDate;
    }
    setSelectedDate(newDate);
  };

  const exportReport = () => {
    const { label } = getDateRange();
    const reportData = {
      periodo: label,
      tipo: reportType,
      estatisticas: stats,
      agendamentos: filteredBookings
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${reportType}-${format(selectedDate, 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderHeader = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatórios Detalhados</h2>
          <p className="text-gray-400">Análise completa do desempenho da barbearia</p>
        </div>
        
        <button
          onClick={exportReport}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório</span>
        </button>
      </div>

      {/* Controles de Filtro */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tipo de Relatório */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Relatório
            </label>
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {[
                { value: 'daily', label: 'Diário', icon: Calendar },
                { value: 'weekly', label: 'Semanal', icon: BarChart3 },
                { value: 'monthly', label: 'Mensal', icon: TrendingUp }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setReportType(value as any)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    reportType === value
                      ? 'bg-yellow-600 text-black'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegação de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Período
            </label>
            <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700">
              <button
                onClick={() => navigateDate('prev')}
                className="p-3 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 rounded-l-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 px-4 py-3 text-center text-white font-medium">
                {getDateRange().label}
              </div>
              <button
                onClick={() => navigateDate('next')}
                className="p-3 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 rounded-r-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtro por Barbeiro */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Barbeiro
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
            >
              <option value="all">Todos os barbeiros</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Serviço
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
            >
              <option value="all">Todos os serviços</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50 hover:border-green-600/50 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Faturamento Total</p>
            <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
              R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-sm text-green-300 mt-1">
              Ticket médio: R$ {stats.averageTicket.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <DollarSign className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50 hover:border-blue-600/50 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Total de Agendamentos</p>
            <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
              {stats.totalBookings}
            </p>
            <p className="text-sm text-blue-300 mt-1">
              Concluídos: {stats.completedBookings}
            </p>
          </div>
          <Calendar className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50 hover:border-yellow-600/50 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-400">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
              {stats.completionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-yellow-300 mt-1">
              Cancelamentos: {stats.cancellationRate.toFixed(1)}%
            </p>
          </div>
          <Target className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50 hover:border-purple-600/50 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-400">Clientes Atendidos</p>
            <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
              {new Set(filteredBookings.filter(b => b.status === 'concluido').map(b => b.client_id)).size}
            </p>
            <p className="text-sm text-purple-300 mt-1">
              Únicos no período
            </p>
          </div>
          <Users className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );

  const renderBarberPerformance = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Users className="w-6 h-6 mr-2 text-yellow-400" />
          Desempenho por Barbeiro
        </h3>
      </div>
      
      <div className="p-6">
        {stats.barberStats.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum dado de barbeiro para o período selecionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.barberStats
              .sort((a, b) => b.revenue - a.revenue)
              .map((stat) => (
              <div key={stat.barber.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={stat.barber.photo_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300'}
                      alt={stat.barber.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-white">{stat.barber.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-400">{stat.barber.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{stat.totalBookings}</div>
                      <div className="text-xs text-gray-400">Agendamentos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        R$ {stat.revenue.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-xs text-gray-400">Faturamento</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        R$ {stat.averageTicket.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-xs text-gray-400">Ticket Médio</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {stat.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Taxa Conclusão</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderServiceAnalysis = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <PieChart className="w-6 h-6 mr-2 text-yellow-400" />
          Análise por Serviço
        </h3>
      </div>
      
      <div className="p-6">
        {stats.serviceStats.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum dado de serviço para o período selecionado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.serviceStats
              .sort((a, b) => b.revenue - a.revenue)
              .map((stat) => (
              <div key={stat.service.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{stat.service.icon}</div>
                    <div>
                      <h4 className="font-semibold text-white">{stat.service.name}</h4>
                      <p className="text-sm text-gray-400">
                        R$ {stat.service.price.toFixed(2).replace('.', ',')} • {stat.service.duration_minutes}min
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{stat.totalBookings}</div>
                    <div className="text-xs text-gray-400">Agendamentos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      R$ {stat.revenue.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-xs text-gray-400">Faturamento</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">{stat.completedBookings}</div>
                    <div className="text-xs text-gray-400">Concluídos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDailyBreakdown = () => {
    if (reportType === 'daily' || stats.dailyStats.length === 0) return null;

    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Activity className="w-6 h-6 mr-2 text-yellow-400" />
            Breakdown Diário
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {stats.dailyStats.map((dayStat) => (
              <div key={dayStat.date.toString()} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {format(dayStat.date, 'dd')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(dayStat.date, 'EEE', { locale: ptBR })}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {format(dayStat.date, 'dd \'de\' MMMM', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {dayStat.totalBookings} agendamento{dayStat.totalBookings !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-400">{dayStat.totalBookings}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{dayStat.completedBookings}</div>
                    <div className="text-xs text-gray-400">Concluídos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">
                      R$ {dayStat.revenue.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-xs text-gray-400">Faturamento</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBookingsList = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <FileText className="w-6 h-6 mr-2 text-yellow-400" />
          Agendamentos do Período ({filteredBookings.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum agendamento encontrado para os filtros selecionados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Data/Hora</th>
                <th className="text-left p-4 text-gray-300 font-medium">Cliente</th>
                <th className="text-left p-4 text-gray-300 font-medium">Barbeiro</th>
                <th className="text-left p-4 text-gray-300 font-medium">Serviço</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings
                .sort((a, b) => new Date(b.booking_date + ' ' + b.booking_time).getTime() - new Date(a.booking_date + ' ' + a.booking_time).getTime())
                .map((booking) => (
                <tr key={booking.id} className="border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">
                        {format(parseISO(booking.booking_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className="text-sm text-gray-400">{booking.booking_time}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{booking.client?.name}</div>
                      <div className="text-sm text-gray-400">{booking.client?.phone}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{booking.barber?.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{booking.service?.name}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full border capitalize ${
                      booking.status === 'concluido' ? 'bg-green-900/50 text-green-400 border-green-700' :
                      booking.status === 'cancelado' ? 'bg-red-900/50 text-red-400 border-red-700' :
                      booking.status === 'em_andamento' ? 'bg-blue-900/50 text-blue-400 border-blue-700' :
                      booking.status === 'confirmado' ? 'bg-green-900/50 text-green-400 border-green-700' :
                      'bg-yellow-900/50 text-yellow-400 border-yellow-700'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-green-400">
                      R$ {booking.total_price.toFixed(2).replace('.', ',')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderHeader()}
      {renderOverviewCards()}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {renderBarberPerformance()}
        {renderServiceAnalysis()}
      </div>
      
      {renderDailyBreakdown()}
      {renderBookingsList()}
    </div>
  );
};

export default ReportsView;