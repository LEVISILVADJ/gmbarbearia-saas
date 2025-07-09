import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Clock, FileText, Smile } from 'lucide-react';
import { db, type Service } from '../../lib/supabase';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSave: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    icon: '✂️',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const iconOptions = [
    '✂️', '🧔', '🪒', '👁️', '💇‍♂️', '💈', '🎯', '⭐', '🔥', '💎',
    '👑', '🎨', '✨', '🌟', '💫', '🎪', '🎭', '🎨', '🎯', '🏆'
  ];

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration_minutes: service.duration_minutes,
        icon: service.icon,
        is_active: service.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30,
        icon: '✂️',
        is_active: true
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (service) {
        await db.services.update(service.id, formData);
      } else {
        await db.services.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {service ? 'Editar Serviço' : 'Novo Serviço'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Nome do Serviço
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                placeholder="Descrição do serviço..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Preço (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Duração (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Smile className="w-4 h-4 inline mr-2" />
                Ícone do Serviço
              </label>
              <div className="grid grid-cols-10 gap-2 mb-3">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-3 text-2xl rounded-lg border transition-all duration-300 hover:scale-110 ${
                      formData.icon === icon
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-gray-700 bg-gray-800/50 hover:border-yellow-400/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <span className="text-2xl">{formData.icon}</span>
                <span className="text-gray-300">Ícone selecionado</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
              Serviço ativo
            </label>
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

export default ServiceModal;