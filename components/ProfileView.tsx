
import React from 'react';
import { UserProfile, AppStep } from '../types';
import { User, Mail, Phone, MapPin, Award, ArrowLeft, Users, CreditCard, Layout, Globe, Home, Shield } from 'lucide-react';
import { Button } from './Button';

interface ProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
  onEdit?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onBack, onEdit }) => {
  
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'ultra': return 'bg-gray-900 text-white border-gray-900';
      case 'premium': return 'bg-brand-taupe text-white border-brand-taupe';
      case 'pro': return 'bg-brand-rose text-brand-taupe border-brand-rose';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
          <h1 className="text-xl font-serif font-bold text-gray-900">My Account</h1>
          <div className="w-8"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Profile Hero */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-stone-100 flex items-center justify-center border-4 border-white shadow-lg text-stone-400">
             {profile.name ? (
               <span className="text-5xl font-serif font-bold text-stone-600">{profile.name[0].toUpperCase()}</span>
             ) : (
               <User size={64} />
             )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              <h2 className="text-3xl font-serif font-bold text-gray-900">{profile.name || 'Guest User'}</h2>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getTierColor(profile.tier)}`}>
                {profile.tier} Member
              </span>
            </div>
            <p className="text-gray-500 mb-6">Member since {new Date().getFullYear()}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
               {profile.email && (
                 <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Mail size={16} className="text-brand-taupe"/> {profile.email}
                 </div>
               )}
               {profile.phone && (
                 <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Phone size={16} className="text-brand-taupe"/> {profile.phone}
                 </div>
               )}
               <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  <Globe size={16} className="text-brand-taupe"/> {profile.region}
               </div>
            </div>
          </div>
          
          {onEdit && (
            <Button variant="outline" onClick={onEdit} className="shrink-0">
               Edit Profile
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Subscription Details */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-rose/20 text-brand-taupe rounded-xl">
                   <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Subscription & Usage</h3>
             </div>
             
             <div className="space-y-6 flex-1">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{profile.tier} Plan</p>
                   </div>
                   {profile.isSubscribed && (
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Active</span>
                   )}
                </div>

                <div>
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Design Credits Used</span>
                      <span className="font-bold text-gray-900">{profile.designCount} / {profile.maxDesigns === 10000 ? 'Unlimited' : profile.maxDesigns}</span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-taupe rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((profile.designCount / (profile.maxDesigns || 1)) * 100, 100)}%` }}
                      />
                   </div>
                </div>
                
                {profile.billingCycle && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Billing Cycle: <span className="font-medium text-gray-900 capitalize">{profile.billingCycle.replace('_', ' ')}</span></p>
                  </div>
                )}
             </div>
          </div>

          {/* Design Preferences */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                   <Home size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Design Profile</h3>
             </div>
             
             {profile.onboardingData ? (
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <span className="text-sm text-gray-500">Property Type</span>
                     <span className="font-medium text-gray-900">{profile.onboardingData.homeType}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <span className="text-sm text-gray-500">Location</span>
                     <span className="font-medium text-gray-900">
                        {profile.onboardingData.location.city ? `${profile.onboardingData.location.city}, ` : ''}
                        {profile.region}
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <span className="text-sm text-gray-500">Preferred Style</span>
                     <span className="font-medium text-gray-900 capitalize">{profile.stylePreference || profile.onboardingData.styles[0] || 'Not Set'}</span>
                  </div>
               </div>
             ) : (
               <div className="text-center py-8 text-gray-400">
                  <p>No design preferences set yet.</p>
                  <Button variant="outline" className="mt-4" onClick={onBack}>Start Designing</Button>
               </div>
             )}
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 md:col-span-2">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                       <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Family Members</h3>
                </div>
                <span className="text-sm text-gray-500">
                   {profile.familyMembers.length} / 5 Active
                </span>
             </div>

             {profile.familyMembers.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {profile.familyMembers.map((member, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-taupe font-bold">
                            {member.phone.slice(-2)}
                         </div>
                         <div>
                            <p className="font-medium text-gray-900">{member.phone}</p>
                            <p className="text-xs text-gray-500 capitalize">{member.role} • Added {formatDate(member.addedAt)}</p>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                   <p className="text-gray-500 mb-2">No family members added yet.</p>
                   {profile.tier === 'free' || profile.tier === 'pro' ? (
                      <p className="text-xs text-orange-500">Upgrade to Premium to add family members.</p>
                   ) : (
                      <p className="text-xs text-gray-400">Add members from the dashboard to share designs.</p>
                   )}
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
