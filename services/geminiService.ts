import { GoogleGenerativeAI } from "@google/generative-ai";
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
   Gemini Client Init (Browser-safe, Vercel-safe)
========================================================= */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is missing. AI features will not work.");
}

const ai = new GoogleGenerativeAI(apiKey);

/* =========================================================
   Helpers
========================================================= */

type GenerateContentResponse = any;

const cleanBase64 = (base64: string) =>
  base64.replace(/^data:(image|video)\/.*;base64,/, "");

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image|video)\/([^;]+);base64,/);
  return match ? `${match[1]}/${match[2]}` : "image/jpeg";
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1500
): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
};

/* =========================================================
   FLOOR PLAN ANALYSIS
========================================================= */

export const analyzeFloorPlan = async (
  base64Image: string
): Promise<FloorPlanAnalysis | null> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64(base64Image),
                mimeType: getMimeType(base64Image)
              }
            },
            {
              text: `
Return STRICT JSON ONLY:
{
  "architecturalStyle": "string",
  "flowAssessment": "string",
  "detectedRooms": [
    {
      "label": "string",
      "dimensions": "string",
      "windowCount": number,
      "doorCount": number
    }
  ]
}
`
            }
          ]
        }
      })
    );

    return JSON.parse(response.text ?? "{}");
  } catch (err) {
    console.error("Floor plan analysis failed", err);
    return null;
  }
};

/* =========================================================
   HOUSE VIDEO ANALYSIS
========================================================= */

export const analyzeHouseVideo = async (base64Video: string): Promise<string> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64(base64Video),
                mimeType: getMimeType(base64Video)
              }
            },
            {
              text:
                "Analyze this house walkthrough video and describe style, flow, lighting, and materials. Keep concise."
            }
          ]
        }
      })
    );

    return response.text || "";
  } catch {
    return "";
  }
};

/* =========================================================
   MULTI-STYLE DESIGN PROMPT
========================================================= */

export const multiStylePrompt = (
  roomType: string,
  styleId: string,
  requirements: Record<string, string>,
  region: DesignRegion
) => `
Return EXACTLY 5 design variants as JSON ARRAY.

Room: ${roomType}
Style: ${styleId}
Region: ${region}
Requirements: ${JSON.stringify(requirements)}

Each item:
{
  "style_id": "string",
  "display_name": "string",
  "short_description": "string",
  "color_palette_hex": ["#XXXXXX"],
  "material_map": { "walls": "string", "floor": "string" }
}

STRICT JSON ONLY.
`;

/* =========================================================
   ROOM DESIGN GENERATION
========================================================= */

export const generateRoomDesign = async (
  roomType: string,
  selectedStyle: string,
  images: string[],
  _videos: string[],
  requirements: Record<string, string>,
  region: DesignRegion
): Promise<{ result: DesignResult; scene: null }> => {
  try {
    const styleResponse = await withRetry<GenerateContentResponse>(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [{ text: multiStylePrompt(roomType, selectedStyle, requirements, region) }]
        }
      })
    );

    const styles = JSON.parse(styleResponse.text ?? "[]");

    const generatedImages: string[] = [];
    const advice: string[] = [];

    const baseImage = images[0];

    for (const variant of styles.slice(0, 3)) {
      const imgResponse = await withRetry<GenerateContentResponse>(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: baseImage
              ? [
                  {
                    inlineData: {
                      data: cleanBase64(baseImage),
                      mimeType: getMimeType(baseImage)
                    }
                  },
                  { text: variant.short_description }
                ]
              : [{ text: variant.short_description }]
          }
        })
      );

      const parts = imgResponse.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          generatedImages.push(
            `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}`
          );
        }
      }

      advice.push(`${variant.display_name}: ${variant.short_description}`);
    }

    return {
      result: {
        generatedImages,
        advice: advice.join("\n")
      },
      scene: null
    };
  } catch (err) {
    console.error("Design generation failed", err);
    return {
      result: { generatedImages: [], advice: "Design generation failed." },
      scene: null
    };
  }
};

/* =========================================================
   PLACEHOLDERS (SAFE)
========================================================= */

export const analyzeRoomSemantics = async (): Promise<ImageSemanticData[]> => [];
export const compute3DReconstruction = async (): Promise<ReconstructionResult | null> => null;
export const generateRenderedViews = async (): Promise<RenderedView[]> => [];
export const validateAndRefineRenders = async (): Promise<ValidationResult> => ({
  dedupe_log: [],
  scale_issues: [],
  final_renders: []
});
