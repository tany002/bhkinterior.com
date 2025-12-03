// App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { AppState, AppStep, RoomData, RoomType, DESIGN_STYLES, ROOM_QUESTIONS, LayoutProposal, DesignRegion, OnboardingData, SubscriptionTier, BillingCycle } from './types';
import { analyzeFloorPlan, generateRoomDesign, analyzeImageCoverage, analyzeHouseVideo, analyzeRoomScale, analyzeRoomSemantics, compute3DReconstruction, generateLayoutProposals, validateLayouts, generate3DScene, generateRenderedViews, validateAndRefineRenders } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { ImageViewer } from './components/ImageViewer';
import { ScaleCalibrator } from './components/ScaleCalibrator';
import { MicroPreview } from './components/MicroPreview';
import { DragEditor } from './components/DragEditor';
import { SavedDesignsGallery } from './components/SavedDesignsGallery';
import { ThreeDViewer } from './components/ThreeDViewer';
import { LandingHero } from './components/LandingHero';
import { CategoryGrid } from './components/CategoryGrid';
import { LandingHomeTypes } from './components/LandingHomeTypes';
import { LandingStyles } from './components/LandingStyles';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingPricing } from './components/LandingPricing';
import { LandingGallery } from './components/LandingGallery';
import { LandingFooter } from './components/LandingFooter';
import { Landing3DTeaser } from './components/Landing3DTeaser';
import { OnboardingBackground } from './components/OnboardingBackground';

import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle, 
  Loader2, 
  LayoutTemplate, 
  Armchair, 
  UtensilsCrossed, 
  BedDouble, 
  Trash2,
  ScanEye,
  Info,
  Video,
  Image as ImageIcon,
  Save,
  Maximize2,
  Ruler,
  AlertTriangle,
  Play,
  Layers,
  Box,
  Grid,
  Wrench,
  X,
  Cuboid,
  Download,
  Aperture,
  ShieldCheck,
  Zap,
  FolderOpen,
  Edit3,
  Star,
  Sparkles,
  Quote,
  CreditCard,
  Lock,
  Check,
  ChevronDown,
  Globe,
  Award,
  MapPin,
  Palette,
  Home,
  MousePointer2,
  Cpu,
  Upload,
  Menu, 
  LogOut, 
  ChevronLeft,
  Layout,
  Users,
  UserPlus,
  Phone,
  Mail,
  Crown,
  Plus,
  Minus,
  MonitorPlay
} from 'lucide-react';

const INITIAL_ROOMS: RoomData[] = [];

// Global Gallery Images
const GLOBAL_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=500",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=500",
  "https://images.unsplash.com/photo-1616594039964-40891a909d99?w=500",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500",
  "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=500",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=500",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfe1?w=500",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500"
];

// Room Type Image Mapping for 3D Ultra Zone
const ROOM_TYPE_IMAGES: Record<string, string> = {
    'Living Room': "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    'Kitchen': "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    'Bedroom': "https://images.unsplash.com/photo-1616594039964-40891a909d99?auto=format&fit=crop&w=800&q=80",
    'Bathroom': "https://images.unsplash.com/photo-1620626012053-1d128f754580?auto=format&fit=crop&w=800&q=80",
    'Dining Room': "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    'Home Office': "https://images.unsplash.com/photo-1593640408182-b87239482500?auto=format&fit=crop&w=800&q=80",
};

// BHK Brand Logo Component
const BHKLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <img 
        src="https://i.postimg.cc/prMkF5Kb/Gemini-Generated-Image-roq6qrroq6qrroq6.png" 
        alt="BHK Interior Logo" 
        className="w-full h-full object-contain drop-shadow-sm"
    />
  </div>
);

