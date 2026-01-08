import {
  ScaleAnalysis,
  DesignResult,
  ImageSemanticData,
  ReconstructionResult,
  LayoutProposal,
  SceneGenerationResult,
  RenderedView,
  ValidationResult,
  FloorPlanAnalysis,
  DesignRegion
} from "../types";

/* =========================================================
   SAFE STUB IMPLEMENTATION (SIGNATURE-CORRECT)
   This unblocks build & matches App.tsx exactly
========================================================= */

export async function analyzeFloorPlan(
  base64Image: string
): Promise<FloorPlanAnalysis | null> {
  return null;
}

export async function analyzeHouseVideo(
  base64Video: string
): Promise<string> {
  return "";
}

export async function analyzeImageCoverage(
  images: string[],
  videos: string[]
): Promise<string> {
  return "Coverage looks sufficient.";
}

export async function analyzeRoomScale(
  images: string[],
  videos: string[]
): Promise<ScaleAnalysis> {
  return {
    status: "missing",
    confidence: 0,
    detectedObjects: [],
    pixelsPerMeter: 0
  };
}

export async function analyzeRoomSemantics(
  images: string[],
  videos: string[]
): Promise<ImageSemanticData[]> {
  return [];
}

export async function compute3DReconstruction(
  images: string[],
  videos: string[],
  scale: ScaleAnalysis | null
): Promise<ReconstructionResult | null> {
  return null;
}

export async function generateLayoutProposals(
  roomType: string,
  semantics: ImageSemanticData[],
  scale: ScaleAnalysis | null,
  requirements: Record<string, string>,
  region: DesignRegion
): Promise<LayoutProposal[]> {
  return [];
}

export async function validateLayouts(
  layouts: LayoutProposal[],
  semantics: ImageSemanticData[],
  scale: ScaleAnalysis | null
): Promise<LayoutProposal[]> {
  return layouts;
}

export async function generateRoomDesign(
  roomType: string,
  style: string,
  images: string[],
  videos: string[],
  requirements: Record<string, string>,
  region: DesignRegion,
  floorPlan?: FloorPlanAnalysis,
  houseVideo?: string,
  scale?: ScaleAnalysis | null,
  reconstruction?: ReconstructionResult | null,
  layout?: LayoutProposal,
  location?: { city?: string; country?: string }
): Promise<{ result: DesignResult; scene: SceneGenerationResult | null }> {
  return {
    result: {
      generatedImages: [],
      advice: "Design generation stubbed."
    },
    scene: null
  };
}

export async function generate3DScene(
  layout: LayoutProposal,
  roomType: string,
  style: string
): Promise<SceneGenerationResult> {
  return {
    status: "error",
    info: "3D generation disabled",
    camera_presets: []
  };
}

export async function generateRenderedViews(
  scene: SceneGenerationResult
): Promise<RenderedView[]> {
  return [];
}

export async function validateAndRefineRenders(
  renders: RenderedView[]
): Promise<ValidationResult> {
  return {
    dedupe_log: [],
    scale_issues: [],
    final_renders: renders
  };
}
