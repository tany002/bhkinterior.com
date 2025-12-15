import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScaleAnalysis, DesignResult, ImageSemanticData, ReconstructionResult, RoomData, LayoutProposal, SceneGenerationResult, RenderedView, ValidationResult, QAHeuristicResult, FloorPlanAnalysis, RoomType, FurniturePlacement, DesignRegion } from "../types";

// Safety check for API Key to prevent crash on load
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API_KEY is missing. The app will load, but AI features will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key_to_prevent_crash" });

const threeDUltraPrompt = (unitType: string, styleId: string | null) => `
SYSTEM:
You are a 3D scene metadata generator for an interior design app.
Your job is to create a clean, fast-loading 3D "Ultra Mode" view
for ONE unit type: "${unitType}".

GOAL:
Return a minimal but impressive 3D scene configuration with:
- a placeholder layout (correct proportions),
- simple furniture blocks in the right positions,
- explicit material and color information FOR EVERY BLOCK,
- clear camera presets for orbit/zoom.

CRITICAL REQUIREMENT:
No block is allowed to be colorless or undefined.
Every furniture block must have a material_id and a color_hex.
If style is unknown, use a safe neutral palette but still assign a color.

STYLE CONTEXT:
Main style id: "${styleId || "default"}".
Use this style for choosing palette, but keep geometry simple.

OUTPUT FORMAT (JSON):
{
  "unit_type": "${unitType}",
  "placeholder_layout": {
    "width_m": 6,
    "depth_m": 6,
    "height_m": 2.7,
    "furniture_blocks": [
      {
        "id": "string",
        "type": "sofa" | "tv_unit" | "base_cabinet" | "wall_unit" | "bed" | "wardrobe" | "dining" | "island" | "side_table",
        "x_m": number,
        "y_m": number,
        "w_m": number,
        "d_m": number,
        "h_m": number,
        "rotation_deg": number,
        "material_id": "string",
        "color_hex": "#RRGGBB"
      }
    ]
  },
  "material_map": {
    "sofa_default": { "color_hex": "#E5E0D8" },
    "tv_unit_default": { "color_hex": "#2F2F30" }
  },
  "camera_presets": [
    { "id":"hero_front", "pos":[5,5,5], "look_at":[0,0,0], "fov_deg":45 },
    { "id":"top_down", "pos":[0,10,0], "look_at":[0,0,0], "fov_deg":60 }
  ],
  "viewer_controls": {
    "rotate": true,
    "zoom": { "min_dist_m": 0.5, "max_dist_m": 10 },
    "pan": true,
    "auto_spin": true
  }
}

RULES:
- STRICT JSON ONLY. NO MARKDOWN. NO COMMENTS.
- Use double quotes for all keys and string values.
- Ensure rotation_deg is included for every block.
- Keep geometry simple but scaled realistically.
`;

