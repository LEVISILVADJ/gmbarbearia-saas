import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Loader } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    business_name: '',
    subdomain: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    
    // Limpar status de disponibilidade do subdomínio quando ele é alterado
    if (name === 'subdomain') {
      setSubdomainAvailable(null);
    }
  };

  const checkSubdomain = async () => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }
    
    setIsCheckingSubdomain(true);
    
    try {
      const result = await authService.checkSubdomain(formData.subdomain);
      setSubdomainAvailable(result.available);
    } catch (error) {
      console.error('Erro ao verificar subdomínio:', error);
      setSubdomainAvailable(false);
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // Verificar disponibilidade do subdomínio antes de enviar
      if (subdomainAvailable !== true) {
        await checkSubdomain();
        if (subdomainAvailable === false) {
          setErrors({ subdomain: 'Este subdomínio já está em uso' });
          setIsLoading(false);
          return;
        }
      }
      
      const response = await authService.register(formData);
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: error.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11110f] via-gray-900 to-[#11110f] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5"></div>
      <div className="relative max-w-md w-full">
        <div className="bg-gray-900/80 rounded-xl shadow-2xl p-8 border border-gray-700 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img 
                src="/WhatsApp Image 2025-06-26 at 08.22.png" 
                alt="GM Barbearia Logo" 
                className="w-16 h-16 mx-auto rounded-full shadow-lg shadow-yellow-400/20"
              />
              <div className="absolute inset-0 rounded-full bg-yellow-400/10 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-white">Crie sua Barbearia</h1>
            <p className="text-gray-400">Comece seu período de teste gratuito de 10 dias</p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Informações Pessoais</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                  required
                />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-400">{errors.password_confirmation}</p>}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Informações da Barbearia</h2>
              
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Barbearia
                </label>
                <input
                  type="text"
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className={`w-full p-3 bg-gray-800/50 border ${errors.business_name ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                  required
                />
                {errors.business_name && <p className="mt-1 text-sm text-red-400">{errors.business_name}</p>}
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-300 mb-2">
                  Subdomínio
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    onBlur={checkSubdomain}
                    className={`w-full p-3 bg-gray-800/50 border ${
                      errors.subdomain ? 'border-red-500' : 
                      subdomainAvailable === true ? 'border-green-500' : 
                      subdomainAvailable === false ? 'border-red-500' : 
                      'border-gray-700'
                    } rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isCheckingSubdomain && (
                      <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!isCheckingSubdomain && subdomainAvailable === true && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {!isCheckingSubdomain && subdomainAvailable === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-400">https://</span>
                  <span className="text-sm text-yellow-400">{formData.subdomain || 'suabarbearia'}</span>
                  <span className="text-sm text-gray-400">.gmbarbearia.com</span>
                </div>
                {errors.subdomain && <p className="mt-1 text-sm text-red-400">{errors.subdomain}</p>}
                {!errors.subdomain && subdomainAvailable === false && (
                  <p className="mt-1 text-sm text-red-400">Este subdomínio já está em uso</p>
                )}
                {!errors.subdomain && subdomainAvailable === true && (
                  <p className="mt-1 text-sm text-green-400">Subdomínio disponível</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 text-sm text-yellow-300">
              <p>Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
              <p className="mt-2">Você terá acesso gratuito por 10 dias. Após esse período, será necessário assinar um plano para continuar utilizando o sistema.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || isCheckingSubdomain || subdomainAvailable === false}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50 hover:scale-105"
            >
              {isLoading ? 'Criando sua barbearia...' : 'Criar Minha Barbearia'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Já tem uma conta? Faça login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;