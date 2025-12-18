import React from 'react';
import { Instagram, Youtube, Twitter, Github } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const socials = [
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Github, href: "https://github.com/tany002/bhkinterior.com" }
  ];

  // Handle clicks on footer links
  const handleLinkClick = (label: string) => {
    if (label === 'Contact') {
      // 🔔 Trigger a global event to open the Contact Page (handled by App.tsx)
      window.dispatchEvent(new CustomEvent('open-contact'));
    } else if (label === 'Pricing') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else if (label === 'Gallery') {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const footerLinks = ['Pricing', 'Gallery', 'About Us', 'Contact', 'Privacy Policy'];

  return (
    <footer className="bg-brand-taupe text-brand-cream/80 py-20 border-t border-brand-shadow/20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden bg-brand-cream border-2 border-brand-cream/50 p-1">
              <img 
                src="https://i.postimg.cc/prMkF5Kb/Gemini-Generated-Image-roq6qrroq6qrroq6.png" 
                alt="BHK Interior Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML =
                    '<span class="font-serif font-bold text-xl text-brand-taupe">BHK</span>';
                }}
              />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-brand-cream">
              BHKInterior.com
            </span>
          </div>
          <p className="text-brand-cream/60 text-sm max-w-xs text-center md:text-left font-light">
            Redefining residential luxury with AI precision.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-brand-cream text-sm font-medium tracking-wide">
          {footerLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleLinkClick(link)}
              className="hover:text-brand-rose transition-colors duration-300 relative group bg-transparent border-none cursor-pointer"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-rose transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Socials */}
        <div className="flex gap-6">
          {socials.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-brand-cream hover:bg-brand-rose hover:text-brand-taupe transition-all duration-300"
            >
              <item.icon size={18} />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center text-xs text-brand-cream/40 gap-4">
        <p>&copy; {new Date().getFullYear()} BHKInterior.com. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <span className="text-brand-rose">❤️</span> for Global Homes
        </p>
      </div>
    </footer>
  );
};
