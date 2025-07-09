import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { db, type SlideshowImage } from '../lib/supabase';

interface SlideshowProps {
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

const Slideshow: React.FC<SlideshowProps> = ({ 
  className = '', 
  autoPlay = true, 
  interval = 5000 
}) => {
  const [images, setImages] = useState<SlideshowImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, images.length, interval]);

  const loadImages = async () => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Slideshow loading timeout')), 10000);
      });
      
      const imagesPromise = db.slideshow.getAll();
      const data = await Promise.race([imagesPromise, timeoutPromise]);
      setImages(data);
    } catch (error) {
      console.error('Error loading slideshow images:', error);
      // Set fallback images to prevent empty slideshow
      setImages([
        {
          id: 'fallback-1',
          title: 'GM Barbearia',
          image_url: '/WhatsApp Image 2025-06-26 at 08.22.png',
          alt_text: 'GM Barbearia - Tradição e qualidade',
          order_index: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-gray-800 animate-pulse ${className}`}>
        <div className="w-full h-96"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <p>Nenhuma imagem disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-3xl border border-yellow-400/20 ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-96 overflow-hidden">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image.image_url}
              alt={image.alt_text || image.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                console.warn(`Slideshow image failed to load: ${image.image_url}`);
                e.currentTarget.src = 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=400';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {images.length > 1 && (
        <button
          onClick={togglePlayPause}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      )}

      {/* Image Title */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-white font-semibold text-lg">
            {images[currentIndex]?.title}
          </h3>
          {images[currentIndex]?.alt_text && (
            <p className="text-gray-300 text-sm mt-1">
              {images[currentIndex].alt_text}
            </p>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-yellow-400 scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Slideshow;