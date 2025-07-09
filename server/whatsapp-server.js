import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.WHATSAPP_PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Store WhatsApp data
let whatsappClient = null;
let currentQRCode = null;
let sessionStatus = 'disconnected';
let connectionState = 'disconnected';
let qrAttempts = 0;
let initializationError = null;

// Check if environment supports Chrome/Puppeteer
function checkEnvironmentSupport() {
  // Check if we're in a supported environment
  const isWebContainer = process.env.SHELL && process.env.SHELL.includes('zsh') && process.env.PWD && process.env.PWD.includes('/home/project');
  const isReplit = process.env.REPL_ID || process.env.REPLIT_DB_URL;
  const isCodeSandbox = process.env.CODESANDBOX_SSE;
  const isGitpod = process.env.GITPOD_WORKSPACE_ID;
  
  if (isWebContainer || isReplit || isCodeSandbox || isGitpod) {
    return {
      supported: false,
      reason: 'WhatsApp server requires a full Linux environment with Chrome. Current environment does not support Puppeteer/Chrome.',
      environment: isWebContainer ? 'WebContainer' : isReplit ? 'Replit' : isCodeSandbox ? 'CodeSandbox' : 'Gitpod'
    };
  }
  
  return { supported: true };
}

// Initialize WhatsApp client (only if environment supports it)
async function initializeWhatsApp() {
  try {
    console.log('\n🔍 Verificando suporte do ambiente...');
    
    const envCheck = checkEnvironmentSupport();
    if (!envCheck.supported) {
      const errorMsg = `❌ Ambiente não suportado: ${envCheck.environment}\n${envCheck.reason}`;
      console.log(errorMsg);
      sessionStatus = 'unsupported_environment';
      initializationError = errorMsg;
      return null;
    }
    
    console.log('✅ Ambiente suportado, inicializando WhatsApp...');
    
    // Dynamic import of WPPConnect (only load if environment supports it)
    const { create } = await import('@wppconnect-team/wppconnect');
    
    console.log('🚀 Inicializando cliente WhatsApp WPPConnect...');
    console.log('📁 Pasta de tokens:', path.join(__dirname, 'tokens'));
    
    // Reset state
    currentQRCode = null;
    sessionStatus = 'initializing';
    connectionState = 'connecting';
    qrAttempts = 0;
    initializationError = null;
    
    // Enhanced session configuration
    const sessionConfig = {
      session: 'gm-barbearia-session',
      catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
        console.log('\n🔄 Novo QR Code gerado!');
        console.log(`📱 Tentativa: ${attempts}`);
        console.log('📋 Escaneie o QR Code abaixo com seu WhatsApp:');
        console.log(asciiQR);
        console.log('\n');
        
        // Store QR code data
        currentQRCode = {
          qr: base64Qr,
          attempts,
          urlCode,
          timestamp: Date.now(),
          ascii: asciiQR
        };
        qrAttempts = attempts;
        
        console.log('✅ QR Code armazenado para acesso via API');
      },
      statusFind: (statusSession, session) => {
        console.log(`📊 Status da sessão: ${statusSession} (${session})`);
        sessionStatus = statusSession;
        
        // Clear QR code when connected
        if (statusSession === 'qrReadSuccess' || statusSession === 'chatsAvailable') {
          currentQRCode = null;
          console.log('🎉 WhatsApp conectado com sucesso!');
        }
      },
      onLoadingScreen: (percent, message) => {
        console.log(`⏳ Carregando: ${percent}% - ${message}`);
      },
      headless: true,
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: true,
      disableSpins: true,
      disableWelcome: true,
      updatesLog: false,
      autoClose: 0, // Don't auto close
      createPathFileToken: true,
      waitForLogin: true,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      refreshQR: 15000, // Refresh QR every 15 seconds
      tokenStore: 'file',
      folderNameToken: path.join(__dirname, 'tokens'),
      puppeteerOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    };
    
    whatsappClient = await create(sessionConfig);
    
    console.log('✅ Cliente WhatsApp inicializado!');
    
    // Set up event listeners
    whatsappClient.onMessage((message) => {
      console.log('📨 Nova mensagem:', message.from, message.body);
    });
    
    whatsappClient.onStateChange((state) => {
      console.log('🔄 Estado da conexão:', state);
      connectionState = state;
    });
    
    whatsappClient.onIncomingCall((call) => {
      console.log('📞 Chamada recebida:', call);
    });
    
    // Check connection status
    try {
      const isConnected = await whatsappClient.isConnected();
      console.log('🔗 Status de conexão:', isConnected ? 'Conectado' : 'Desconectado');
      
      if (isConnected) {
        sessionStatus = 'chatsAvailable';
        currentQRCode = null;
      }
    } catch (error) {
      console.log('⚠️ Não foi possível verificar status de conexão:', error.message);
    }
    
    return whatsappClient;
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    sessionStatus = 'error';
    connectionState = 'disconnected';
    initializationError = error.message;
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  const envCheck = checkEnvironmentSupport();
  
  res.json({
    success: true,
    message: 'Servidor WhatsApp WPPConnect funcionando',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: {
      supported: envCheck.supported,
      reason: envCheck.reason || 'Ambiente suportado',
      type: envCheck.environment || 'Suportado'
    },
    status: {
      session: sessionStatus,
      connection: connectionState,
      client: !!whatsappClient,
      qr: !!currentQRCode,
      error: initializationError
    }
  });
});

