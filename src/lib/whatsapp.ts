// WhatsApp API client for WPPConnect integration
export interface WhatsAppStatus {
  connected: boolean;
  sessionStatus: string;
  connectionState: string;
  clientAvailable: boolean;
  qrAvailable?: boolean;
  qrAttempts?: number;
  batteryLevel?: number;
  phoneInfo?: any;
  environment?: {
    supported: boolean;
    reason?: string;
    type?: string;
  };
}

export interface WhatsAppQR {
  success: boolean;
  qr?: string;
  attempts?: number;
  urlCode?: string;
  message?: string;
  connected?: boolean;
  timestamp?: number;
  environment?: {
    supported: boolean;
    reason?: string;
    type?: string;
  };
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  messageId?: string;
  timestamp?: number;
  to?: string;
  environment?: {
    supported: boolean;
    reason?: string;
    type?: string;
  };
}

class WhatsAppAPI {
  private baseURL: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseURL = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3001/api/whatsapp';
  }

  async getStatus(): Promise<WhatsAppStatus> {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return {
          connected: data.connected,
          sessionStatus: data.sessionStatus,
          connectionState: data.connectionState,
          clientAvailable: data.clientAvailable,
          qrAvailable: data.qrAvailable,
          qrAttempts: data.qrAttempts,
          batteryLevel: data.batteryLevel,
          phoneInfo: data.phoneInfo,
          environment: data.environment
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      
      // Check if it's a network error (server not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          connected: false,
          sessionStatus: 'server_offline',
          connectionState: 'disconnected',
          clientAvailable: false,
          environment: {
            supported: false,
            reason: 'Servidor WhatsApp não está rodando. Execute: npm run whatsapp:start',
            type: 'Server Offline'
          }
        };
      }
      
      return {
        connected: false,
        sessionStatus: 'error',
        connectionState: 'disconnected',
        clientAvailable: false,
        environment: {
          supported: false,
          reason: 'Erro ao conectar com servidor WhatsApp',
          type: 'Connection Error'
        }
      };
    }
  }

  async getQRCode(): Promise<WhatsAppQR> {
    try {
      const response = await fetch(`${this.baseURL}/qr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting QR code:', error);
      
      // Check if it's a network error (server not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start',
          environment: {
            supported: false,
            reason: 'Servidor WhatsApp não está rodando',
            type: 'Server Offline'
          }
        };
      }
      
      return {
        success: false,
        message: 'Erro ao obter QR Code: ' + (error as Error).message
      };
    }
  }

  async sendMessage(phone: string, message: string): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, message })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Check if it's a network error (server not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start',
          environment: {
            supported: false,
            reason: 'Servidor WhatsApp não está rodando',
            type: 'Server Offline'
          }
        };
      }
      
      return {
        success: false,
        message: 'Erro ao enviar mensagem: ' + (error as Error).message
      };
    }
  }

  async restart(): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseURL}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error restarting WhatsApp:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start'
        };
      }
      
      return {
        success: false,
        message: 'Erro ao reiniciar WhatsApp: ' + (error as Error).message
      };
    }
  }

  async disconnect(): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseURL}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start'
        };
      }
      
      return {
        success: false,
        message: 'Erro ao desconectar WhatsApp: ' + (error as Error).message
      };
    }
  }

  async generateQR(): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start'
        };
      }
      
      return {
        success: false,
        message: 'Erro ao gerar QR Code: ' + (error as Error).message
      };
    }
  }

  async checkHealth(): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseURL.replace('/whatsapp', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking health:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Servidor WhatsApp offline. Execute: npm run whatsapp:start'
        };
      }
      
      return {
        success: false,
        message: 'Servidor WhatsApp offline: ' + (error as Error).message
      };
    }
  }

  formatConfirmationMessage(booking: any): string {
    const date = new Date(booking.booking_date).toLocaleDateString('pt-BR');
    const time = booking.booking_time;
    const clientName = booking.client?.name || 'Cliente';
    const serviceName = booking.service?.name || 'Serviço';
    const barberName = booking.barber?.name || 'Barbeiro';
    
    return `🎉 *Agendamento Confirmado!*

Olá ${clientName}! Seu agendamento foi confirmado com sucesso.

📅 *Data:* ${date}
⏰ *Horário:* ${time}
✂️ *Serviço:* ${serviceName}
👨‍💼 *Barbeiro:* ${barberName}
💰 *Valor:* R$ ${booking.total_price.toFixed(2).replace('.', ',')}

📍 *Local:* GM Barbearia
Rua das Flores, 123 - Centro, São Paulo - SP

Estamos ansiosos para atendê-lo! 😊

Em caso de dúvidas, entre em contato conosco.

_Mensagem automática - GM Barbearia_`;
  }

  formatReminderMessage(booking: any): string {
    const date = new Date(booking.booking_date).toLocaleDateString('pt-BR');
    const time = booking.booking_time;
    const clientName = booking.client?.name || 'Cliente';
    const serviceName = booking.service?.name || 'Serviço';
    const barberName = booking.barber?.name || 'Barbeiro';
    
    return `⏰ *Lembrete de Agendamento*

Olá ${clientName}! Lembramos que você tem um agendamento hoje.

📅 *Data:* ${date}
⏰ *Horário:* ${time}
✂️ *Serviço:* ${serviceName}
👨‍💼 *Barbeiro:* ${barberName}

📍 *Local:* GM Barbearia
Rua das Flores, 123 - Centro, São Paulo - SP

Nos vemos em breve! 😊

_Mensagem automática - GM Barbearia_`;
  }
}

export const whatsappAPI = new WhatsAppAPI();