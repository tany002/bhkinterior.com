
import React from 'react';
import { Button } from './Button';
import { Check, AlertTriangle, Crown } from 'lucide-react';
import { SubscriptionTier, BillingCycle } from '../types';

interface LandingPricingProps {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  handlePlanSelect: (tier: SubscriptionTier) => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ billingCycle, setBillingCycle, handlePlanSelect }) => {
  
  // Updated Pricing Logic in INR
  // Pro: 599 | Premium: 799 | Ultra: 999
  // 6mo discount: ~4.99%
  // Yearly discount: ~14.99%
  const pricing = {
      monthly: { pro: 599, premium: 799, ultra: 999 },
      half_yearly: { pro: 569, premium: 759, ultra: 949 },
      yearly: { pro: 509, premium: 679, ultra: 849 }
  };

  return (
    <section className="py-24 bg-brand-cream" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-5xl font-serif font-bold text-brand-taupe mb-6 tracking-tight">Simple, scalable pricing</h2>
                <p className="text-brand-taupe/70 text-lg mb-10 leading-relaxed">Curated plans for every design ambition.</p>
                
                {/* Toggle */}
                <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-brand-rose/30">
                    {[{id:'monthly', label:'Monthly'}, {id:'half_yearly', label:'6 Months', tag:'-5%'}, {id:'yearly', label:'Yearly', tag:'-15%'}].map(cycle => (
                        <button 
                            key={cycle.id}
                            onClick={() => setBillingCycle(cycle.id as any)}
                            className={`px-6 md:px-8 py-3 rounded-full text-sm font-bold transition-all relative ${billingCycle === cycle.id ? 'bg-brand-taupe text-brand-cream shadow-md' : 'text-brand-taupe/60 hover:text-brand-taupe'}`}
                        >
                            {cycle.label}
                            {cycle.tag && <span className="absolute -top-3 -right-2 text-[10px] bg-brand-rose text-brand-taupe px-2 py-0.5 rounded-full font-bold">{cycle.tag}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                {/* PRO (Light Card) */}
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-brand-shadow/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-brand-taupe mb-2">Pro</h3>
                        <p className="text-sm text-brand-taupe/60">Essential tools for casual redesigns.</p>
                    </div>
                    <div className="text-4xl font-bold mb-6 text-brand-taupe">₹{pricing[billingCycle].pro}<span className="text-lg font-medium text-brand-taupe/50">/mo</span></div>
                    
                    <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => handlePlanSelect('pro')} 
                        className="mb-8 border-brand-taupe/20 text-brand-taupe hover:bg-brand-cream py-3 text-lg font-bold"
                    >
                        Start Pro Trial
                    </Button>

                    <ul className="space-y-4 text-sm text-brand-taupe/80">
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 1,000 Designs/mo</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Basic Renders</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 4 Concurrent Units</li>
                        <li className="flex gap-3 items-center text-red-600 bg-red-50 p-2 rounded-lg w-fit"><AlertTriangle size={14}/> Low Quality Output</li>
                    </ul>
                </div>

                {/* PREMIUM (Highlighted - Darker Taupe) */}
                <div className="bg-brand-taupe text-brand-cream p-10 rounded-3xl shadow-2xl border border-brand-taupe transform md:scale-105 relative z-10">
                    <div className="absolute top-5 right-5 bg-brand-rose text-brand-taupe text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                    <div className="mb-6 mt-2">
                        <h3 className="text-2xl font-bold">Premium</h3>
                        <p className="text-sm text-brand-cream/60">For serious homeowners & creators.</p>
                    </div>
                    <div className="text-5xl font-bold mb-8">₹{pricing[billingCycle].premium}<span className="text-lg font-medium text-brand-cream/50">/mo</span></div>
                    
                    <Button 
                        fullWidth 
                        onClick={() => handlePlanSelect('premium')} 
                        className="mb-8 bg-brand-cream text-brand-taupe hover:bg-white border-none py-4 text-lg font-extrabold shadow-lg"
                    >
                        Get Premium Access
                    </Button>
                    
                    <ul className="space-y-4 text-brand-cream/90 text-sm font-medium">
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 5,000 Designs/mo</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 8K Ultra Photorealism</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 3D Ultra Zone</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Advanced Furniture Editor</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Share with 5 Family Members</li>
                    </ul>
                </div>

                {/* ULTRA (Light Card) */}
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-brand-shadow/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-brand-taupe mb-2">Ultra</h3>
                        <p className="text-sm text-brand-taupe/60">For large estates & professionals.</p>
                    </div>
                    <div className="text-4xl font-bold mb-6 text-brand-taupe">₹{pricing[billingCycle].ultra}<span className="text-lg font-medium text-brand-taupe/50">/mo</span></div>
                    
                    <Button 
                        variant="outline" 
                        fullWidth 
                        onClick={() => handlePlanSelect('ultra')} 
                        className="mb-8 border-brand-rose bg-brand-cream/50 text-brand-taupe hover:bg-brand-rose/20 py-3 text-lg font-bold"
                    >
                        Select Ultra
                    </Button>

                    <ul className="space-y-4 text-sm text-brand-taupe/80">
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> 10,000 Designs/mo</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Priority Support</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Family Editing (5 Users)</li>
                        <li className="flex gap-3"><Check size={16} className="text-brand-rose"/> Commercial Usage Rights</li>
                    </ul>
                </div>
            </div>
            
            <p className="text-center text-brand-taupe/60 text-sm mt-12 font-medium">Prices in INR. Cancel anytime.</p>
        </div>
    </section>
  );
};
