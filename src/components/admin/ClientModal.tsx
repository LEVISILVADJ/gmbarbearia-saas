import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Calendar, Mail } from 'lucide-react';
import { db, type Client } from '../../lib/supabase';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone || '',
        birth_date: client.birth_date || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        birth_date: ''
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!formData.phone.trim()) {
        throw new Error('Telefone é obrigatório');
      }

      // Clean the data
      const cleanData = {
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''), // Remove non-digits
        birth_date: formData.birth_date || null
      };

      if (client) {
        await db.clients.update(client.id, cleanData);
      } else {
        await db.clients.create(cleanData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      alert(`Erro ao salvar cliente: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {client ? 'Editar Cliente' : 'Novo Cliente'}
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Digite apenas números (ex: 11999999999)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Nascimento
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
            />
            <p className="text-xs text-gray-500 mt-2">
              Para envio de mensagens de aniversário e ofertas especiais
            </p>
          </div>

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

export default ClientModal;