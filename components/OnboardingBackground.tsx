
import React from 'react';

const DESIGN_TILES = [
  "https://images.pexels.com/photos/29383009/pexels-photo-29383009.jpeg?cs=srgb&dl=pexels-thisispav-29383009.jpg&fm=jpg", // Japandi
  "https://images.pexels.com/photos/34980822/pexels-photo-34980822.jpeg?cs=srgb&dl=pexels-tiffanychristiefreeman-34980822.jpg&fm=jpg", // Minimalist
  "https://images.pexels.com/photos/31594912/pexels-photo-31594912.jpeg?cs=srgb&dl=pexels-edmond-elshani-2521534-31594912.jpg&fm=jpg", // Scandinavian
  "https://images.pexels.com/photos/32062852/pexels-photo-32062852.jpeg?cs=srgb&dl=pexels-tr-n-tu-n-anh-2151426479-32062852.jpg&fm=jpg", // Industrial
  "https://images.pexels.com/photos/5157576/pexels-photo-5157576.jpeg?cs=srgb&dl=pexels-reneterp-5157576.jpg&fm=jpg", // Traditional
  "https://images.pexels.com/photos/34677885/pexels-photo-34677885.jpeg?cs=srgb&dl=pexels-aj-collins-artistry-1772576281-34677885.jpg&fm=jpg", // Boho
  "https://images.pexels.com/photos/7688071/pexels-photo-7688071.jpeg?cs=srgb&dl=pexels-kindelmedia-7688071.jpg&fm=jpg", // Mid-century
  "https://images.pexels.com/photos/8142059/pexels-photo-8142059.jpeg?cs=srgb&dl=pexels-heyho-8142059.jpg&fm=jpg" // Modern Farmhouse
];

export const OnboardingBackground: React.FC = () => {
  // Create infinite arrays for seamless scrolling loop by tripling the data
  const column1 = [...DESIGN_TILES, ...DESIGN_TILES, ...DESIGN_TILES];
  const column2 = [...DESIGN_TILES.slice(2).concat(DESIGN_TILES.slice(0,2)), ...DESIGN_TILES, ...DESIGN_TILES]; 
  const column3 = [...DESIGN_TILES.slice(4).concat(DESIGN_TILES.slice(0,4)), ...DESIGN_TILES, ...DESIGN_TILES];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-stone-100 pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-3 gap-4 opacity-20 scale-105">
        
        {/* Column 1 - Moves Up */}
        <div className="flex flex-col gap-4 animate-scroll-up">
            {column1.map((src, i) => (
                <div key={`c1-${i}`} className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                </div>
            ))}
        </div>
        
        {/* Column 2 - Moves Down (slower) */}
        <div className="flex flex-col gap-4 animate-scroll-down -mt-40">
            {column2.map((src, i) => (
                <div key={`c2-${i}`} className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                </div>
            ))}
        </div>

        {/* Column 3 - Moves Up */}
        <div className="flex flex-col gap-4 animate-scroll-up -mt-20">
            {column3.map((src, i) => (
                <div key={`c3-${i}`} className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                </div>
            ))}
        </div>
      </div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-stone-50/90 backdrop-blur-[2px]" />
      
      <style>{`
        @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-33.33%); } 
        }
        @keyframes scroll-down {
            0% { transform: translateY(-33.33%); }
            100% { transform: translateY(0); }
        }
        .animate-scroll-up {
            animation: scroll-up 60s linear infinite;
        }
        .animate-scroll-down {
            animation: scroll-down 70s linear infinite;
        }
      `}</style>
    </div>
  );
};
