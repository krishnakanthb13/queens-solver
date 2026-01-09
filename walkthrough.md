# 📖 Project Walkthrough

This document provides a high-level overview of the Queens Solver project and how to navigate the codebase.

## 🚀 Getting Started

If you are new here, start by reading the [README.md](README.md) to set up the project on your local machine.

## 📂 Navigation

-   **User Interface**: Most UI components and state management are in `App.tsx`.
-   **Game Board**: The visual grid logic is inside `components/Board.tsx`.
-   **Solving Algorithm**: The core logic that finds solutions is in `services/solver.ts`.
-   **AI Integration**: Vision-based grid detection is handled by multiple services:
    -   `services/aiml.ts` - AIML API (Gemini 3 Pro)
    -   `services/vercel.ts` - Vercel AI Gateway (Claude Sonnet 4.5)
    -   `services/gemini.ts` - Direct Google Gemini API

## 🤖 AI Providers

The app supports **3 AI providers** for screenshot-to-puzzle extraction:

| File | Provider | Model | API Endpoint |
| :--- | :--- | :--- | :--- |
| `aiml.ts` | AIML | Gemini 3 Pro | `api.aimlapi.com` |
| `vercel.ts` | Vercel Gateway | Claude Sonnet 4.5 | `ai-gateway.vercel.sh` |
| `gemini.ts` | Google | Gemini 3 Pro | Google GenAI SDK |

### Switching Providers

Users can switch between providers using the toggle buttons in the UI. The default is **AIML** (Gemini 3 Pro).

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
