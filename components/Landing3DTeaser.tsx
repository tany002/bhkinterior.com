import React, { useState } from 'react';
import { Play, Cuboid, X, MousePointer2 } from 'lucide-react';

export const Landing3DTeaser: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // High-res image for the effect
  const IMAGE_URL = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80";

  return (
    <section className="py-24 bg-stone-50 border-t border-brand-rose/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
             <div className="mb-12">
                <span className="text-brand-rose font-bold tracking-widest uppercase text-xs mb-3 block">Interactive Experience</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-taupe tracking-tight">Walk Through Your Future Home</h2>
             </div>
             
             <div className="relative group perspective-1000 max-w-5xl mx-auto">
                  <div 
                    className="relative shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white bg-brand-cream h-[600px] w-full isolate"
                  >
                      {/* Image Layer with CSS Animation */}
                      <img 
                        src={IMAGE_URL}
                        alt="3D Ultra" 
                        className={`w-full h-full object-cover transition-all duration-700 ease-in-out`}
                        style={{
                            animation: isPlaying ? 'pan-image 20s infinite alternate linear' : 'none',
                            transform: isPlaying ? 'scale(1.4)' : 'scale(1)'
                        }}
                      />
                      
                      {/* Overlay Content (Idle) */}
                      {!isPlaying && (
                        <>
                          <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-500">
                              <div className="flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm mb-2 backdrop-blur-sm bg-white/20 w-fit px-4 py-1 rounded-full"><Cuboid size={16} /> 3D Ultra Mode</div>
                              <div className="text-white text-4xl font-serif tracking-tight text-left">Transitional Duplex Tour</div>
                          </div>
                          
                          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                               <button 
                                 onClick={() => setIsPlaying(true)}
                                 className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl cursor-pointer hover:bg-white/30 transition-colors"
                               >
                                   <Play className="text-white ml-2" size={40} fill="white" />
                               </button>
                          </div>
                        </>
                      )}

                      {/* Active State UI */}
                      {isPlaying && (
                          <>
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30">
                               <div className="bg-white/90 backdrop-blur text-brand-taupe px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm animate-pulse">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Live Walkthrough
                               </div>
                               <button 
                                 onClick={() => setIsPlaying(false)}
                                 className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur transition-colors"
                               >
                                  <X size={24} />
                               </button>
                            </div>

                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                               <div className="inline-flex items-center gap-3 text-white/90 text-xs uppercase tracking-widest bg-black/40 backdrop-blur px-6 py-2 rounded-full shadow-sm">
                                    <MousePointer2 size={12} /> Auto-Navigation Active
                               </div>
                            </div>
                          </>
                      )}
                  </div>
              </div>
        </div>
        <style>{`
          @keyframes pan-image {
            0% { transform: scale(1.4) translate(0, 0); }
            25% { transform: scale(1.5) translate(-2%, 1%); }
            50% { transform: scale(1.4) translate(0, 2%); }
            75% { transform: scale(1.5) translate(2%, 1%); }
            100% { transform: scale(1.4) translate(0, 0); }
          }
        `}</style>
    </section>
  );
};