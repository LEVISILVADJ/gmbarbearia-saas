import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Settings,
  Lock,
  Trash2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number;
  includeFiles: boolean;
  includeDatabase: boolean;
  encryptBackups: boolean;
  lastBackup: string | null;
  nextBackup: string | null;
}

interface BackupHistory {
  id: string;
  timestamp: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed';
  downloadUrl?: string;
}

const BackupSettings: React.FC = () => {
  const [settings, setSettings] = useState<BackupSettings>({
    enabled: true,
    frequency: 'daily',
    time: '03:00',
    retention: 7,
    includeFiles: true,
    includeDatabase: true,
    encryptBackups: true,
    lastBackup: '2024-12-25T03:00:00Z',
    nextBackup: '2024-12-26T03:00:00Z'
  });

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: '1',
      timestamp: '2024-12-25T03:00:00Z',
      size: '24.5 MB',
      type: 'auto',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '2',
      timestamp: '2024-12-24T03:00:00Z',
      size: '24.2 MB',
      type: 'auto',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '3',
      timestamp: '2024-12-23T03:00:00Z',
      size: '23.8 MB',
      type: 'auto',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '4',
      timestamp: '2024-12-22T15:30:00Z',
      size: '23.5 MB',
      type: 'manual',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '5',
      timestamp: '2024-12-21T03:00:00Z',
      size: '0 KB',
      type: 'auto',
      status: 'failed'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSettingsChange = (field: keyof BackupSettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Configurações de backup salvas com sucesso!');
    }, 1000);
  };

  const createManualBackup = () => {
    setIsLoading(true);
    
    // Simulate backup creation
    setTimeout(() => {
      const newBackup: BackupHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        size: '24.8 MB',
        type: 'manual',
        status: 'success',
        downloadUrl: '#'
      };
      
      setBackupHistory([newBackup, ...backupHistory]);
      setSettings({
        ...settings,
        lastBackup: newBackup.timestamp
      });
      
      setIsLoading(false);
      alert('Backup manual criado com sucesso!');
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const restoreBackup = () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo de backup para restaurar.');
      return;
    }
    
    if (!confirm('ATENÇÃO: Restaurar um backup irá substituir todos os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?')) {
      return;
    }
    
    setIsRestoring(true);
    
    // Simulate restore process
    setTimeout(() => {
      setIsRestoring(false);
      setSelectedFile(null);
      alert('Backup restaurado com sucesso!');
    }, 3000);
  };

  const downloadBackup = (id: string) => {
    // Simulate download
    alert(`Iniciando download do backup ${id}`);
  };

  const deleteBackup = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este backup?')) {
      return;
    }
    
    setBackupHistory(prev => prev.filter(backup => backup.id !== id));
    alert('Backup excluído com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Backup e Restauração</h2>
        <p className="text-gray-400">Configure backups automáticos e restaure dados</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Último Backup</p>
              <p className="text-xl font-bold text-white">
                {settings.lastBackup ? format(new Date(settings.lastBackup), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'}
              </p>
              <p className="text-sm text-blue-300 mt-1">
                {settings.lastBackup ? format(new Date(settings.lastBackup), 'HH:mm', { locale: ptBR }) : ''}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Próximo Backup</p>
              <p className="text-xl font-bold text-white">
                {settings.nextBackup ? format(new Date(settings.nextBackup), 'dd/MM/yyyy', { locale: ptBR }) : 'Não agendado'}
              </p>
              <p className="text-sm text-green-300 mt-1">
                {settings.nextBackup ? format(new Date(settings.nextBackup), 'HH:mm', { locale: ptBR }) : ''}
              </p>
            </div>
            <Clock className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Status</p>
              <p className="text-xl font-bold text-white">
                {settings.enabled ? 'Ativo' : 'Desativado'}
              </p>
              <p className="text-sm text-yellow-300 mt-1">
                {settings.frequency === 'daily' ? 'Diário' : 
                 settings.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-yellow-400" />
          Configurações de Backup
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enabled"
              checked={settings.enabled}
              onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
              className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-300">
              Ativar backups automáticos
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequência
              </label>
              <select
                value={settings.frequency}
                onChange={(e) => handleSettingsChange('frequency', e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário
              </label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => handleSettingsChange('time', e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retenção (dias)
              </label>
              <input
                type="number"
                value={settings.retention}
                onChange={(e) => handleSettingsChange('retention', parseInt(e.target.value))}
                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeDatabase"
                checked={settings.includeDatabase}
                onChange={(e) => handleSettingsChange('includeDatabase', e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="includeDatabase" className="text-sm font-medium text-gray-300">
                Incluir banco de dados
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeFiles"
                checked={settings.includeFiles}
                onChange={(e) => handleSettingsChange('includeFiles', e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="includeFiles" className="text-sm font-medium text-gray-300">
                Incluir arquivos
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="encryptBackups"
                checked={settings.encryptBackups}
                onChange={(e) => handleSettingsChange('encryptBackups', e.target.checked)}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="encryptBackups" className="text-sm font-medium text-gray-300">
                Criptografar backups
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Backup and Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Download className="w-6 h-6 mr-2 text-yellow-400" />
            Backup Manual
          </h3>
          
          <div className="space-y-6">
            <p className="text-gray-400">
              Crie um backup manual completo do sistema. O backup inclui banco de dados e arquivos.
            </p>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="manualIncludeDatabase"
                checked={true}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="manualIncludeDatabase" className="text-sm font-medium text-gray-300">
                Incluir banco de dados
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="manualIncludeFiles"
                checked={true}
                className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
              />
              <label htmlFor="manualIncludeFiles" className="text-sm font-medium text-gray-300">
                Incluir arquivos
              </label>
            </div>
            
            <button
              onClick={createManualBackup}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isLoading ? 'Criando Backup...' : 'Criar Backup Agora'}</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-yellow-400" />
            Restaurar Backup
          </h3>
          
          <div className="space-y-6">
            <p className="text-gray-400">
              Restaure o sistema a partir de um arquivo de backup. Todos os dados atuais serão substituídos.
            </p>
            
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">
                  <strong>Atenção:</strong> Restaurar um backup irá substituir todos os dados atuais. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Selecione o arquivo de backup
              </label>
              <input
                type="file"
                accept=".zip,.sql,.json"
                onChange={handleFileChange}
                className="block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700 focus:outline-none"
              />
              {selectedFile && (
                <p className="text-sm text-gray-400">
                  Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <button
              onClick={restoreBackup}
              disabled={!selectedFile || isRestoring}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isRestoring ? 'Restaurando...' : 'Restaurar Backup'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-yellow-400" />
          Histórico de Backups
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Data e Hora</th>
                <th className="text-left p-4 text-gray-300 font-medium">Tipo</th>
                <th className="text-left p-4 text-gray-300 font-medium">Tamanho</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200">
                  <td className="p-4">
                    <div className="font-medium text-white">
                      {format(new Date(backup.timestamp), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(backup.timestamp), 'HH:mm', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      backup.type === 'auto' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'
                    }`}>
                      {backup.type === 'auto' ? 'Automático' : 'Manual'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-300">{backup.size}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      backup.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {backup.status === 'success' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Sucesso</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Falha</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {backup.status === 'success' && (
                        <button
                          onClick={() => downloadBackup(backup.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;