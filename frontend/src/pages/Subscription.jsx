import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tenantService, subscriptionService } from '../services/api';
import { CreditCard, CheckCircle, Calendar, ArrowRight, Loader, Shield } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tenant, setTenant] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Obter subdomínio da URL
  const params = new URLSearchParams(location.search);
  const subdomain = params.get('subdomain');

  useEffect(() => {
    if (!subdomain) {
      navigate('/select-tenant');
      return;
    }
    
    loadTenant();
  }, [subdomain]);

  const loadTenant = async () => {
    try {
      setIsLoading(true);
      const response = await tenantService.getTenant(subdomain);
      setTenant(response.tenant);
    } catch (error) {
      console.error('Erro ao carregar tenant:', error);
      setError('Não foi possível carregar as informações da barbearia.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      const response = await subscriptionService.subscribe(subdomain, {
        plan: selectedPlan,
        payment_method: selectedPaymentMethod
      });
      
      // Redirecionar para a página de pagamento do MercadoPago
      if (response.payment && response.payment.init_point) {
        window.location.href = response.payment.init_point;
      } else {
        throw new Error('Não foi possível iniciar o processo de pagamento.');
      }
    } catch (error) {
      console.error('Erro ao assinar:', error);
      setError(error.message || 'Ocorreu um erro ao processar sua assinatura. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 99,90',
      priceValue: 99.9,
      features: [
        'Agendamentos ilimitados',
        'Painel administrativo completo',
        'Integração com WhatsApp',
        'Personalização básica',
        'Suporte por e-mail'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 149,90',
      priceValue: 149.9,
      features: [
        'Tudo do plano Básico',
        'Múltiplos barbeiros',
        'Relatórios avançados',
        'Personalização completa',
        'Suporte prioritário',
        'Backup automático'
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11110f] via-gray-900 to-[#11110f]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Assine o <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">GM Barbearia</span>
          </h1>
          {tenant && (
            <p className="text-xl text-gray-300">
              {tenant.trial_ends_at && new Date(tenant.trial_ends_at) < new Date() ? (
                'Seu período de teste expirou. Assine agora para continuar usando o sistema.'
              ) : (
                'Escolha o plano ideal para sua barbearia'
              )}
            </p>
          )}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                selectedPlan === plan.id
                  ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-400 transform scale-105 shadow-xl shadow-yellow-400/20'
                  : 'bg-gray-900/50 border border-gray-700 hover:border-yellow-400/30'
              }`}
            >
              {selectedPlan === plan.id && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-bl-lg font-semibold text-sm">
                  Selecionado
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-end mb-6">
                  <span className="text-4xl font-bold text-yellow-400">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Plano Selecionado' : 'Selecionar Plano'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Métodos de Pagamento */}
        <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-2xl border border-gray-700 p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Método de Pagamento</h3>
          
          <div className="space-y-4">
            <div
              onClick={() => setSelectedPaymentMethod('credit_card')}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedPaymentMethod === 'credit_card'
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-yellow-400/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border ${
                selectedPaymentMethod === 'credit_card'
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-gray-500'
              } flex items-center justify-center mr-4`}>
                {selectedPaymentMethod === 'credit_card' && (
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                )}
              </div>
              <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
              <span className="text-white">Cartão de Crédito</span>
            </div>
            
            <div
              onClick={() => setSelectedPaymentMethod('pix')}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedPaymentMethod === 'pix'
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-yellow-400/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border ${
                selectedPaymentMethod === 'pix'
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-gray-500'
              } flex items-center justify-center mr-4`}>
                {selectedPaymentMethod === 'pix' && (
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                )}
              </div>
              <div className="w-6 h-6 text-gray-400 mr-3 flex items-center justify-center font-bold">
                PIX
              </div>
              <span className="text-white">PIX</span>
            </div>
            
            <div
              onClick={() => setSelectedPaymentMethod('boleto')}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedPaymentMethod === 'boleto'
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-yellow-400/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border ${
                selectedPaymentMethod === 'boleto'
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-gray-500'
              } flex items-center justify-center mr-4`}>
                {selectedPaymentMethod === 'boleto' && (
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                )}
              </div>
              <Calendar className="w-6 h-6 text-gray-400 mr-3" />
              <span className="text-white">Boleto Bancário</span>
            </div>
          </div>
        </div>

        {/* Resumo e Botão de Assinatura */}
        <div className="max-w-2xl mx-auto bg-gray-900/50 rounded-2xl border border-gray-700 p-8">
          <h3 className="text-xl font-bold text-white mb-6">Resumo da Assinatura</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Plano</span>
              <span className="text-white font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valor Mensal</span>
              <span className="text-white font-medium">{plans.find(p => p.id === selectedPlan)?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Método de Pagamento</span>
              <span className="text-white font-medium">
                {selectedPaymentMethod === 'credit_card' ? 'Cartão de Crédito' : 
                 selectedPaymentMethod === 'pix' ? 'PIX' : 'Boleto Bancário'}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-300 font-medium">Total</span>
                <span className="text-yellow-400 font-bold text-xl">{plans.find(p => p.id === selectedPlan)?.price}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Sua assinatura será renovada automaticamente a cada mês. Você pode cancelar a qualquer momento pelo painel administrativo.
            </p>
          </div>
          
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>Assinar Agora</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;