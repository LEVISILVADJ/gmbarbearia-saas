import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Image, FileText, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Trash2, Edit, Plus } from 'lucide-react';
import { db, type GalleryImage } from '../../lib/supabase';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  image?: GalleryImage | null;
  onSave: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, image, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    alt_text: '',
    description: '',
    order_index: 0,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title,
        image_url: image.image_url,
        alt_text: image.alt_text || '',
        description: image.description || '',
        order_index: image.order_index,
        is_active: image.is_active
      });
      setPreviewUrl(image.image_url);
    } else {
      setFormData({
        title: '',
        image_url: '',
        alt_text: '',
        description: '',
        order_index: 0,
        is_active: true
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setUploadMethod('url');
  }, [image]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setFormData(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url;

      // If user selected a file, use the base64 data URL
      if (selectedFile && uploadMethod === 'file') {
        imageUrl = previewUrl;
      } else if (uploadMethod === 'url' && formData.image_url) {
        // Validate URL format
        try {
          new URL(formData.image_url);
          imageUrl = formData.image_url;
        } catch {
          alert('Por favor, insira uma URL válida para a imagem.');
          setIsLoading(false);
          return;
        }
      }

      // Ensure we have a valid image URL
      if (!imageUrl || imageUrl.trim() === '') {
        alert('Por favor, selecione uma imagem ou insira uma URL válida.');
        setIsLoading(false);
        return;
      }

      const dataToSave = {
        title: formData.title.trim(),
        image_url: imageUrl,
        alt_text: formData.alt_text.trim(),
        description: formData.description.trim(),
        order_index: Number(formData.order_index),
        is_active: formData.is_active
      };

      if (image) {
        await db.gallery.update(image.id, dataToSave);
      } else {
        await db.gallery.create(dataToSave);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving gallery image:', error);
      alert('Erro ao salvar imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setPreviewUrl(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {image ? 'Editar Imagem da Galeria' : 'Nova Imagem da Galeria'}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Upload Section */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                <Image className="w-4 h-4 inline mr-2" />
                Imagem da Galeria
              </label>
              
              {/* Upload Method Toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    uploadMethod === 'url'
                      ? 'bg-yellow-600 text-black font-medium'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    uploadMethod === 'file'
                      ? 'bg-yellow-600 text-black font-medium'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  Upload
                </button>
              </div>

              {/* Photo Preview */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Image className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Nenhuma imagem selecionada</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              {uploadMethod === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={handlePhotoUrlChange}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Cole a URL de uma imagem ou deixe em branco para usar a imagem padrão
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-yellow-400/50 transition-all duration-300 text-gray-300 hover:text-yellow-400"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{selectedFile ? selectedFile.name : 'Selecionar Arquivo'}</span>
                  </button>
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Título da Imagem
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  placeholder="Ex: Corte Degradê Moderno"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Texto Alternativo (Alt Text)
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
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  placeholder="Descrição detalhada do trabalho..."
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
                  Imagem ativa na galeria
                </label>
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

export default GalleryModal;