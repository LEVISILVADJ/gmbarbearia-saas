import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  Target,
  Award,
  Filter,
  FileText
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Booking, type Barber, type Service } from '../../lib/supabase';

interface AdvancedReportsProps {
  bookings: Booking[];
  barbers: Barber[];
  services: Service[];
}

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ bookings, barbers, services }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [reportType, setReportType] = useState('overview');

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by period
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (selectedPeriod) {
      case 'current-month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'last-3-months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    filtered = filtered.filter(booking => {
      const bookingDate = parseISO(booking.booking_date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    // Filter by barber
    if (selectedBarber !== 'all') {
      filtered = filtered.filter(booking => booking.barber_id === selectedBarber);
    }

    return filtered;
  }, [bookings, selectedPeriod, selectedBarber]);

  const analytics = useMemo(() => {
    const completedBookings = filteredBookings.filter(b => b.status === 'concluido');
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelado');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
    
    // Barber performance
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

    // Service performance
    const serviceStats = services.map(service => {
      const serviceBookings = filteredBookings.filter(b => b.service_id === service.id);
      const serviceCompleted = serviceBookings.filter(b => b.status === 'concluido');
      const serviceRevenue = serviceCompleted.reduce((sum, b) => sum + b.total_price, 0);
      
      return {
        service,
        totalBookings: serviceBookings.length,
        completedBookings: serviceCompleted.length,
        revenue: serviceRevenue,
        percentage: filteredBookings.length > 0 ? (serviceBookings.length / filteredBookings.length) * 100 : 0
      };
    }).filter(stat => stat.totalBookings > 0);

    // Time analysis
    const timeSlots = {
      morning: filteredBookings.filter(b => {
        const hour = parseInt(b.booking_time.split(':')[0]);
        return hour >= 8 && hour < 12;
      }).length,
      afternoon: filteredBookings.filter(b => {
        const hour = parseInt(b.booking_time.split(':')[0]);
        return hour >= 12 && hour < 17;
      }).length,
      evening: filteredBookings.filter(b => {
        const hour = parseInt(b.booking_time.split(':')[0]);
        return hour >= 17 && hour < 20;
      }).length
    };

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = parseISO(booking.booking_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const monthCompleted = monthBookings.filter(b => b.status === 'concluido');
      const monthRevenue = monthCompleted.reduce((sum, b) => sum + b.total_price, 0);
      
      monthlyTrend.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        bookings: monthBookings.length,
        revenue: monthRevenue,
        completed: monthCompleted.length
      });
    }

    return {
      totalBookings: filteredBookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue,
      averageTicket: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
      completionRate: filteredBookings.length > 0 ? (completedBookings.length / filteredBookings.length) * 100 : 0,
      cancellationRate: filteredBookings.length > 0 ? (cancelledBookings.length / filteredBookings.length) * 100 : 0,
      barberStats,
      serviceStats,
      timeSlots,
      monthlyTrend
    };
  }, [filteredBookings, barbers, services, bookings]);

  const exportToPDF = () => {
    // Simulate PDF export
    const reportData = {
      period: selectedPeriod,
      barber: selectedBarber === 'all' ? 'Todos' : barbers.find(b => b.id === selectedBarber)?.name,
      analytics,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-avancado-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Faturamento Total</p>
            <p className="text-3xl font-bold text-white">
              R$ {analytics.totalRevenue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-sm text-green-300 mt-1">
              Ticket médio: R$ {analytics.averageTicket.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <DollarSign className="w-10 h-10 text-green-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Agendamentos</p>
            <p className="text-3xl font-bold text-white">{analytics.totalBookings}</p>
            <p className="text-sm text-blue-300 mt-1">
              Concluídos: {analytics.completedBookings}
            </p>
          </div>
          <Calendar className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-400">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-white">{analytics.completionRate.toFixed(1)}%</p>
            <p className="text-sm text-yellow-300 mt-1">
              Cancelamentos: {analytics.cancellationRate.toFixed(1)}%
            </p>
          </div>
          <Target className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-400">Clientes Únicos</p>
            <p className="text-3xl font-bold text-white">
              {new Set(filteredBookings.map(b => b.client_id)).size}
            </p>
            <p className="text-sm text-purple-300 mt-1">No período</p>
          </div>
          <Users className="w-10 h-10 text-purple-400" />
        </div>
      </div>
    </div>
  );

  const renderBarberPerformance = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Award className="w-6 h-6 mr-2 text-yellow-400" />
        Performance dos Barbeiros
      </h3>
      
      <div className="space-y-4">
        {analytics.barberStats
          .sort((a, b) => b.revenue - a.revenue)
          .map((stat, index) => (
          <div key={stat.barber.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                }`}>
                  {index + 1}
                </div>
                <img
                  src={stat.barber.photo_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300'}
                  alt={stat.barber.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{stat.barber.name}</h4>
                  <p className="text-sm text-gray-400">{stat.barber.experience_years} anos</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stat.totalBookings}</div>
                <div className="text-xs text-gray-400">Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  R$ {stat.revenue.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-gray-400">Faturamento</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  R$ {stat.averageTicket.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-gray-400">Ticket Médio</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {stat.completionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Taxa Conclusão</div>
              </div>
            </div>
            
            {/* Progress bar for completion rate */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stat.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServiceAnalysis = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <PieChart className="w-6 h-6 mr-2 text-yellow-400" />
        Análise de Serviços
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {analytics.serviceStats
            .sort((a, b) => b.revenue - a.revenue)
            .map((stat) => (
            <div key={stat.service.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{stat.service.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{stat.service.name}</h4>
                    <p className="text-sm text-gray-400">
                      R$ {stat.service.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    R$ {stat.revenue.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-sm text-gray-400">{stat.percentage.toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-4">Distribuição por Horário</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Manhã (8h-12h)</span>
              <span className="text-white font-semibold">{analytics.timeSlots.morning}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${(analytics.timeSlots.morning / analytics.totalBookings) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tarde (12h-17h)</span>
              <span className="text-white font-semibold">{analytics.timeSlots.afternoon}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${(analytics.timeSlots.afternoon / analytics.totalBookings) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Noite (17h-20h)</span>
              <span className="text-white font-semibold">{analytics.timeSlots.evening}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full"
                style={{ width: `${(analytics.timeSlots.evening / analytics.totalBookings) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonthlyTrend = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-yellow-400" />
        Tendência dos Últimos 6 Meses
      </h3>
      
      <div className="space-y-4">
        {analytics.monthlyTrend.map((month, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">{month.month}</h4>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  R$ {month.revenue.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-gray-400">{month.bookings} agendamentos</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-blue-400 font-semibold">{month.bookings}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-green-400 font-semibold">{month.completed}</div>
                <div className="text-gray-500">Concluídos</div>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold">
                  {month.bookings > 0 ? ((month.completed / month.bookings) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-gray-500">Taxa</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Relatórios Avançados</h2>
          <p className="text-gray-400">Análise detalhada do desempenho da barbearia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
          >
            <option value="current-month">Mês Atual</option>
            <option value="last-month">Mês Passado</option>
            <option value="last-3-months">Últimos 3 Meses</option>
          </select>
          
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
          >
            <option value="all">Todos os Barbeiros</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {renderOverviewCards()}
      {renderBarberPerformance()}
      {renderServiceAnalysis()}
      {renderMonthlyTrend()}
    </div>
  );
};

export default AdvancedReports;