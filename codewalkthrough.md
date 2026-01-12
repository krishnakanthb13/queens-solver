# 🧩 Queens Solver: Code Walkthrough

Welcome to the inner workings of the **Queens Solver**! This document explains how the code is organized and what each part does, using simple language.

---

## 🏗️ Project Structure

The project is built with **React**, **TypeScript**, and **Vite**. Here is a breakdown of the important files:

### 1. `App.tsx` (The Brain)
This is the main file of the application. It's like the "manager" that:
-   **Remembers Everything**: It keeps track of the current grid, the colored regions, whether you are in "Play" or "Edit" mode, and your solving history.
-   **Handles Clicks**: When you click a cell to place a Queen or a Cross, this file decides what happens.
-   **Connects the Dots**: It sends instructions to the **Solver** to find answers and to the **AI Services** to read images.
-   **Manages AI Selection**: Lets users choose between AIML, Vercel, or Gemini for screenshot analysis.
-   **Manages Time & History**: It measures how fast the solver finds a solution and saves valid solves to local storage in "Solved History Logs".
-   **Reverse Chronological Sorting**: Implements logic to ensure the newest solve is always displayed first.
-   **Individual Deletion**: Provides a `deleteHistoryEntry` function to remove specific records from the history list.
-   **Random Level Handling**: Orchestrates the generator modal and updates the board with internally generated puzzles (supporting up to 12x12 grids).
-   **Paint Brush State**: Implements a "Pick and Paint" state machine in Edit Mode that allows copying region colors quickly.
-   **Smart Layout Validation**: Uses a background check to provide real-time feedback on whether a custom board layout is mathematically solvable.

### 2. `components/Board.tsx` (The Face)
This component is responsible for drawing the grid on your screen.
-   It takes the data from `App.tsx` and turns it into the colorful, interactive grid you see.
-   It applies the background colors to different regions and draws the thick borders between them.
-   It renders the icons like Crowns (Queens) and Crosses.

### 3. `services/solver.ts` (The Logic Wizard)
This is a specialized script that solves the puzzle using a technique called **Backtracking**.
-   **How it works**: It tries placing a Queen in a row, then moves to the next row. If it hits a dead end (a rule is broken), it "backtracks" (undoes the last move) and tries a different spot.
-   It keeps going until it find a valid position for every single Queen.

### 4. `services/generator.ts` (The Creative Genius)
This service creates NEW puzzles from scratch using an "Inside-Out" approach:
-   **Queen Placement**: It first creates a valid "skeleton" of Queens using randomized backtracking. By shuffling the column order at each step, it ensures that every board is unique.
-   **Region Growth**: Once the Queens are placed, it grows colored regions around them using a frontier-based algorithm.
-   **Difficulty Control**:
    -   **Easy**: Biases growth towards the "oldest" points, resulting in simple, compact shapes.
    -   **Medium**: A balanced mix of patterns.
    -   **Hard**: Uses fully random growth to create complex, winding, "snakelike" regions that are much trickier to solve.

### 5. AI Services (The Eyes)

The app supports **3 different AI providers** for reading screenshots:

#### `services/aiml.ts` (AIML Provider)
-   Uses **AIML API** with **Gemini 3 Pro / Claude Sonnet 4.5** model
-   **Best for**: Grid extraction accuracy
-   **Endpoint**: `https://api.aimlapi.com/v1/chat/completions`
-   **Default provider** in the app

#### `services/vercel.ts` (Vercel Provider)
-   Uses **Vercel AI Gateway** with **Gemini 3 Pro / Claude Sonnet 4.5**
-   **Best for**: Spatial reasoning and logical validation
-   **Endpoint**: `https://ai-gateway.vercel.sh/v1/chat/completions` (Direct call)

#### `services/gemini.ts` (Google Gemini Provider)
-   Uses **Google GenAI SDK** with **Gemini 3 Pro**
-   **Best for**: Direct Google API integration
-   Uses the official `@google/genai` package

All three services share the same logic:
-   **Vision Analysis**: Send screenshots to the AI with specific instructions to identify grid size and cell colors
-   **Auto-Correction**: Clean up AI responses to ensure the grid is a perfect square and regions are valid
-   **JSON Extraction**: Parse the structured output from the AI response

### 6. `utils.ts` (The Helper)
This file contains small, reusable tools:
-   **Move Validator**: Checks if placing a Queen breaks any rules (same row, same column, same region, or touching another Queen).
-   **Error Checker**: Scans the whole board to find any conflicts you've made while playing.

### 7. `types.ts` & `constants.ts` (The Dictionary)
-   **types.ts**: Defines the names and shapes of data (like what a `GridState` or `CellState` looks like). It helps catch bugs while writing code.
-   **constants.ts**: Stores fixed information like the colors used for the regions and the layout of sample puzzles.

### 8. `vite.config.ts` (The Setup)
-   **Environment Variables**: Exposes API keys from `.env.local` as `process.env.*`
-   **Build Settings**: Configures Vite for development and production

---

## 🎲 Why the Random Generator?

Before the generator was added, the app was a "tool" for solving external puzzles. By adding the `generator.ts` logic, it became a **standalone game**. 

-   **Goal**: Provide infinite replayability without needing external screenshots.
-   **Guaranteed Solvable**: Because the algorithm places Queens *first* and then wraps regions around them, every puzzle generated is mathematically guaranteed to have at least one solution.
-   **Visual Polish**: We also added a custom **SVG Favicon** (the golden crown) to make the experience feel premium.

---

## 🔧 Environment Configuration

Create a `.env.local` file with your API keys:

```env
# AIML API (Default - Gemini 3 Pro / Claude Sonnet 4.5)
AIML_API_KEY=your_key_here

# Vercel AI Gateway (Gemini 3 Pro / Claude Sonnet 4.5)
VERCEL_API_KEY=your_key_here

# Google Gemini (Direct API)
GEMINI_API_KEY=your_key_here
```

---

## 🛠️ How to Edit

If you want to modify this app:
-   **Change the UI**: Edit `App.tsx` (for layout) or `index.css` (for styles).
-   **Improve the Solver**: Tweak the logic in `services/solver.ts`.
-   **Update AI Instructions**: Modify the `SYSTEM_PROMPT` in any of the AI service files.
-   **Add a New AI Provider**: Create a new file in `services/` following the pattern of existing services.
-   **Add Colors**: Add new hex codes to the `REGION_COLORS` array in `constants.ts`.

Happy coding! 🚀
