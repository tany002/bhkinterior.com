

export type RoomType = 'Living Room' | 'Kitchen' | 'Bedroom' | 'Bathroom' | 'Dining Room';

export enum AppStep {
  LANDING = 'LANDING',
  PAYWALL = 'PAYWALL',
  PROFILE = 'PROFILE',
  ONBOARDING = 'ONBOARDING',
  FLOOR_PLAN = 'FLOOR_PLAN',
  HOUSE_VIDEO = 'HOUSE_VIDEO',
  ROOM_UPLOADS = 'ROOM_UPLOADS',
  STYLE_SELECT = 'STYLE_SELECT',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
  SAVED_DESIGNS = 'SAVED_DESIGNS'
}

export type DesignRegion = 'North America' | 'Europe' | 'India' | 'South America' | 'SE Asia' | 'Africa' | 'Global';

export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'ultra';
export type BillingCycle = 'monthly' | 'half_yearly' | 'yearly';

export interface FamilyMember {
    phone: string;
    role: string;
    addedAt: Date;
}

export interface OnboardingData {
  styles: string[]; // IDs of selected styles
  homeType: string; // Apartment, Villa, etc.
  location: { city: string; country: string };
  rooms: { type: RoomType, count: number }[];
  inputMethod: 'floorplan' | 'photos' | 'video' | 'sample';
}

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  designGoal?: string;
  propertyType?: string;
  region: DesignRegion;
  stylePreference?: string; // Primary style
  onboardingData?: OnboardingData;
  isSubscribed: boolean;
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
  designCount: number;
  maxDesigns: number;
  familyMembers: FamilyMember[];
}

export interface DesignResult {
  generatedImages: string[]; // Array of URLs for different corner views
  advice: string;
}

export interface ScaleAnalysis {
  confidence: number;
  detectedObjects: string[];
  pixelsPerMeter: number | null;
  status: 'valid' | 'missing' | 'calibrated';
  fusionMode?: 'heavy_3d_fusion' | 'parametric_fallback';
  reason?: string;
}

export interface SemanticRegion {
  label: string;
  polygon: { x: number; y: number }[]; // Normalized 0-1 coordinates
}

export interface ImageSemanticData {
  imageIndex: number;
  semanticMasks: SemanticRegion[];
  depthMap: string; // Description of the depth profile
}

export interface CameraPose {
  imageIndex: number;
  translation: { x: number; y: number; z: number };
  rotation: { w: number; x: number; y: number; z: number };
}

export interface ReconstructionResult {
  poses: CameraPose[];
  pointCloud: {
    count: number;
    density: 'sparse' | 'medium' | 'dense';
  };
  confidence: number;
  route: 'heavy_3d' | 'parametric_fallback';
  reason: string;
}

export interface FurniturePlacement {
  item_type: string;
  x_m: number;
  y_m: number;
  rotation_deg: number;
  width_m: number;
  depth_m: number;
  elevation_m?: number;
  material?: 'fabric' | 'wood' | 'metal' | 'glass' | 'leather';
}

export interface LayoutProposal {
  layout_id: string;
  style_token: string;
  placements: FurniturePlacement[];
  walkways: string[];
  constraints_ok: boolean;
  short_rationale: string;
  errors?: string[];
  auto_fixed?: boolean;
}

export interface CameraPreset {
  id: string;
  pos: [number, number, number];
  look_at: [number, number, number];
  fov?: number;
}

export interface LODLevel {
  level: number;
  triangles: string;
}

export interface FurnitureBlock {
  id: string;
  type: string;
  x_m: number;
  y_m: number;
  w_m: number;
  d_m: number;
  h_m: number;
  material_id: string;
  color_hex: string;
  rotation_deg?: number;
}

export interface SceneLayout {
  width_m: number;
  depth_m: number;
  height_m: number;
  furniture_blocks: FurnitureBlock[];
}

