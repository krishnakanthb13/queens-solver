# 📖 Project Walkthrough

This document provides a high-level overview of the Queens Solver project and how to navigate the codebase.

## 🚀 Getting Started

If you are new here, start by reading the [README.md](README.md) to set up the project on your local machine.

## 📂 Navigation

-   **User Interface**: Most UI components and state management are in `App.tsx`.
-   **Game Board**: The visual grid logic is inside `components/Board.tsx`.
-   **Solving Algorithm**: The core logic that finds solutions is in `services/solver.ts`.
-   **AI Integration**: Vision-based grid detection is handled by multiple services:
    -   `services/aiml.ts` - AIML API (Gemini 3 Pro / Claude Sonnet 4.5)
    -   `services/vercel.ts` - Vercel AI Gateway (Gemini 3 Pro / Claude Sonnet 4.5)
    -   `services/gemini.ts` - Direct Google Gemini API

## 🤖 AI Providers

The app supports **3 AI providers** for screenshot-to-puzzle extraction:

| File | Provider | Model | API Endpoint |
| :--- | :--- | :--- | :--- |
| `aiml.ts` | AIML | Gemini 3 Pro / Claude Sonnet 4.5 | `api.aimlapi.com` |
| `vercel.ts` | Vercel Gateway | Gemini 3 Pro / Claude Sonnet 4.5 | `ai-gateway.vercel.sh` |
| `gemini.ts` | Google | Gemini 3 Pro | Google GenAI SDK |

### Switching Providers

Users can switch between providers using the toggle buttons in the UI. The default is **AIML** (Gemini 3 Pro).

## 📜 History & Logging

The application maintains a local history of your solved puzzles. You can access this via the **History** button in the top-right corner.

-   **View History**: Replay previous puzzles.
-   **Save Logs**: Download your complete solve history as `queens_solver_logs.txt`.
-   **Clear History**: Permanently delete all logs.

## 🎨 Design & Usability

-   **Paint Brush Tool**: Designed for power users who want to build custom boards quickly. Instead of selecting a color from the palette for every click, you can "pick" a color from an existing cell and "paint" it across the grid.
-   **Layout Intelligence**: The app doesn't just check for mistakes; it checks for possibility. When you finish editing a board, the app background-solves it to ensure you haven't created an impossible layout.
-   **Scalability**: The random generator now supports up to 12x12 grids, providing a significant step up in difficulty for veteran players.

## 🔧 Configuration

Environment variables are configured in `.env.local`:

```env
AIML_API_KEY=your_key      # For AIML provider
VERCEL_API_KEY=your_key    # For Vercel provider
GEMINI_API_KEY=your_key    # For Google Gemini provider
```

The Vite config (`vite.config.ts`) exposes these as `process.env.*`.

---

## 💻 Technical Details

For a detailed explanation of every file and how the logic flows, check out our technical guide:

👉 **[Code Walkthrough](codewalkthrough.md)**
