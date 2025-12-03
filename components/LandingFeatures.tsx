import React from 'react';
import { Aperture, Cuboid, Layers, Wrench } from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-24 bg-brand-cream text-brand-taupe relative overflow-hidden">
        {/* Soft Glows instead of dark blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-rose/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-shadow/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
                <span className="text-brand-rose font-bold tracking-widest uppercase text-xs mb-3 block">Technology</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-taupe tracking-tight">Why Millions Trust AI for Interiors</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { icon: <Aperture size={28} className="text-brand-rose"/>, title: "8K Photorealism", desc: "Ray-traced quality renders with physically accurate lighting." },
                    { icon: <Cuboid size={28} className="text-brand-rose"/>, title: "3D Ultra Mode", desc: "Walk through your reimagined space in interactive 3D." },
                    { icon: <Layers size={28} className="text-brand-rose"/>, title: "5+ Style Variants", desc: "Instantly visualize your room in multiple global aesthetics." },
                    { icon: <Wrench size={28} className="text-brand-rose"/>, title: "Pro Editing", desc: "Swap furniture, adjust colors, and fix layouts in seconds." }
                ].map((feat, i) => (
                    <div key={i} className="group bg-white/40 backdrop-blur-md border border-brand-shadow/20 p-8 rounded-3xl hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-brand-rose/50">
                        
                        <div className="relative z-10">
                            <div className="mb-6 bg-brand-cream w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-brand-shadow/10">
                                {feat.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-brand-taupe group-hover:text-stone-800 transition-colors">{feat.title}</h3>
                            <p className="text-brand-taupe/70 leading-relaxed text-sm group-hover:text-brand-taupe transition-colors">{feat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};