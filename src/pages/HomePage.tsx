import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import Slideshow from '../components/Slideshow';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Star, Scissors, Users, Award, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { db } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setIsVisible(true);
    loadGalleryImages();
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const settings = await db.settings.get();
      console.log('Loaded business settings:', settings);
      setBusinessSettings(settings);
      
      // Set theme mode from settings
      if (settings.theme_mode) {
        setThemeMode(settings.theme_mode);
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGalleryImages = async () => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gallery loading timeout')), 10000);
      });
      
      const imagesPromise = db.gallery.getAll();
      const images = await Promise.race([imagesPromise, timeoutPromise]);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      // Fallback to default images if database fails
      setGalleryImages([
        {
          id: '1',
          title: 'Degradê Moderno',
          image_url: '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg',
          alt_text: 'Corte degradê moderno com acabamento perfeito',
          description: 'Corte degradê moderno com acabamento perfeito'
        },
        {
          id: '2',
          title: 'Corte Clássico',
          image_url: '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg',
          alt_text: 'Corte clássico com risco lateral e acabamento profissional',
          description: 'Corte clássico com risco lateral e acabamento profissional'
        },
        {
          id: '3',
          title: 'Corte Social',
          image_url: '/a8278cba-7226-4554-baa9-4f6b7d287121.jpg',
          alt_text: 'Corte social com degradê e risco bem definido',
          description: 'Corte social com degradê e risco bem definido'
        },
        {
          id: '4',
          title: 'Buzz Cut',
          image_url: '/965c0cf0-4972-4730-8d2b-c6ae3c3bc785.jpg',
          alt_text: 'Corte buzz cut moderno com acabamento preciso',
          description: 'Corte buzz cut moderno com acabamento preciso'
        },
        {
          id: '5',
          title: 'Pompadour',
          image_url: '/61580cfb-8ad0-44ae-925f-f9db36fde0e0.jpg',
          alt_text: 'Corte pompadour com barba alinhada',
          description: 'Corte pompadour com barba alinhada'
        },
        {
          id: '6',
          title: 'Trabalho Premium',
          image_url: 'https://images.pexels.com/photos/1570810/pexels-photo-1570810.jpeg?auto=compress&cs=tinysrgb&w=400',
          alt_text: 'Trabalho profissional da barbearia',
          description: 'Trabalho profissional da barbearia'
        }
      ]);
    }
  };

  // Use default services if none are configured
  const defaultServices = [
    { name: 'Corte Tradicional', price: 'R$ 25,00', description: 'Corte clássico com acabamento perfeito', icon: '✂️' },
    { name: 'Corte + Barba', price: 'R$ 40,00', description: 'Corte completo com barba alinhada', icon: '🧔' },
    { name: 'Barba Completa', price: 'R$ 20,00', description: 'Barba feita com navalha e acabamento', icon: '🪒' },
    { name: 'Sobrancelha', price: 'R$ 10,00', description: 'Alinhamento e design de sobrancelhas', icon: '👁️' },
  ];

  // Get primary and secondary colors from business settings
  const primaryColor = useMemo(() => 
    businessSettings?.primary_color || '#f59e0b', 
    [businessSettings]
  );
  
  const secondaryColor = useMemo(() => 
    businessSettings?.secondary_color || '#ea580c', 
    [businessSettings]
  );

  const stats = [
    { number: '500+', label: 'Clientes Satisfeitos', icon: Users },
    { number: '10+', label: 'Anos de Experiência', icon: Award },
    { number: '4.9', label: 'Avaliação Média', icon: Star },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden ${
      themeMode === 'light' 
        ? 'bg-gray-100 text-gray-900' 
        : 'bg-[#11110f] text-white'
    }`}>
      <Header />
      
      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center ${
        themeMode === 'light' ? 'bg-white' : ''
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0" style={{
          background: themeMode === 'light'
            ? `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)`
            : `radial-gradient(circle, rgba(17,17,15,0.9) 0%, rgba(17,17,15,1) 100%)`
        }}>
          <div className={`absolute inset-0 ${
            themeMode === 'light'
              ? 'bg-gradient-to-br from-white via-gray-100/50 to-white'
              : 'bg-gradient-to-br from-[#11110f] via-gray-900/50 to-[#11110f]'
          }`}></div>
          <div className="absolute inset-0" style={{ 
            background: `linear-gradient(to right, ${primaryColor}05, transparent, ${secondaryColor}05)` 
          }}></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" 
               style={{ background: `${primaryColor}0a` }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
               style={{ background: `${secondaryColor}0a` }}></div>
        </div>

        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="mb-8">
            <div className="relative inline-block group">
              <div className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150"
                   style={{ background: `linear-gradient(to right, ${primaryColor}4d, ${secondaryColor}4d)` }}></div>
              <img 
                src={businessSettings?.logo_url || "/WhatsApp Image 2025-06-26 at 08.22.png"} 
                alt={businessSettings?.business_name || "GM Barbearia Logo"} 
                className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-yellow-400/30"
                loading="eager"
                onError={(e) => {
                  console.warn('Hero logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"
                   style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
            </div>
          </div>
          
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className={themeMode === 'light' ? 'text-gray-900' : 'text-white'}>
                {businessSettings?.business_name?.split(' ')[0] || 'GM'} 
              </span>
              <span className="text-transparent bg-clip-text animate-gradient-x"
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})` }}>
                {businessSettings?.business_name?.split(' ').slice(1).join(' ') || 'Barbearia'}
              </span>
            </h1>
            <p className={`text-xl sm:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed ${
              themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`} 
               dangerouslySetInnerHTML={{ __html: businessSettings?.business_name || 'Tradição, estilo e qualidade em cada corte' }}>
            </p>
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Experiência Premium desde 2015</span>
              <Sparkles className="w-5 h-5 animate-pulse delay-500" />
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/agendar"
              className="group relative inline-flex items-center space-x-3 text-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{ 
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 10px 15px -3px ${primaryColor}20`
              }}
            >
              <span>Agendar Meu Horário</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 relative ${themeMode === 'light' ? 'bg-gray-50' : ''}`}>
        <div className="absolute inset-0" style={{ 
          background: `linear-gradient(to right, ${primaryColor}0a, transparent, ${secondaryColor}0a)` 
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                       style={{ background: `linear-gradient(to right, ${primaryColor}33, ${secondaryColor}33)` }}></div>
                  <div className="relative w-20 h-20 mx-auto rounded-full flex items-center justify-center border transition-all duration-500 group-hover:scale-110"
                       style={{ 
                         background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)`,
                         borderColor: `${primaryColor}33`
                       }}>
                    <stat.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div className={`text-4xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-500 ${
                  themeMode === 'light' ? 'text-gray-900' : 'text-white'
                }`}
                     style={{ 
                       '&:hover': { 
                         backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                       }
                     }}>
                  {stat.number}
                </div>
                
                <div className={`group-hover:text-gray-700 transition-colors duration-300 ${
                  themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Slideshow */}
      <section className={`py-20 ${
        themeMode === 'light' ? 'bg-white' : 'bg-gradient-to-br from-gray-900/30 to-[#11110f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center" id="about-section">
            <div className="space-y-8">
              <div>
                <h2 className={`text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
                  themeMode === 'light' ? 'text-gray-900' : 'text-white'
                }`} id="about-heading">
                  Sobre a <span className="text-transparent bg-clip-text" 
                               style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                    {businessSettings?.business_name?.split(' ')[0] || 'GM'} {businessSettings?.business_name?.split(' ').slice(1).join(' ') || 'Barbearia'}
                  </span>
                </h2>
                <p className={`text-lg leading-relaxed ${
                  themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`} id="about-description">
                  {businessSettings?.description || 
                   "Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className={`group p-6 rounded-2xl border hover:border-yellow-400/30 transition-all duration-500 hover:scale-105 ${
                  themeMode === 'light' 
                    ? 'bg-white border-gray-200 shadow-sm' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50'
                }`}>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                  <div className={`text-sm group-hover:text-gray-700 transition-colors duration-300 ${
                    themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>Clientes Satisfeitos</div>
                </div>
                <div className={`group p-6 rounded-2xl border hover:border-yellow-400/30 transition-all duration-500 hover:scale-105 ${
                  themeMode === 'light' 
                    ? 'bg-white border-gray-200 shadow-sm' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50'
                }`}>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">4.9★</div>
                  <div className={`text-sm group-hover:text-gray-700 transition-colors duration-300 ${
                    themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>Avaliação Média</div>
                </div>
              </div>
            </div>
            
            {/* Slideshow Component */}
            <div className="relative">
              <Slideshow 
                className="w-full h-96 lg:h-[500px]" 
                autoPlay={true} 
                interval={4000} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`py-20 relative ${themeMode === 'light' ? 'bg-gray-50' : 'bg-[#11110f]'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent"
             style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}05, transparent)` }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
              themeMode === 'light' ? 'text-gray-900' : 'text-white'
            }`} id="services-heading">
              Nossos <span className="text-transparent bg-clip-text" 
                          style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                Serviços
              </span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${themeMode === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>Qualidade e profissionalismo em cada atendimento</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultServices.map((service, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
                     style={{ background: `linear-gradient(to right, ${primaryColor}1a, ${secondaryColor}1a)` }}></div>
                <div className={`relative rounded-2xl p-6 border transition-all duration-500 hover:scale-105 backdrop-blur-sm ${
                  themeMode === 'light' 
                    ? 'bg-white border-gray-200 shadow-sm' 
                    : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50'
                }`}
                     style={{ '&:hover': { borderColor: `${primaryColor}4d` } }}>
                  <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 transition-all duration-500 ${themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}
                      style={{ 
                        '&:hover': { 
                          color: 'transparent',
                          backgroundClip: 'text',
                          backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
                        }
                      }}>
                    {service.name}
                  </h3>
                  <p className={`mb-4 transition-colors duration-300 ${themeMode === 'light' ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {service.description}
                  </p>
                  <div className="text-2xl font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                    {service.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={`py-20 ${
        themeMode === 'light' ? 'bg-white' : 'bg-gradient-to-br from-gray-900/20 to-[#11110f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" id="gallery-section">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
              themeMode === 'light' ? 'text-gray-900' : 'text-white'
            }`} id="gallery-heading">
              Nossa <span className="text-transparent bg-clip-text" 
                         style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                Galeria
              </span>
            </h2>
            <p className={`text-lg ${themeMode === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>Veja alguns dos nossos trabalhos profissionais</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <div key={image.id || index} className="group relative overflow-hidden rounded-2xl aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
                <img
                  src={image.image_url}
                  alt={image.alt_text || image.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    console.warn(`Gallery image failed to load: ${image.image_url}`);
                    e.currentTarget.src = 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                  <p className="text-gray-300 text-sm">{image.description || image.alt_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 relative ${
        themeMode === 'light' 
          ? 'bg-gradient-to-br from-gray-50 via-white/50 to-gray-50' 
          : 'bg-gradient-to-br from-[#11110f] via-gray-900/50 to-[#11110f]'
      }`}>
        <div className="absolute inset-0" 
             style={{ background: `linear-gradient(to right, ${primaryColor}0a, ${secondaryColor}0a)` }}></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className={`text-4xl lg:text-5xl font-bold leading-tight ${
              themeMode === 'light' ? 'text-gray-900' : 'text-white'
            }`} id="cta-heading">
              Pronto para um novo <span className="text-transparent bg-clip-text" 
                                       style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                visual?
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${
              themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Agende seu horário agora e experimente o melhor da barbearia tradicional
            </p>
            <Link
              to="/agendar"
              className="group inline-flex items-center space-x-3 text-black px-10 py-5 rounded-full text-xl font-semibold transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{ 
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 10px 15px -3px ${primaryColor}20`
              }}
            >
              <span>Agendar Agora</span>
              <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${
        themeMode === 'light' 
          ? 'bg-gray-100 border-gray-200' 
          : 'bg-[#11110f] border-yellow-400/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12" id="footer-section">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={businessSettings?.logo_url || "/WhatsApp Image 2025-06-26 at 08.22.png"} 
                  alt={businessSettings?.business_name || "GM Barbearia Logo"} 
                  className="w-12 h-12 rounded-full"
                />
                <span className={`text-2xl font-bold ${themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {businessSettings?.business_name || "GM Barbearia"}
                </span>
              </div>
              <p className={`leading-relaxed ${themeMode === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>
                {businessSettings?.business_name || "Tradição, estilo e qualidade em cada corte. Sua satisfação é nossa prioridade."}
              </p>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>Contato</h3>
              <div className="space-y-4">
                <div className={`flex items-center space-x-3 transition-colors duration-300 group ${
                  themeMode === 'light' 
                    ? 'text-gray-700 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}>
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{businessSettings?.phone || "(11) 99999-9999"}</span>
                </div>
                <div className={`flex items-center space-x-3 transition-colors duration-300 group ${
                  themeMode === 'light' 
                    ? 'text-gray-700 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}>
                  <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{businessSettings?.footer_address || businessSettings?.address?.split(',')[0] || "Rua das Flores, 123 - Centro"}</span>
                </div>
                <div className={`flex items-center space-x-3 transition-colors duration-300 group ${
                  themeMode === 'light' 
                    ? 'text-gray-700 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}>
                  <Clock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>
                    {businessSettings?.opening_hours ? 
                      `Seg-Sex: ${businessSettings.opening_hours.monday.open} às ${businessSettings.opening_hours.monday.close}` : 
                      "Seg-Sáb: 8h às 18h"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>Links Rápidos</h3>
              <div className="space-y-3">
                <Link to="/" className={`block transition-all duration-300 hover:translate-x-2 ${
                  themeMode === 'light' ? 'text-gray-700 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'
                }`}>Início</Link>
                <Link to="/agendar" className={`block transition-all duration-300 hover:translate-x-2 ${
                  themeMode === 'light' ? 'text-gray-700 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'
                }`}>Agendar</Link>
                <Link to="/contato" className={`block transition-all duration-300 hover:translate-x-2 ${
                  themeMode === 'light' ? 'text-gray-700 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'
                }`}>Contato</Link>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>Área Restrita</h3>
              <div className="space-y-3">
                <Link 
                  to="/admin/login" 
                  className={`flex items-center space-x-2 transition-all duration-300 hover:translate-x-2 group ${
                    themeMode === 'light' ? 'text-gray-700 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Painel Admin</span>
                </Link>
                <Link 
                  to="/barbeiro/login" 
                  className={`flex items-center space-x-2 transition-all duration-300 hover:translate-x-2 group ${
                    themeMode === 'light' ? 'text-gray-700 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Scissors className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Área do Barbeiro</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className={`border-t mt-12 pt-8 text-center ${
            themeMode === 'light' ? 'border-gray-200' : 'border-gray-800'
          }`}>
            <div className="space-y-4">
              <p className={themeMode === 'light' ? 'text-gray-700' : 'text-gray-400'}>
                &copy; 2025 {businessSettings?.business_name || "GM Barbearia"}. Todos os direitos reservados.
              </p>
              
              {/* Green Sistemas Credit */}
              <div className={`flex flex-col items-center space-y-3 pt-4 border-t ${
                themeMode === 'light' ? 'border-gray-200' : 'border-gray-800'
              }`}>
                <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                  Desenvolvido com ❤️ por:
                </p>
                <a
                  href="https://wa.me/5511951612874"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center space-x-3 border rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 ${
                    themeMode === 'light'
                      ? 'bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 hover:border-green-300'
                      : 'bg-gradient-to-r from-green-600/10 to-green-500/10 hover:from-green-600/20 hover:to-green-500/20 border-green-600/20 hover:border-green-500/40'
                  }`}
                >
                  <img
                    src="/green_sistemas_logo.png"
                    alt="Green Sistemas Logo"
                    className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      console.warn('Green Sistemas logo failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-left">
                    <div className={`font-semibold text-sm transition-colors duration-300 ${
                      themeMode === 'light' 
                        ? 'text-green-600 group-hover:text-green-700' 
                        : 'text-green-400 group-hover:text-green-300'
                    }`}>
                      Green Sistemas
                    </div>
                    <div className={`text-xs transition-colors duration-300 ${
                      themeMode === 'light' 
                        ? 'text-gray-600 group-hover:text-gray-700' 
                        : 'text-gray-500 group-hover:text-gray-400'
                    }`}>
                      Soluções em Tecnologia
                    </div>
                  </div>
                  <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${
                    themeMode === 'light' ? 'text-green-600' : 'text-green-500'
                  }`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                </a>
                <p className={`text-xs ${themeMode === 'light' ? 'text-gray-700' : 'text-gray-600'}`}>
                  Clique para entrar em contato via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;