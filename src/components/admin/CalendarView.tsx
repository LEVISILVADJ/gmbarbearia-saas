import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, DollarSign, Eye, Edit, Trash2, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Booking, type Barber, type Service, type Client } from '../../lib/supabase';

interface CalendarViewProps {
  bookings: Booking[];
  barbers: Barber[];
  services: Service[];
  clients: Client[];
  onNewBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  barbers,
  services,
  clients,
  onNewBooking,
  onEditBooking,
  onDeleteBooking
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => booking.booking_date === dateStr);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'agendado': 'bg-yellow-500',
      'confirmado': 'bg-green-500',
      'em_andamento': 'bg-blue-500',
      'concluido': 'bg-gray-500',
      'cancelado': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || colors.agendado;
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-2xl font-bold text-white">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 sm:p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 sm:px-4 py-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 text-xs sm:text-sm font-medium"
          >
            Hoje
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 sm:p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex bg-gray-800/50 rounded-lg p-1 order-2 sm:order-1">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 ${
                viewMode === mode
                  ? 'bg-yellow-600 text-black'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
        <button
          onClick={onNewBooking}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-3 sm:py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105 text-sm sm:text-base order-1 sm:order-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </div>
  );

  const renderWeekDays = () => (
    <div className="grid grid-cols-7 gap-1 mb-2 text-xs sm:text-sm">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
        <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-400 bg-gray-800/30 rounded-lg">
          {day}
        </div>
      ))}
    </div>
  );

  const renderMonthView = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayBookings = getBookingsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-700/50 rounded-lg cursor-pointer transition-all duration-300 ${
                isCurrentMonth ? 'bg-gray-900/50' : 'bg-gray-800/30'
              } ${
                isToday ? 'ring-2 ring-yellow-400' : ''
              } ${
                isSelected ? 'bg-yellow-900/20 border-yellow-400/50' : 'hover:bg-gray-800/50'
              }`}
            >
              <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                isCurrentMonth ? 'text-white' : 'text-gray-500'
              } ${
                isToday ? 'text-yellow-400' : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-0.5 sm:space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(booking);
                    }}
                    className={`text-xs p-0.5 sm:p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity duration-200 ${getStatusColor(booking.status)}`}
                  >
                    <div className="font-medium truncate text-xs">
                      {booking.booking_time} - {booking.client?.name}
                    </div>
                    <div className="truncate opacity-90 text-xs hidden sm:block">
                      {booking.service?.name}
                    </div>
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-400 text-center py-0.5 sm:py-1">
                    +{dayBookings.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h

    return (
      <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
        {/* Header com dias da semana */}
        <div className="grid grid-cols-8 border-b border-gray-700">
          <div className="p-4 bg-gray-800/50"></div>
          {days.map((day) => (
            <div key={day.toString()} className="p-4 text-center bg-gray-800/50">
              <div className="text-sm text-gray-400">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={`text-lg font-semibold ${
                isSameDay(day, new Date()) ? 'text-yellow-400' : 'text-white'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Grid de horários */}
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-700/50">
              <div className="p-3 text-sm text-gray-400 bg-gray-800/30 border-r border-gray-700">
                {hour}:00
              </div>
              {days.map((day) => {
                const dayBookings = getBookingsForDate(day).filter(booking => {
                  const bookingHour = parseInt(booking.booking_time.split(':')[0]);
                  return bookingHour === hour;
                });

                return (
                  <div key={`${day}-${hour}`} className="p-1 min-h-[60px] border-r border-gray-700/50 relative">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`text-xs p-2 rounded mb-1 text-white cursor-pointer hover:opacity-80 transition-opacity duration-200 ${getStatusColor(booking.status)}`}
                      >
                        <div className="font-medium">{booking.client?.name}</div>
                        <div className="opacity-90">{booking.service?.name}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate || currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h

    return (
      <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          {format(selectedDate || currentDate, 'EEEE, dd \'de\' MMMM', { locale: ptBR })}
        </h3>

        <div className="space-y-2">
          {hours.map((hour) => {
            const hourBookings = dayBookings.filter(booking => {
              const bookingHour = parseInt(booking.booking_time.split(':')[0]);
              return bookingHour === hour;
            });

            return (
              <div key={hour} className="flex items-start space-x-4 p-3 border-b border-gray-700/50">
                <div className="w-16 text-sm text-gray-400 font-medium">
                  {hour}:00
                </div>
                <div className="flex-1 space-y-2">
                  {hourBookings.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">Nenhum agendamento</div>
                  ) : (
                    hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200 ${getStatusColor(booking.status)} text-white`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{booking.booking_time} - {booking.client?.name}</div>
                            <div className="text-sm opacity-90">{booking.service?.name}</div>
                            <div className="text-sm opacity-75">Barbeiro: {booking.barber?.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">R$ {booking.total_price.toFixed(2).replace('.', ',')}</div>
                            <div className="text-sm opacity-75 capitalize">{booking.status.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Detalhes do Agendamento</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">{selectedBooking.client?.name}</div>
                <div className="text-sm text-gray-400">{selectedBooking.client?.phone}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Scissors className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">{selectedBooking.barber?.name}</div>
                <div className="text-sm text-gray-400">Barbeiro</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">{selectedBooking.service?.name}</div>
                <div className="text-sm text-gray-400">
                  {format(parseISO(selectedBooking.booking_date), 'dd/MM/yyyy', { locale: ptBR })} às {selectedBooking.booking_time}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-white">R$ {selectedBooking.total_price.toFixed(2).replace('.', ',')}</div>
                <div className="text-sm text-gray-400">Valor total</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedBooking.status)}`}></div>
              <div>
                <div className="font-medium text-white capitalize">{selectedBooking.status.replace('_', ' ')}</div>
                <div className="text-sm text-gray-400">Status atual</div>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Observações:</div>
                <div className="text-white">{selectedBooking.notes}</div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-700 flex space-x-3">
            <button
              onClick={() => {
                onEditBooking(selectedBooking);
                setSelectedBooking(null);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                onDeleteBooking(selectedBooking.id);
                setSelectedBooking(null);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderCalendarHeader()}
      
      {/* Legenda de status */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
        <span className="text-sm text-gray-400 font-medium">Status:</span>
        {[
          { status: 'agendado', label: 'Agendado' },
          { status: 'confirmado', label: 'Confirmado' },
          { status: 'em_andamento', label: 'Em Andamento' },
          { status: 'concluido', label: 'Concluído' },
          { status: 'cancelado', label: 'Cancelado' }
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
            <span className="text-sm text-gray-300">{label}</span>
          </div>
        ))}
      </div>

      {viewMode === 'month' && (
        <>
          {renderWeekDays()}
          {renderMonthView()}
        </>
      )}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {selectedDate && viewMode === 'month' && (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Agendamentos para {format(selectedDate, 'dd \'de\' MMMM', { locale: ptBR })}
          </h3>
          <div className="space-y-3">
            {getBookingsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-400">Nenhum agendamento para esta data.</p>
            ) : (
              getBookingsForDate(selectedDate).map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`}></div>
                    <div>
                      <div className="font-medium text-white">
                        {booking.booking_time} - {booking.client?.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {booking.service?.name} com {booking.barber?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">
                      R$ {booking.total_price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {booking.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {renderBookingDetails()}
    </div>
  );
};

export default CalendarView;