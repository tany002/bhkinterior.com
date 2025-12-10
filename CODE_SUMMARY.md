# BHKInterior.com - Codebase & Technical Summary
**Date:** May 2024
**Version:** 1.0.0

## 1. Application Overview
BHKInterior.com is a single-page application (SPA) built with React and TypeScript that leverages Generative AI to transform floor plans, photos, and videos into interior design concepts. It features a custom 3D viewer, drag-and-drop layout editing, and tiered subscription monetization.

### Tech Stack
-   **Frontend:** React 18, Vite, Tailwind CSS
-   **Language:** TypeScript
-   **AI Engine:** Google Gemini API (`gemini-2.5-flash` for logic/text, `gemini-2.5-flash-image` for visuals)
-   **3D Rendering:** Three.js (Custom implementation with `OrbitControls` and `RoomEnvironment`)
-   **Payments:** Cashfree SDK (Client-side load) + Next.js API Routes (Stubbed)
-   **Icons:** Lucide React

---

## 2. User Experience Flow

### A. Landing & Conversion
1.  **Landing Page**: Hero section with video backgrounds, feature grid, style carousel, and gallery.
2.  **Paywall (Gatekeeper)**:
    -   Users must select a plan (`Pro`, `Premium`, `Ultra`) and billing cycle (`Monthly`, `Half-Yearly`, `Yearly`) before accessing the tool.
    -   **AuthVerificationModal**: Captures Email and Phone.
        -   *Logic*: Simulates OTP verification.
        -   *Currency*: Detects country code (e.g., +91 for India, +1 for USA) and converts the base USD price to local currency (INR, GBP, EUR, etc.) using hardcoded rates.
    -   **Payment**: Initiates a Cashfree checkout session via `services/cashfreeService.ts`.

### B. Onboarding
Once subscribed, the `AppStep` moves to `ONBOARDING`.
1.  **Home Type**: User selects (Apartment, Villa, Studio).
2.  **Location**: City & Region (Critical for AI "Vaastu" or "Feng Shui" context).
3.  **Input Method**:
    -   *Floor Plan*: Upload -> AI analyzes rooms/dimensions (`analyzeFloorPlan`).
    -   *House Video*: Upload -> AI analyzes style/flow (`analyzeHouseVideo`).
    -   *Photos*: Manual room creation.

### C. Design Configuration
The app transitions to `ROOM_UPLOADS`.
-   **Room Management**: User adds photos/videos for specific rooms (Living Room, Kitchen, etc.).
-   **Tools**:
    -   `Check Coverage`: AI verifies if uploaded photos cover all angles.
    -   `Analyze Scale`: AI estimates pixels-per-meter using reference objects (standard doors).
-   **Requirements**: User fills out specific Q&A per room type (e.g., "Where is the TV unit?").

### D. Generation & Results
State: `PROCESSING` -> `RESULTS`.
1.  **Layout Generation**: Gemini generates JSON furniture coordinates.
2.  **Visual Generation**:
    -   Text-to-Image (if no photos) or Image-to-Image (if photos provided).
    -   Generates 5 distinct style variants based on the selected "Base Style" (e.g., Japandi).
3.  **3D Scene Construction**:
    -   Converts the AI Layout JSON into Three.js primitives (BoxGeometry for furniture).
    -   Applies colors and materials based on style context.

---

## 3. Key Services

### `services/geminiService.ts`
This is the core AI logic handler.
-   **`analyzeFloorPlan`**: Returns JSON with detected rooms and dimensions.
-   **`generateRoomDesign`**: The heavy lifter.
    1.  Calls `multiStylePrompt` to get text descriptions of 5 variants.
    2.  Calls `generateContent` with image prompts to render the visuals.
    3.  Calls `generate3DScene` to create the metadata for the Ultra View.
-   **`analyzeRoomScale`**: vital for the layout editor accuracy. Uses vision capabilities to measure "pixels per door width".

### `services/cashfreeService.ts`
-   Dynamically loads the Cashfree JS SDK.
-   **Mock Mode**: If the API call fails or for dev testing, it creates a mock session (`session_mock_...`) to allow flow testing without real money.

---

## 4. Payment & Subscription Details
-   **Tiers**:
    -   **Free**: No access (Paywall blocks usage).
    -   **Pro ($39/mo)**: 1,000 Designs, Basic Renders.
    -   **Premium ($149/mo)**: 5,000 Designs, 8K Renders, 3D Mode, Family Sharing.
    -   **Ultra ($169/mo)**: 10,000 Designs, Commercial Rights.
-   **Currency Handling**:
    -   Base prices are in USD.
    -   Frontend calculates local price: `Base * Multiplier * ExchangeRate`.
    -   Actual charge happens via Cashfree (supporting INR/USD).

---

## 5. Current Status & TODOs
-   **Status**: Payment integration is stable. Core AI flow is implemented.
-   **Immediate Focus**:
    1.  Refining the flow transition between "Payment Success" and "Onboarding".
    2.  Enhancing the `DragEditor` to support more furniture types.
    3.  Improving the "Floor Plan to 3D" conversion accuracy.
