import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Scissors, 
  Settings, 
  BarChart3, 
  Menu, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Shield,
  Database,
  Smartphone,
  MessageSquare,
  Gift,
  Target,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  Star,
  Phone,
  Mail,
  Camera,
  Image as ImageIcon,
  Heart,
  UserPlus,
  CalendarDays,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import BarberModal from '../../components/admin/BarberModal';
import ServiceModal from '../../components/admin/ServiceModal';
import BookingModal from '../../components/admin/BookingModal';
import GalleryModal from '../../components/admin/GalleryModal';
import SlideshowModal from '../../components/admin/SlideshowModal';
import WhatsAppSettingsModal from '../../components/admin/WhatsAppSettingsModal';
import CalendarView from '../../components/admin/CalendarView';
import ReportsView from '../../components/admin/ReportsView';
import ClientManagement from '../../components/admin/ClientManagement';
import FinancialManagement from '../../components/admin/FinancialManagement';
import MarketingCampaigns from '../../components/admin/MarketingCampaigns';
import LoyaltyProgram from '../../components/admin/LoyaltyProgram';
import NotificationCenter from '../../components/admin/NotificationCenter';
import SecurityAudit from '../../components/admin/SecurityAudit';
import BackupSettings from '../../components/admin/BackupSettings';
import PWASettings from '../../components/admin/PWASettings';
import MultiLocationSettings from '../../components/admin/MultiLocationSettings';
import AdvancedReports from '../../components/admin/AdvancedReports';
import BirthdaySettings from '../../components/admin/BirthdaySettings';
import RetentionSettings from '../../components/admin/RetentionSettings';
import ConfiguracaoPG from '../../components/admin/ConfiguracaoPG';

interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  specialties?: string[];
  rating?: number;
  experience_years?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  icon?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Booking {
  id: string;
  client_id?: string;
  barber_id?: string;
  service_id?: string;
  booking_date: string;
  booking_time: string;
  status?: string;
  total_price: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  clients?: {
    name: string;
    phone: string;
    email?: string;
  };
  barbers?: {
    name: string;
  };
  services?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  last_visit_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  alt_text?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SlideshowImage {
  id: string;
  title: string;
  image_url: string;
  alt_text?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BusinessSettings {
  id: string;
  business_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  opening_hours?: any;
  logo_url?: string;
  whatsapp_api_key?: string;
  whatsapp_phone_number?: string;
  whatsapp_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);

  // Modal states
  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isSlideshowModalOpen, setIsSlideshowModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Selected items for editing
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<GalleryImage | null>(null);
  const [selectedSlideshowImage, setSelectedSlideshowImage] = useState<SlideshowImage | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBarbers(),
        loadServices(),
        loadBookings(),
        loadClients(),
        loadGalleryImages(),
        loadSlideshowImages(),
        loadBusinessSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Error loading barbers:', error);
    }
  };

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          clients (name, phone, email),
          barbers (name),
          services (name)
        `)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };

  const loadSlideshowImages = async () => {
    try {
      const { data, error } = await supabase
        .from('slideshow_images')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSlideshowImages(data || []);
    } catch (error) {
      console.error('Error loading slideshow images:', error);
    }
  };

  const loadBusinessSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setBusinessSettings(data);
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;

    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadBarbers();
    } catch (error) {
      console.error('Error deleting barber:', error);
      alert('Erro ao excluir barbeiro');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erro ao excluir serviço');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadGalleryImages();
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      alert('Erro ao excluir imagem');
    }
  };

  const handleDeleteSlideshowImage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('slideshow_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSlideshowImages();
    } catch (error) {
      console.error('Error deleting slideshow image:', error);
      alert('Erro ao excluir imagem');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.barbers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.services?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'bookings', label: 'Agendamentos', icon: CalendarDays },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'barbers', label: 'Barbeiros', icon: Users },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'gallery', label: 'Galeria', icon: ImageIcon },
    { id: 'slideshow', label: 'Slideshow', icon: Camera },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'financial', label: 'Financeiro', icon: CreditCard },
    { id: 'marketing', label: 'Marketing', icon: Target },
    { id: 'loyalty', label: 'Fidelidade', icon: Gift },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'birthday', label: 'Aniversários', icon: Gift },
    { id: 'retention', label: 'Retenção', icon: Heart },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'pwa', label: 'PWA', icon: Smartphone },
    { id: 'locations', label: 'Localizações', icon: MapPin },
    { id: 'advanced-reports', label: 'Relatórios Avançados', icon: TrendingUp },
    { id: 'configuracaopg', label: 'ConfiguraçãoPG', icon: Settings },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Bem-vindo, {user?.name || 'Administrador'}!
            </h2>
            <p className="text-gray-300">
              Painel administrativo da GM Barbearia. Gerencie agendamentos, clientes e muito mais.
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Agendamentos</p>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </div>
            <CalendarDays className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Clientes Ativos</p>
              <p className="text-3xl font-bold">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Barbeiros</p>
              <p className="text-3xl font-bold">{barbers.filter(b => b.is_active).length}</p>
            </div>
            <Scissors className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Serviços</p>
              <p className="text-3xl font-bold">{services.filter(s => s.is_active).length}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Agendamentos Recentes</h3>
        <div className="space-y-3">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{booking.clients?.name}</p>
                  <p className="text-gray-400 text-sm">{booking.services?.name} - {booking.barbers?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'agendado')}`}>
                  {getStatusText(booking.status || 'agendado')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBarbers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Barbeiros</h2>
        <button
          onClick={() => setIsBarberModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Barbeiro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              {barber.photo_url ? (
                <img
                  src={barber.photo_url}
                  alt={barber.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{barber.name}</h3>
                <p className="text-gray-400">{barber.email}</p>
                {barber.phone && (
                  <p className="text-gray-400 text-sm">{barber.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Experiência:</span>
                <span className="text-white">{barber.experience_years || 0} anos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avaliação:</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white">{barber.rating || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  barber.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {barber.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {barber.specialties && barber.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedBarber(barber);
                  setIsBarberModalOpen(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDeleteBarber(barber.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Serviços</h2>
        <button
          onClick={() => setIsServiceModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">{service.icon || '✂️'}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-400 text-sm">{service.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Preço:</span>
                <span className="text-white font-semibold">R$ {service.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Duração:</span>
                <span className="text-white">{service.duration_minutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedService(service);
                  setIsServiceModalOpen(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDeleteService(service.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Agendamentos</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full sm:w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">Todos os Status</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Barbeiro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{booking.clients?.name}</div>
                      <div className="text-sm text-gray-400">{booking.clients?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {booking.barbers?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {booking.services?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-400">{booking.booking_time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status || 'agendado')}`}>
                      {getStatusText(booking.status || 'agendado')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    R$ {booking.total_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsBookingModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
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

  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Galeria</h2>
        <button
          onClick={() => setIsGalleryModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Imagem</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryImages.map((image) => (
          <div key={image.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={image.alt_text || image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedGalleryImage(image);
                    setIsGalleryModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGalleryImage(image.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium mb-1">{image.title}</h3>
              {image.description && (
                <p className="text-gray-400 text-sm mb-2">{image.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {image.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-gray-400 text-xs">Ordem: {image.order_index}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSlideshow = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Slideshow</h2>
        <button
          onClick={() => setIsSlideshowModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Imagem</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slideshowImages.map((image) => (
          <div key={image.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
            <div className="aspect-video relative">
              <img
                src={image.image_url}
                alt={image.alt_text || image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedSlideshowImage(image);
                    setIsSlideshowModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSlideshowImage(image.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium mb-2">{image.title}</h3>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {image.is_active ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-gray-400 text-xs">Ordem: {image.order_index}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configurações</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl p-6 text-left transition-all duration-300 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <MessageSquare className="w-8 h-8 text-green-400" />
            <h3 className="text-lg font-semibold text-white">WhatsApp</h3>
          </div>
          <p className="text-gray-400 text-sm">Configurar integração com WhatsApp para envio de mensagens automáticas</p>
        </button>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Settings className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Configurações Gerais</h3>
          </div>
          <p className="text-gray-400 text-sm">Configurações básicas da barbearia</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Horários</h3>
          </div>
          <p className="text-gray-400 text-sm">Configurar horários de funcionamento</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'calendar':
        return <CalendarView bookings={bookings} onBookingClick={(booking) => {
          setSelectedBooking(booking);
          setIsBookingModalOpen(true);
        }} />;
      case 'bookings':
        return renderBookings();
      case 'clients':
        return <ClientManagement clients={clients} onClientUpdate={loadClients} />;
      case 'barbers':
        return renderBarbers();
      case 'services':
        return renderServices();
      case 'gallery':
        return renderGallery();
      case 'slideshow':
        return renderSlideshow();
      case 'reports':
        return <ReportsView bookings={bookings} clients={clients} barbers={barbers} services={services} />;
      case 'financial':
        return <FinancialManagement bookings={bookings} />;
      case 'marketing':
        return <MarketingCampaigns clients={clients} />;
      case 'loyalty':
        return <LoyaltyProgram clients={clients} />;
      case 'notifications':
        return <NotificationCenter />;
      case 'birthday':
        return <BirthdaySettings />;
      case 'retention':
        return <RetentionSettings />;
      case 'security':
        return <SecurityAudit />;
      case 'backup':
        return <BackupSettings />;
      case 'pwa':
        return <PWASettings />;
      case 'locations':
        return <MultiLocationSettings />;
      case 'advanced-reports':
        return <AdvancedReports bookings={bookings} clients={clients} barbers={barbers} services={services} />;
      case 'configuracaopg':
        return <ConfiguracaoPG />;
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11110f]">
      {/* Header */}
      <header className="bg-gray-900/90 shadow-md border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <img 
                src="/WhatsApp Image 2025-06-26 at 08.22.png" 
                alt="GM Barbearia Logo" 
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">GM Barbearia</h1>
                <p className="text-sm text-gray-400">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 transition-all duration-300 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-300 font-medium">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors duration-300 p-2 rounded-lg hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-900/90 border-r border-gray-700 transition-all duration-300 hidden lg:block overflow-y-auto`}>
          <nav className="p-4 space-y-2 pb-20">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-700 z-50 overflow-y-auto">
              <div className="p-4 pb-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Menu</h2>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 text-left ${
                          activeTab === item.id
                            ? 'bg-yellow-500 text-black font-medium'
                            : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <BarberModal
        isOpen={isBarberModalOpen}
        onClose={() => {
          setIsBarberModalOpen(false);
          setSelectedBarber(null);
        }}
        barber={selectedBarber}
        onSave={() => {
          loadAllData();
          setIsBarberModalOpen(false);
          setSelectedBarber(null);
        }}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onSave={() => {
          loadAllData();
          setIsServiceModalOpen(false);
          setSelectedService(null);
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSave={() => {
          loadAllData();
          setIsBookingModalOpen(false);
          setSelectedBooking(null);
        }}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => {
          setIsGalleryModalOpen(false);
          setSelectedGalleryImage(null);
        }}
        image={selectedGalleryImage}
        onSave={() => {
          loadAllData();
          setIsGalleryModalOpen(false);
          setSelectedGalleryImage(null);
        }}
      />

      <SlideshowModal
        isOpen={isSlideshowModalOpen}
        onClose={() => {
          setIsSlideshowModalOpen(false);
          setSelectedSlideshowImage(null);
        }}
        image={selectedSlideshowImage}
        onSave={() => {
          loadAllData();
          setIsSlideshowModalOpen(false);
          setSelectedSlideshowImage(null);
        }}
      />

      <WhatsAppSettingsModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onSave={() => {
          loadAllData();
          setIsWhatsAppModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminDashboard;