import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaViewerProps {
  urls: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaViewer({ urls, initialIndex, isOpen, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [direction, setDirection] = useState<'horizontal' | 'vertical' | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (!direction) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection('horizontal');
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setDirection('vertical');
      }
    }

    if (direction === 'horizontal') {
      setOffsetX(deltaX);
      e.preventDefault();
    } else if (direction === 'vertical' && deltaY > 50) {
      onClose();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = window.innerWidth * 0.3;
    if (Math.abs(offsetX) > threshold) {
      if (offsetX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (offsetX < 0 && currentIndex < urls.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    setIsDragging(false);
    setOffsetX(0);
    setDirection(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white p-2"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="w-full h-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false}>
          {urls.map((url, index) => {
            const isVideo = url.match(/\.(mp4|webm|MOV|mov)$/i);
            if (index !== currentIndex) return null;

            return (
              <motion.div
                key={url}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, x: offsetX }}
                animate={{ opacity: 1, x: offsetX }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {isVideo ? (
                  <video
                    src={url}
                    className="max-h-full max-w-full object-contain"
                    controls
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
