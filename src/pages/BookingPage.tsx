import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ArrowLeft, ArrowRight, Star, Clock, Calendar, Check, Sparkles } from 'lucide-react';
import { db, type Barber, type Service, type BusinessSettings } from '../lib/supabase';

const BookingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    birth_date: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setIsVisible(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load business settings first to get theme
      const settings = await db.settings.get();
      setBusinessSettings(settings);
      
      // Set theme mode from settings
      if (settings.theme_mode) {
        setThemeMode(settings.theme_mode as 'dark' | 'light');
      }
      
      setIsLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Data loading timeout')), 15000);
      });
      
      const dataPromise = Promise.all([
        db.barbers.getAll(),
        db.services.getAll()
      ]);
      
      const [barbersData, servicesData] = await Promise.race([dataPromise, timeoutPromise]);
      
      setBarbers(barbersData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Set fallback data to prevent infinite loading
      setBarbers([]);
      setServices([]);
      
      // Show user-friendly error
      alert('Erro ao carregar dados. Usando dados em cache. Recarregue a página se necessário.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateBookingData = () => {
    if (!selectedBarber) {
      alert('Por favor, selecione um barbeiro.');
      return false;
    }
    
    if (!selectedService) {
      alert('Por favor, selecione um serviço.');
      return false;
    }
    
    if (!selectedDate) {
      alert('Por favor, selecione uma data.');
      return false;
    }
    
    if (!selectedTime) {
      alert('Por favor, selecione um horário.');
      return false;
    }
    
    if (!clientData.name.trim()) {
      alert('Por favor, informe seu nome.');
      return false;
    }
    
    if (!clientData.phone.trim()) {
      alert('Por favor, informe seu telefone.');
      return false;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      alert('Por favor, selecione uma data e horário futuros.');
      return false;
    }

    return true;
  };

  const normalizePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  };

  const handleBooking = async () => {
    if (!validateBookingData()) {
      return;
    }

    setIsBooking(true);

    try {
      console.log('Starting booking process...', {
        selectedBarber: selectedBarber?.id,
        selectedService: selectedService?.id,
        selectedDate,
        selectedTime,
        clientData
      });

      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(clientData.phone);
      
      if (normalizedPhone.length < 10) {
        alert('Por favor, informe um telefone válido com pelo menos 10 dígitos.');
        setIsBooking(false);
        return;
      }

      // Check if client exists or create new one
      let client;
      try {
        client = await db.clients.findByPhone(normalizedPhone);
        console.log('Existing client found:', client);
      } catch (error) {
        console.log('No existing client found or error in search:', error);
        client = null;
      }
      
      if (!client) {
        console.log('Creating new client...');
        try {
          const clientToCreate = {
            name: clientData.name.trim(),
            phone: normalizedPhone,
            email: clientData.email.trim() || undefined
          };
          
          console.log('Client data to create:', clientToCreate);
          
          client = await db.clients.create(clientToCreate);
          console.log('New client created:', client);
        } catch (clientError) {
          console.error('Error creating client:', clientError);
          
          // More specific error handling
          if (clientError instanceof Error) {
            if (clientError.message.includes('duplicate key')) {
              alert('Já existe um cliente com este telefone. Tente novamente.');
            } else {
              alert(`Erro ao criar cliente: ${clientError.message}`);
            }
          } else {
            alert('Erro ao criar cliente. Verifique os dados e tente novamente.');
          }
          setIsBooking(false);
          return;
        }
      }

      if (!client || !client.id) {
        throw new Error('Erro ao obter dados do cliente.');
      }

      // Create booking
      console.log('Creating booking...');
      const bookingData = {
        client_id: client.id,
        barber_id: selectedBarber!.id,
        service_id: selectedService!.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'agendado' as const,
        total_price: selectedService!.price,
        notes: ''
      };

      console.log('Booking data:', bookingData);

      const booking = await db.bookings.create(bookingData);
      console.log('Booking created successfully:', booking);

      alert('Agendamento realizado com sucesso! Você receberá uma confirmação em breve.');
      
      // Reset form
      setCurrentStep(1);
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setClientData({ name: '', phone: '', birth_date: '' });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          alert('Já existe um agendamento para este horário. Por favor, escolha outro horário.');
        } else {
          alert(`Erro ao realizar agendamento: ${error.message}`);
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        alert(`Erro ao realizar agendamento: ${(error as any).message}`);
      } else {
        alert('Erro ao realizar agendamento. Verifique sua conexão com a internet e tente novamente.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-12">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
              currentStep >= step 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/25 scale-110' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700'
            }`}>
              {currentStep > step ? (
                <Check className="w-6 h-6" />
              ) : (
                step
              )}
              {currentStep >= step && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse"></div>
              )}
            </div>
            {step < 4 && (
              <div className={`w-8 sm:w-16 h-1 transition-all duration-500 ${
                currentStep > step ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-800'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Escolha seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Barbeiro</span>
        </h2>
        <p className="text-gray-400 text-lg">Selecione o profissional de sua preferência</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900/50 rounded-2xl p-6 animate-pulse">
              <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-700 rounded"></div>
                <div className="h-2 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum barbeiro disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => setSelectedBarber(barber)}
              className={`group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 cursor-pointer transition-all duration-500 border backdrop-blur-sm ${
                selectedBarber?.id === barber.id 
                  ? 'ring-2 ring-yellow-400 scale-105 border-yellow-400/50 shadow-2xl shadow-yellow-400/20' 
                  : 'hover:scale-105 border-gray-700/50 hover:border-yellow-400/30'
              }`}
            >
              {selectedBarber?.id === barber.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-2xl animate-pulse"></div>
              )}
              
              <div className="relative text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <img
                    src={barber.photo_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300'}
                    alt={barber.name}
                    className="relative w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-700 group-hover:border-yellow-400/50 transition-all duration-500"
                  />
                  {selectedBarber?.id === barber.id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-500">
                  {barber.name}
                </h3>
                
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-400">{barber.rating}</span>
                  <Sparkles className="w-3 h-3 text-yellow-400 ml-2" />
                </div>
                
                <p className="text-sm text-gray-500 mb-4">{barber.experience_years} anos de experiência</p>
                
                <div className="space-y-2">
                  {barber.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-800/50 text-gray-300 text-xs px-3 py-1 rounded-full mr-1 border border-gray-700/50 group-hover:border-yellow-400/30 transition-all duration-300"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="transition-all duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Escolha o <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Serviço</span>
        </h2>
        <p className="text-gray-400 text-lg">Selecione o serviço desejado</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900/50 rounded-2xl p-8 animate-pulse">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded mb-2 w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum serviço disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 cursor-pointer transition-all duration-500 border backdrop-blur-sm ${
                selectedService?.id === service.id 
                  ? 'ring-2 ring-yellow-400 scale-105 border-yellow-400/50 shadow-2xl shadow-yellow-400/20' 
                  : 'hover:scale-105 border-gray-700/50 hover:border-yellow-400/30'
              }`}
            >
              {selectedService?.id === service.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-2xl animate-pulse"></div>
              )}
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-500">
                        {service.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration_minutes} min
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-2">{service.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
                
                {selectedService?.id === service.id && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="transition-all duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Escolha <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Data e Horário</span>
        </h2>
        <p className="text-gray-400 text-lg">Selecione quando deseja ser atendido</p>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Data</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300 backdrop-blur-sm"
          />
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Horário</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 text-sm rounded-xl transition-all duration-300 border font-medium ${
                  selectedTime === time
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg shadow-yellow-400/25 scale-105'
                    : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border-gray-700 hover:border-yellow-400/30 hover:scale-105'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="transition-all duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Dados</span>
        </h2>
        <p className="text-gray-400 text-lg">Finalize seu agendamento</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
            <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
            Resumo do Agendamento
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Barbeiro:</span>
              <span className="font-semibold text-yellow-400">{selectedBarber?.name}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Serviço:</span>
              <span className="font-semibold text-yellow-400">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Data:</span>
              <span className="font-semibold text-yellow-400">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Horário:</span>
              <span className="font-semibold text-yellow-400">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-yellow-400 border-t border-gray-700 pt-4">
              <span>Total:</span>
              <span>R$ {selectedService?.price.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-6 text-white">Seus Dados</h3>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Nome completo"
              value={clientData.name}
              onChange={(e) => setClientData({...clientData, name: e.target.value})}
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
              required
            />
            <div>
              <input
                type="tel"
                placeholder="Telefone (ex: 11999999999)"
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Digite apenas números (ex: 11999999999)
              </p>
            </div>
            <input
              type="date"
              placeholder="Data de Nascimento (opcional)"
              value={clientData.birth_date}
              onChange={(e) => setClientData({...clientData, birth_date: e.target.value})}
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
            />
            <p className="text-xs text-gray-500 mt-2">
              Informe sua data de nascimento para receber ofertas especiais no seu aniversário
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${
      themeMode === 'light' ? 'bg-gray-100' : 'bg-[#11110f]'
    }`}>
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderStepIndicator()}
          
          <div className="mb-16">
            <div className={themeMode === 'light' ? 'text-gray-900' : 'text-white'}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? themeMode === 'light'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700'
                  : themeMode === 'light'
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 hover:scale-105'
                    : 'bg-gray-800/50 text-white hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 hover:scale-105'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedBarber) ||
                  (currentStep === 2 && !selectedService) ||
                  (currentStep === 3 && (!selectedDate || !selectedTime))
                }
                className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  (currentStep === 1 && !selectedBarber) ||
                  (currentStep === 2 && !selectedService) ||
                  (currentStep === 3 && (!selectedDate || !selectedTime))
                    ? themeMode === 'light'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                      : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'bg-gradient-to-r text-black hover:shadow-lg hover:scale-105'
                }`}
                style={{
                  background: (currentStep === 1 && !selectedBarber) ||
                              (currentStep === 2 && !selectedService) ||
                              (currentStep === 3 && (!selectedDate || !selectedTime))
                    ? '' 
                    : `linear-gradient(to right, ${businessSettings?.primary_color || '#f59e0b'}, ${businessSettings?.secondary_color || '#ea580c'})`,
                  boxShadow: (currentStep === 1 && !selectedBarber) ||
                             (currentStep === 2 && !selectedService) ||
                             (currentStep === 3 && (!selectedDate || !selectedTime))
                    ? ''
                    : `0 10px 15px -3px ${businessSettings?.primary_color || '#f59e0b'}20`
                }}
              >
                <span>Próximo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={!clientData.name.trim() || !clientData.phone.trim() || isBooking}
                className={`flex items-center space-x-2 px-10 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  !clientData.name.trim() || !clientData.phone.trim() || isBooking 
                    ? themeMode === 'light'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                      : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700'
                    : 'bg-gradient-to-r text-black hover:shadow-lg hover:scale-105'
                }`}
                style={{
                  background: !clientData.name.trim() || !clientData.phone.trim() || isBooking
                    ? ''
                    : `linear-gradient(to right, ${businessSettings?.primary_color || '#f59e0b'}, ${businessSettings?.secondary_color || '#ea580c'})`,
                  boxShadow: !clientData.name.trim() || !clientData.phone.trim() || isBooking
                    ? ''
                    : `0 10px 15px -3px ${businessSettings?.primary_color || '#f59e0b'}20`
                }}
              >
                <Calendar className="w-5 h-5" />
                <span>{isBooking ? 'Agendando...' : 'Confirmar Agendamento'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;