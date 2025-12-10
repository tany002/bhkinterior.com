
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Mail, Phone, CheckCircle, Loader2, ShieldCheck, Globe, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface AuthVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (data: { email: string; phone: string; countryCode: string; name?: string }) => void;
  planName: string;
  baseAmountUSD: number;
}

type Step = 'EMAIL_INPUT' | 'EMAIL_VERIFY' | 'PHONE_INPUT' | 'SUCCESS';

const COUNTRY_CONFIG = [
  { code: '+1', country: 'US', label: 'USA (+1)', currency: 'USD', symbol: '$' },
  { code: '+91', country: 'IN', label: 'India (+91)', currency: 'INR', symbol: '₹' },
  { code: '+44', country: 'UK', label: 'UK (+44)', currency: 'GBP', symbol: '£' },
  { code: '+49', country: 'DE', label: 'Germany (+49)', currency: 'EUR', symbol: '€' },
  { code: '+33', country: 'FR', label: 'France (+33)', currency: 'EUR', symbol: '€' },
  { code: '+971', country: 'AE', label: 'UAE (+971)', currency: 'AED', symbol: 'AED ' },
  { code: '+61', country: 'AU', label: 'Australia (+61)', currency: 'AUD', symbol: 'A$' },
  { code: '+1-CA', country: 'CA', label: 'Canada (+1)', currency: 'CAD', symbol: 'C$' }, 
];

