import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Mail, MessageSquare, Calendar } from 'lucide-react';
import { db } from '../../lib/supabase';
import { format, parseISO, addHours, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'reminder' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Check for upcoming appointments every minute
    const interval = setInterval(checkUpcomingAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    // Simulate loading notifications from database
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Agendamento em 1 hora',
        message: 'João Silva tem agendamento às 14:00',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'booking',
        title: 'Novo agendamento',
        message: 'Pedro Costa agendou corte + barba para amanhã',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  };

  const checkUpcomingAppointments = async () => {
    try {
      const bookings = await db.bookings.getAll();
      const now = new Date();
      const oneHourFromNow = addHours(now, 1);
      
      const upcomingBookings = bookings.filter(booking => {
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
        return bookingDateTime > now && bookingDateTime <= oneHourFromNow && booking.status === 'confirmado';
      });

      // Create notifications for upcoming bookings
      upcomingBookings.forEach(booking => {
        const existingNotification = notifications.find(n => 
          n.message.includes(booking.client?.name || '') && n.type === 'reminder'
        );
        
        if (!existingNotification) {
          const newNotification: Notification = {
            id: `reminder-${booking.id}`,
            type: 'reminder',
            title: 'Agendamento próximo',
            message: `${booking.client?.name} tem agendamento em breve`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'booking': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'payment': return <AlertCircle className="w-5 h-5 text-green-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900/95 rounded-xl shadow-2xl border border-gray-700 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notificações</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-300 ${
                    !notification.isRead ? 'bg-yellow-400/5 border-l-4 border-l-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(parseISO(notification.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 rounded text-gray-400 hover:text-green-400 transition-colors duration-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;