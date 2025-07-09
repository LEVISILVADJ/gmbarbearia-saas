import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Phone, 
  Mail, 
  Users,
  Settings,
  Check,
  X,
  Eye,
  Calendar,
  ArrowRight,
  Building,
  Star
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  isActive: boolean;
  isMain: boolean;
  barberCount: number;
  createdAt: string;
}

const MultiLocationSettings: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'GM Barbearia - Centro',
      address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      phone: '(11) 99999-9999',
      email: 'centro@gmbarbearia.com',
      openingHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '16:00', closed: false },
        sunday: { open: '08:00', close: '16:00', closed: true }
      },
      isActive: true,
      isMain: true,
      barberCount: 4,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'GM Barbearia - Zona Sul',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      phone: '(11) 99999-8888',
      email: 'zonasul@gmbarbearia.com',
      openingHours: {
        monday: { open: '09:00', close: '19:00', closed: false },
        tuesday: { open: '09:00', close: '19:00', closed: false },
        wednesday: { open: '09:00', close: '19:00', closed: false },
        thursday: { open: '09:00', close: '19:00', closed: false },
        friday: { open: '09:00', close: '19:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true }
      },
      isActive: true,
      isMain: false,
      barberCount: 3,
      createdAt: '2024-06-01T00:00:00Z'
    }
  ]);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    },
    isActive: true,
    isMain: false
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleDeleteLocation = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;
    
    setLocations(prev => prev.filter(location => location.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setLocations(prev => prev.map(location => 
      location.id === id ? { ...location, isActive: !location.isActive } : location
    ));
  };

  const handleSetMainLocation = (id: string) => {
    setLocations(prev => prev.map(location => ({
      ...location,
      isMain: location.id === id
    })));
  };

  const createLocation = () => {
    if (!newLocation.name || !newLocation.address || !newLocation.phone || !newLocation.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name!,
      address: newLocation.address!,
      phone: newLocation.phone!,
      email: newLocation.email!,
      openingHours: newLocation.openingHours!,
      isActive: newLocation.isActive!,
      isMain: newLocation.isMain!,
      barberCount: 0,
      createdAt: new Date().toISOString()
    };

    setLocations(prev => [...prev, location]);
    setShowLocationModal(false);
    setNewLocation({
      name: '',
      address: '',
      phone: '',
      email: '',
      openingHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '16:00', closed: false },
        sunday: { open: '08:00', close: '16:00', closed: true }
      },
      isActive: true,
      isMain: false
    });
  };

  const updateLocation = () => {
    if (!selectedLocation) return;
    
    setLocations(prev => prev.map(location => 
      location.id === selectedLocation.id ? selectedLocation : location
    ));
    
    setShowLocationModal(false);
    setSelectedLocation(null);
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        openingHours: {
          ...selectedLocation.openingHours,
          [day]: {
            ...selectedLocation.openingHours[day],
            [field]: value
          }
        }
      });
    } else {
      setNewLocation({
        ...newLocation,
        openingHours: {
          ...newLocation.openingHours!,
          [day]: {
            ...newLocation.openingHours![day],
            [field]: value
          }
        }
      });
    }
  };

  const renderLocationCard = (location: Location) => (
    <div key={location.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-yellow-400/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            location.isMain ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-800/50 text-gray-400'
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{location.name}</h3>
            <div className="flex items-center space-x-2">
              {location.isMain && (
                <span className="bg-yellow-900/50 text-yellow-400 border border-yellow-700 px-2 py-0.5 text-xs rounded-full">
                  Principal
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                location.isActive 
                  ? 'bg-green-900/50 text-green-400 border-green-700' 
                  : 'bg-red-900/50 text-red-400 border-red-700'
              }`}>
                {location.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedLocation(location);
              setShowLocationModal(true);
            }}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(location.id)}
            className={`p-2 ${
              location.isActive 
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
            } rounded-lg transition-all duration-300`}
            title={location.isActive ? 'Desativar' : 'Ativar'}
          >
            {location.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
          {!location.isMain && (
            <button
              onClick={() => handleDeleteLocation(location.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{location.address}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Phone className="w-4 h-4" />
          <span>{location.phone}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Mail className="w-4 h-4" />
          <span>{location.email}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            Seg-Sex: {location.openingHours.monday.open} - {location.openingHours.monday.close}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>{location.barberCount} barbeiros</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {!location.isMain && (
          <button
            onClick={() => handleSetMainLocation(location.id)}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Star className="w-4 h-4" />
            <span>Definir como Principal</span>
          </button>
        )}
        <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300">
          <Eye className="w-4 h-4" />
          <span>Visualizar</span>
        </button>
      </div>
    </div>
  );

  const renderLocationModal = () => {
    const isEditing = !!selectedLocation;
    const locationData = selectedLocation || newLocation;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Unidade' : 'Nova Unidade'}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'general'
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Informações Gerais
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'hours'
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Horário de Funcionamento
              </button>
            </div>
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome da Unidade
                    </label>
                    <input
                      type="text"
                      value={locationData.name}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, name: e.target.value})
                        : setNewLocation({...newLocation, name: e.target.value})
                      }
                      className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                      placeholder="Ex: GM Barbearia - Centro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={locationData.address}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, address: e.target.value})
                        : setNewLocation({...newLocation, address: e.target.value})
                      }
                      className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                      placeholder="Ex: Rua das Flores, 123 - Centro"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={locationData.phone}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, phone: e.target.value})
                        : setNewLocation({...newLocation, phone: e.target.value})
                      }
                      className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={locationData.email}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, email: e.target.value})
                        : setNewLocation({...newLocation, email: e.target.value})
                      }
                      className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                      placeholder="Ex: unidade@gmbarbearia.com"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={locationData.isActive}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, isActive: e.target.checked})
                        : setNewLocation({...newLocation, isActive: e.target.checked})
                      }
                      className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                      Unidade ativa
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isMain"
                      checked={locationData.isMain}
                      onChange={(e) => isEditing 
                        ? setSelectedLocation({...selectedLocation!, isMain: e.target.checked})
                        : setNewLocation({...newLocation, isMain: e.target.checked})
                      }
                      className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                    />
                    <label htmlFor="isMain" className="text-sm font-medium text-gray-300">
                      Unidade principal
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Horário de Funcionamento</h4>
                  
                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayNames: { [key: string]: string } = {
                        monday: 'Segunda-feira',
                        tuesday: 'Terça-feira',
                        wednesday: 'Quarta-feira',
                        thursday: 'Quinta-feira',
                        friday: 'Sexta-feira',
                        saturday: 'Sábado',
                        sunday: 'Domingo'
                      };
                      
                      const dayData = locationData.openingHours![day];
                      
                      return (
                        <div key={day} className="flex items-center space-x-4">
                          <div className="w-32 text-sm font-medium text-gray-300">{dayNames[day]}</div>
                          
                          <div className="flex items-center space-x-3">
                            <input
                              type="time"
                              value={dayData.open}
                              onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                              disabled={dayData.closed}
                              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white disabled:opacity-50"
                            />
                            <span className="text-gray-400">até</span>
                            <input
                              type="time"
                              value={dayData.close}
                              onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                              disabled={dayData.closed}
                              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white disabled:opacity-50"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`closed-${day}`}
                              checked={dayData.closed}
                              onChange={(e) => handleOpeningHoursChange(day, 'closed', e.target.checked)}
                              className="w-4 h-4 text-red-400 bg-gray-800 border-gray-700 rounded focus:ring-red-400"
                            />
                            <label htmlFor={`closed-${day}`} className="text-sm font-medium text-gray-300">
                              Fechado
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-700 flex space-x-3">
            <button
              onClick={() => {
                setShowLocationModal(false);
                setSelectedLocation(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={isEditing ? updateLocation : createLocation}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Unidade
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Múltiplas Unidades</h2>
          <p className="text-gray-400">Gerencie todas as unidades da barbearia</p>
        </div>
        
        <button
          onClick={() => {
            setSelectedLocation(null);
            setShowLocationModal(true);
            setActiveTab('general');
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Unidade</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Total de Unidades</p>
              <p className="text-3xl font-bold text-white">{locations.length}</p>
            </div>
            <Building className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Unidades Ativas</p>
              <p className="text-3xl font-bold text-white">
                {locations.filter(l => l.isActive).length}
              </p>
            </div>
            <Check className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Total de Barbeiros</p>
              <p className="text-3xl font-bold text-white">
                {locations.reduce((sum, l) => sum + l.barberCount, 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map(renderLocationCard)}
      </div>
      
      {/* Location Modal */}
      {showLocationModal && renderLocationModal()}
    </div>
  );
};

export default MultiLocationSettings;