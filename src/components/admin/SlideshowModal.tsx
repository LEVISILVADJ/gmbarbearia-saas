import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image, FileText } from 'lucide-react';
import { db, type SlideshowImage } from '../../lib/supabase';

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  image?: SlideshowImage | null;
  onSave: () => void;
}

const SlideshowModal: React.FC<SlideshowModalProps> = ({ isOpen, onClose, image, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    alt_text: '',
    order_index: 0,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title,
        image_url: image.image_url,
        alt_text: image.alt_text || '',
        order_index: image.order_index,
        is_active: image.is_active
      });
    } else {
      setFormData({
        title: '',
        image_url: '',
        alt_text: '',
        order_index: 0,
        is_active: true
      });
    }
  }, [image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (image) {
        await db.slideshow.update(image.id, formData);
      } else {
        await db.slideshow.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving slideshow image:', error);
      alert('Erro ao salvar imagem. Tente novamente.');
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
              {image ? 'Editar Imagem' : 'Nova Imagem'}
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
              <FileText className="w-4 h-4 inline mr-2" />
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              URL da Imagem
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              placeholder="https://exemplo.com/imagem.jpg"
              required
            />
          </div>

          {formData.image_url && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                Pré-visualização
              </label>
              <div className="relative rounded-lg overflow-hidden border border-gray-700">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texto Alternativo
            </label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              placeholder="Descrição da imagem para acessibilidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ordem de Exibição
            </label>
            <input
              type="number"
              min="0"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
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
              Imagem ativa
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

export default SlideshowModal;