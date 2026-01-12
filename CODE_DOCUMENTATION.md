# 🧩 Queens Solver: Technical Documentation

Welcome to the technical core of the **Queens Solver**. This document outlines the architecture, data flow, and core logic of the application.

---

## 🏗️ Architecture Overview

The project is a client-side web application built with a modern stack focusing on performance and type safety.

-   **Framework**: [React 19](https://react.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: Vanilla CSS (Premium Dark Theme)
-   **State Management**: React `useState` and `useEffect` hooks for local state; `localStorage` for persistence.

The application follows a modular service-oriented design:
1.  **UI Layer**: `App.tsx` and React components.
2.  **Logic Layer**: Pure functional services for solving and generating puzzles.
3.  **Vision Layer**: API-based services for processing screenshot data via AI.

---

## 📂 Project Structure

| File/Folder | Description |
| :--- | :--- |
| `App.tsx` | Main application controller. Manages state, routing (modes), and event handlers. |
| `components/` | Contains UI components like `Board.tsx` (the SVG rendering engine). |
| `services/` | Contains core logic: `solver.ts`, `generator.ts`, and AI providers. |
| `utils.ts` | Shared helper functions for move validation and conflict detection. |
| `types.ts` | Centralized TypeScript interfaces and enums. |
| `constants.ts` | Configuration constants (colors, initial state, sample puzzles). |

---

## ⚙️ Core Methods & Functions

| Function | Location | Description |
| :--- | :--- | :--- |
| `solvePuzzle` | `solver.ts` | Brute-force backtracking algorithm to find a valid Queen placement. |
| `generateRandomBoard` | `generator.ts` | Inside-out algorithm: places Queens first, then grows regions. |
| `isValidMove` | `utils.ts` | Validates Row, Column, Region, and Adjacency rules for a specific cell. |
| `analyzeScreenshot` | `aiml.ts` / `vercel.ts` | Sends image data to AI for grid and region extraction. |
| `deleteHistoryEntry` | `App.tsx` | Manages the removal of specific local records from the solved history. |

---

## 🔄 Data Flow

1.  **Input**: The user manual clicks cells, generates a random board, or uploads a screenshot.
2.  **Processing**:
    -   **Solver**: If "Get Hint" or "Auto Solve" is triggered, `solvePuzzle` scans the current `RegionMap`.
    -   **AI**: If an image is uploaded, it's converted to Base64 and sent to an AI provider.
3.  **State Update**: The resulting JSON or grid data updates the `grid` and `regions` state in `App.tsx`.
4.  **Output**: React re-renders the `Board.tsx` component to reflect the new state.

---

## 🤖 AI Vision Integration

The app integrates 3 providers to handle OCR and spatial reasoning for grid extraction:
-   **AIML API**: Primary provider using LLM vision models.
-   **Vercel AI Gateway**: Proxy for various models with optimized latency.
-   **Google Gemini SDK**: Direct integration with Google's GenAI for native performance.

---

## 📦 Dependencies

Major packages used:
-   `lucide-react`: For the sleek iconography.
-   `@google/genai`: For direct Google AI interaction.
-   `vite`: Provides the high-speed dev environment.

---

## 🛠️ Development & Extension

-   **To add a new AI model**: Create a new service in `services/` and add a toggle in `App.tsx`.
-   **To modify solver speed**: Tweak the pruning logic in `solvePuzzle` (though currently optimized for grids up to 12x12).
-   **To add colors**: Update the `REGION_COLORS` array in `constants.ts`.

---

## 📖 Related Documentation
-   **[Design Philosophy](DESIGN_PHILOSOPHY.md)**: The rationale and principles behind the project.
-   **[Contributing Guide](CONTRIBUTING.md)**: How to get involved and contribute to the project.
-   **[README](README.md)**: Back to the project overview.

*Happy coding!* 🚀
