import React from 'react';

interface LandingGalleryProps {
  images: string[];
}

export const LandingGallery: React.FC<LandingGalleryProps> = ({ images }) => {
  return (
    <section className="py-24 bg-stone-50" id="gallery">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Made with HomeInterior.AI</h2>
        </div>
        <div className="columns-2 md:columns-4 gap-4 px-4 space-y-4">
            {images.map((src, i) => (
                <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden hover:opacity-90 transition-opacity cursor-zoom-in">
                    <img src={src} className="w-full h-auto" alt="Gallery" />
                </div>
            ))}
        </div>
    </section>
  );
};