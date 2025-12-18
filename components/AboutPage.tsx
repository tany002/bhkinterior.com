// components/AboutPage.tsx
import React from "react";
import { ArrowLeft, Sparkles, Home } from "lucide-react";

export const AboutPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl bg-white shadow-xl rounded-3xl p-10 text-center border border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-brand-taupe mb-6">
          About Us
        </h1>

        <div className="text-gray-700 text-base leading-relaxed space-y-4">
          <p>
            <strong>BHKInterior.com</strong> is India’s first AI-powered home design studio — 
            where creativity meets technology to transform your living spaces into works of art.
          </p>

          <p>
            Founded by <strong>Tanya Sahay</strong>, BHK Interior redefines how homeowners plan, 
            visualize, and personalize their dream homes using advanced design intelligence. 
            Every render and 3D walkthrough is crafted with precision, warmth, and beauty.
          </p>

          <p>
            Our goal is simple — make luxury home design accessible, intuitive, and inspiring for everyone.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/");
              onBack();
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-taupe px-6 py-2.5 rounded-full hover:bg-stone-800 transition-all"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
