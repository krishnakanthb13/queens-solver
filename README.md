<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 👑 Queens Solver

An interactive web application designed to solve the daily **LinkedIn Queens** puzzle (and other Star Battle variants). This tool allows you to play manually, get hints, or use AI to auto-detect and solve puzzles from screenshots.

## ✨ Features

-   **Manual Play**: Test your logic skills by solving puzzles yourself.
-   **Auto-Solver**: Uses a powerful backtracking algorithm to find solutions in microseconds.
-   **AI Screenshot Detection**: Integrated with **Google Gemini 1.5 Pro (Thinking)** to instantly read and recreate puzzle layouts from images.
-   **Edit Mode**: Create and test your own custom board layouts.
-   **Solve History**: Keep track of your solved puzzles and durations.
-   **Dark Mode**: A sleek, premium interface that's easy on the eyes.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (for the screenshot feature)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/queens-solver.git
    cd queens-solver
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run the app**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 📖 Documentation

-   **[Project Walkthrough](walkthrough.md)**: Overview of the project structure and navigation.
-   **[Code Walkthrough](codewalkthrough.md)**: A simple technical guide explaining how each file works.

## ⚖️ License

This project is licensed under the **GNU General Public License v3.0**. 

See the [LICENSE](LICENSE) file for the full text.

---
Built with ❤️ by AI Studio & React.
