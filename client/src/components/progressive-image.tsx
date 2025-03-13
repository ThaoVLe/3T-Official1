
import React, { useState, useEffect } from 'react';
import { ImageCache } from '../lib/image-cache';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  previewSize?: number | string;
  maxSize?: number;
  priority?: boolean;
  width?: number;
  quality?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  onError,
  previewSize = 10,
  maxSize = 500,
  priority = false,
  width,
  quality = 80
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  
  useEffect(() => {
    // First check cache
    const cachedSrc = ImageCache.get(src);
    if (cachedSrc) {
      setImageSrc(cachedSrc);
      setIsLoaded(true);
      return;
    }
    
    // Check if it's a blob URL - important for handling file uploads
    const isBlob = src.startsWith('blob:');
    
    // Set appropriate optimization parameters
    const optimizedSrc = isBlob ? src : (src + (src.includes('?') ? '&' : '?') + `q=${quality}&maxSize=${maxSize}`);
    // For blobs, we just use the original URL

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
  quality?: number;
  previewSize?: number;
  onClick?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  width,
  height,
  quality = 80,
  previewSize = 10,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (!src) return;

    // Reset states when src changes
    setIsLoaded(false);
    setIsError(false);

    // Check if image is in cache
    const cachedSrc = ImageCache.get(src);
    if (cachedSrc) {
      setImageSrc(cachedSrc);
      setIsLoaded(true);
      return;
    }

    // Create optimized URL with query parameters
    let optimizedSrc = src;
    const queryParams = new URLSearchParams();
    
    if (width) queryParams.append('w', width.toString());
    if (quality) queryParams.append('q', quality.toString());
    
    // Add size constraint for thumbnail preview (500KB)
    queryParams.append('maxSize', '500');
    
    // Add URL parameters if there are any
    if (queryParams.toString()) {
      optimizedSrc += (src.includes('?') ? '&' : '?') + queryParams.toString();
    }

    // Check if it's a blob URL - for blobs we don't create previews
    const isBlob = src.startsWith('blob:');
    
    if (isBlob) {
      // For blob URLs, just use the direct URL without modifications
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        ImageCache.set(src, src);
      };
      
      img.onerror = () => {
        console.error(`Failed to load blob image: ${src}`);
        setIsError(true);
        if (onError) onError();
      };
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    } else {
      // For regular URLs, use the progressive loading approach
      const previewSrc = src + (src.includes('?') ? '&' : '?') + `w=${previewSize}&q=30`;
      
      // Load the preview first
      const previewImg = new Image();
      previewImg.src = previewSrc;
      previewImg.onload = () => {
        setImageSrc(previewSrc);
        
        // Then load the full version
        const fullImg = new Image();
        fullImg.src = optimizedSrc;
        
        fullImg.onload = () => {
          setImageSrc(optimizedSrc);
          setIsLoaded(true);
          ImageCache.set(src, optimizedSrc);
        };
        
        fullImg.onerror = () => {
          console.error(`Failed to load image: ${optimizedSrc}`);
          setIsError(true);
          if (onError) onError();
        };
      };
      
      previewImg.onerror = () => {
        console.error(`Failed to load preview: ${previewSrc}`);
        // Try loading the full image directly
        const fullImg = new Image();
        fullImg.src = optimizedSrc;
        
        fullImg.onload = () => {
          setImageSrc(optimizedSrc);
          setIsLoaded(true);
          ImageCache.set(src, optimizedSrc);
        };
        
        fullImg.onerror = () => {
          console.error(`Failed to load image: ${optimizedSrc}`);
          setIsError(true);
          if (onError) onError();
        };
      };
      
      // Cleanup function
      return () => {
        previewImg.onload = null;
        previewImg.onerror = null;
      };
    }
  }, [src, width, quality, previewSize]);

  if (isError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`} 
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '200px' }}
        onClick={onClick}
      >
        <span className="text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${!isLoaded ? placeholderClassName : ''}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        transition: 'filter 0.3s ease-out',
        filter: isLoaded ? 'none' : 'blur(8px)',
      }}
      loading="lazy"
      onClick={onClick}
      onError={() => setIsError(true)}
    />
  );
};
