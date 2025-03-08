import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export function ProgressiveImage({ src, alt, className = '', sizes }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Generate low quality placeholder URL
  const placeholderUrl = `${src}?w=20&q=10`;

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);

    // Start with low quality placeholder
    const placeholderImage = new Image();
    placeholderImage.src = placeholderUrl;
    placeholderImage.onload = () => {
      setCurrentSrc(placeholderUrl);
    };

    // Load high quality image
    const highQualityImage = new Image();
    highQualityImage.src = src;
    highQualityImage.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src, placeholderUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="placeholder"
            className="absolute inset-0 bg-muted animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      <motion.img
        src={currentSrc}
        alt={alt}
        className={`${className} ${!isLoaded ? 'blur-sm scale-105' : ''}`}
        style={{ 
          transition: 'filter 0.3s ease-out, transform 0.3s ease-out'
        }}
        sizes={sizes}
        loading="lazy"
      />
    </div>
  );
}
