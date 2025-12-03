
import React, { useState } from 'react';
import { Play, Cuboid } from 'lucide-react';

export const Landing3DTeaser: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    // Animation runs for 10s
    setTimeout(() => {
        setIsPlaying(false);
    }, 10000);
  };

  return (
    <section className="py-24 bg-stone-50 border-t border-brand-rose/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
             <div className="mb-12">
                <span className="text-brand-rose font-bold tracking-widest uppercase text-xs mb-3 block">Interactive Experience</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-taupe tracking-tight">Walk Through Your Future Home</h2>
             </div>
             
             <div className="relative group perspective-1000 max-w-4xl mx-auto">
                  <div 
                    className="relative transform transition-all duration-700 shadow-2xl rounded-[3rem] overflow-hidden border-8 border-white bg-brand-rose/10 h-[600px] w-full isolate cursor-pointer"
                    onClick={!isPlaying ? handlePlay : undefined}
                  >
                      <img 
                        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80" 
                        alt="3D Ultra" 
                        className={`w-full h-full object-cover will-change-transform ${isPlaying ? 'animate-walkthrough' : 'group-hover:scale-105 transition-transform duration-1000'}`} 
                      />
                      
                      {/* Overlay Content */}
                      <div className={`absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-700 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                          <div className="flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm mb-2 backdrop-blur-sm bg-white/20 w-fit px-4 py-1 rounded-full"><Cuboid size={16} /> 3D Ultra Mode</div>
                          <div className="text-white text-4xl font-serif tracking-tight text-left">Immersive 3D Walkthroughs</div>
                      </div>
                      
                      {/* Play Button */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 hover:scale-110 transition-transform shadow-2xl">
                               <Play className="text-white ml-2" size={40} fill="white" />
                           </div>
                      </div>

                      {/* Playing Indicator */}
                      <div className={`absolute top-8 right-8 bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
                      </div>
                  </div>
              </div>
        </div>
        
        <style>{`
            @keyframes walkthrough {
                0% { transform: scale(1) translate3d(0,0,0); }
                20% { transform: scale(1.5) translate3d(-5%, 2%, 0) rotate(1deg); }
                50% { transform: scale(1.6) translate3d(5%, -2%, 0) rotate(-1deg); }
                80% { transform: scale(1.2) translate3d(0, 0, 0); }
                100% { transform: scale(1) translate3d(0,0,0); }
            }
            .animate-walkthrough {
                animation: walkthrough 10s ease-in-out forwards;
            }
        `}</style>
    </section>
  );
};
