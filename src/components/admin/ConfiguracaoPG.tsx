import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  FileText,
  Palette,
  RefreshCw,
  Check,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { db, type BusinessSettings } from '../../lib/supabase';

const ConfiguracaoPG: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settingsData = await db.settings.get();
      setSettings(settingsData);
      setPreviewUrl(settingsData.logo_url || '');
      
      // Set theme mode from settings if available
      if (settingsData.theme_mode) {
        setThemeMode(settingsData.theme_mode as 'dark' | 'light');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    if (settings) {
      setSettings({ ...settings, logo_url: url });
    }
  };

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (settings) {
      const newOpeningHours = { ...settings.opening_hours };
      newOpeningHours[day] = {
        ...newOpeningHours[day],
        [field]: value
      };
      
      setSettings({
        ...settings,
        opening_hours: newOpeningHours
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    console.log('Starting save process with settings:', JSON.stringify(settings, null, 2));
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Create a clean copy of the settings object
      const { id, created_at, updated_at, ...settingsToSave } = settings;
      
      console.log('Saving settings (cleaned):', JSON.stringify(settingsToSave, null, 2));
      
      // If using file upload, we would normally upload to storage here
      // For now, we'll just use the base64 data URL for demo purposes
      let logoUrl = settings.logo_url;
      
      if (uploadMethod === 'file' && selectedFile) {
        // In a real implementation, you would upload to Supabase Storage
        // and get a URL back. For now, we'll just use the preview URL
        logoUrl = previewUrl;
      }
      
      // Create the final settings object to save
      const updatedSettings: Partial<BusinessSettings> = {
        ...settingsToSave,
        logo_url: logoUrl,
        theme_mode: themeMode,
        tenant_id: null // Ensure tenant_id is null for single-tenant setup
      };
      
      console.log('Final settings to save:', JSON.stringify(updatedSettings, null, 2));
      
      await db.settings.update(updatedSettings);
      
      console.log('Settings saved successfully');
      
      setSaveMessage({
        type: 'success',
        text: 'Configurações salvas com sucesso!'
      });
      
      // Reload settings to get the latest data
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error instanceof Error ? error.message : error);
      setSaveMessage({
        type: 'error',
        text: `Erro ao salvar configurações: ${error instanceof Error ? error.message.replace('new row violates row-level security policy for table "business_settings"', 'Permissões insuficientes. Verifique se você está logado como administrador.') : 'Erro desconhecido'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-700">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-white mb-2">Erro ao carregar configurações</p>
        <p className="text-gray-400 mb-4">Não foi possível carregar as configurações da barbearia.</p>
        <button
          onClick={loadSettings}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Configurações da Página</h2>
        <p className="text-gray-400">Personalize a aparência e informações da sua barbearia</p>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-900/20 border border-green-700 text-green-400' 
            : 'bg-red-900/20 border border-red-700 text-red-400'
        }`}>
          <div className="flex items-center space-x-2">
            {saveMessage.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo and Colors Section */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-between">
            <div className="flex items-center">
            <ImageIcon className="w-6 h-6 mr-2 text-yellow-400" />
            Logo e Cores
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Tema:</span>
              <button
                onClick={() => setThemeMode('light')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  themeMode === 'light'
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title="Tema Claro"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  themeMode === 'dark'
                    ? 'bg-yellow-600 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title="Tema Escuro"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </h3>
          
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Logo da Barbearia
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

              {/* Logo Preview */}
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto bg-gray-800/50 rounded-full border border-gray-700 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Logo preview failed to load');
                        e.currentTarget.src = '/WhatsApp Image 2025-06-26 at 08.22.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              {uploadMethod === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={settings.logo_url || ''}
                    onChange={handleLogoUrlChange}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                    placeholder="https://exemplo.com/logo.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Cole a URL de uma imagem ou deixe em branco para usar a logo padrão
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

            {/* Theme Preview */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prévia do Tema
              </label>
              <div className={`p-4 rounded-lg border ${
                themeMode === 'light' 
                  ? 'bg-white border-gray-300' 
                  : 'bg-gray-900 border-gray-700'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                       style={{ 
                         background: `linear-gradient(to right, ${settings.primary_color || '#f59e0b'}, ${settings.secondary_color || '#ea580c'})` 
                       }}>
                    <span className={`text-sm font-bold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>GM</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      {settings.business_name || 'GM Barbearia'}
                    </h4>
                    <p className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Estilo e Tradição
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Esta é uma prévia de como o tema {themeMode === 'light' ? 'claro' : 'escuro'} ficará no site.
              </p>
            </div>

            {/* Color Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Cor Principal
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.primary_color || '#f59e0b'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color || '#f59e0b'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.secondary_color || '#ea580c'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color || '#ea580c'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg" style={{
              background: `linear-gradient(to right, ${settings.primary_color || '#f59e0b'}, ${settings.secondary_color || '#ea580c'})`,
            }}>
              <p className="text-center font-bold text-black">Prévia do Gradiente</p>
            </div>
          </div>
        </div>

        {/* Business Information Section */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-yellow-400" />
            Informações da Barbearia
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Nome da Barbearia (Título Principal)
              </label>
              <input
                type="text"
                value={settings.business_name || ''}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Descrição da Barbearia (Seção Sobre)
              </label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={5}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                placeholder="Descreva sua barbearia em detalhes. Este texto aparecerá APENAS na seção 'Sobre' da página inicial."
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">
                <strong>IMPORTANTE:</strong> Esta descrição aparecerá APENAS na seção "Sobre" da página inicial e é completamente independente do endereço no rodapé
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone (Rodapé)
                </label>
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-mail (Rodapé)
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Endereço Resumido (Apenas Rodapé)
              </label>
              <input
                type="text"
                value={settings.footer_address || ''}
                onChange={(e) => setSettings({ ...settings, footer_address: e.target.value })}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white transition-all duration-300"
                placeholder="Endereço curto APENAS para o rodapé (ex: Rua das Flores, 123 - Centro)"
              />
              <p className="text-xs text-gray-500 mt-2">
                <strong>IMPORTANTE:</strong> Este endereço aparecerá APENAS no rodapé e NÃO afeta a descrição da barbearia na seção Sobre
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours Section */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-yellow-400" />
          Horário de Funcionamento
        </h3>
        
        <div className="space-y-4">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
            const dayNames: { [key: string]: string } = {
              monday: 'Segunda-feira',
              tuesday: 'Terça-feira',
              wednesday: 'Quarta-feira',
              thursday: 'Quinta-feira',
              friday: 'Sexta-feira',
              saturday: 'Sábado',
              sunday: 'Domingo'
            };
            
            const dayData = settings.opening_hours[day];
            
            return (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-300">{dayNames[day]}</div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="time"
                    value={dayData.open}
                    onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                    disabled={dayData.closed}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white disabled:opacity-50"
                  />
                  <span className="text-gray-400">até</span>
                  <input
                    type="time"
                    value={dayData.close}
                    onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                    disabled={dayData.closed}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white disabled:opacity-50"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`closed-${day}`}
                    checked={dayData.closed}
                    onChange={(e) => handleOpeningHoursChange(day, 'closed', e.target.checked)}
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                  />
                  <label htmlFor={`closed-${day}`} className="text-sm font-medium text-gray-300">
                    Fechado
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </div>
  );
};

export default ConfiguracaoPG;