export interface SceneGenerationResult {
  gltf_url?: string; // Optional if we generate client-side
  lods?: LODLevel[];
  pivot_point?: [number, number, number];
  bounding_box?: { min: [number, number, number]; max: [number, number, number] };
  camera_presets: CameraPreset[];
  placeholder_layout?: SceneLayout;
  viewer_controls?: {
    rotate: boolean;
    zoom: { min_dist_m: number; max_dist_m: number };
    pan: boolean;
    auto_spin?: boolean;
  };
  status: 'success' | 'fallback_triggered' | 'error';
  info: string;
}

export interface RenderedView {
  image: string; // base64
  metadata: {
    layout_id: string;
    camera_id: string;
    seed: number;
    style_token: string;
  };
}

export interface QAHeuristicResult {
  qa_pass: boolean;
  issues: string[];
  fixed_renders: RenderedView[];
}

export interface ValidationResult {
  dedupe_log: string[];
  scale_issues: string[];
  final_renders: RenderedView[];
  qa_heuristics?: QAHeuristicResult;
}

export interface RoomData {
  id: string;
  type: RoomType;
  originalImages: string[];
  originalVideos: string[]; // Stores base64 video data
  requirements: Record<string, string>; // Stores Q&A for the room
  coverageFeedback: string | null; // Stores AI feedback on image coverage
  scaleAnalysis: ScaleAnalysis | null;
  semanticAnalysis: ImageSemanticData[] | null;
  reconstruction: ReconstructionResult | null;
  layoutProposals: LayoutProposal[] | null;
  sceneGeneration: SceneGenerationResult | null;
  renderedViews: RenderedView[] | null;
  validationResult: ValidationResult | null;
  result: DesignResult | null;
  status: 'pending' | 'uploading' | 'analyzing_coverage' | 'analyzing_scale' | 'analyzing_semantics' | 'analyzing_reconstruction' | 'generating_layouts' | 'validating_layouts' | 'generating_scene' | 'rendering_views' | 'validating_renders' | 'processing' | 'completed' | 'error';
  selectedStyle: string; // The style selected for this specific room
}

export interface FloorPlanRoomDetail {
  label: string;
  dimensions: string;
  windowCount: number;
  doorCount: number;
}

export interface FloorPlanAnalysis {
  architecturalStyle: string;
  flowAssessment: string;
  detectedRooms: FloorPlanRoomDetail[];
}

export interface AppState {
  step: AppStep;
  userProfile: UserProfile;
  floorPlanImage: string | null;
  floorPlanAnalysis: FloorPlanAnalysis | null;
  houseVideo: string | null;
  houseVideoAnalysis: string | null;
  rooms: RoomData[];
}

export const ROOM_QUESTIONS: Record<RoomType, { id: string; label: string; placeholder: string }[]> = {
  'Living Room': [
    { 
      id: 'tv_position', 
      label: 'Where should the TV unit be placed?', 
      placeholder: 'e.g., Against the wall opposite the main door, or on the side wall?' 
    },
    { 
      id: 'seating', 
      label: 'Any specific seating requirements?', 
      placeholder: 'e.g., Large L-shaped sofa, 2 accent chairs, bean bags...' 
    }
  ],
  'Kitchen': [
    { 
      id: 'sinks', 
      label: 'Sink Configuration & Usage', 
      placeholder: 'e.g., Need two sinks: one for dirty utensils, one for hand washing.' 
    },
    { 
      id: 'appliances', 
      label: 'What appliances must be included?', 
      placeholder: 'e.g., Washing machine, dishwasher, double-door fridge, microwave...' 
    },
    {
      id: 'storage',
      label: 'Storage Preferences',
      placeholder: 'e.g., Deep drawers for pots, pantry pull-out, tall units...'
    }
  ],
  'Bedroom': [
    { 
      id: 'bed_position', 
      label: 'Preferred Bed Position', 
      placeholder: 'e.g., Headboard against the window wall.' 
    },
    { 
      id: 'workspace', 
      label: 'Do you need a workspace/desk?', 
      placeholder: 'e.g., Yes, a small desk near the window for laptop work.' 
    }
  ],
  'Bathroom': [
    { 
      id: 'zones', 
      label: 'Wet/Dry Zoning', 
      placeholder: 'e.g., Glass partition for shower required.' 
    }
  ],
  'Dining Room': [
    { 
      id: 'capacity', 
      label: 'Seating Capacity', 
      placeholder: 'e.g., 6 seater, round table preferred.' 
    }
  ]
};

