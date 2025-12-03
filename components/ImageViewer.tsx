import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    const safeName = (alt || 'design').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `LuxeInterior-${safeName}-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200 select-none">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
         <div className="text-white/80 font-medium px-4 text-sm hidden md:block">{alt}</div>
         <div className="flex items-center gap-3">
            <button 
                onClick={handleDownload}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm group"
                title="Download Image"
            >
                <Download size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={onClose} 
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm group"
                aria-label="Close viewer"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
         </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-stone-900/90 p-2 pl-4 pr-2 rounded-full border border-stone-700 backdrop-blur-md shadow-2xl">
        <button 
            onClick={handleZoomOut} 
            disabled={scale <= 1} 
            className="p-2 text-white hover:text-accent disabled:opacity-30 disabled:hover:text-white transition-colors"
            title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        
        <span className="text-white text-sm font-mono w-12 text-center select-none">
            {Math.round(scale * 100)}%
        </span>
        
        <button 
            onClick={handleZoomIn} 
            disabled={scale >= 4} 
            className="p-2 text-white hover:text-accent disabled:opacity-30 disabled:hover:text-white transition-colors"
            title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        
        <div className="w-px h-5 bg-stone-700 mx-1"></div>
        
        <button 
            onClick={handleReset} 
            className="p-2 text-white hover:text-accent transition-colors" 
            title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Image Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
            if (scale === 1) onClose(); // Click background to close if not zoomed
        }}
      >
        <img 
          src={src} 
          alt={alt}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
          className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};