function App() {
  const [state, setState] = useState<AppState>({
    step: AppStep.LANDING,
    userProfile: { 
        isSubscribed: false, 
        region: 'Global', 
        tier: 'free', 
        designCount: 0, 
        maxDesigns: 1, 
        familyMembers: [] 
    },
    floorPlanImage: null,
    floorPlanAnalysis: null,
    houseVideo: null,
    houseVideoAnalysis: null,
    rooms: INITIAL_ROOMS,
  });
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    styles: [],
    homeType: 'Apartment',
    location: { city: '', country: '' },
    rooms: [{ type: 'Living Room', count: 1 }],
    inputMethod: 'floorplan'
  });

  const [isAnalyzingFloorPlan, setIsAnalyzingFloorPlan] = useState(false);
  const [isAnalyzingHouseVideo, setIsAnalyzingHouseVideo] = useState(false);
  const [isProcessingDesigns, setIsProcessingDesigns] = useState(false);
  const [viewingImage, setViewingImage] = useState<{src: string, alt: string} | null>(null);
  const [calibratingRoomId, setCalibratingRoomId] = useState<string | null>(null);
  
  const [editingLayout, setEditingLayout] = useState<{roomId: string, layout: LayoutProposal, index: number} | null>(null);
  const [activeStyleTab, setActiveStyleTab] = useState<string | null>(null);
  const [viewing3D, setViewing3D] = useState<string | null>(null); 
  
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanTier, setSelectedPlanTier] = useState<SubscriptionTier | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupForm, setSignupForm] = useState({ email: '', phone: '' });
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // --- Handlers ---
  const handleStartFlow = (registrationData?: { name: string; email: string; phone: string }) => {
    if (registrationData) {
        setState(prev => ({
            ...prev,
            userProfile: {
                ...prev.userProfile,
                name: registrationData.name,
                email: registrationData.email,
                phone: registrationData.phone
            }
        }));
    }

    if (state.userProfile.isSubscribed) {
      setState(prev => ({ ...prev, step: AppStep.ONBOARDING }));
      setOnboardingStep(1); 
    } else {
      setState(prev => ({ ...prev, step: AppStep.PAYWALL }));
    }
  };

  const handlePlanSelect = (tier: SubscriptionTier) => {
      setSelectedPlanTier(tier);
      setShowSignupModal(true);
  };

  const handleSubscribe = () => {
    if (!selectedPlanTier) return;
    let maxDesigns = 1;
    if (selectedPlanTier === 'pro') maxDesigns = 1000;
    if (selectedPlanTier === 'premium') maxDesigns = 5000;
    if (selectedPlanTier === 'ultra') maxDesigns = 10000;

    setState(prev => ({ 
      ...prev, 
      userProfile: { 
          ...prev.userProfile, 
          isSubscribed: true,
          tier: selectedPlanTier,
          billingCycle: billingCycle,
          email: signupForm.email || prev.userProfile.email,
          phone: signupForm.phone || prev.userProfile.phone,
          designCount: 0,
          maxDesigns: maxDesigns
      },
      step: AppStep.ONBOARDING
    }));
    setShowSignupModal(false);
    setOnboardingStep(1);
  };
  
  const handleAddFamilyMember = () => {
      const { tier, familyMembers } = state.userProfile;
      if (tier === 'free' || tier === 'pro') {
          alert("Upgrade to Premium or Ultra to add family members.");
          return;
      }
      if (familyMembers.length >= 5) {
          alert("Maximum of 5 family members allowed.");
          return;
      }
      if (newMemberPhone.length < 5) return;
      const role = tier === 'ultra' ? 'editor' : 'viewer';
      setState(prev => ({
          ...prev,
          userProfile: {
              ...prev.userProfile,
              familyMembers: [...prev.userProfile.familyMembers, { phone: newMemberPhone, role, addedAt: new Date() }]
          }
      }));
      setNewMemberPhone('');
  };

  const handleRemoveFamilyMember = (index: number) => {
      setState(prev => ({
          ...prev,
          userProfile: {
              ...prev.userProfile,
              familyMembers: prev.userProfile.familyMembers.filter((_, i) => i !== index)
          }
      }));
  };

  const initRoomsFromOnboarding = () => {
      const newRooms: RoomData[] = [];
      onboardingData.rooms.forEach(r => {
          for(let i=0; i<r.count; i++) {
              newRooms.push({
                  id: `${r.type.toLowerCase().replace(/\s+/g, '-')}-${i+1}`,
                  type: r.type,
                  originalImages: [],
                  originalVideos: [],
                  requirements: {},
                  coverageFeedback: null,
                  scaleAnalysis: null,
                  semanticAnalysis: null,
                  reconstruction: null,
                  layoutProposals: null,
                  sceneGeneration: null,
                  renderedViews: null,
                  validationResult: null,
                  result: null,
                  status: 'pending',
                  selectedStyle: onboardingData.styles[0] || 'minimalist'
              });
          }
      });
      return newRooms;
  };

  const handleOnboardingComplete = () => {
    const initializedRooms = initRoomsFromOnboarding();
    setState(prev => ({
      ...prev,
      userProfile: { 
          ...prev.userProfile, 
          onboardingData: onboardingData,
          stylePreference: onboardingData.styles[0] 
      },
      rooms: initializedRooms,
      step: onboardingData.inputMethod === 'floorplan' ? AppStep.FLOOR_PLAN : 
            onboardingData.inputMethod === 'video' ? AppStep.HOUSE_VIDEO :
            onboardingData.inputMethod === 'sample' ? AppStep.STYLE_SELECT : AppStep.ROOM_UPLOADS
    }));
    
    if (onboardingData.inputMethod === 'sample') {
        alert("Loading sample home data...");
    }
  };

  const handleFloorPlanUpload = (base64: string) => {
    setState(prev => ({ ...prev, floorPlanImage: base64 }));
  };

  const submitFloorPlan = async () => {
    if (!state.floorPlanImage) return;
    setIsAnalyzingFloorPlan(true);
    try {
      const analysis = await analyzeFloorPlan(state.floorPlanImage);
      setState(prev => ({ 
        ...prev, 
        floorPlanAnalysis: analysis,
        step: AppStep.HOUSE_VIDEO 
      }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, step: AppStep.HOUSE_VIDEO }));
    } finally {
      setIsAnalyzingFloorPlan(false);
    }
  };

  const handleHouseVideoUpload = (base64: string) => {
    setState(prev => ({ ...prev, houseVideo: base64 }));
  };

  const submitHouseVideo = async () => {
    if (!state.houseVideo) return;
    setIsAnalyzingHouseVideo(true);
    try {
      const analysis = await analyzeHouseVideo(state.houseVideo);
      setState(prev => ({
        ...prev,
        houseVideoAnalysis: analysis,
        step: AppStep.ROOM_UPLOADS
      }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, step: AppStep.ROOM_UPLOADS }));
    } finally {
      setIsAnalyzingHouseVideo(false);
    }
  };

  const skipHouseVideo = () => {
    setState(prev => ({ ...prev, step: AppStep.ROOM_UPLOADS }));
  };

  const addRoomMedia = (roomId: string, base64: string, type: 'image' | 'video') => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          originalImages: type === 'image' ? [...room.originalImages, base64] : room.originalImages,
          originalVideos: type === 'video' ? [...room.originalVideos, base64] : room.originalVideos,
        };
      })
    }));
  };

  const removeRoomMedia = (roomId: string, indexToRemove: number, type: 'image' | 'video') => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          originalImages: type === 'image' ? room.originalImages.filter((_, idx) => idx !== indexToRemove) : room.originalImages,
          originalVideos: type === 'video' ? room.originalVideos.filter((_, idx) => idx !== indexToRemove) : room.originalVideos,
        };
      })
    }));
  };

  const handleRequirementChange = (roomId: string, questionId: string, value: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId 
          ? { ...room, requirements: { ...room.requirements, [questionId]: value } }
          : room
      )
    }));
  };

  const handleAnalyzeCoverage = async (roomId: string) => {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, status: 'analyzing_coverage' } : r)
    }));
    const feedback = await analyzeImageCoverage(room.originalImages, room.originalVideos);
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, coverageFeedback: feedback, status: 'pending' } : r)
    }));
  };

  const handleCheckScale = async (roomId: string) => {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, status: 'analyzing_scale' } : r)
    }));
    const analysis = await analyzeRoomScale(room.originalImages, room.originalVideos);
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id !== roomId ? r : { ...r, scaleAnalysis: analysis, status: 'pending' })
    }));
    if (analysis.status === 'missing') setCalibratingRoomId(roomId);
  };

  const handleStyleSelect = (styleId: string) => {
    const roomId = activeStyleTab || state.rooms[0].id;
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, selectedStyle: styleId } : r)
    }));
  };

  const submitDesigns = async () => {
    if (state.userProfile.designCount >= state.userProfile.maxDesigns) {
        alert(`Limit reached. Upgrade plan.`);
        return;
    }
    setState(prev => ({ ...prev, step: AppStep.PROCESSING }));
    setIsProcessingDesigns(true);

    const processedRooms: RoomData[] = [];
    
    for (const room of state.rooms) {
      const hasMedia = room.originalImages.length > 0 || room.originalVideos.length > 0;
      const hasFloorPlan = !!state.floorPlanImage;
      
      if (!hasMedia && !hasFloorPlan) {
          processedRooms.push(room);
          continue;
      }
      
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => r.id === room.id ? { ...r, status: 'processing' } : r)
      }));

      try {
        let finalScale = room.scaleAnalysis;
        if (!finalScale && room.originalImages.length > 0) {
             try { finalScale = await analyzeRoomScale(room.originalImages, room.originalVideos); } catch(e) {}
        }

        let currentLayouts = room.layoutProposals;
        if (!currentLayouts) {
            const rawLayouts = await generateLayoutProposals(
                room.type, room.semanticAnalysis || [], finalScale, room.requirements, state.userProfile.region
            );
            currentLayouts = await validateLayouts(rawLayouts, room.semanticAnalysis || [], finalScale);
        }

        const { result, scene } = await generateRoomDesign(
          room.type, room.selectedStyle, room.originalImages, room.originalVideos,
          room.requirements, state.userProfile.region, state.floorPlanAnalysis || undefined,
          state.houseVideoAnalysis || undefined, finalScale, room.reconstruction,
          currentLayouts?.[0], state.userProfile.onboardingData?.location
        );

        const updatedRoom = { ...room, scaleAnalysis: finalScale, layoutProposals: currentLayouts, result, sceneGeneration: scene, status: 'completed' as const };
        processedRooms.push(updatedRoom);
        setState(prev => ({
            ...prev,
            userProfile: { ...prev.userProfile, designCount: prev.userProfile.designCount + 1 },
            rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
        }));
      } catch (error) {
        console.error(`Failed room ${room.id}`, error);
        processedRooms.push({ ...room, status: 'error' as const });
      }
    }

    setState(prev => ({ ...prev, rooms: processedRooms, step: AppStep.RESULTS }));
    setIsProcessingDesigns(false);
  };

  const handleEditLayout = (room: RoomData) => {
      if (state.userProfile.tier === 'pro' || state.userProfile.tier === 'free') {
          alert("Layout Editing is available for Premium users.");
          return;
      }
      if (room.layoutProposals && room.layoutProposals.length > 0) {
          setEditingLayout({ roomId: room.id, layout: room.layoutProposals[0], index: 0 });
      } else {
          alert("No layout data available.");
      }
  };

  const handleSaveLayout = async (updatedLayout: LayoutProposal) => {
      if (!editingLayout) return;
      const roomId = editingLayout.roomId;
      setEditingLayout(null);
      setState(prev => ({
          ...prev,
          rooms: prev.rooms.map(r => r.id === roomId ? { ...r, status: 'processing' } : r)
      }));
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
          try {
              const { result, scene } = await generateRoomDesign(
                  room.type, room.selectedStyle, room.originalImages, room.originalVideos,
                  room.requirements, state.userProfile.region, state.floorPlanAnalysis || undefined,
                  state.houseVideoAnalysis || undefined, room.scaleAnalysis, room.reconstruction,
                  updatedLayout, state.userProfile.onboardingData?.location
              );
              setState(prev => ({
                  ...prev,
                  rooms: prev.rooms.map(r => r.id === roomId ? { ...r, result, sceneGeneration: scene, status: 'completed' } : r)
              }));
          } catch (e) {
              setState(prev => ({ ...prev, rooms: prev.rooms.map(r => r.id === roomId ? { ...r, status: 'error' } : r) }));
          }
      }
  };
  
  const handleSaveResult = (room: RoomData) => {
    try {
        const saved = localStorage.getItem('luxe_saved_designs');
        const designs = saved ? JSON.parse(saved) : [];
        const existingIdx = designs.findIndex((d: RoomData) => d.id === room.id);
        if (existingIdx > -1) designs[existingIdx] = room;
        else designs.push(room);
        localStorage.setItem('luxe_saved_designs', JSON.stringify(designs));
        alert('Saved!');
    } catch (e) { alert('Storage full.'); }
  };

  const handleOpen3D = async (room: RoomData) => {
      if (state.userProfile.tier !== 'premium' && state.userProfile.tier !== 'ultra') {
          alert("3D Ultra Mode is a Premium feature.");
          return;
      }
      if (!room.sceneGeneration && room.layoutProposals && room.layoutProposals.length > 0) {
          try {
             const sceneGen = await generate3DScene(room.layoutProposals[0], room.type, room.selectedStyle);
             setState(prev => ({
                 ...prev,
                 rooms: prev.rooms.map(r => r.id === room.id ? { ...r, sceneGeneration: sceneGen } : r)
             }));
          } catch (e) {}
      }
      setViewing3D(room.id);
  };

  const formatAdvice = (text: string) => {
    if (!text) return "No advice generated.";
    return text.split('\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;
      return (
        <p key={idx} className="mb-4 last:mb-0 text-gray-700 leading-relaxed">
          {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => 
            part.startsWith('**') && part.endsWith('**') ? 
              <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong> : 
              part
          )}
        </p>
      );
    });
  };

  // --- RENDERERS ---

  if (viewingImage) {
    return <ImageViewer src={viewingImage.src} alt={viewingImage.alt} onClose={() => setViewingImage(null)} />;
  }
  
  if (calibratingRoomId) {
      const room = state.rooms.find(r => r.id === calibratingRoomId);
      if (room && room.originalImages[0]) {
          return (
             <ScaleCalibrator 
                imageSrc={room.originalImages[0]} 
                onConfirm={(ppm, meters) => {
                    const newAnalysis = { ...room.scaleAnalysis!, pixelsPerMeter: ppm, status: 'valid' as const };
                    setState(prev => ({
                        ...prev,
                        rooms: prev.rooms.map(r => r.id === calibratingRoomId ? { ...r, scaleAnalysis: newAnalysis } : r)
                    }));
                    setCalibratingRoomId(null);
                }}
                onCancel={() => setCalibratingRoomId(null)}
             />
          );
      }
  }

  if (editingLayout) {
      const room = state.rooms.find(r => r.id === editingLayout.roomId);
      if (room) {
          return (
              <DragEditor 
                 layout={editingLayout.layout}
                 roomType={room.type}
                 backgroundImage={state.floorPlanImage}
                 onSave={handleSaveLayout}
                 onCancel={() => setEditingLayout(null)}
              />
          );
      }
  }

  if (viewing3D) {
      const room = state.rooms.find(r => r.id === viewing3D);
      if (room) {
          return <ThreeDViewer room={room} onClose={() => setViewing3D(null)} />;
      }
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-taupe selection:bg-brand-rose/30">
      
      {/* --- Landing Page --- */}
      {state.step === AppStep.LANDING && (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-20 gap-12">
              <div className="flex items-center gap-2">
                <BHKLogo />
                <span className="font-serif font-bold text-2xl tracking-tight text-brand-taupe">BHKInterior.com</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                  <Button 
                    onClick={() => handleStartFlow()} 
                    className="!bg-[#3B2F2F] !text-[#F8F4EE] hover:!bg-[#5A4545] text-sm px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started — Just $39/Month
                  </Button>
              </div>
              <button className="md:hidden text-brand-taupe">
                  <Menu size={24} />
              </button>
            </nav>

            <LandingHero 
                headline={
                  <span>
                    Design Your Dream Home with AI <br/>
                    <span className="text-brand-taupe/60 italic font-light block mt-2 text-3xl md:text-5xl">
                      — Personalized Room Designs in One Click
                    </span>
                  </span>
                }
                subheadline="Step into the future of home design with AI-powered 8K renders and fully interactive 3D walkthroughs created instantly"
                ctaText="Get Started — Just $39/Month"
                onCtaClick={handleStartFlow}
                onSecondaryClick={() => {
                   document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />

            <LandingHomeTypes 
                onSelectType={(type) => {
                    setOnboardingData(prev => ({ ...prev, homeType: type }));
                    handleStartFlow();
                }}
            />
            
            <LandingFeatures />

            <LandingStyles 
                styles={DESIGN_STYLES.slice(0, 8)} 
                onStartFlow={handleStartFlow} 
            />

            <Landing3DTeaser />
            
            <LandingGallery images={GLOBAL_GALLERY_IMAGES.slice(0, 8)} />
            
            <LandingPricing 
                billingCycle={billingCycle}
                setBillingCycle={setBillingCycle}
                handlePlanSelect={handlePlanSelect}
            />
            
            <LandingFooter />

            {/* Signup Modal (Simple) */}
            {showSignupModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-serif font-bold">Complete Registration</h3>
                            <button onClick={() => setShowSignupModal(false)}><X size={24}/></button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                type="email" placeholder="Email Address" 
                                className="w-full px-4 py-3 border rounded-lg"
                                value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})}
                            />
                            <input 
                                type="tel" placeholder="Phone Number" 
                                className="w-full px-4 py-3 border rounded-lg"
                                value={signupForm.phone} onChange={e => setSignupForm({...signupForm, phone: e.target.value})}
                            />
                            <div className="pt-4">
                                <Button fullWidth onClick={handleSubscribe} className="py-3 text-lg">
                                    Confirm {selectedPlanTier?.toUpperCase()} Plan
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* --- Saved Designs --- */}
      {state.step === AppStep.SAVED_DESIGNS && (
          <SavedDesignsGallery 
             onBack={() => setState(prev => ({ ...prev, step: AppStep.LANDING }))}
             onLoadDesign={(design) => {
                 // Load design into results view
                 setState(prev => ({ 
                     ...prev, 
                     step: AppStep.RESULTS,
                     rooms: [design] // For viewing single design
                 }));
             }}
          />
      )}

      {/* --- Paywall Step --- */}
      {state.step === AppStep.PAYWALL && (
         <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
             <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
                 {/* Left Panel (Top on mobile) */}
                 <div className="md:w-1/2 bg-stone-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                     <div className="relative z-10">
                        <BHKLogo className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 brightness-0 invert" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Unlock Your Dream Home</h2>
                        <ul className="space-y-3 md:space-y-4 text-base md:text-lg text-white/80">
                            <li className="flex gap-3"><Check className="text-brand-rose shrink-0" /> Unlimited AI Redesigns</li>
                            <li className="flex gap-3"><Check className="text-brand-rose shrink-0" /> 8K Photorealistic Renders</li>
                            <li className="flex gap-3"><Check className="text-brand-rose shrink-0" /> 3D Walkthroughs</li>
                        </ul>
                     </div>
                     <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800')] bg-cover" />
                 </div>
                 
                 {/* Right Panel (Bottom on mobile) */}
                 <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                     <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Choose Your Plan</h3>
                     <div className="space-y-4 mb-8">
                         <div 
                            onClick={() => setSelectedPlanTier('premium')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlanTier === 'premium' ? 'border-brand-taupe bg-brand-cream' : 'border-gray-200 hover:border-brand-taupe'}`}
                         >
                             <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-gray-900">Premium</span>
                                 <span className="font-bold text-gray-900">$39/mo</span>
                             </div>
                             <p className="text-sm text-gray-500">Most popular for homeowners.</p>
                         </div>
                         <div 
                            onClick={() => setSelectedPlanTier('ultra')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPlanTier === 'ultra' ? 'border-brand-taupe bg-brand-cream' : 'border-gray-200 hover:border-brand-taupe'}`}
                         >
                             <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-gray-900">Ultra</span>
                                 <span className="font-bold text-gray-900">$99/mo</span>
                             </div>
                             <p className="text-sm text-gray-500">For professionals & large estates.</p>
                         </div>
                     </div>
                     <Button onClick={() => setShowSignupModal(true)} disabled={!selectedPlanTier} fullWidth className="py-3 text-lg">
                         Continue to Checkout
                     </Button>
                     <button onClick={() => setState(prev => ({...prev, step: AppStep.LANDING}))} className="mt-4 text-sm text-center text-gray-500 hover:text-gray-900 hover:underline">
                         Back to Home
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* --- Onboarding Step --- */}
      {state.step === AppStep.ONBOARDING && (
          <div className="min-h-screen relative flex items-center justify-center p-4">
              <OnboardingBackground />
              
              <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 border border-white/50">
                  <div className="mb-8">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                          <span>Step {onboardingStep} of 3</span>
                          <span>{Math.round((onboardingStep/3)*100)}% Completed</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-taupe transition-all duration-500 ease-out" style={{ width: `${(onboardingStep/3)*100}%` }} />
                      </div>
                  </div>

                  {onboardingStep === 1 && (
                      <div className="animate-in slide-in-from-right duration-500">
                          <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">What are we designing?</h2>
                          <div className="grid grid-cols-2 gap-4">
                              {['Apartment', 'Villa', 'Office', 'Studio'].map(type => (
                                  <button 
                                    key={type}
                                    onClick={() => setOnboardingData({...onboardingData, homeType: type})}
                                    className={`p-6 rounded-xl border-2 transition-all text-left group ${onboardingData.homeType === type ? 'border-brand-taupe bg-brand-cream' : 'border-gray-100 hover:border-gray-300'}`}
                                  >
                                      <span className={`block text-lg font-bold mb-1 ${onboardingData.homeType === type ? 'text-brand-taupe' : 'text-gray-700'}`}>{type}</span>
                                      <span className="text-xs text-gray-400 group-hover:text-gray-500">Select property type</span>
                                  </button>
                              ))}
                          </div>
                          <div className="mt-8 flex justify-end">
                              <Button onClick={() => setOnboardingStep(2)} className="px-8">Next Step <ArrowRight size={16} className="ml-2"/></Button>
                          </div>
                      </div>
                  )}

                  {onboardingStep === 2 && (
                      <div className="animate-in slide-in-from-right duration-500">
                           <h2 className="text-3xl font-serif font-bold mb-2 text-gray-900">Where is this located?</h2>
                           <p className="text-gray-500 mb-6">We use this to optimize for local light and trends.</p>
                           
                           <div className="space-y-4 mb-8">
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                   <input 
                                      type="text" 
                                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-taupe outline-none"
                                      placeholder="e.g. New York, London, Mumbai"
                                      value={onboardingData.location.city}
                                      onChange={e => setOnboardingData({...onboardingData, location: {...onboardingData.location, city: e.target.value}})}
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                   <select 
                                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-taupe outline-none bg-white"
                                      value={state.userProfile.region}
                                      onChange={e => setState(prev => ({...prev, userProfile: {...prev.userProfile, region: e.target.value as DesignRegion}}))}
                                   >
                                       {['North America', 'Europe', 'India', 'South America', 'SE Asia', 'Africa', 'Global'].map(r => (
                                           <option key={r} value={r}>{r}</option>
                                       ))}
                                   </select>
                               </div>
                           </div>
                           <div className="flex justify-between">
                               <button onClick={() => setOnboardingStep(1)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
                               <Button onClick={() => setOnboardingStep(3)} className="px-8">Next Step <ArrowRight size={16} className="ml-2"/></Button>
                           </div>
                      </div>
                  )}

                  {onboardingStep === 3 && (
                      <div className="animate-in slide-in-from-right duration-500">
                          <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900">How do you want to start?</h2>
                          <div className="space-y-4 mb-8">
                              <div 
                                onClick={() => setOnboardingData({...onboardingData, inputMethod: 'floorplan'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 transition-all ${onboardingData.inputMethod === 'floorplan' ? 'border-brand-taupe bg-brand-cream' : 'border-gray-100 hover:border-gray-300'}`}
                              >
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-taupe shadow-sm"><LayoutTemplate size={24}/></div>
                                  <div>
                                      <div className="font-bold text-gray-900">Upload Floor Plan</div>
                                      <div className="text-sm text-gray-500">Best for full home renovations.</div>
                                  </div>
                              </div>
                              <div 
                                onClick={() => setOnboardingData({...onboardingData, inputMethod: 'video'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 transition-all ${onboardingData.inputMethod === 'video' ? 'border-brand-taupe bg-brand-cream' : 'border-gray-100 hover:border-gray-300'}`}
                              >
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-taupe shadow-sm"><Video size={24}/></div>
                                  <div>
                                      <div className="font-bold text-gray-900">Upload House Video</div>
                                      <div className="text-sm text-gray-500">We'll extract rooms automatically.</div>
                                  </div>
                              </div>
                              <div 
                                onClick={() => setOnboardingData({...onboardingData, inputMethod: 'photos'})}
                                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-4 transition-all ${onboardingData.inputMethod === 'photos' ? 'border-brand-taupe bg-brand-cream' : 'border-gray-100 hover:border-gray-300'}`}
                              >
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-taupe shadow-sm"><ImageIcon size={24}/></div>
                                  <div>
                                      <div className="font-bold text-gray-900">Room-by-Room Photos</div>
                                      <div className="text-sm text-gray-500">Perfect for single room redesigns.</div>
                                  </div>
                              </div>
                          </div>
                          <div className="flex justify-between">
                               <button onClick={() => setOnboardingStep(2)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
                               <Button onClick={handleOnboardingComplete} className="px-8 bg-brand-taupe text-white">Launch Studio <Sparkles size={16} className="ml-2"/></Button>
                           </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- Main App Header (For authenticated steps) --- */}
      {state.step !== AppStep.LANDING && state.step !== AppStep.PAYWALL && state.step !== AppStep.ONBOARDING && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setState(prev => ({...prev, step: AppStep.LANDING}))}>
                    <BHKLogo className="w-8 h-8"/>
                    <span className="font-serif font-bold text-xl hidden md:inline">BHK Interior</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6 mr-4 text-sm font-medium text-gray-600">
                         <div className="flex items-center gap-1"><MapPin size={14}/> {state.userProfile.region}</div>
                         <div className="flex items-center gap-1"><Layout size={14}/> {state.userProfile.designCount} / {state.userProfile.maxDesigns} Designs</div>
                    </div>
                    
                    {state.userProfile.tier !== 'free' && (
                        <div className="px-3 py-1 bg-brand-cream text-brand-taupe rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Crown size={12}/> {state.userProfile.tier}
                        </div>
                    )}
                    
                    <button className="p-2 hover:bg-gray-100 rounded-full"><Users size={20} className="text-gray-600" onClick={() => alert("Family Management Modal")}/></button>
                    <div className="w-8 h-8 bg-brand-taupe rounded-full flex items-center justify-center text-white font-bold">
                        {state.userProfile.name ? state.userProfile.name[0] : 'U'}
                    </div>
                </div>
            </div>
        </header>
      )}

      {/* --- Content Steps --- */}
      <main className={`max-w-7xl mx-auto px-4 py-8 ${state.step === AppStep.LANDING || state.step === AppStep.ONBOARDING ? 'hidden' : ''}`}>
        
        {/* Step: Floor Plan Upload */}
        {state.step === AppStep.FLOOR_PLAN && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Upload Floor Plan</h2>
            <p className="text-gray-500 mb-8">We'll analyze the layout to detect rooms automatically.</p>
            
            <FileUpload 
              label="Drop your floor plan here" 
              onFileSelect={(base64, type) => handleFloorPlanUpload(base64)}
              preview={state.floorPlanImage}
              onClear={() => setState(prev => ({ ...prev, floorPlanImage: null }))}
              className="mb-8 h-64"
            />
            
            <div className="flex justify-end gap-4">
               <button onClick={skipHouseVideo} className="text-gray-500 hover:text-gray-900 px-4">Skip</button>
               <Button onClick={submitFloorPlan} disabled={!state.floorPlanImage || isAnalyzingFloorPlan}>
                  {isAnalyzingFloorPlan ? <><Loader2 className="animate-spin mr-2"/> Analyzing...</> : "Analyze Plan"}
               </Button>
            </div>
          </div>
        )}

        {/* Step: House Video Upload */}
        {state.step === AppStep.HOUSE_VIDEO && (
           <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
               <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">House Video Tour</h2>
               <p className="text-gray-500 mb-8">Upload a continuous walkthrough video. We'll identify rooms and context.</p>

               <FileUpload 
                  label="Upload video tour (MP4/MOV)" 
                  onFileSelect={(base64, type) => handleHouseVideoUpload(base64)}
                  preview={state.houseVideo}
                  isVideo={true}
                  accept="video/*"
                  onClear={() => setState(prev => ({ ...prev, houseVideo: null }))}
                  className="mb-8 h-64"
               />

               <div className="flex justify-end gap-4">
                   <button onClick={skipHouseVideo} className="text-gray-500 hover:text-gray-900 px-4">Skip this step</button>
                   <Button onClick={submitHouseVideo} disabled={!state.houseVideo || isAnalyzingHouseVideo}>
                       {isAnalyzingHouseVideo ? <><Loader2 className="animate-spin mr-2"/> Processing Video...</> : "Process Video"}
                   </Button>
               </div>
           </div>
        )}

        {/* Step: Room Uploads & Config */}
        {state.step === AppStep.ROOM_UPLOADS && (
           <div className="animate-in fade-in">
               <div className="flex justify-between items-end mb-8">
                   <div>
                       <h2 className="text-3xl font-serif font-bold text-gray-900">Room Details</h2>
                       <p className="text-gray-500 mt-1">Upload photos and specify requirements for each room.</p>
                   </div>
                   <Button onClick={submitDesigns} className="bg-brand-taupe hover:bg-stone-800">
                       Generate Designs <ArrowRight size={16} className="ml-2"/>
                   </Button>
               </div>
               
               <div className="space-y-12">
                   {state.rooms.map((room, index) => (
                       <div key={room.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                           <div className="flex items-center gap-3 mb-6">
                               <div className="bg-brand-cream p-2 rounded-lg text-brand-taupe">
                                   {room.type === 'Kitchen' ? <UtensilsCrossed size={20}/> : 
                                    room.type === 'Bedroom' ? <BedDouble size={20}/> : 
                                    <Armchair size={20}/>}
                               </div>
                               <h3 className="text-xl font-bold text-gray-800">{room.type} {index + 1}</h3>
                           </div>

                           <div className="grid lg:grid-cols-2 gap-12">
                               {/* Left: Media Uploads */}
                               <div>
                                   <div className="flex justify-between items-start mb-4">
                                       <h4 className="font-medium text-gray-700">Photos & Videos</h4>
                                       <span className="text-xs text-gray-400">At least 1 photo required</span>
                                   </div>
                                   
                                   <div className="grid grid-cols-3 gap-3 mb-4">
                                       {room.originalImages.map((img, i) => (
                                           <div key={`img-${i}`} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100">
                                               <img src={img} className="w-full h-full object-cover" alt="Room" />
                                               <button 
                                                  onClick={() => removeRoomMedia(room.id, i, 'image')}
                                                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                               ><X size={14}/></button>
                                           </div>
                                       ))}
                                       <FileUpload 
                                          label="Add Photo" 
                                          onFileSelect={(b64) => addRoomMedia(room.id, b64, 'image')} 
                                          className="aspect-square p-2 border-gray-200"
                                          accept="image/*"
                                       />
                                   </div>

                                   {/* Coverage & Scale Tools */}
                                   <div className="flex gap-3 mt-4">
                                       <button 
                                          onClick={() => handleAnalyzeCoverage(room.id)}
                                          disabled={room.status === 'analyzing_coverage'}
                                          className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                       >
                                           {room.status === 'analyzing_coverage' ? <Loader2 size={14} className="animate-spin"/> : <ScanEye size={14}/>}
                                           Check Coverage
                                       </button>
                                       <button 
                                          onClick={() => handleCheckScale(room.id)}
                                          disabled={room.status === 'analyzing_scale'}
                                          className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                       >
                                           {room.status === 'analyzing_scale' ? <Loader2 size={14} className="animate-spin"/> : <Ruler size={14}/>}
                                           Analyze Scale
                                       </button>
                                   </div>
                                   
                                   {room.coverageFeedback && (
                                       <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                                           <Info size={16} className="mt-0.5 text-blue-500 flex-shrink-0"/>
                                           {room.coverageFeedback}
                                       </div>
                                   )}
                                   {room.scaleAnalysis && (
                                       <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                                           {room.scaleAnalysis.status === 'valid' ? <CheckCircle size={16} className="text-green-500"/> : <AlertTriangle size={16} className="text-amber-500"/>}
                                           Scale: {room.scaleAnalysis.status === 'valid' ? `Calibrated (${room.scaleAnalysis.pixelsPerMeter?.toFixed(1)} px/m)` : 'Calibration needed'}
                                       </div>
                                   )}
                               </div>

                               {/* Right: Requirements Form */}
                               <div>
                                   <h4 className="font-medium text-gray-700 mb-4">Design Requirements</h4>
                                   <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Style</label>
                                                <select 
                                                    className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm"
                                                    value={room.selectedStyle}
                                                    onChange={(e) => {
                                                        const newStyle = e.target.value;
                                                        setState(prev => ({
                                                            ...prev,
                                                            rooms: prev.rooms.map(r => r.id === room.id ? { ...r, selectedStyle: newStyle } : r)
                                                        }));
                                                    }}
                                                >
                                                    {DESIGN_STYLES.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                       </div>

                                       {(ROOM_QUESTIONS[room.type] || []).map(q => (
                                           <div key={q.id}>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">{q.label}</label>
                                               <textarea 
                                                   placeholder={q.placeholder}
                                                   className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-taupe outline-none min-h-[80px]"
                                                   value={room.requirements[q.id] || ''}
                                                   onChange={(e) => handleRequirementChange(room.id, q.id, e.target.value)}
                                               />
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {/* Step: Processing */}
        {state.step === AppStep.PROCESSING && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-gray-100 border-t-brand-taupe rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-rose animate-pulse" size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Dreaming up your space...</h2>
                <p className="text-gray-500 max-w-md">
                    Our AI is analyzing your floor plan, understanding geometry, and applying your selected styles. This usually takes 30-60 seconds.
                </p>
                <div className="mt-8 space-y-2 text-sm text-gray-400">
                    <p>Generating 3D geometry...</p>
                    <p>Calculating lighting paths...</p>
                    <p>Applying photorealistic textures...</p>
                </div>
            </div>
        )}

        {/* Step: Results */}
        {state.step === AppStep.RESULTS && (
           <div className="animate-in fade-in pb-20">
               {/* Style Tabs */}
               <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-gray-200 sticky top-16 bg-brand-cream/95 backdrop-blur z-30 pt-4">
                   {state.rooms.map(room => (
                       <button 
                         key={room.id}
                         onClick={() => setActiveStyleTab(room.id)}
                         className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                             (activeStyleTab === room.id || (!activeStyleTab && state.rooms[0].id === room.id)) 
                             ? 'bg-brand-taupe text-white shadow-md' 
                             : 'bg-white text-gray-600 hover:bg-gray-100'
                         }`}
                       >
                           {room.type} ({room.selectedStyle})
                       </button>
                   ))}
               </div>

               {state.rooms.map(room => {
                   if (activeStyleTab && room.id !== activeStyleTab) return null;
                   if (!activeStyleTab && state.rooms[0].id !== room.id) return null;

                   return (
                       <div key={room.id} className="animate-in slide-in-from-bottom-4">
                           {/* Main Hero Result */}
                           <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8 group bg-stone-900">
                               {room.result?.generatedImages[0] ? (
                                   <>
                                     <img 
                                        src={room.result.generatedImages[0]} 
                                        alt="Main Design" 
                                        className="w-full h-full object-cover"
                                        onClick={() => setViewingImage({src: room.result!.generatedImages[0], alt: "Main Design"})}
                                     />
                                     <div className="absolute bottom-4 right-4 flex gap-3">
                                         <button 
                                            onClick={() => handleOpen3D(room)}
                                            className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:scale-105 transition-all shadow-lg"
                                         >
                                             <Cuboid size={18} className="text-brand-rose" /> 3D Ultra View
                                         </button>
                                         <button 
                                            onClick={() => handleEditLayout(room)}
                                            className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-black hover:scale-105 transition-all shadow-lg"
                                         >
                                             <Edit3 size={18} /> Edit Layout
                                         </button>
                                     </div>
                                   </>
                               ) : (
                                   <div className="flex items-center justify-center h-full text-white/50">
                                       <div className="text-center">
                                           <AlertTriangle size={48} className="mx-auto mb-2"/>
                                           <p>Generation failed or pending.</p>
                                       </div>
                                   </div>
                               )}
                           </div>

                           <div className="grid lg:grid-cols-3 gap-8">
                               {/* Left: Design Narrative */}
                               <div className="lg:col-span-2">
                                   <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                                       <h3 className="font-serif font-bold text-2xl mb-4 flex items-center gap-2">
                                           <Sparkles className="text-brand-rose" size={24} /> Design Rationale
                                       </h3>
                                       <div className="prose prose-stone max-w-none">
                                           {formatAdvice(room.result?.advice || "")}
                                       </div>
                                   </div>

                                   {/* Alternative Views */}
                                   <h4 className="font-bold text-gray-900 mb-4">Alternative Angles & Variants</h4>
                                   <div className="grid grid-cols-2 gap-4">
                                       {room.result?.generatedImages.slice(1).map((img, idx) => (
                                           <div key={idx} className="aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                               <img 
                                                  src={img} 
                                                  className="w-full h-full object-cover" 
                                                  alt={`Variant ${idx+1}`}
                                                  onClick={() => setViewingImage({src: img, alt: `Variant ${idx+1}`})}
                                               />
                                           </div>
                                       ))}
                                   </div>
                               </div>

                               {/* Right: Actions & Details */}
                               <div className="space-y-6">
                                   <div className="bg-brand-taupe text-brand-cream rounded-2xl p-6 shadow-lg">
                                       <h4 className="font-bold mb-4 flex items-center gap-2"><Download size={20}/> Export Options</h4>
                                       <div className="space-y-3">
                                           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-left px-4 text-sm font-medium transition-colors flex justify-between items-center">
                                               High-Res Renders (PNG) <ArrowRight size={14}/>
                                           </button>
                                           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-left px-4 text-sm font-medium transition-colors flex justify-between items-center">
                                               Shopping List (PDF) <ArrowRight size={14}/>
                                           </button>
                                           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-left px-4 text-sm font-medium transition-colors flex justify-between items-center">
                                               3D Model (GLB) <ArrowRight size={14}/>
                                           </button>
                                       </div>
                                   </div>

                                   <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                       <h4 className="font-bold text-gray-900 mb-4">Project Actions</h4>
                                       <div className="flex gap-2">
                                           <Button variant="outline" fullWidth onClick={() => handleSaveResult(room)}>
                                               <Save size={18} className="mr-2"/> Save
                                           </Button>
                                           <Button variant="outline" fullWidth onClick={() => {
                                               // Re-generate logic could go here
                                               alert("Re-rolling design...");
                                           }}>
                                               <RotateCw size={18} className="mr-2"/> Remix
                                           </Button>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   );
               })}
           </div>
        )}

      </main>
      
      {/* 3D Viewer Portal */}
      {viewing3D && (
          <div className="fixed inset-0 z-50">
               {/* 3D Component is rendered here via state condition at top level */}
          </div>
      )}

    </div>
  );
}

// Helper icon
const RotateCw = ({size, className}: {size: number, className?: string}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </svg>
);

export default App;