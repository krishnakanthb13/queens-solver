# 👑 Queens Solver

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

An interactive web application designed to solve the daily **LinkedIn Queens** puzzle (and other Star Battle variants). This tool allows you to play manually, get hints, or use AI to auto-detect and solve puzzles from screenshots.

## ✨ Features

-   **Manual Play**: Test your logic skills by solving puzzles yourself.
-   **Auto-Solver**: Uses a powerful backtracking algorithm to find solutions in microseconds.
-   **Random Level Generator**: Generate infinite valid boards with adjustable difficulty (Easy, Medium, Hard) and sizes from 5x5 to 12x12.
-   **Paint Brush Tool**: Quickly create custom layouts by picking and painting region colors in Edit Mode.
-   **Smart Layout Validation**: Automatically detects if a board configuration is mathematically solvable as you switch to Play Mode.
-   **Multi-Provider AI Vision**: Choose from **3 AI providers** to extract puzzles from screenshots:
    -   **AIML** (Gemini 3 Pro / Claude Sonnet 4.5) - Best grid extraction accuracy
    -   **Vercel AI Gateway** (Gemini 3 Pro / Claude Sonnet 4.5) - Excellent spatial reasoning
    -   **Google Gemini** (Gemini 3 Pro) - Direct Google API integration
-   **Edit Mode**: Create and test your own custom board layouts.
-   **Solved History Logs**: Keep track of your solved puzzles with precise microsecond timing. Manage your history by viewing past solutions or deleting specific entries (✕).
-   **Save Logs**: Export your Solved History Logs to a text file for your records.
-   **Dark Mode**: A sleek, premium interface that's easy on the eyes.
-   **Visuals**: Custom SVG favicon for a polished browser experience.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   At least one API key from the following providers:
    -   [AIML API Key](https://aimlapi.com/) (recommended)
    -   [Vercel AI Gateway](https://vercel.com/ai) 
    -   [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/krishnakanthb13/queens-solver.git
    cd queens-solver
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root directory and add your API keys. You can use `.env.example` as a template:
    ```bash
    cp .env.example .env.local
    ```
    Alternatively, if you run the app using the provided scripts (see below), a `.env` file will be automatically created from the template if no configuration exists.

    **Required Keys**:
    ```env
    # AIML API (Recommended - uses Gemini 3 Pro / Claude Sonnet 4.5)
    AIML_API_KEY=your_aiml_api_key_here

    # Vercel AI Gateway (uses Gemini 3 Pro / Claude Sonnet 4.5)
    VERCEL_API_KEY=your_vercel_api_key_here

    # Google Gemini (Direct API)
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the app**:
    You can use the automated launcher scripts which handle environment setup and dependency checks:
    - **Windows**: Run `run_app.bat`
    - **Linux/macOS/Git Bash**: Run `bash run_app.sh`

    Or via npm directly:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3002`.

## 🤖 AI Provider Comparison

| Provider | Model | Strengths |
| :--- | :--- | :--- |
| **AIML** | Gemini 3 Pro / Claude Sonnet 4.5 | Best grid extraction, fast |
| **Vercel** | Gemini 3 Pro / Claude Sonnet 4.5 | Excellent spatial reasoning |
| **Gemini** | Gemini 3 Pro | Direct Google API |

> **Tip**: AIML is set as the default provider. You can switch between providers using the toggle buttons in the UI.

## 📖 Documentation

-   **[Design Philosophy](DESIGN_PHILOSOPHY.md)**: The rationale behind the project, solving strategy, and user experience goals.
-   **[Code Documentation](CODE_DOCUMENTATION.md)**: A detailed technical guide explaining the architecture, core methods, and data flow.
-   **[Contributing Guide](CONTRIBUTING.md)**: Instructions for reporting bugs, suggesting features, and submitting pull requests.


## ⚖️ License

This project is licensed under the **GNU General Public License v3.0**. 

See the [LICENSE](LICENSE) file for the full text.

---
Built with ❤️ by AI Studio & React.
