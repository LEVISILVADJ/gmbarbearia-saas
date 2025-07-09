import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, Scissors, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { db, type Booking, type Barber, type Service, type Client } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  onSave: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, booking, onSave }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    barber_id: '',
    service_id: '',
    booking_date: '',
    booking_time: '',
    status: 'agendado' as const,
    total_price: 0,
    notes: ''
  });
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (booking) {
      setFormData({
        client_id: booking.client_id || '',
        barber_id: booking.barber_id || '',
        service_id: booking.service_id || '',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time || '',
        status: booking.status || 'agendado',
        total_price: booking.total_price || 0,
        notes: booking.notes || ''
      });
    } else {
      setFormData({
        client_id: '',
        barber_id: '',
        service_id: '',
        booking_date: '',
        booking_time: '',
        status: 'agendado',
        total_price: 0,
        notes: ''
      });
    }
  }, [booking]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      
      console.log('Loading data for booking modal...');
      
      // Load data with timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading modal data')), 10000);
      });
      
      const dataPromise = Promise.all([
        db.barbers.getAllForAdmin(), // Use admin version to get all barbers
        db.services.getAllForAdmin(), // Use admin version to get all services
        db.clients.getAll()
      ]);
      
      const [barbersData, servicesData, clientsData] = await Promise.race([dataPromise, timeoutPromise]);
      
      console.log('Modal data loaded:', {
        barbers: barbersData.length,
        services: servicesData.length,
        clients: clientsData.length
      });
      
      setBarbers(barbersData);
      setServices(servicesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set fallback empty arrays to prevent UI issues
      setBarbers([]);
      setServices([]);
      setClients([]);
      
      alert('Erro ao carregar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    console.log('Service selected:', {
      serviceId,
      service,
      price: service?.price
    });
    setFormData({
      ...formData,
      service_id: serviceId,
      total_price: service ? service.price : 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Submitting booking with data:', formData);

    try {
      // Validate required fields
      if (!formData.client_id || !formData.barber_id || !formData.service_id) {
        alert('Por favor, preencha todos os campos obrigatórios (Cliente, Barbeiro e Serviço).');
        setIsLoading(false);
        return;
      }
      
      if (!formData.booking_date || !formData.booking_time) {
        alert('Por favor, selecione data e horário.');
        setIsLoading(false);
        return;
      }
      
      if (booking) {
        await db.bookings.update(booking.id, formData);
        console.log('Booking updated successfully');
      } else {
        await db.bookings.create(formData);
        console.log('Booking created successfully');
      }
      
      alert(booking ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(`Erro ao salvar agendamento: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  if (!isOpen) return null;

  // Show loading state
  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {booking ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 text-xs">
                <p className="text-blue-300">
                  Debug: Barbeiros: {barbers.length}, Serviços: {services.length}, Clientes: {clients.length}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Cliente
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.length === 0 && (
                    <option disabled>Nenhum cliente encontrado</option>
                  )}
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Scissors className="w-4 h-4 inline mr-2" />
                  Barbeiro
                </label>
                <select
                  value={formData.barber_id}
                  onChange={(e) => setFormData({ ...formData, barber_id: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                >
                  <option value="">Selecione um barbeiro</option>
                  {barbers.length === 0 && (
                    <option disabled>Nenhum barbeiro encontrado</option>
                  )}
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Scissors className="w-4 h-4 inline mr-2" />
                  Serviço
                </label>
                <select
                  value={formData.service_id}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.length === 0 && (
                    <option disabled>Nenhum serviço encontrado</option>
                  )}
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data
                </label>
                <input
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Horário
                </label>
                <select
                  value={formData.booking_time || ''}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                >
                  <option value="">Selecione um horário</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time} selected={formData.booking_time === time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status do Agendamento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'agendado', label: 'Agendado' },
                    { value: 'confirmado', label: 'Confirmado' },
                    { value: 'em_andamento', label: 'Em Andamento' },
                    { value: 'concluido', label: 'Concluído' },
                    { value: 'cancelado', label: 'Cancelado' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: status.value as any })}
                      className={`p-3 text-sm rounded-lg border transition-all duration-300 ${
                        formData.status === status.value
                          ? getStatusColor(status.value)
                          : 'bg-gray-800/30 text-gray-400 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
                {formData.status === 'confirmado' && (
                  <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">
                        Uma mensagem de confirmação será enviada via WhatsApp para o cliente
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  placeholder="Observações sobre o agendamento..."
                />
              </div>
            </div>

            {booking && (
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Informações do Agendamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Cliente:</span>
                    <span className="text-white ml-2">{booking.client?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Telefone:</span>
                    <span className="text-white ml-2">{booking.client?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Barbeiro:</span>
                    <span className="text-white ml-2">{booking.barber?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Serviço:</span>
                    <span className="text-white ml-2">{booking.service?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Criado em:</span>
                    <span className="text-white ml-2">
                      {format(parseISO(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Atualizado em:</span>
                    <span className="text-white ml-2">
                      {format(parseISO(booking.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default BookingModal;