// Get QR Code for authentication
app.get('/api/whatsapp/qr', (req, res) => {
  console.log('📱 Solicitação de QR Code recebida');
  
  const envCheck = checkEnvironmentSupport();
  if (!envCheck.supported) {
    return res.status(503).json({
      success: false,
      message: 'WhatsApp não disponível neste ambiente',
      reason: envCheck.reason,
      environment: envCheck.environment
    });
  }
  
  if (currentQRCode) {
    console.log('✅ Retornando QR Code existente (tentativa:', currentQRCode.attempts, ')');
    res.json({
      success: true,
      qr: currentQRCode.qr,
      attempts: currentQRCode.attempts,
      urlCode: currentQRCode.urlCode,
      timestamp: currentQRCode.timestamp
    });
  } else {
    console.log('❌ QR Code não disponível');
    
    // If client exists but no QR, might be connected
    if (whatsappClient && sessionStatus === 'chatsAvailable') {
      res.json({
        success: false,
        message: 'WhatsApp já está conectado',
        connected: true
      });
    } else {
      res.json({
        success: false,
        message: 'QR Code não disponível. Aguarde a geração ou reinicie a sessão.',
        connected: false,
        error: initializationError
      });
    }
  }
});

// Get connection status
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const envCheck = checkEnvironmentSupport();
    
    let isConnected = false;
    let batteryLevel = null;
    let phoneInfo = null;
    
    if (envCheck.supported && whatsappClient) {
      try {
        isConnected = await whatsappClient.isConnected();
        
        if (isConnected) {
          try {
            batteryLevel = await whatsappClient.getBatteryLevel();
            phoneInfo = await whatsappClient.getHostDevice();
          } catch (error) {
            console.log('⚠️ Erro ao obter informações do dispositivo:', error.message);
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao verificar conexão:', error.message);
        isConnected = false;
      }
    }
    
    const status = {
      success: true,
      connected: isConnected,
      sessionStatus: sessionStatus,
      connectionState: connectionState,
      clientAvailable: !!whatsappClient,
      qrAvailable: !!currentQRCode,
      qrAttempts: qrAttempts,
      batteryLevel: batteryLevel,
      phoneInfo: phoneInfo,
      timestamp: new Date().toISOString(),
      environment: {
        supported: envCheck.supported,
        reason: envCheck.reason || 'Ambiente suportado',
        type: envCheck.environment || 'Suportado'
      },
      error: initializationError
    };
    
    console.log('📊 Status atual:', {
      connected: isConnected,
      session: sessionStatus,
      client: !!whatsappClient,
      qr: !!currentQRCode,
      envSupported: envCheck.supported
    });
    
    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status da conexão',
      error: error.message
    });
  }
});

// Send message
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    console.log('📤 Tentativa de envio de mensagem para:', phone);
    
    const envCheck = checkEnvironmentSupport();
    if (!envCheck.supported) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não disponível neste ambiente',
        reason: envCheck.reason,
        environment: envCheck.environment
      });
    }
    
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Telefone e mensagem são obrigatórios'
      });
    }
    
    if (!whatsappClient) {
      return res.status(503).json({
        success: false,
        message: 'Cliente WhatsApp não está inicializado'
      });
    }
    
    // Check if connected
    const isConnected = await whatsappClient.isConnected();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não está conectado. Escaneie o QR Code primeiro.'
      });
    }
    
    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    
    // Add country code if needed (Brazil)
    if (formattedPhone.length === 11 && formattedPhone.startsWith('11')) {
      formattedPhone = '55' + formattedPhone;
    } else if (formattedPhone.length === 10) {
      formattedPhone = '5511' + formattedPhone;
    } else if (formattedPhone.length === 11 && !formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    
    // Add @c.us suffix for WhatsApp format
    const whatsappNumber = formattedPhone + '@c.us';
    
    console.log(`📱 Enviando para: ${whatsappNumber}`);
    console.log(`💬 Mensagem: ${message.substring(0, 50)}...`);
    
    // Check if number exists on WhatsApp
    try {
      const numberExists = await whatsappClient.checkNumberStatus(whatsappNumber);
      
      if (!numberExists.exists) {
        return res.status(400).json({
          success: false,
          message: 'Este número não possui WhatsApp ativo'
        });
      }
      
      console.log('✅ Número verificado, enviando mensagem...');
    } catch (error) {
      console.log('⚠️ Não foi possível verificar o número, tentando enviar mesmo assim...');
    }
    
    // Send message
    const result = await whatsappClient.sendText(whatsappNumber, message);
    
    console.log('✅ Mensagem enviada com sucesso!', result.id);
    
    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      messageId: result.id,
      timestamp: result.t,
      to: whatsappNumber
    });
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem: ' + error.message
    });
  }
});