// 45+ High-Quality Global Interior Design Styles - Reordered by Popularity
export const DESIGN_STYLES = [
  { id: 'modern-farmhouse', name: 'Modern Farmhouse', description: 'Rustic warmth meets modern chic. Shiplap, black metal accents, and neutral comfort.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80' },
  { id: 'biophilic', name: 'Biophilic', description: 'Nature-inspired. Living walls, natural light, organic shapes, and air-purifying plants.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80' },
  { id: 'modern-indian', name: 'Modern Indian', description: 'Traditional warmth (teak, brass, jali) blended with sleek, clutter-free contemporary layouts.', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80' },
  { id: 'transitional', name: 'Transitional', description: 'The perfect balance of traditional elegance and modern lines. Timeless and sophisticated.', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80' },
  { id: 'mid-century', name: 'Mid-Century Modern', description: 'Retro 50s/60s vibe. Tapered legs, geometric patterns, olive & mustard tones.', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80' },
  { id: 'luxury-modern', name: 'Luxury Modern', description: 'High-gloss finishes, velvet textures, gold accents, and dramatic lighting.', image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&q=80' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Hygge warmth, light woods, functional simplicity, and cozy textiles.', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80' },
  { id: 'japandi', name: 'Japandi', description: 'Fusion of Japanese rustic minimalism and Scandinavian functionality.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&q=80' },
  { id: 'minimalist', name: 'Minimalist', description: 'Ultra-clean lines, monochromatic palettes, and clutter-free spaces.', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500&q=80' },
  { id: 'boho', name: 'Boho', description: 'Eclectic layering, organic textures, rattan, and global patterns.', image: 'https://images.unsplash.com/photo-1522444195799-478538b28823?w=500&q=80' },
  { id: 'industrial', name: 'Industrial', description: 'Raw materials, exposed brick/pipes, concrete floors, and metal fixtures.', image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=500&q=80' },
  { id: 'contemporary', name: 'Contemporary', description: 'Fluid and current. Soft curves, neutral elements, and cutting-edge trends.', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80' },
  { id: 'mediterranean', name: 'Mediterranean', description: 'Sun-baked colors, terracotta tiles, arched doorways, and wrought iron.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80' },
  { id: 'coastal', name: 'Coastal', description: 'Breezy and light. Whites, blues, natural fibers, and a relaxed beach house vibe.', image: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=500&q=80' },
  { id: 'art-deco', name: 'Art Deco', description: 'Glamour and geometry. Bold metallic accents, mirrored surfaces, and luxe velvets.', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=500&q=80' },
  { id: 'wabi-sabi', name: 'Wabi-Sabi', description: 'Beauty in imperfection. Raw concrete, aged wood, asymmetry, and earthy austerity.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80' },
  { id: 'maximalist', name: 'Maximalist', description: 'Bold colors, mixed patterns, curated clutter, and high-energy personality.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' },
  { id: 'tropical', name: 'Tropical', description: 'Lush greenery, vibrant prints, cane furniture, and an endless summer vibe.', image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=500&q=80' },
  { id: 'zen', name: 'Zen', description: 'Asian-inspired tranquility. Low furniture, tatami mats, sliding screens, and harmony.', image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500&q=80' },
  { id: 'rustic', name: 'Rustic', description: 'Rugged beauty. Reclaimed wood, stone fireplaces, and warm, earthy comfort.', image: 'https://images.unsplash.com/photo-1540932296774-3ed6d133d3be?w=500&q=80' },
  { id: 'french-country', name: 'French Country', description: 'Provencal charm. Distressed wood, toile fabrics, lavender tones, and antique touches.', image: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=500&q=80' },
  { id: 'hollywood-regency', name: 'Hollywood Regency', description: 'Opulent and theatrical. Lacquer finishes, crystal chandeliers, and bold contrast.', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=500&q=80' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic, neon-lit, high-tech aesthetic with dark tones and vibrant LEDs.', image: 'https://images.unsplash.com/photo-1555685812-4b943f3e99a9?w=500&q=80' },
  { id: 'shabby-chic', name: 'Shabby Chic', description: 'Soft, romantic, and vintage. Pastels, florals, and distressed white furniture.', image: 'https://images.unsplash.com/photo-1596194045647-2a6b53952127?w=500&q=80' },
  { id: 'bauhaus', name: 'Bauhaus', description: 'Form follows function. Primary colors, geometric shapes, and industrial materials.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80' },
  { id: 'brutalist', name: 'Brutalist', description: 'Monolithic and raw. Exposed concrete, heavy forms, and monochromatic minimalism.', image: 'https://images.unsplash.com/photo-1552355040-e727378b6444?w=500&q=80' },
  { id: 'gothic', name: 'Gothic', description: 'Dark, dramatic, and ornate. Velvet, dark wood, stained glass, and moody lighting.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80' },
  { id: 'victorian', name: 'Victorian', description: 'Rich and detailed. Patterned wallpapers, heavy drapes, dark woods, and ornamentation.', image: 'https://images.unsplash.com/photo-1505693416388-b0346efee535?w=500&q=80' },
  { id: 'southwestern', name: 'Southwestern', description: 'Desert inspired. Terracotta, navajo patterns, cactus, and warm sunset tones.', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500&q=80' },
  { id: 'moroccan', name: 'Moroccan', description: 'Exotic and intricate. Mosaics, lanterns, poufs, and rich jewel tones.', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=500&q=80' },
  { id: 'tuscan', name: 'Tuscan', description: 'Old world Italy. Stone walls, vineyards, wrought iron, and warm ochre colors.', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&q=80' },
  { id: 'steampunk', name: 'Steampunk', description: 'Victorian industrial sci-fi. Brass gears, leather, pipes, and vintage tech.', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80' },
  { id: 'neoclassical', name: 'Neoclassical', description: 'Grand and symmetrical. Columns, pale colors, gilding, and refined elegance.', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500&q=80' },
  { id: 'cottagecore', name: 'Cottagecore', description: 'Idyllic countryside. Floral prints, vintage china, cozy nooks, and nostalgia.', image: 'https://images.unsplash.com/photo-1595805397221-4d32150b599a?w=500&q=80' },
  { id: 'preppy', name: 'Preppy', description: 'Classic collegiate. Plaids, stripes, monograms, and crisp navy & white.', image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=500&q=80' },
  { id: 'memphis', name: 'Memphis Design', description: '80s rebellion. Clashing colors, abstract shapes, squiggles, and bold geometry.', image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&q=80' },
  { id: 'traditional-indian', name: 'Traditional Indian', description: 'Heritage luxury. Carved wood, silk tapestries, vibrant colors, and swings.', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80' },
  { id: 'asian-zen', name: 'Asian Zen', description: 'Minimalist harmony. Feng shui, water features, bamboo, and natural stone.', image: 'https://images.unsplash.com/photo-1600210491892-03d5450977d9?w=500&q=80' },
  { id: 'eclectic', name: 'Eclectic', description: 'Curated chaos. A harmonious mix of styles, time periods, and textures.', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80' },
  { id: 'retro', name: 'Retro', description: 'Nostalgic 60s/70s. Bold patterns, shag rugs, avocado green, and orange.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' },
  { id: 'bali', name: 'Bali Style', description: 'Island sanctuary. Open-air living, thatch roofs, teak wood, and lush plants.', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=80' },
  { id: 'nautical', name: 'Nautical', description: 'Maritime inspired. Navy blue, white stripes, rope accents, and ship details.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80' },
  { id: 'spanish-revival', name: 'Spanish Revival', description: 'Colonial warmth. Stucco walls, red tile roofs, dark beams, and colorful tiles.', image: 'https://images.unsplash.com/photo-1600596542815-369e7d3fa799?w=500&q=80' },
  { id: 'urban-modern', name: 'Urban Modern', description: 'City chic. Loft aesthetics, soft furnishings, and cosmopolitan polish.', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80' },
  { id: 'chalet', name: 'Chalet', description: 'Mountain lodge. Exposed timber, fur throws, stone fireplaces, and snow views.', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80' }
];