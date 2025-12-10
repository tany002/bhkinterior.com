

import React from 'react';

interface LandingGalleryProps {
  images: string[];
}

export const LandingGallery: React.FC<LandingGalleryProps> = ({ images }) => {
  return (
    <section className="py-24 bg-stone-50" id="gallery">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
            {/* New Chic Header */}
            <div className="inline-block relative mb-4">
                 <span className="font-serif italic text-2xl md:text-3xl text-brand-rose mb-2 block transform -rotate-2">Made with Love</span>
                 <h2 className="text-5xl md:text-7xl font-serif font-bold text-brand-taupe relative z-10 tracking-tight leading-none">
                    Design Gallery
                 </h2>
                 <div className="absolute -bottom-2 left-4 right-4 h-3 bg-brand-rose/20 -rotate-1 rounded-full z-0"></div>
            </div>
            
            <p className="mt-6 text-brand-taupe/60 text-lg font-light tracking-wide max-w-2xl mx-auto">
               Discover how everyday spaces are being transformed into stunning sanctuaries by <span className="font-semibold text-brand-taupe">BHKInterior.com</span>
            </p>
        </div>

        <div className="columns-2 md:columns-4 gap-4 px-4 space-y-4">
            {images.map((src, i) => (
                <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden hover:opacity-90 transition-opacity cursor-zoom-in shadow-sm group relative">
                    <img 
                        src={src} 
                        className="w-full h-auto" 
                        alt="Gallery" 
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'; // Hide image if it fails to load
                            e.currentTarget.parentElement!.style.display = 'none'; // Hide container
                        }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
            ))}
        </div>
    </section>
  );
};