# CalorieSnap

CalorieSnap is a web application built with Next.js that allows users to upload a photo of their meal. The application then automatically uses AI to identify the food items present in the image and provides an estimated calorie count for the identified items.

## Features

-   **Image Upload:** Users can upload an image file containing a picture of food.
-   **Automatic Food Identification & Calorie Estimation:** Upon image upload, the application automatically:
    -   Utilizes Google's Gemini AI model (specifically `gemini-2.0-flash`) via Genkit to identify food items in the uploaded image.
    -   Estimates the total calorie count for the identified food items, also using the Gemini AI model via Genkit.
-   **User-Friendly Interface:** Built with ShadCN UI components and Tailwind CSS for a clean and responsive design, inspired by Cookpad's aesthetic.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **AI/ML:** [Genkit](https://firebase.google.com/docs/genkit) with [Google Gemini](https://ai.google.dev/docs/gemini_api_overview) (`gemini-2.0-flash`)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   A Google Generative AI API Key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd CalorieSnap
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your Google Generative AI API key:
    ```env
    # .env.local
    GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
    ```
    **Important:** Ensure your `.env.local` file is listed in your `.gitignore` file to prevent accidentally committing your API key.

### Running the Development Server

1.  **Start the Genkit development server (in a separate terminal):**
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```

2.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the application.

## How It Works

1.  The user uploads an image via the file input on the main page (`src/app/page.tsx`).
2.  The image is displayed momentarily while processing begins.
3.  The `handleImageUpload` function triggers the `processImage` function.
4.  The `processImage` function first calls the `identifyFoodItems` Genkit flow (`src/ai/flows/identify-food-items.ts`).
5.  This flow sends the image (as a data URL) to the Gemini model (`gemini-2.0-flash`) to identify food items.
6.  If food items are identified, `processImage` then calls the `estimateCalorieCount` Genkit flow (`src/ai/flows/estimate-calorie-count.ts`).
7.  This flow sends the list of identified food items to the Gemini model (`gemini-2.0-flash`) to get calorie estimates.
8.  The identified food items and the estimated calorie breakdown are displayed to the user once processing is complete. Loading and error states are handled visually.

## Project Structure

-   `src/app/`: Main application pages and layout (Next.js App Router).
    -   `page.tsx`: The main page component containing the UI and client-side logic.
    -   `layout.tsx`: The root layout.
    -   `globals.css`: Global CSS styles and Tailwind directives (including theme).
-   `src/ai/`: Genkit configuration and flows.
    -   `flows/`: Contains the AI logic for identifying food and estimating calories.
        -   `identify-food-items.ts`: Genkit flow for food identification.
        -   `estimate-calorie-count.ts`: Genkit flow for calorie estimation.
    -   `ai-instance.ts`: Configures the Genkit instance and Google AI plugin.
    -   `dev.ts`: Entry point for the Genkit development server.
-   `src/components/`: Reusable UI components.
    -   `ui/`: ShadCN UI components.
    -   `icons.ts`: Icon definitions using `lucide-react`.
-   `src/hooks/`: Custom React hooks (e.g., `use-toast`, `use-mobile`).
-   `src/lib/`: Utility functions (e.g., `cn` for class names).
-   `public/`: Static assets.
-   `.env.local`: Environment variables (API Keys, etc. - **MUST be in .gitignore**).
-   `next.config.ts`: Next.js configuration.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `tsconfig.json`: TypeScript configuration.
-   `package.json`: Project dependencies and scripts.
-   `components.json`: ShadCN UI configuration.
