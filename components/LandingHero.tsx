
import React, { useState } from 'react';
import { ArrowRight, Check, Star, LayoutTemplate, Armchair, Ruler, PenTool, Layers } from 'lucide-react';
import { Button } from './Button';

interface LandingHeroProps {
  headline: React.ReactNode;
  subheadline: string;
  ctaText: string;
  onCtaClick: (formData: { name: string; email: string; phone: string }) => void;
  onSecondaryClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ 
  headline, 
  subheadline, 
  ctaText, 
  onCtaClick,
  onSecondaryClick
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  return (
    <div className="relative overflow-hidden bg-brand-cream text-brand-taupe min-h-[85vh] flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
         <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-rose/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-brand-shadow/10 rounded-full blur-[100px]" />
         
         {/* Animated Floating Designs */}
         <div className="absolute top-[10%] left-[5%] opacity-[0.03] text-brand-taupe animate-float-slow hidden lg:block">
            <LayoutTemplate size={300} strokeWidth={0.5} />
         </div>
         <div className="absolute bottom-[15%] right-[50%] opacity-[0.02] text-brand-taupe animate-float-reverse hidden md:block">
            <Armchair size={240} strokeWidth={0.5} />
         </div>
         <div className="absolute top-[20%] right-[10%] opacity-[0.03] text-brand-taupe animate-float-sideways hidden lg:block">
            <Layers size={180} strokeWidth={0.5} />
         </div>
         <div className="absolute bottom-[10%] left-[20%] opacity-[0.02] text-brand-taupe animate-float-slow">
            <Ruler size={200} strokeWidth={0.5} className="rotate-45" />
         </div>
         <div className="absolute top-[40%] left-[45%] opacity-[0.02] text-brand-taupe animate-float-reverse">
            <PenTool size={150} strokeWidth={0.5} className="-rotate-12" />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Text Content */}
          <div className="text-left animate-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-brand-rose/30 backdrop-blur-md mb-5">
                <span className="flex h-2 w-2 rounded-full bg-brand-rose"></span>
                <span className="text-xs font-bold tracking-widest uppercase text-brand-taupe/80">BHKInterior.com</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-brand-taupe mb-4 tracking-tight leading-[1.05]">
              {headline}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-taupe/80 mb-8 leading-relaxed max-w-lg font-light">
              {subheadline}
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {onSecondaryClick && (
                  <Button 
                      variant="outline" 
                      onClick={onSecondaryClick} 
                      className="px-8 py-3 text-base rounded-full border-brand-shadow text-brand-taupe hover:bg-brand-cream bg-transparent transition-all"
                  >
                    View Gallery
                  </Button>
                )}
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-1000 delay-100">
                  <div className="flex -space-x-4">
                      {[
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64"
                      ].map((src, i) => (
                          <img key={i} src={src} alt="User" className="w-12 h-12 rounded-full border-2 border-brand-cream object-cover shadow-sm" />
                      ))}
                  </div>
                  <div>
                      <div className="flex text-amber-500 mb-1">
                          {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" className="mr-0.5"/>)}
                      </div>
                      <p className="text-sm font-medium text-brand-taupe/80">
                          <span className="font-bold text-brand-taupe">The Choice</span> of Modern Homeowners
                      </p>
                  </div>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div className="animate-in slide-in-from-right duration-1000 delay-200 w-full">
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-2xl max-w-md mx-auto lg:mr-0 relative">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand-rose/10 rounded-bl-[2rem] rounded-tr-[2rem] -z-10"></div>
                  
                  <h3 className="text-2xl font-serif font-bold text-brand-taupe mb-2">Get Started</h3>
                  <p className="text-brand-taupe/60 text-sm mb-6">Register to unlock AI design tools.</p>

                  <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-brand-taupe/60 uppercase tracking-wide mb-1 ml-1">Name</label>
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full px-5 py-3 rounded-xl border border-brand-rose/30 bg-white/50 placeholder-brand-taupe/30 focus:ring-2 focus:ring-brand-rose focus:outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-taupe/60 uppercase tracking-wide mb-1 ml-1">Email</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="w-full px-5 py-3 rounded-xl border border-brand-rose/30 bg-white/50 placeholder-brand-taupe/30 focus:ring-2 focus:ring-brand-rose focus:outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-taupe/60 uppercase tracking-wide mb-1 ml-1">Phone <span className="opacity-50 lowercase font-normal">(optional)</span></label>
                        <input 
                            type="tel" 
                            placeholder="+1 (555) 000-0000" 
                            className="w-full px-5 py-3 rounded-xl border border-brand-rose/30 bg-white/50 placeholder-brand-taupe/30 focus:ring-2 focus:ring-brand-rose focus:outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                  </div>
                  
                  <Button 
                      onClick={() => onCtaClick(formData)} 
                      className="w-full py-4 text-lg rounded-xl !bg-[#3B2F2F] !text-[#F8F4EE] font-bold tracking-[0.01em] !hover:bg-[#5A4545] shadow-xl hover:shadow-brand-rose/50 transition-all transform hover:-translate-y-1"
                  >
                      {ctaText} <ArrowRight className="ml-2" size={20} />
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-brand-taupe/50">
                      <span className="flex items-center gap-1"><Check size={12}/> No credit card required</span>
                      <span className="flex items-center gap-1"><Check size={12}/> Free trial</span>
                  </div>
              </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-reverse {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(15px) rotate(-2deg); }
        }
        @keyframes float-sideways {
            0%, 100% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(15px) translateY(-10px); }
        }
        .animate-float-slow { animation: float-slow 20s infinite ease-in-out; }
        .animate-float-reverse { animation: float-reverse 25s infinite ease-in-out; }
        .animate-float-sideways { animation: float-sideways 22s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
