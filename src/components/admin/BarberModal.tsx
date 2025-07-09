import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, User, Mail, Phone, Star, Calendar, Tag, Camera, Image, Lock, Eye, EyeOff } from 'lucide-react';
import { db, type Barber } from '../../lib/supabase';
import { authService } from '../../lib/auth';

interface BarberModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber?: Barber | null;
  onSave: () => void;
}

const BarberModal: React.FC<BarberModalProps> = ({ isOpen, onClose, barber, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo_url: '',
    specialties: [] as string[],
    rating: 0,
    experience_years: 0,
    is_active: true,
    password: ''
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (barber) {
      setFormData({
        name: barber.name,
        email: barber.email,
        phone: barber.phone || '',
        photo_url: barber.photo_url || '',
        specialties: barber.specialties || [],
        rating: barber.rating,
        experience_years: barber.experience_years,
        is_active: barber.is_active,
        password: '' // Don't show existing password
      });
      setPreviewUrl(barber.photo_url || '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        photo_url: '',
        specialties: [],
        rating: 0,
        experience_years: 0,
        is_active: true,
        password: ''
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setUploadMethod('url');
    setShowPassword(false);
  }, [barber]);

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
        // Also update the form data with the preview URL for now
        setFormData(prev => ({ ...prev, photo_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // Using a public ImgBB API key for demo purposes
    // In production, you should use your own API key and handle this server-side
    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Falha no upload da imagem');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl = formData.photo_url;

      // If user selected a file, we'll use the base64 data URL for now
      // In production, you would upload to a proper image hosting service
      if (selectedFile && uploadMethod === 'file') {
        // For demo purposes, we'll use the base64 data URL
        // In production, you should upload to a service like Cloudinary, AWS S3, etc.
        photoUrl = previewUrl;
        
        console.log('Using file upload with base64 data URL');
      } else if (uploadMethod === 'url' && formData.photo_url) {
        // Validate URL format
        try {
          new URL(formData.photo_url);
          photoUrl = formData.photo_url;
        } catch {
          alert('Por favor, insira uma URL válida para a imagem.');
          setIsLoading(false);
          return;
        }
      }

      // Ensure we have a valid photo URL or use a default
      if (!photoUrl || photoUrl.trim() === '') {
        photoUrl = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300';
      }

      const dataToSave = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        photo_url: photoUrl,
        specialties: formData.specialties,
        rating: Number(formData.rating),
        experience_years: Number(formData.experience_years),
        is_active: formData.is_active
      };

      console.log('Saving barber data:', dataToSave);

      let savedBarber;
      if (barber) {
        savedBarber = await db.barbers.update(barber.id, dataToSave);
        
        // If password is provided for existing barber, update their auth
        if (formData.password && formData.password.trim()) {
          try {
            // For existing barbers, we need to handle password updates differently
            // This would typically require admin privileges or a password reset flow
            alert('Barbeiro atualizado com sucesso! Para alterar a senha, use a função de redefinição de senha.');
          } catch (authError) {
            console.error('Error updating auth user:', authError);
            alert('Barbeiro atualizado, mas houve um problema ao atualizar as credenciais.');
          }
        } else {
          alert('Barbeiro atualizado com sucesso!');
        }
        
        console.log('Barber updated successfully:', savedBarber);
      } else {
        savedBarber = await db.barbers.create(dataToSave);
        console.log('Barber created successfully:', savedBarber);

        // For new barbers, create auth user if password is provided
        if (formData.password && formData.password.trim()) {
          try {
            console.log('Creating auth user for new barber...');
            const { data: authData } = await authService.signUp(formData.email, formData.password, {
              role: 'barber',
              name: formData.name,
              email_confirm: false // Skip email confirmation
            });
            
            // Link the barber record to the user
            if (authData.user?.id && savedBarber.id) {
              await db.barbers.linkToUser(savedBarber.id, authData.user.id);
            }
            
            alert(`Barbeiro criado com sucesso!\n\nCredenciais de acesso:\nE-mail: ${formData.email}\nSenha: ${formData.password}\n\nO barbeiro já pode fazer login no sistema.`);
          } catch (authError) {
            console.error('Error creating auth user:', authError);
            alert('Barbeiro criado, mas houve um problema ao configurar as credenciais de acesso. Use o botão "Criar Contas Barbeiros" na tela de login.');
          }
        } else {
          alert('Barbeiro criado com sucesso! Defina uma senha para permitir o login.');
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving barber:', error);
      alert('Erro ao salvar barbeiro. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, photo_url: url });
    setPreviewUrl(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {barber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
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
                <Camera className="w-4 h-4 inline mr-2" />
                Foto do Barbeiro
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
                        console.log('Image load error, using fallback');
                        e.currentTarget.src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300';
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
                    value={formData.photo_url}
                    onChange={handlePhotoUrlChange}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Cole a URL de uma imagem ou deixe em branco para usar a foto padrão
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Star className="w-4 h-4 inline mr-2" />
                    Avaliação (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Anos de Experiência
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-yellow-400" />
                  Credenciais de Acesso
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Senha para o Painel do Barbeiro
                      {!barber && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-3 pr-20 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                        placeholder={barber ? "Deixe em branco para manter a senha atual" : "Digite uma senha"}
                        required={!barber}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-black rounded font-medium transition-all duration-300"
                        >
                          Gerar
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {barber 
                        ? "Esta senha será usada para acessar o painel do barbeiro. Deixe em branco para manter a senha atual."
                        : "Esta senha será usada para acessar o painel do barbeiro. Mínimo 6 caracteres."
                      }
                    </p>
                  </div>
                  
                  {formData.password && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <strong>Credenciais de acesso:</strong><br />
                        E-mail: {formData.email}<br />
                        Senha: {showPassword ? formData.password : '••••••••'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Especialidades
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                    placeholder="Digite uma especialidade"
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gray-800/50 text-gray-300 text-sm px-3 py-1 rounded-full border border-gray-700"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
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
                  Barbeiro ativo
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

export default BarberModal;