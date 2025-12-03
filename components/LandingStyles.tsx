import React from 'react';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

interface StyleItem {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface LandingStylesProps {
  styles: StyleItem[];
  onStartFlow: () => void;
}

export const LandingStyles: React.FC<LandingStylesProps> = ({ styles, onStartFlow }) => {
  return (
    <section className="py-24 bg-brand-cream border-t border-brand-rose/20">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-taupe mb-4 tracking-tight">Curated Aesthetics</h2>
            <p className="text-brand-taupe/70 text-lg max-w-2xl mx-auto">Explore our comprehensive library of 45+ global design languages. Click any style to start designing.</p>
        </div>
        
        {/* Full Grid Layout showing all styles at once */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto">
            {styles.map(style => (
                <div key={style.id} className="group cursor-pointer" onClick={onStartFlow}>
                    <div className="relative h-[360px] rounded-[2rem] overflow-hidden shadow-md border border-white/50 group-hover:shadow-2xl group-hover:border-brand-rose transition-all duration-500 bg-[#EDE4DB]">
                        {/* Image Layer */}
                        <img 
                            src={style.image} 
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                            alt={style.name} 
                            loading="lazy"
                        />
                        
                        {/* Softer Gradient Overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-taupe/90 via-transparent to-transparent opacity-90" />
                        
                        {/* Content Layer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <p className="text-brand-cream/80 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">BHKInterior.com Exclusive</p>
                            <h3 className="text-brand-cream text-2xl font-serif font-bold mb-1 leading-tight">{style.name}</h3>
                            <p className="text-brand-cream/90 text-xs line-clamp-2 leading-relaxed mb-4 opacity-80 group-hover:opacity-100">{style.description}</p>
                            
                            {/* CTA on Hover */}
                            <div className="flex items-center gap-2 text-brand-cream font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                                <span>Try this style</span>
                                <div className="w-6 h-6 rounded-full bg-brand-cream/20 backdrop-blur flex items-center justify-center group-hover:bg-brand-cream/30 transition-colors">
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </section>
  );
};