export const multiStylePrompt = (roomType: string, mainStyleId: string, requirements: Record<string, string>, region: DesignRegion = 'Global', location?: { city: string; country: string }) => {
    let regionalInstruction = "";
    const locString = location ? `User Location: ${location.city}, ${location.country}. ` : '';

    switch(region) {
        case 'India':
            regionalInstruction = "CRITICAL: Prioritize VAASTU compliance concepts. Focus on maximizing storage (lofts/wardrobes). Use warmer wood tones (teak/walnut) and brighter accent colors suited for Indian homes.";
            break;
        case 'Europe':
            regionalInstruction = "CRITICAL: Focus on SUSTAINABILITY and SPACE EFFICIENCY. Use lighter woods, eco-friendly materials, and hygge/cozy lighting concepts common in European flats.";
            break;
        case 'North America':
            regionalInstruction = "CRITICAL: Focus on OPEN FLOW and COMFORT. Large sectional seating, kitchen islands as hubs, and 'Transitional' aesthetics.";
            break;
        case 'South America':
            regionalInstruction = "CRITICAL: Focus on SOCIAL HOSTING and INDOOR-OUTDOOR flow. Use vibrant textures, concrete elements, and tropical greenery.";
            break;
        case 'SE Asia':
            regionalInstruction = "CRITICAL: Focus on AIRFLOW and HUMIDITY management. Use rattan, bamboo, stone, and 'Tropical Japandi' aesthetics.";
            break;
        case 'Africa':
            regionalInstruction = "CRITICAL: Focus on 'Afro-Luxe'. Earthy tones (terracotta, clay) mixed with modern luxury. Patterned textiles.";
            break;
    }

    // Specific style instructions
    let styleInstruction = "";
    if (mainStyleId === "modern-indian") {
        styleInstruction = "STYLE GUIDE: Modern Indian. Mix traditional craft (Jali screens, brass accents, silk cushions) with clean, contemporary furniture lines. Dark wood finishes.";
    } else if (mainStyleId === "biophilic") {
        styleInstruction = "STYLE GUIDE: Biophilic. Integrate nature. Living walls, large plants, organic curved furniture, raw wood, stone, and maximum natural light.";
    } else if (mainStyleId === "modern-farmhouse") {
        styleInstruction = "STYLE GUIDE: Modern Farmhouse. White shiplap walls, black matte metal accents, reclaimed wood beams, apron sinks, and cozy linen textiles.";
    }

    return `
SYSTEM:
You are an interior design engine aware of global cultural nuances.
${locString}
The user is in region: "${region}".
The user has selected style: "${mainStyleId}" for unit: "${roomType}".

${regionalInstruction}
${styleInstruction}

GOAL:
For THIS unit, under this ONE main style, you MUST generate
AT LEAST 5 clearly distinct design options. This is NON-NEGOTIABLE.

Each design option = one "style_variant" with:
- its own look & feel,
- its own materials and color palette,
- its own furniture styling,
but all still inside the same main style family ("${mainStyleId}").

OUTPUT FORMAT (JSON ARRAY, EXACTLY 5 ITEMS):
[
  {
    "style_id": "string_unique_for_variant_1",
    "display_name": "Short name, e.g. 'Warm Japandi Natural'",
    "short_description": "One sentence describing this variation.",
    "color_palette_hex": ["#F7F1E8", "#D9C7B2", "#8C7A6B"],
    "material_map": {
       "walls": "matte_offwhite",
       "floor": "light_oak_wood",
       "sofa": "beige_fabric",
       "cabinets": "warm_wood",
       "accent": "black_metal"
    },
    "layout_adjustments": [
       "short bullet of layout nuance, e.g. 'open shelving on left wall'",
       "another minor tweak"
    ],
    "expected_camera_angles": [
       "hero_front",
       "corner_wide",
       "detail_closeup"
    ]
  },
  { ... four more objects, each visually distinct but same main style ... }
]

RULES:
- ALWAYS return 5 variants, never fewer.
- All 5 must look meaningfully different (different palettes, textures, compositions).
- Do NOT change base room size; only styling and minor layout nuances.
- Keep JSON valid. Do not add extra commentary outside the array.
- Use requirements: ${JSON.stringify(requirements)} when choosing palettes and materials.
`;
};

export const multiImagePrompt = (roomType: string, mainStyleId: string, variant: any) => `
SYSTEM:
You are an ELITE interior renderer.

TASK:
For the unit: "${roomType}"
For main style: "${mainStyleId}"
For specific style variation: "${variant.style_id}" ("${variant.display_name}")

You must generate MULTIPLE camera views (at least 3) of the SAME design:
- View 1: hero_front
- View 2: corner_wide
- View 3: detail_closeup (materials / textures)

All views MUST:
- use the SAME layout and materials described in:
  color_palette_hex: ${JSON.stringify(variant.color_palette_hex)}
  material_map: ${JSON.stringify(variant.material_map)}
- keep furniture, scale, materials perfectly consistent.
- only change camera angle and composition.

GOAL:
Give the user visual clarity by showing the same design from several angles.

OUTPUT EXPECTATION:
- Return multiple images of the same room design.
- If the API supports it, generate 3 images in one call.
- Do NOT change colors or furniture between images.
`;

