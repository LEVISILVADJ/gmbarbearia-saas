import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Calendar, ArrowLeft, Clock } from 'lucide-react';
import { db, supabase } from '../../lib/supabase';

interface RetentionMessage {
  id: string;
  title: string;
  message_template: string;
  days_inactive: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RetentionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: RetentionMessage | null;
  onSave: () => void;
}

const RetentionMessageModal: React.FC<RetentionMessageModalProps> = ({ isOpen, onClose, message, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    message_template: '',
    days_inactive: 60,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewName, setPreviewName] = useState('João Silva');

  useEffect(() => {
    if (message) {
      setFormData({
        title: message.title,
        message_template: message.message_template,
        days_inactive: message.days_inactive,
        is_active: message.is_active
      });
    } else {
      setFormData({
        title: '',
        message_template: '',
        days_inactive: 60,
        is_active: true
      });
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      
      if (!formData.message_template.trim()) {
        throw new Error('Modelo de mensagem é obrigatório');
      }
      
      if (formData.days_inactive < 1) {
        throw new Error('Dias de inatividade deve ser maior que zero');
      }

      // Clean the data
      const cleanData = {
        title: formData.title.trim(),
        message_template: formData.message_template.trim(),
        days_inactive: formData.days_inactive,
        is_active: formData.is_active
      };

      // Create or update the message in the database
      if (message) {
        // Update existing message
        await supabase
          .from('retention_messages')
          .update(cleanData)
          .eq('id', message.id);
      } else {
        // Create new message
        await supabase
          .from('retention_messages')
          .insert([cleanData]);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving retention message:', error);
      alert(`Erro ao salvar mensagem: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewMessage = () => {
    let preview = formData.message_template.replace('{client_name}', previewName);
    preview = preview.replace('{days_inactive}', formData.days_inactive.toString());
    return preview;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {message ? 'Editar Mensagem de Retorno' : 'Nova Mensagem de Retorno'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Título da Mensagem
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  placeholder="Ex: Mensagem de Retorno - 60 dias"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Dias de Inatividade
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.days_inactive}
                  onChange={(e) => setFormData({ ...formData, days_inactive: parseInt(e.target.value) || 60 })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Número de dias sem retornar para enviar esta mensagem
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Modelo de Mensagem
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Use {'{client_name}'} para inserir o nome do cliente e {'{days_inactive}'} para o número de dias sem retornar.
                </p>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  rows={12}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300 font-mono"
                  placeholder="👋 *Olá, {client_name}!*\n\nSentimos sua falta na GM Barbearia! Já faz mais de {days_inactive} dias desde sua última visita."
                  required
                />
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
                  Mensagem ativa
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Prévia da Mensagem
                </label>
                <div className="mb-3">
                  <input
                    type="text"
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value)}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                    placeholder="Nome para prévia"
                  />
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 whitespace-pre-line h-[400px] overflow-y-auto">
                  <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-orange-800 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-400 font-medium">WhatsApp</p>
                        <p className="text-xs text-orange-500">Mensagem de Retorno</p>
                      </div>
                    </div>
                    <div className="text-orange-300 text-sm font-mono">
                      {getPreviewMessage()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default RetentionMessageModal;