import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { db } from '../lib/supabase'; 
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Load business settings
    const loadSettings = async () => {
      try {
        const settings = await db.settings.get();
        setBusinessSettings(settings);
        
        // Set theme mode from settings
        if (settings.theme_mode) {
          setThemeMode(settings.theme_mode);
        }
      } catch (error) {
        console.error('Error loading business settings in header:', error);
      }
    };
    
    loadSettings();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Get primary and secondary colors from business settings
  const primaryColor = useMemo(() => 
    businessSettings?.primary_color || '#f59e0b', 
    [businessSettings]
  );
  
  const secondaryColor = useMemo(() => 
    businessSettings?.secondary_color || '#ea580c', 
    [businessSettings]
  );

  return (
    <div className={themeMode === 'light' ? 'light-theme' : 'dark-theme'}>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? themeMode === 'light'
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200'
            : 'bg-[#11110f]/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"
                     style={{ background: `linear-gradient(to right, ${primaryColor}4d, ${secondaryColor}4d)` }}></div>
                <img 
                  src={businessSettings?.logo_url || "/WhatsApp Image 2025-06-26 at 08.22.png"} 
                  alt={businessSettings?.business_name || "GM Barbearia Logo"} 
                  className="relative w-12 h-12 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-yellow-400/30"
                  loading="eager"
                  onError={(e) => {
                    console.warn('Logo failed to load, using fallback');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"
                     style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
              </div>
              <div className="transition-all duration-300">
                <h1 className={`text-2xl font-bold group-hover:text-transparent group-hover:bg-clip-text transition-all duration-500 ${
                  themeMode === 'light' ? 'text-gray-900' : 'text-white'
                }`}
                    style={{ 
                      '&:hover': { 
                        backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                      }
                    }}>
                  {businessSettings?.business_name || "GM Barbearia"}
                </h1>
                <p className={`text-sm group-hover:text-gray-700 transition-colors duration-300 ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>Estilo e Tradição</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`relative px-6 py-2 rounded-full font-medium transition-all duration-300 group ${
                  isActive('/') 
                    ? 'text-black shadow-lg' 
                    : themeMode === 'light' 
                      ? 'text-gray-700 hover:text-gray-900' 
                      : 'text-gray-300 hover:text-white'
                }`} 
                style={isActive('/') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {}}
              >
                <span className="relative z-10">Início</span>
                {!isActive('/') && (
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                       style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
                )}
              </Link>
              
              <Link 
                to="/agendar" 
                className={`relative px-6 py-2 rounded-full font-medium transition-all duration-300 group ${
                  isActive('/agendar') 
                    ? 'text-black shadow-lg' 
                    : themeMode === 'light' 
                      ? 'text-gray-700 hover:text-gray-900' 
                      : 'text-gray-300 hover:text-white'
                }`}
                style={isActive('/agendar') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {}}
              >
                <span className="relative z-10">Agendar</span>
                {!isActive('/agendar') && (
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                       style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
                )}
              </Link>
              
              <Link 
                to="/contato" 
                className={`relative px-6 py-2 rounded-full font-medium transition-all duration-300 group ${
                  isActive('/contato') 
                    ? 'text-black shadow-lg' 
                    : themeMode === 'light' 
                      ? 'text-gray-700 hover:text-gray-900' 
                      : 'text-gray-300 hover:text-white'
                }`}
                style={isActive('/contato') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {}}
              >
                <span className="relative z-10">Contato</span>
                {!isActive('/contato') && (
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                       style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
                )}
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)`,
                borderColor: `${primaryColor}33`,
                '&:hover': {
                  background: `linear-gradient(to right, ${primaryColor}33, ${secondaryColor}33)`
                }
              }}
            >
              <div className="relative">
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 transition-all duration-300" style={{ color: primaryColor }} />
                ) : (
                  <Menu className="w-5 h-5 transition-all duration-300" style={{ color: primaryColor }} />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className={`absolute inset-0 backdrop-blur-xl ${
          themeMode === 'light' ? 'bg-white/80' : 'bg-black/80'
        }`} 
             onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] backdrop-blur-xl border-l transform transition-all duration-500 ease-out ${
          themeMode === 'light' ? 'bg-white/95 border-gray-200' : 'bg-[#11110f]/95 border-gray-700',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 pt-20">
            <nav className="space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/')
                    ? 'text-black shadow-lg'
                    : themeMode === 'light'
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-300 hover:text-white'
                }`}
                style={isActive('/') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {
                  '&:hover': {
                    background: themeMode === 'light'
                      ? `linear-gradient(to right, ${primaryColor}0a, ${secondaryColor}0a)`
                      : `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)`
                  }
                }}
              >
                Início
              </Link>
              <Link 
                to="/agendar" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/agendar')
                    ? 'text-black shadow-lg'
                    : themeMode === 'light'
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-300 hover:text-white'
                }`}
                style={isActive('/agendar') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {
                  '&:hover': {
                    background: themeMode === 'light'
                      ? `linear-gradient(to right, ${primaryColor}0a, ${secondaryColor}0a)`
                      : `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)`
                  }
                }}
              >
                Agendar Horário
              </Link>
              <Link 
                to="/contato" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/contato')
                    ? 'text-black shadow-lg'
                    : themeMode === 'light'
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-300 hover:text-white'
                }`}
                style={isActive('/contato') ? { 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40`
                } : {
                  '&:hover': {
                    background: themeMode === 'light'
                      ? `linear-gradient(to right, ${primaryColor}0a, ${secondaryColor}0a)`
                      : `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)`
                  }
                }}
              >
                Contato
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;