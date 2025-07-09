import React, { useState } from 'react';
import Header from '../components/Header';
import { MapPin, Phone, Clock, Mail, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria enviado o formulário
    alert('Mensagem enviada com sucesso!');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#11110f]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Contato</span>
          </h1>
          <p className="text-lg text-gray-400">Estamos aqui para atender você da melhor forma</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Informações de Contato */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Informações de Contato</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">Endereço</h3>
                  <p className="text-gray-400">Rua das Flores, 123 - Centro<br />São Paulo - SP, 01234-567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">Telefone</h3>
                  <p className="text-gray-400">(11) 99999-9999</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">E-mail</h3>
                  <p className="text-gray-400">contato@gmbarbearia.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300">Horário de Funcionamento</h3>
                  <div className="text-gray-400">
                    <p>Segunda a Sexta: 8h às 18h</p>
                    <p>Sábado: 8h às 16h</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Localização</h3>
              <div className="bg-gray-900/50 rounded-lg h-64 flex items-center justify-center border border-gray-700">
                <p className="text-gray-500">Mapa da localização</p>
              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div>
            <div className="bg-gray-900/50 rounded-xl shadow-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Envie uma Mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;