export const textToImagePrompt = (roomType: string, mainStyleId: string, variant: any, requirements: Record<string, string>) => `
SYSTEM:
You are an ELITE architectural visualization engine.
You are generating a photorealistic interior design from scratch based on a specific style and requirements.

CONTEXT:
Room Type: "${roomType}"
Style: "${mainStyleId}" -> Variation: "${variant.display_name}"
Description: ${variant.short_description}
User Requirements: ${JSON.stringify(requirements)}

VISUAL DETAILS:
- Color Palette: ${variant.color_palette_hex.join(', ')}
- Materials: ${JSON.stringify(variant.material_map)}
- Lighting: Natural daylight, cinematic architectural lighting, soft shadows.
- Viewpoint: Eye-level perspective showing the main area of the room.
- Quality: 8K, photorealistic, magazine cover quality, highly detailed textures.

TASK:
Generate a stunning, high-resolution image of this room. Ensure the layout is logical and functional.
`;

/**
 * Helper to convert base64 string to clean data string for API
 */
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:(image|video)\/(png|jpeg|jpg|webp|mp4|mpeg|quicktime|webm|gif);base64,/, '');
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image|video)\/(png|jpeg|jpg|webp|mp4|mpeg|quicktime|webm|gif);base64,/);
  if (!match) return 'image/jpeg'; 
  return `${match[1]}/${match[2]}`;
}

