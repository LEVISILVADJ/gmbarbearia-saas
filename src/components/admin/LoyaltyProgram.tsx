import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Gift, 
  Star, 
  Users, 
  TrendingUp, 
  Settings,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  Scissors,
  Target,
  Zap
} from 'lucide-react';
import { db, type Client, type Booking } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoyaltyTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  benefits: string[];
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  limitPerClient?: number;
  expirationDays?: number;
}

interface ClientWithLoyalty extends Client {
  totalBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  lastVisit?: string;
}

const LoyaltyProgram: React.FC = () => {
  const [clients, setClients] = useState<ClientWithLoyalty[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([
    {
      id: '1',
      name: 'Bronze',
      icon: '🥉',
      color: 'text-orange-400',
      minPoints: 0,
      benefits: ['Acesso ao programa de fidelidade']
    },
    {
      id: '2',
      name: 'Prata',
      icon: '🥈',
      color: 'text-gray-400',
      minPoints: 100,
      benefits: ['Acesso ao programa de fidelidade', 'Desconto de 5% em serviços']
    },
    {
      id: '3',
      name: 'Ouro',
      icon: '🥇',
      color: 'text-yellow-400',
      minPoints: 200,
      benefits: ['Acesso ao programa de fidelidade', 'Desconto de 10% em serviços', 'Prioridade no agendamento']
    },
    {
      id: '4',
      name: 'Diamante',
      icon: '💎',
      color: 'text-blue-400',
      minPoints: 500,
      benefits: ['Acesso ao programa de fidelidade', 'Desconto de 15% em serviços', 'Prioridade no agendamento', 'Serviço de barba gratuito a cada 5 cortes']
    }
  ]);

  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([
    {
      id: '1',
      name: 'Corte Grátis',
      description: 'Um corte de cabelo gratuito',
      pointsCost: 150,
      isActive: true,
      limitPerClient: 1,
      expirationDays: 30
    },
    {
      id: '2',
      name: 'Barba Grátis',
      description: 'Um serviço de barba gratuito',
      pointsCost: 100,
      isActive: true,
      limitPerClient: 1,
      expirationDays: 30
    },
    {
      id: '3',
      name: 'Desconto de 50%',
      description: 'Desconto de 50% em qualquer serviço',
      pointsCost: 200,
      isActive: true,
      limitPerClient: 1,
      expirationDays: 60
    }
  ]);

  const [showTierModal, setShowTierModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      
      // Calculate client loyalty data
      const clientsWithLoyalty: ClientWithLoyalty[] = clientsData.map(client => {
        const clientBookings = bookingsData.filter(b => b.client_id === client.id);
        const completedBookings = clientBookings.filter(b => b.status === 'concluido');
        
        const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
        const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per R$ 10 spent
        
        const lastBooking = clientBookings
          .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())[0];
        
        // Determine tier based on points
        const tier = loyaltyTiers
          .sort((a, b) => b.minPoints - a.minPoints)
          .find(t => loyaltyPoints >= t.minPoints) || loyaltyTiers[0];

        return {
          ...client,
          totalBookings: clientBookings.length,
          totalSpent,
          loyaltyPoints,
          tier,
          lastVisit: lastBooking?.booking_date
        };
      });
      
      setClients(clientsWithLoyalty);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoyaltyStats = () => {
    const totalClients = clients.length;
    const totalPoints = clients.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const avgPointsPerClient = totalClients > 0 ? Math.round(totalPoints / totalClients) : 0;
    const tierCounts = loyaltyTiers.map(tier => ({
      tier,
      count: clients.filter(c => c.tier.id === tier.id).length
    }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Clientes no Programa</p>
              <p className="text-3xl font-bold text-white">{totalClients}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Total de Pontos</p>
              <p className="text-3xl font-bold text-white">{totalPoints}</p>
            </div>
            <Star className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Média por Cliente</p>
              <p className="text-3xl font-bold text-white">{avgPointsPerClient}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Clientes VIP</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.tier.minPoints >= 200).length}
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>
    );
  };

  const renderTierDistribution = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Award className="w-6 h-6 mr-2 text-yellow-400" />
        Distribuição de Níveis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loyaltyTiers.map(tier => {
          const clientCount = clients.filter(c => c.tier.id === tier.id).length;
          const percentage = totalClients > 0 ? (clientCount / totalClients) * 100 : 0;
          
          return (
            <div key={tier.id} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">{tier.icon}</div>
              <h4 className={`text-lg font-semibold ${tier.color}`}>{tier.name}</h4>
              <p className="text-2xl font-bold text-white mt-2">{clientCount}</p>
              <p className="text-sm text-gray-400">clientes ({percentage.toFixed(1)}%)</p>
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tier.id === '1' ? 'bg-orange-400' :
                      tier.id === '2' ? 'bg-gray-400' :
                      tier.id === '3' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLoyaltyTiers = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-400" />
          Níveis de Fidelidade
        </h3>
        
        <button
          onClick={() => {
            setSelectedTier(null);
            setShowTierModal(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Nível</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {loyaltyTiers.map((tier) => (
          <div key={tier.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{tier.icon}</div>
                <div>
                  <h4 className={`text-lg font-semibold ${tier.color}`}>{tier.name}</h4>
                  <p className="text-sm text-gray-400">
                    Mínimo: {tier.minPoints} pontos
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setShowTierModal(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este nível?')) {
                      setLoyaltyTiers(prev => prev.filter(t => t.id !== tier.id));
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
              <h5 className="text-sm font-medium text-white mb-2">Benefícios:</h5>
              <ul className="space-y-1">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoyaltyRewards = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Gift className="w-6 h-6 mr-2 text-yellow-400" />
          Recompensas
        </h3>
        
        <button
          onClick={() => {
            setSelectedReward(null);
            setShowRewardModal(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Recompensa</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loyaltyRewards.map((reward) => (
          <div key={reward.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">{reward.name}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                reward.isActive 
                  ? 'bg-green-900/50 text-green-400 border border-green-700' 
                  : 'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {reward.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">{reward.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">{reward.pointsCost}</span>
              </div>
              
              <div className="text-sm text-gray-400">
                {reward.limitPerClient && `Limite: ${reward.limitPerClient} por cliente`}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedReward(reward);
                  setShowRewardModal(true);
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta recompensa?')) {
                    setLoyaltyRewards(prev => prev.filter(r => r.id !== reward.id));
                  }
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopClients = () => {
    const topClients = [...clients]
      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
      .slice(0, 5);
    
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-yellow-400" />
          Top 5 Clientes Fiéis
        </h3>
        
        <div className="space-y-4">
          {topClients.map((client, index) => (
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
                    <span className={`text-sm ${client.tier.color}`}>{client.tier.icon} {client.tier.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-400">{client.totalBookings} visitas</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-400">
                  {client.loyaltyPoints} pontos
                </div>
                <div className="text-sm text-gray-400">
                  R$ {client.totalSpent.toFixed(2).replace('.', ',')} gastos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTierModal = () => {
    const isEditing = !!selectedTier;
    const tierData = selectedTier || {
      id: '',
      name: '',
      icon: '🏅',
      color: 'text-yellow-400',
      minPoints: 0,
      benefits: ['']
    };
    
    const [formData, setFormData] = useState({
      name: tierData.name,
      icon: tierData.icon,
      color: tierData.color,
      minPoints: tierData.minPoints,
      benefits: [...tierData.benefits]
    });
    
    const handleAddBenefit = () => {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, '']
      });
    };
    
    const handleRemoveBenefit = (index: number) => {
      setFormData({
        ...formData,
        benefits: formData.benefits.filter((_, i) => i !== index)
      });
    };
    
    const handleBenefitChange = (index: number, value: string) => {
      const newBenefits = [...formData.benefits];
      newBenefits[index] = value;
      setFormData({
        ...formData,
        benefits: newBenefits
      });
    };
    
    const handleSaveTier = () => {
      if (!formData.name || formData.minPoints < 0) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      const tier: LoyaltyTier = {
        id: isEditing ? tierData.id : Date.now().toString(),
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        minPoints: formData.minPoints,
        benefits: formData.benefits.filter(b => b.trim() !== '')
      };
      
      if (isEditing) {
        setLoyaltyTiers(prev => prev.map(t => t.id === tier.id ? tier : t));
      } else {
        setLoyaltyTiers(prev => [...prev, tier]);
      }
      
      setShowTierModal(false);
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Nível' : 'Novo Nível'}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Nível
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Ex: Bronze, Prata, Ouro"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ícone
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white text-center text-2xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pontos Mínimos
                </label>
                <input
                  type="number"
                  value={formData.minPoints}
                  onChange={(e) => setFormData({...formData, minPoints: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cor do Texto
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              >
                <option value="text-orange-400">Laranja</option>
                <option value="text-gray-400">Cinza</option>
                <option value="text-yellow-400">Dourado</option>
                <option value="text-blue-400">Azul</option>
                <option value="text-green-400">Verde</option>
                <option value="text-purple-400">Roxo</option>
                <option value="text-red-400">Vermelho</option>
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Benefícios
                </label>
                <button
                  onClick={handleAddBenefit}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                >
                  + Adicionar
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                      placeholder="Descreva o benefício"
                    />
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Prévia do Nível</h4>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{formData.icon}</div>
                <div>
                  <h5 className={`text-lg font-semibold ${formData.color}`}>{formData.name}</h5>
                  <p className="text-sm text-gray-400">
                    Mínimo: {formData.minPoints} pontos
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-700 flex space-x-3">
            <button
              onClick={() => setShowTierModal(false)}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTier}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Nível
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRewardModal = () => {
    const isEditing = !!selectedReward;
    const rewardData = selectedReward || {
      id: '',
      name: '',
      description: '',
      pointsCost: 100,
      isActive: true,
      limitPerClient: 1,
      expirationDays: 30
    };
    
    const [formData, setFormData] = useState({
      name: rewardData.name,
      description: rewardData.description,
      pointsCost: rewardData.pointsCost,
      isActive: rewardData.isActive,
      limitPerClient: rewardData.limitPerClient,
      expirationDays: rewardData.expirationDays
    });
    
    const handleSaveReward = () => {
      if (!formData.name || !formData.description || formData.pointsCost <= 0) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      const reward: LoyaltyReward = {
        id: isEditing ? rewardData.id : Date.now().toString(),
        name: formData.name,
        description: formData.description,
        pointsCost: formData.pointsCost,
        isActive: formData.isActive,
        limitPerClient: formData.limitPerClient,
        expirationDays: formData.expirationDays
      };
      
      if (isEditing) {
        setLoyaltyRewards(prev => prev.map(r => r.id === reward.id ? reward : r));
      } else {
        setLoyaltyRewards(prev => [...prev, reward]);
      }
      
      setShowRewardModal(false);
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Recompensa' : 'Nova Recompensa'}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Recompensa
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Ex: Corte Grátis"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Descreva a recompensa..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custo em Pontos
                </label>
                <input
                  type="number"
                  value={formData.pointsCost}
                  onChange={(e) => setFormData({...formData, pointsCost: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Limite por Cliente
                </label>
                <input
                  type="number"
                  value={formData.limitPerClient}
                  onChange={(e) => setFormData({...formData, limitPerClient: parseInt(e.target.value) || undefined})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                  min="1"
                  placeholder="Sem limite"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dias para Expiração
              </label>
              <input
                type="number"
                value={formData.expirationDays}
                onChange={(e) => setFormData({...formData, expirationDays: parseInt(e.target.value) || undefined})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                min="1"
                placeholder="Sem expiração"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                Recompensa ativa
              </label>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Prévia da Recompensa</h4>
              <div className="text-center">
                <h5 className="text-lg font-semibold text-white">{formData.name}</h5>
                <p className="text-sm text-gray-400 mb-2">{formData.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">{formData.pointsCost}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-700 flex space-x-3">
            <button
              onClick={() => setShowRewardModal(false)}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveReward}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Recompensa
            </button>
          </div>
        </div>
      </div>
    );
  };

  const totalClients = clients.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Programa de Fidelidade</h2>
          <p className="text-gray-400">Gerencie o programa de fidelidade e recompensas</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedTier(null);
              setShowTierModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Star className="w-4 h-4" />
            <span>Novo Nível</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedReward(null);
              setShowRewardModal(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            <Gift className="w-4 h-4" />
            <span>Nova Recompensa</span>
          </button>
        </div>
      </div>

      {renderLoyaltyStats()}
      {renderTierDistribution()}
      {renderLoyaltyTiers()}
      {renderLoyaltyRewards()}
      {renderTopClients()}
      
      {showTierModal && renderTierModal()}
      {showRewardModal && renderRewardModal()}
    </div>
  );
};

export default LoyaltyProgram;