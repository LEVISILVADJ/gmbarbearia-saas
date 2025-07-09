import React, { useState } from 'react';
import { 
  Megaphone, 
  Gift, 
  Mail, 
  MessageSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Target,
  Star,
  Percent,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Campaign {
  id: string;
  name: string;
  type: 'discount' | 'loyalty' | 'referral' | 'birthday';
  status: 'active' | 'scheduled' | 'ended';
  description: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  targetAudience: string;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  campaignId: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  expiresAt: string;
  createdAt: string;
}

const MarketingCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Desconto de Natal',
      type: 'discount',
      status: 'active',
      description: 'Desconto especial para as festas de fim de ano',
      discountValue: 20,
      discountType: 'percentage',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      targetAudience: 'Todos os clientes',
      usageCount: 45,
      maxUsage: 100,
      createdAt: '2024-12-01'
    },
    {
      id: '2',
      name: 'Programa Fidelidade',
      type: 'loyalty',
      status: 'active',
      description: 'A cada 5 cortes, ganhe 1 grátis',
      discountValue: 100,
      discountType: 'percentage',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      targetAudience: 'Clientes frequentes',
      usageCount: 23,
      createdAt: '2024-01-01'
    }
  ]);

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'NATAL20',
      campaignId: '1',
      discountValue: 20,
      discountType: 'percentage',
      isActive: true,
      usageCount: 12,
      maxUsage: 50,
      expiresAt: '2024-12-31',
      createdAt: '2024-12-01'
    },
    {
      id: '2',
      code: 'PRIMEIRA10',
      campaignId: '1',
      discountValue: 10,
      discountType: 'fixed',
      isActive: true,
      usageCount: 8,
      maxUsage: 25,
      expiresAt: '2024-12-31',
      createdAt: '2024-12-01'
    }
  ]);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    type: 'discount',
    description: '',
    discountValue: 0,
    discountType: 'percentage',
    startDate: new Date().toISOString().split('T')[0],
    endDate: addDays(new Date(), 30).toISOString().split('T')[0],
    targetAudience: 'Todos os clientes',
    maxUsage: 100
  });

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountValue: 0,
    discountType: 'percentage',
    maxUsage: 10,
    expiresAt: addDays(new Date(), 30).toISOString().split('T')[0]
  });

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="w-5 h-5" />;
      case 'loyalty': return <Star className="w-5 h-5" />;
      case 'referral': return <Users className="w-5 h-5" />;
      case 'birthday': return <Gift className="w-5 h-5" />;
      default: return <Megaphone className="w-5 h-5" />;
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'discount': return 'text-green-400 bg-green-900/50';
      case 'loyalty': return 'text-yellow-400 bg-yellow-900/50';
      case 'referral': return 'text-blue-400 bg-blue-900/50';
      case 'birthday': return 'text-purple-400 bg-purple-900/50';
      default: return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/50 border-green-700';
      case 'scheduled': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'ended': return 'text-gray-400 bg-gray-900/50 border-gray-700';
      default: return 'text-gray-400 bg-gray-900/50 border-gray-700';
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name!,
      type: newCampaign.type!,
      status: 'active',
      description: newCampaign.description!,
      discountValue: newCampaign.discountValue!,
      discountType: newCampaign.discountType!,
      startDate: newCampaign.startDate!,
      endDate: newCampaign.endDate!,
      targetAudience: newCampaign.targetAudience!,
      usageCount: 0,
      maxUsage: newCampaign.maxUsage,
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [campaign, ...prev]);
    setShowCampaignModal(false);
    setNewCampaign({
      name: '',
      type: 'discount',
      description: '',
      discountValue: 0,
      discountType: 'percentage',
      startDate: new Date().toISOString().split('T')[0],
      endDate: addDays(new Date(), 30).toISOString().split('T')[0],
      targetAudience: 'Todos os clientes',
      maxUsage: 100
    });
  };

  const createCoupon = () => {
    if (!newCoupon.code || !selectedCampaign) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code!,
      campaignId: selectedCampaign.id,
      discountValue: newCoupon.discountValue!,
      discountType: newCoupon.discountType!,
      isActive: true,
      usageCount: 0,
      maxUsage: newCoupon.maxUsage!,
      expiresAt: newCoupon.expiresAt!,
      createdAt: new Date().toISOString()
    };

    setCoupons(prev => [coupon, ...prev]);
    setShowCouponModal(false);
    setNewCoupon({
      code: '',
      discountValue: 0,
      discountType: 'percentage',
      maxUsage: 10,
      expiresAt: addDays(new Date(), 30).toISOString().split('T')[0]
    });
  };

  const renderCampaignStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Campanhas Ativas</p>
            <p className="text-3xl font-bold text-white">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <Megaphone className="w-10 h-10 text-green-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Cupons Ativos</p>
            <p className="text-3xl font-bold text-white">
              {coupons.filter(c => c.isActive).length}
            </p>
          </div>
          <Gift className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-400">Total de Usos</p>
            <p className="text-3xl font-bold text-white">
              {campaigns.reduce((sum, c) => sum + c.usageCount, 0)}
            </p>
          </div>
          <TrendingUp className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-400">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-white">12.5%</p>
          </div>
          <Target className="w-10 h-10 text-purple-400" />
        </div>
      </div>
    </div>
  );

  const renderCampaignCard = (campaign: Campaign) => (
    <div key={campaign.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-yellow-400/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCampaignTypeColor(campaign.type)}`}>
            {getCampaignTypeIcon(campaign.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            <p className="text-sm text-gray-400 capitalize">{campaign.type}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(campaign.status)}`}>
          {campaign.status === 'active' ? 'Ativa' : campaign.status === 'scheduled' ? 'Agendada' : 'Finalizada'}
        </span>
      </div>
      
      <p className="text-gray-300 mb-4">{campaign.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-yellow-400">
            {campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : `R$ ${campaign.discountValue.toFixed(2)}`}
          </div>
          <div className="text-sm text-gray-400">Desconto</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{campaign.usageCount}</div>
          <div className="text-sm text-gray-400">
            Usos {campaign.maxUsage ? `/ ${campaign.maxUsage}` : ''}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>Início: {format(new Date(campaign.startDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
        <span>Fim: {format(new Date(campaign.endDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
      </div>
      
      {campaign.maxUsage && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progresso</span>
            <span>{((campaign.usageCount / campaign.maxUsage) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((campaign.usageCount / campaign.maxUsage) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setSelectedCampaign(campaign);
            setShowCouponModal(true);
          }}
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>Cupom</span>
        </button>
        <button className="flex items-center justify-center p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all duration-300">
          <Edit className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all duration-300">
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderCouponsList = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Gift className="w-6 h-6 mr-2 text-yellow-400" />
        Cupons de Desconto
      </h3>
      
      <div className="space-y-4">
        {coupons.map((coupon) => {
          const campaign = campaigns.find(c => c.id === coupon.campaignId);
          
          return (
            <div key={coupon.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-2 rounded-lg font-bold text-lg">
                    {coupon.code}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {campaign?.name} • Expira em {format(new Date(coupon.expiresAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{coupon.usageCount}/{coupon.maxUsage}</div>
                  <div className="text-sm text-gray-400">Usos</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((coupon.usageCount / coupon.maxUsage) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCampaignModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Nova Campanha</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Campanha</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Ex: Desconto de Verão"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Campanha</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              >
                <option value="discount">Desconto</option>
                <option value="loyalty">Fidelidade</option>
                <option value="referral">Indicação</option>
                <option value="birthday">Aniversário</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
              rows={3}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              placeholder="Descreva os detalhes da campanha..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valor do Desconto</label>
              <input
                type="number"
                value={newCampaign.discountValue}
                onChange={(e) => setNewCampaign({...newCampaign, discountValue: parseFloat(e.target.value) || 0})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Desconto</label>
              <select
                value={newCampaign.discountType}
                onChange={(e) => setNewCampaign({...newCampaign, discountType: e.target.value as any})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Limite de Uso</label>
              <input
                type="number"
                value={newCampaign.maxUsage}
                onChange={(e) => setNewCampaign({...newCampaign, maxUsage: parseInt(e.target.value) || undefined})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Deixe em branco para ilimitado"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Início</label>
              <input
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Término</label>
              <input
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Público-Alvo</label>
            <input
              type="text"
              value={newCampaign.targetAudience}
              onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              placeholder="Ex: Todos os clientes, Novos clientes, etc."
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex space-x-3">
          <button
            onClick={() => setShowCampaignModal(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={createCampaign}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
          >
            Criar Campanha
          </button>
        </div>
      </div>
    </div>
  );

  const renderCouponModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Novo Cupom</h2>
          {selectedCampaign && (
            <p className="text-gray-400">Campanha: {selectedCampaign.name}</p>
          )}
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Código do Cupom</label>
              <input
                type="text"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                placeholder="Ex: NATAL20"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateCouponCode}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
              >
                Gerar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valor do Desconto</label>
              <input
                type="number"
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value) || 0})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Desconto</label>
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Limite de Uso</label>
              <input
                type="number"
                value={newCoupon.maxUsage}
                onChange={(e) => setNewCoupon({...newCoupon, maxUsage: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Expiração</label>
              <input
                type="date"
                value={newCoupon.expiresAt}
                onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Prévia do Cupom</h4>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-3 rounded-lg font-bold text-center text-lg">
              {newCoupon.code || 'CUPOM'}
            </div>
            <p className="text-center text-blue-300 mt-2">
              {newCoupon.discountType === 'percentage' ? `${newCoupon.discountValue}% OFF` : `R$ ${newCoupon.discountValue?.toFixed(2)} OFF`}
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex space-x-3">
          <button
            onClick={() => setShowCouponModal(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={createCoupon}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium transition-all duration-300"
          >
            Criar Cupom
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Marketing e Promoções</h2>
          <p className="text-gray-400">Gerencie campanhas, cupons e promoções</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {renderCampaignStats()}

      {/* Marketing Channels */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Megaphone className="w-6 h-6 mr-2 text-yellow-400" />
          Canais de Marketing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">WhatsApp</h4>
            <p className="text-sm text-gray-400 mb-4">Envie promoções diretamente para os clientes via WhatsApp</p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
              Configurar
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">E-mail Marketing</h4>
            <p className="text-sm text-gray-400 mb-4">Envie e-mails personalizados com ofertas e novidades</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
              Configurar
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">SMS</h4>
            <p className="text-sm text-gray-400 mb-4">Envie mensagens de texto com promoções e lembretes</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300">
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Target className="w-6 h-6 mr-2 text-yellow-400" />
            Campanhas de Marketing
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map(renderCampaignCard)}
        </div>
      </div>

      {renderCouponsList()}
      
      {showCampaignModal && renderCampaignModal()}
      {showCouponModal && renderCouponModal()}
    </div>
  );
};

export default MarketingCampaigns;