// Restart WhatsApp session
app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    console.log('\n🔄 Reiniciando sessão WhatsApp...');
    
    const envCheck = checkEnvironmentSupport();
    if (!envCheck.supported) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não disponível neste ambiente',
        reason: envCheck.reason,
        environment: envCheck.environment
      });
    }
    
    // Close existing client
    if (whatsappClient) {
      try {
        await whatsappClient.close();
        console.log('🔒 Cliente anterior fechado');
      } catch (error) {
        console.log('⚠️ Erro ao fechar cliente:', error.message);
      }
      whatsappClient = null;
    }
    
    // Reset state
    currentQRCode = null;
    sessionStatus = 'restarting';
    connectionState = 'disconnected';
    qrAttempts = 0;
    initializationError = null;
    
    res.json({
      success: true,
      message: 'Sessão WhatsApp sendo reiniciada...'
    });
    
    // Reinitialize after response
    setTimeout(async () => {
      try {
        console.log('🚀 Reinicializando cliente...');
        await initializeWhatsApp();
        console.log('✅ Sessão reiniciada com sucesso');
      } catch (error) {
        console.error('❌ Erro ao reiniciar:', error);
        sessionStatus = 'error';
        initializationError = error.message;
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro ao reiniciar sessão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reiniciar sessão: ' + error.message
    });
  }
});

// Disconnect WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    console.log('🔌 Desconectando WhatsApp...');
    
    if (whatsappClient) {
      await whatsappClient.logout();
      await whatsappClient.close();
      whatsappClient = null;
      console.log('✅ WhatsApp desconectado');
    }
    
    // Reset state
    currentQRCode = null;
    sessionStatus = 'disconnected';
    connectionState = 'disconnected';
    qrAttempts = 0;
    initializationError = null;
    
    res.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desconectar: ' + error.message
    });
  }
});

// Force QR generation
app.post('/api/whatsapp/generate-qr', async (req, res) => {
  try {
    console.log('🔄 Forçando geração de novo QR Code...');
    
    const envCheck = checkEnvironmentSupport();
    if (!envCheck.supported) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não disponível neste ambiente',
        reason: envCheck.reason,
        environment: envCheck.environment
      });
    }
    
    if (whatsappClient) {
      try {
        await whatsappClient.close();
      } catch (error) {
        console.log('⚠️ Erro ao fechar cliente:', error.message);
      }
    }
    
    // Reset and reinitialize
    whatsappClient = null;
    currentQRCode = null;
    sessionStatus = 'generating_qr';
    initializationError = null;
    
    res.json({
      success: true,
      message: 'Gerando novo QR Code...'
    });
    
    // Initialize new session
    setTimeout(async () => {
      try {
        await initializeWhatsApp();
      } catch (error) {
        console.error('❌ Erro ao gerar QR:', error);
        initializationError = error.message;
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao gerar QR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar QR Code'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`📱 Servidor WhatsApp WPPConnect iniciado!`);
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 QR Code: http://localhost:${PORT}/api/whatsapp/qr`);
  console.log('🚀 ========================================\n');
  
  // Check environment before initializing
  const envCheck = checkEnvironmentSupport();
  if (!envCheck.supported) {
    console.log('⚠️ ========================================');
    console.log('❌ AMBIENTE NÃO SUPORTADO');
    console.log(`📍 Ambiente detectado: ${envCheck.environment}`);
    console.log(`💡 Motivo: ${envCheck.reason}`);
    console.log('');
    console.log('✅ Para usar o WhatsApp, execute em:');
    console.log('   • VPS/Servidor Linux com Chrome');
    console.log('   • Máquina local com Chrome instalado');
    console.log('   • Ambiente Docker com Chrome');
    console.log('⚠️ ========================================\n');
    
    sessionStatus = 'unsupported_environment';
    initializationError = envCheck.reason;
    return;
  }
  
  // Initialize WhatsApp after server starts (only if environment supports it)
  setTimeout(() => {
    console.log('⏳ Aguardando 3 segundos antes de inicializar WhatsApp...\n');
    initializeWhatsApp().catch(error => {
      console.error('❌ Falha na inicialização:', error);
      sessionStatus = 'error';
      initializationError = error.message;
    });
  }, 3000);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Recebido sinal ${signal}, encerrando servidor...`);
  
  server.close(() => {
    console.log('🔒 Servidor HTTP fechado');
  });
  
  if (whatsappClient) {
    try {
      console.log('🔌 Fechando cliente WhatsApp...');
      await whatsappClient.close();
      console.log('✅ Cliente WhatsApp fechado');
    } catch (error) {
      console.error('❌ Erro ao fechar WhatsApp:', error);
    }
  }
  
  console.log('👋 Servidor encerrado com sucesso');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;