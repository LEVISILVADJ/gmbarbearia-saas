import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Clock,
  FileText,
  RefreshCw,
  Download,
  Search,
  Filter,
  Settings,
  Key
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

interface SecurityScan {
  id: string;
  type: 'permissions' | 'database' | 'auth' | 'api';
  status: 'passed' | 'warning' | 'failed';
  findings: number;
  timestamp: string;
  details: string[];
}

const SecurityAudit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(85);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      generateMockData();
      setIsLoading(false);
    }, 1000);
  }, []);

  const generateMockData = () => {
    // Generate mock audit logs
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        userId: 'admin-1',
        userName: 'Administrador',
        action: 'login',
        resource: 'auth',
        details: 'Login bem-sucedido',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date().toISOString(),
        status: 'success'
      },
      {
        id: '2',
        userId: 'barber-1',
        userName: 'Carlos Silva',
        action: 'update',
        resource: 'bookings',
        details: 'Atualização de status de agendamento',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        userId: 'unknown',
        userName: 'Desconhecido',
        action: 'login_failed',
        resource: 'auth',
        details: 'Tentativa de login com credenciais inválidas',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'error'
      },
      {
        id: '4',
        userId: 'admin-1',
        userName: 'Administrador',
        action: 'create',
        resource: 'services',
        details: 'Criação de novo serviço',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'success'
      },
      {
        id: '5',
        userId: 'barber-2',
        userName: 'João Santos',
        action: 'access_denied',
        resource: 'admin_settings',
        details: 'Tentativa de acesso a configurações administrativas',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        status: 'warning'
      }
    ];
    
    // Generate mock security scans
    const mockScans: SecurityScan[] = [
      {
        id: '1',
        type: 'permissions',
        status: 'passed',
        findings: 0,
        timestamp: new Date().toISOString(),
        details: ['Todas as permissões estão configuradas corretamente']
      },
      {
        id: '2',
        type: 'database',
        status: 'warning',
        findings: 2,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: [
          'Índices ausentes em algumas tabelas',
          'Consultas não otimizadas detectadas'
        ]
      },
      {
        id: '3',
        type: 'auth',
        status: 'passed',
        findings: 0,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        details: ['Autenticação segura configurada corretamente']
      },
      {
        id: '4',
        type: 'api',
        status: 'failed',
        findings: 3,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        details: [
          'Endpoints sem rate limiting',
          'Validação de entrada insuficiente',
          'Falta de sanitização de dados'
        ]
      }
    ];
    
    setAuditLogs(mockLogs);
    setSecurityScans(mockScans);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-900/50 border-green-700';
      case 'warning': return 'text-yellow-400 bg-yellow-900/50 border-yellow-700';
      case 'error': return 'text-red-400 bg-red-900/50 border-red-700';
      case 'passed': return 'text-green-400 bg-green-900/50 border-green-700';
      case 'failed': return 'text-red-400 bg-red-900/50 border-red-700';
      default: return 'text-gray-400 bg-gray-900/50 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'permissions': return <Lock className="w-5 h-5" />;
      case 'database': return <FileText className="w-5 h-5" />;
      case 'auth': return <User className="w-5 h-5" />;
      case 'api': return <Settings className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const runSecurityScan = () => {
    setIsLoading(true);
    
    // Simulate scan
    setTimeout(() => {
      const newScan: SecurityScan = {
        id: Date.now().toString(),
        type: 'permissions',
        status: Math.random() > 0.7 ? 'warning' : 'passed',
        findings: Math.random() > 0.7 ? 1 : 0,
        timestamp: new Date().toISOString(),
        details: Math.random() > 0.7 ? ['Algumas permissões podem ser muito permissivas'] : ['Todas as permissões estão configuradas corretamente']
      };
      
      setSecurityScans(prev => [newScan, ...prev]);
      setSecurityScore(Math.floor(Math.random() * 15) + 80); // Random score between 80-95
      setIsLoading(false);
    }, 2000);
  };

  const exportAuditLogs = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderSecurityScore = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Shield className="w-6 h-6 mr-2 text-yellow-400" />
        Pontuação de Segurança
      </h3>
      
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-48 h-48 mb-6 md:mb-0">
          <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
          <div 
            className="absolute inset-0 rounded-full border-8 border-transparent"
            style={{ 
              borderTopColor: securityScore >= 90 ? '#10B981' : securityScore >= 70 ? '#F59E0B' : '#EF4444',
              borderRightColor: securityScore >= 90 ? '#10B981' : securityScore >= 70 ? '#F59E0B' : '#EF4444',
              transform: `rotate(${(securityScore / 100) * 360}deg)`,
              transition: 'transform 1s ease-out'
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-4xl font-bold text-white">{securityScore}</span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
        </div>
        
        <div className="space-y-4 flex-1 md:ml-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Autenticação</span>
              <span className="text-sm font-medium text-green-400">Seguro</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Permissões</span>
              <span className="text-sm font-medium text-green-400">Bom</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Banco de Dados</span>
              <span className="text-sm font-medium text-yellow-400">Atenção</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">API</span>
              <span className="text-sm font-medium text-red-400">Risco</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityScans = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Lock className="w-6 h-6 mr-2 text-yellow-400" />
          Verificações de Segurança
        </h3>
        
        <button
          onClick={runSecurityScan}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Executando...' : 'Executar Verificação'}</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {securityScans.map((scan) => (
          <div key={scan.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  scan.status === 'passed' ? 'bg-green-900/50' : 
                  scan.status === 'warning' ? 'bg-yellow-900/50' : 'bg-red-900/50'
                }`}>
                  {getScanTypeIcon(scan.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-white capitalize">{scan.type}</h4>
                  <p className="text-sm text-gray-400">
                    {format(new Date(scan.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 text-sm rounded-full border ${getStatusColor(scan.status)}`}>
                  {getStatusIcon(scan.status)}
                  <span className="capitalize">{scan.status}</span>
                </span>
                
                {scan.findings > 0 && (
                  <span className="bg-red-900/50 text-red-400 border border-red-700 px-3 py-1 text-sm rounded-full">
                    {scan.findings} {scan.findings === 1 ? 'problema' : 'problemas'}
                  </span>
                )}
              </div>
            </div>
            
            {scan.findings > 0 && (
              <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <h5 className="text-sm font-medium text-white mb-2">Detalhes:</h5>
                <ul className="space-y-1">
                  {scan.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                      <span className="text-red-400">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <FileText className="w-6 h-6 mr-2 text-yellow-400" />
          Logs de Auditoria
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-gray-400 transition-all duration-300"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white"
          >
            <option value="all">Todos</option>
            <option value="success">Sucesso</option>
            <option value="warning">Alerta</option>
            <option value="error">Erro</option>
          </select>
          
          <button
            onClick={exportAuditLogs}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum log encontrado</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                    log.status === 'success' ? 'bg-green-900/50' : 
                    log.status === 'warning' ? 'bg-yellow-900/50' : 'bg-red-900/50'
                  }`}>
                    {getStatusIcon(log.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white capitalize">{log.action.replace('_', ' ')}</h4>
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs rounded-full border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{log.userName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{log.resource}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-right">
                  <div>{log.ipAddress}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Segurança e Auditoria</h2>
        <p className="text-gray-400">Monitore a segurança do sistema e atividades dos usuários</p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Status de Segurança</p>
              <p className="text-3xl font-bold text-white">Protegido</p>
            </div>
            <Shield className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Último Backup</p>
              <p className="text-3xl font-bold text-white">Hoje</p>
              <p className="text-sm text-blue-300 mt-1">08:00</p>
            </div>
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">Tentativas de Login</p>
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-sm text-yellow-300 mt-1">Hoje</p>
            </div>
            <Key className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Usuários Ativos</p>
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm text-purple-300 mt-1">Nas últimas 24h</p>
            </div>
            <User className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>

      {renderSecurityScore()}
      {renderSecurityScans()}
      {renderAuditLogs()}
    </div>
  );
};

export default SecurityAudit;