/**
 * Retry helper with exponential backoff for handling 429 errors
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
    const isServerError = error.status >= 500;

    if (retries > 0 && (isRateLimit || isServerError)) {
      console.warn(`API Request failed (${error.status || 'error'}). Retrying in ${baseDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, baseDelay));
      return withRetry(fn, retries - 1, baseDelay * 2);
    }
    throw error;
  }
};

export const analyzeFloorPlan = async (base64Image: string): Promise<FloorPlanAnalysis | null> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(base64Image),
              mimeType: getMimeType(base64Image),
            }
          },
          {
            text: `Analyze this floor plan. 
            Extract the architectural style (e.g., 'Modern', 'Traditional'), assess the flow (connections between rooms), and list all detected rooms.
            For each room, provide:
            - A label (e.g., 'Master Bedroom', 'Kitchen')
            - Approximate dimensions (e.g., '4m x 5m' or '12ft x 15ft'). If text is not visible, estimate relative size.
            - Number of windows visible.
            - Number of doors visible.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            architecturalStyle: { type: Type.STRING },
            flowAssessment: { type: Type.STRING },
            detectedRooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  windowCount: { type: Type.INTEGER },
                  doorCount: { type: Type.INTEGER }
                },
                required: ["label", "dimensions", "windowCount", "doorCount"]
              }
            }
          },
          required: ["architecturalStyle", "flowAssessment", "detectedRooms"]
        }
      }
    }));
    
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Floor plan analysis failed:", error);
    return null;
  }
};

export const analyzeHouseVideo = async (base64Video: string): Promise<string> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(base64Video),
              mimeType: getMimeType(base64Video),
            }
          },
          {
            text: "Analyze this full house video tour. Describe the overall architectural style, flow between rooms, lighting, and any consistent design elements (flooring, trim, etc.). Keep it concise."
          }
        ]
      }
    }));
    return response.text || "Video analysis complete.";
  } catch (error) {
    console.error("House video analysis failed:", error);
    return "Could not analyze video. Proceeding.";
  }
};

export const analyzeImageCoverage = async (base64Images: string[], base64Videos: string[] = []): Promise<string> => {
  if (base64Images.length === 0 && base64Videos.length === 0) return "No media to analyze.";
  
  try {
    const parts = [
      ...base64Images.map(img => ({ inlineData: { data: cleanBase64(img), mimeType: getMimeType(img) } })),
      ...base64Videos.map(vid => ({ inlineData: { data: cleanBase64(vid), mimeType: getMimeType(vid) } }))
    ];

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          ...parts,
          { 
            text: `You are an interior design assistant. The user has uploaded ${base64Images.length} photos and ${base64Videos.length} videos of a room.
            Check if these files collectively provide a good view of the room (e.g., all 4 corners, ceiling height, floor).
            If it looks good, say "Coverage looks good."
            If specific angles seem missing, politely ask the user. Keep it very short.` 
          }
        ]
      }
    }));
    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Coverage analysis failed:", error);
    return "Could not verify coverage.";
  }
}

export const analyzeRoomScale = async (base64Images: string[], base64Videos: string[] = []): Promise<ScaleAnalysis> => {
  if (base64Images.length === 0 && base64Videos.length === 0) {
    return { confidence: 0, detectedObjects: [], pixelsPerMeter: null, status: 'missing' };
  }

  try {
    const imagesToAnalyze = base64Images.slice(0, 3).map(img => ({
      inlineData: {
        data: cleanBase64(img),
        mimeType: getMimeType(img),
      }
    }));

    const keyframeCount = base64Images.length + (base64Videos.length * 30);

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...imagesToAnalyze,
          {
            text: `Analyze these room images.
            TASK 1: Scale Detection - Identify standard objects (credit_card, A4 paper, smartphone, doorway ~914mm). Estimate "pixels_per_meter".
            TASK 2: 3D Feasibility - "confidence" (0-1), "estimated_pointcloud_size".
            OUTPUT JSON.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.NUMBER },
            detected_objects: { type: Type.ARRAY, items: { type: Type.STRING } },
            pixels_per_meter: { type: Type.NUMBER },
            estimated_pointcloud_size: { type: Type.NUMBER }
          },
          required: ["confidence", "detected_objects", "pixels_per_meter", "estimated_pointcloud_size"]
        }
      }
    }));

    const result = JSON.parse(response.text || "{}");
    const poseConfidence = result.confidence || 0;
    const detectedObjects = result.detected_objects || [];
    let pixelsPerMeter = result.pixels_per_meter;
    const estimatedPointcloudSize = result.estimated_pointcloud_size || 0;

    if (pixelsPerMeter === -1) pixelsPerMeter = null;

    let fusionMode: 'heavy_3d_fusion' | 'parametric_fallback' = 'heavy_3d_fusion';
    let reason = '';

    if (poseConfidence < 0.6 || keyframeCount < 6 || estimatedPointcloudSize > 5000000) {
      fusionMode = 'parametric_fallback';
      reason = `Fallback triggered: Pose Confidence ${poseConfidence} < 0.6`;
    }

    return {
      confidence: poseConfidence,
      detectedObjects,
      pixelsPerMeter,
      status: pixelsPerMeter ? 'valid' : 'missing',
      fusionMode,
      reason
    };
  } catch (error) {
    console.error("Scale analysis failed:", error);
    return { confidence: 0, detectedObjects: [], pixelsPerMeter: null, status: 'missing', fusionMode: 'parametric_fallback' };
  }
};

export const analyzeRoomSemantics = async (base64Images: string[]): Promise<ImageSemanticData[] | null> => {
  return []; // Simplified for this demo
};

export const compute3DReconstruction = async (images: string[], videos: string[], scale: ScaleAnalysis): Promise<ReconstructionResult | null> => {
    return {
        poses: [],
        pointCloud: { count: 1000, density: 'sparse' },
        confidence: scale.confidence,
        route: scale.fusionMode === 'heavy_3d_fusion' ? 'heavy_3d' : 'parametric_fallback',
        reason: scale.reason || 'Default'
    };
};

export const generateLayoutProposals = async (
    roomType: string, 
    semantics: ImageSemanticData[], 
    scale: ScaleAnalysis | null, 
    requirements: Record<string, string>,
    region: DesignRegion = 'Global'
): Promise<LayoutProposal[]> => {
  try {
    let regionPrompt = "";
    if (region === "India") regionPrompt = "Adhere to VAASTU layouts.";
    if (region === "North America") regionPrompt = "Favor open concept and central flow.";
    
    const prompt = `
        Create a furniture layout for a ${roomType}.
        Context: User is in ${region}. ${regionPrompt}
        Requirements: ${JSON.stringify(requirements)}.
        Room Size assumed: 5m x 5m.
        Return 3 variations of furniture placements in JSON format.
        Each placement has: item_type, x_m, y_m, rotation_deg, width_m, depth_m.
        Also provide a short rationale for each layout.
    `;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              layout_id: { type: Type.STRING },
              style_token: { type: Type.STRING },
              placements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item_type: { type: Type.STRING },
                    x_m: { type: Type.NUMBER },
                    y_m: { type: Type.NUMBER },
                    rotation_deg: { type: Type.NUMBER },
                    width_m: { type: Type.NUMBER },
                    depth_m: { type: Type.NUMBER }
                  },
                  required: ["item_type", "x_m", "y_m", "rotation_deg", "width_m", "depth_m"]
                }
              },
              short_rationale: { type: Type.STRING },
              walkways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
              },
              constraints_ok: { type: Type.BOOLEAN }
            },
            required: ["layout_id", "placements", "short_rationale"]
          }
        }
      }
    }));

    const layouts = JSON.parse(response.text || "[]");
    return layouts.map((l: any) => ({ ...l, walkways: l.walkways || [] }));

  } catch (e) {
    console.error("Layout generation failed", e);
    // Return a safe fallback layout
    return [{
      layout_id: 'fallback-1',
      style_token: 'default',
      placements: [
        { item_type: 'Sofa', x_m: 2.5, y_m: 2.5, rotation_deg: 0, width_m: 2.2, depth_m: 0.9 },
        { item_type: 'Coffee Table', x_m: 2.5, y_m: 3.2, rotation_deg: 0, width_m: 1.2, depth_m: 0.6 }
      ],
      walkways: [],
      constraints_ok: true,
      short_rationale: "Fallback layout"
    }];
  }
};

export const validateLayouts = async (
  layouts: LayoutProposal[],
  semantics: ImageSemanticData[],
  scale: ScaleAnalysis | null
): Promise<LayoutProposal[]> => {
  // Mock validation logic - in a real app this would check collisions and walkways
  return layouts.map(layout => ({
    ...layout,
    constraints_ok: true,
    checked: true
  }));
};

export const generate3DScene = async (layout: LayoutProposal, roomType: string = 'Room', styleId: string | null = null): Promise<SceneGenerationResult> => {
  try {
    // Generate scene metadata using the Ultra Prompt
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: threeDUltraPrompt(roomType, styleId) + `\n\nLayout Context: ${JSON.stringify(layout)}` }] },
      config: { responseMimeType: 'application/json' }
    }));
    
    // Aggressive JSON cleaning to fix potential errors
    let text = response.text || "{}";
    // Find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }
    
    // Remove markdown code blocks if any remain
    text = text.replace(/```json\n?|\n?```/g, "").trim();

    const data = JSON.parse(text);
    
    return {
      status: 'success',
      info: "3D Scene Generated",
      camera_presets: data.camera_presets || [],
      viewer_controls: data.viewer_controls,
      placeholder_layout: data.placeholder_layout,
      bounding_box: data.bounding_box
    };
  } catch (e) {
    console.error("3D Scene generation failed", e);
    return {
      status: 'error',
      info: "Failed to generate 3D scene data",
      camera_presets: [],
    };
  }
};

export const generateRoomDesign = async (
  roomType: string,
  selectedStyle: string,
  images: string[],
  videos: string[],
  requirements: Record<string, string>,
  region: DesignRegion,
  floorPlanAnalysis?: FloorPlanAnalysis,
  houseVideoAnalysis?: string,
  scale?: ScaleAnalysis | null,
  reconstruction?: ReconstructionResult | null,
  layout?: LayoutProposal,
  location?: { city: string; country: string }
): Promise<{ result: DesignResult, scene: SceneGenerationResult | null }> => {
  try {
    // 1. Generate 5 Distinct Style Variants using Gemini 2.5 Flash (Text)
    const promptText = multiStylePrompt(roomType, selectedStyle, requirements, region, location);
    
    const styleResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: promptText }] },
        config: { responseMimeType: 'application/json' }
    }));

    const styleVariants = JSON.parse(styleResponse.text || "[]");
    
    // 2. Generate Images for the top 3 variants
    // Use the first image as the base if available
    const baseImage = images.length > 0 ? images[0] : null;

    const generatedImages: string[] = [];
    const adviceParts: string[] = [];

    // Limit to 3 to optimize speed.
    const variantsToRender = styleVariants.slice(0, 3);

    const imageGenerationPromises = variantsToRender.map(async (variant: any) => {
        let contents;
        let model = 'gemini-2.5-flash-image';

        if (baseImage) {
            // Image-to-Image Generation
            const imagePrompt = multiImagePrompt(roomType, selectedStyle, variant);
            contents = {
                parts: [
                    { inlineData: { data: cleanBase64(baseImage), mimeType: getMimeType(baseImage) } },
                    { text: imagePrompt }
                ]
            };
        } else {
            // Text-to-Image Generation (Fallback for Floor Plan only)
            const textPrompt = textToImagePrompt(roomType, selectedStyle, variant, requirements);
            contents = {
                parts: [
                    { text: textPrompt }
                ]
            };
        }

        try {
            const imgResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: model,
                contents: contents
            }));

            const variantImages: string[] = [];
            // Extract image from response
            if (imgResponse.candidates?.[0]?.content?.parts) {
                for (const part of imgResponse.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        variantImages.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
                    }
                }
            }
            
            if (variantImages.length > 0) {
                 return {
                     images: variantImages,
                     advice: `**${variant.display_name}**: ${variant.short_description}`
                 };
            }
            return null;
        } catch (imgError) {
            console.error(`Failed to render variant ${variant.style_id}`, imgError);
            return null;
        }
    });

    // Wait for all image generations to complete in parallel
    const results = await Promise.all(imageGenerationPromises);

    // Aggregate results
    results.forEach(res => {
        if (res) {
            generatedImages.push(...res.images);
            adviceParts.push(res.advice);
        }
    });

    const designResult = {
      generatedImages, 
      advice: adviceParts.join('\n\n') || "Generated distinct style options based on your preferences."
    };

    // 3. Generate 3D Scene Data (Pre-calc for Ultra Mode)
    let sceneResult: SceneGenerationResult | null = null;
    if (layout) {
      try {
        sceneResult = await generate3DScene(layout, roomType, selectedStyle);
      } catch (e) {
        console.warn("Auto 3D scene generation failed, skipping.", e);
      }
    }

    return { result: designResult, scene: sceneResult };

  } catch (error) {
    console.error("Design generation failed:", error);
    return {
      result: {
        generatedImages: [],
        advice: "We encountered an error while generating your designs. Please try again."
      },
      scene: null
    };
  }
};

export const generateRenderedViews = async (
    layout: LayoutProposal, 
    style: string, 
    cameraPresets: any[]
): Promise<RenderedView[]> => {
    // This would ideally call a rendering service or use the same image generation logic
    return [];
};

export const validateAndRefineRenders = async (renders: RenderedView[]): Promise<ValidationResult> => {
    return {
        dedupe_log: [],
        scale_issues: [],
        final_renders: renders
    };
};