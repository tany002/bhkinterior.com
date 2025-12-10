
# BHKInterior.com - AI Interior Designer

An advanced AI-powered interior design application that transforms floor plans and photos into stunning 3D visualizations and renders.

## Features

-   **AI Floor Plan Analysis**: Automatically detects rooms, dimensions, and architectural flow from uploaded blueprints.
-   **8K Photorealistic Renders**: Generates magazine-quality visualizations of redesigned spaces.
-   **3D Ultra Mode**: Interactive 3D walkthroughs of generated designs using Three.js.
-   **Style Transfer**: Apply 45+ global design styles (Japandi, Modern Farmhouse, Biophilic, etc.).
-   **Drag-and-Drop Editor**: Customize furniture layouts with a precise 2D editor.
-   **Global Context**: Aware of regional design nuances (Vaastu for India, Open Flow for US, etc.).

## Tech Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash & Pro (Multimodal)
-   **3D Engine**: Three.js
-   **Build Tool**: Vite
-   **Email**: Resend
-   **Payments**: Cashfree

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/tany002/bhkinterior.com.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the root directory (see `.env` file in repo):
    ```env
    # AI
    API_KEY=your_google_api_key

    # Email (Resend.com)
    RESEND_API_KEY=re_123456...

    # Payments (Cashfree)
    CASHFREE_APP_ID=...
    CASHFREE_SECRET_KEY=...
    CASHFREE_ENV=sandbox
    ```
4.  Run the development server:
    **Important:** To run the backend API functions (`/api/*`) locally, use Vercel CLI:
    ```bash
    npm i -g vercel
    vercel dev
    ```
    If you use `npm run dev`, the email and payment features will **not** work because Vite does not host the serverless functions.

## Deployment on Vercel

1.  Push this code to your GitHub repository.
2.  Import the project into Vercel.
3.  Vercel will detect `Vite` as the framework.
4.  **Crucial**: Add all variables from your `.env` file to the **Environment Variables** section in Vercel settings.
5.  Deploy!

## License

Proprietary software for BHKInterior.com.
