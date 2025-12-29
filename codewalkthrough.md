# 🧩 Queens Solver: Code Walkthrough

Welcome to the inner workings of the **Queens Solver**! This document explains how the code is organized and what each part does, using simple language.

---

## 🏗️ Project Structure

The project is built with **React**, **TypeScript**, and **Vite**. Here is a breakdown of the important files:

### 1. `App.tsx` (The Brain)
This is the main file of the application. It's like the "manager" that:
-   **Remembers Everything**: It keeps track of the current grid, the colored regions, whether you are in "Play" or "Edit" mode, and your solving history.
-   **Handles Clicks**: When you click a cell to place a Queen or a Cross, this file decides what happens.
-   **Connects the Dots**: It sends instructions to the **Solver** to find answers and to the **Gemini Service** to read images.
-   **Manages Time**: It measures how fast the solver finds a solution.

### 2. `components/Board.tsx` (The Face)
This component is responsible for drawing the grid on your screen.
-   It takes the data from `App.tsx` and turns it into the colorful, interactive grid you see.
-   It applies the background colors to different regions and draws the thick borders between them.
-   It renders the icons like Crowns (Queens) and Crosses.

### 3. `services/solver.ts` (The Logic Wizard)
This is a specialized script that solves the puzzle using a technique called **Backtracking**.
-   **How it works**: It tries placing a Queen in a row, then moves to the next row. If it hits a dead end (a rule is broken), it "backtracks" (undoes the last move) and tries a different spot.
-   It keeps going until it find a valid position for every single Queen.

### 4. `services/gemini.ts` (The Eye)
This file uses **Google's Gemini AI** to "see" screenshots.
-   **OCR & Vision**: When you upload a screenshot, it sends the image to Gemini with specific instructions to identify the grid size and the colors of each cell.
-   **Auto-Correction**: Because AI sometimes makes small mistakes, this script cleans up the data to make sure the grid is a perfect square and the regions make sense.

### 5. `utils.ts` (The Helper)
This file contains small, reusable tools:
-   **Move Validator**: Checks if placing a Queen breaks any rules (same row, same column, same region, or touching another Queen).
-   **Error Checker**: Scans the whole board to find any conflicts you've made while playing.

### 6. `types.ts` & `constants.ts` (The Dictionary)
-   **types.ts**: Defines the names and shapes of data (like what a `GridState` or `CellState` looks like). It helps catch bugs while writing code.
-   **constants.ts**: Stores fixed information like the colors used for the regions and the layout of sample puzzles.

---

## 🛠️ How to Edit

If you want to modify this app:
-   **Change the UI**: Edit `App.tsx` (for layout) or `index.css` (for styles).
-   **Improve the Solver**: Tweak the logic in `services/solver.ts`.
-   **Update AI Instructions**: Modify the `SYSTEM_PROMPT` in `services/gemini.ts`.
-   **Add Colors**: Add new hex codes to the `REGION_COLORS` array in `constants.ts`.

Happy coding! 🚀