export const AuthVerificationModal: React.FC<AuthVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerified,
  planName,
  baseAmountUSD
}) => {
  const [step, setStep] = useState<Step>('EMAIL_INPUT');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'info', message: string} | null>(null);

  const selectedConfig = COUNTRY_CONFIG.find(c => c.code === countryCode) || COUNTRY_CONFIG[0];

  useEffect(() => {
    if (isOpen) {
        setStep('EMAIL_INPUT');
        setError('');
        setOtp('');
        setNotification(null);
    }
  }, [isOpen]);

  // Helper with timeout to prevent hanging
  const fetchJson = async (url: string, body: any) => {
  const isLocal = window.location.hostname === "localhost";
  const baseUrl = isLocal ? "http://localhost:3000" : window.location.origin;
  const fullUrl = `${baseUrl}${url}`;

  console.log("🌐 Calling API:", fullUrl);

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // ✅ Safely check if response is JSON
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response:", text);
    throw new Error(`Server returned non-JSON: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return { res, data };
};
  const handleSendEmailOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    setIsLoading(true);
    setError('');
    setNotification(null);
    
    try {
      const { res, data } = await fetchJson('/api/sendEmailOtp', { email });
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep('EMAIL_VERIFY');
      setOtp(''); 
      setNotification({
          type: 'success',
          message: `Code sent to ${email}`
      });
    } catch (err: any) {
      console.error("Email send error:", err);
      setError(err.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) {
        setError("Enter 6-digit code.");
        return;
    }
    setIsLoading(true);
    setError('');

    try {
      const { res, data } = await fetchJson('/api/verifyEmailOtp', { email, otp });
      
      if (!res.ok || !data.verified) throw new Error(data.error || "Invalid Code");

      setStep('PHONE_INPUT');
      setOtp('');
      setNotification({ type: 'success', message: 'Email Verified!' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!phone || phone.length < 5) {
        setError("Please enter a valid phone number.");
        return;
    }
    setIsLoading(true);
    setError('');
    
    // UI transition to success state before redirecting
    setStep('SUCCESS');
    
    // Short delay for UX then trigger parent handler
    setTimeout(() => {
        onVerified({ 
            email, 
            phone: phone, 
            countryCode: countryCode
        });
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        
        {/* Progress Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className={step === 'EMAIL_INPUT' || step === 'EMAIL_VERIFY' ? 'text-brand-taupe font-bold' : 'text-green-600'}>1. Email</span>
                <span className="text-gray-300">/</span>
                <span className={step === 'PHONE_INPUT' ? 'text-brand-taupe font-bold' : step === 'SUCCESS' ? 'text-green-600' : ''}>2. Payment</span>
            </div>
            {step !== 'SUCCESS' && (
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={18} />
                </button>
            )}
        </div>

        {/* Notifications */}
        {notification && (
             <div className="bg-green-50 px-6 py-2 flex items-center gap-2 text-sm text-green-700 border-b border-green-100 animate-in slide-in-from-top-1">
                 <CheckCircle size={14} /> {notification.message}
             </div>
        )}
        {error && (
            <div className="bg-red-50 px-6 py-2 flex items-center gap-2 text-sm text-red-600 border-b border-red-100 animate-in slide-in-from-top-1">
                <AlertCircle size={14} /> {error}
            </div>
        )}

        {/* Content Area */}
        <div className="p-8">
            
            {/* STEP 1: EMAIL */}
            {step === 'EMAIL_INPUT' && (
                <div className="space-y-5 animate-in slide-in-from-right-4">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-gray-900">Unlock {planName}</h3>
                        <p className="text-gray-500 text-sm">Enter your email to verify account.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-taupe focus:border-brand-taupe outline-none transition-all"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendEmailOtp()}
                            />
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <Button fullWidth onClick={handleSendEmailOtp} disabled={isLoading} className="mt-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Send Email Code'}
                    </Button>
                </div>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 'EMAIL_VERIFY' && (
                <div className="space-y-5 animate-in slide-in-from-right-4">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="text-brand-taupe" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Check your Email</h3>
                        <p className="text-gray-500 text-sm">
                            We sent a code to <span className="font-semibold text-gray-900">{email}</span>. <br/>
                            <span className="text-xs text-orange-600">(Check Spam folder if missing)</span>
                        </p>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase mb-1 text-center">Enter 6-Digit Code</label>
                         <input 
                            type="text" 
                            maxLength={6}
                            autoFocus
                            className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border-b-2 border-gray-200 focus:border-brand-taupe outline-none bg-transparent"
                            placeholder="••••••"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleVerifyEmailOtp()}
                         />
                    </div>

                    <div className="flex justify-between text-xs mt-4">
                         <button onClick={() => setStep('EMAIL_INPUT')} className="text-gray-400 hover:text-gray-600">Change Email</button>
                         <button onClick={handleSendEmailOtp} className="text-brand-taupe font-medium hover:underline">Resend Email</button>
                    </div>

                    <Button fullWidth onClick={handleVerifyEmailOtp} disabled={isLoading || otp.length < 6} className="mt-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                    </Button>
                </div>
            )}

            {/* STEP 3: PHONE & BILLING */}
            {step === 'PHONE_INPUT' && (
                <div className="space-y-5 animate-in slide-in-from-right-4">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Billing Details</h3>
                        <p className="text-gray-500 text-sm">Final step to secure your plan.</p>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex justify-between items-center mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                            <p className="text-2xl font-serif font-bold text-brand-taupe">${baseAmountUSD}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase">Billing Currency</p>
                             <p className="text-sm font-medium text-gray-700 flex items-center gap-1 justify-end">
                                 <Globe size={12}/> {selectedConfig.currency}
                             </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-[35%]">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
                            <div className="relative">
                                <select 
                                    className="w-full pl-3 pr-8 py-3 border border-gray-200 rounded-lg appearance-none bg-white text-sm font-medium focus:ring-2 focus:ring-brand-taupe outline-none"
                                    value={countryCode}
                                    onChange={e => setCountryCode(e.target.value)}
                                >
                                    {COUNTRY_CONFIG.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                    <Globe size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                            <input 
                                type="tel" 
                                autoFocus
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-taupe outline-none transition-all"
                                placeholder="98765 43210"
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleProceedToPayment()}
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center px-4 leading-tight">
                        By continuing, you will be redirected to our secure payment partner. Currency conversion happens automatically.
                    </p>

                    <Button fullWidth onClick={handleProceedToPayment} disabled={isLoading || phone.length < 5} className="mt-2 bg-green-600 hover:bg-green-700 text-white border-none">
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <span className="flex items-center gap-2">Verify & Pay <Lock size={14} /></span>
                        )}
                    </Button>
                </div>
            )}

            {/* STEP 4: REDIRECTING */}
            {step === 'SUCCESS' && (
                <div className="text-center py-8 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Redirecting...</h3>
                    <p className="text-gray-500 mb-6 text-sm">Please wait while we secure your session.</p>
                    <Loader2 className="animate-spin mx-auto text-brand-taupe" size={24} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
