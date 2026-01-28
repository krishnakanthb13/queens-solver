@echo off
setlocal
echo Starting Queens Solver...
echo.

:: Check for environment files
if not exist ".env.local" (
    if not exist ".env" (
        if exist ".env.example" (
            echo .env.local not found. Creating .env from .env.example...
            copy .env.example .env
        ) else (
            echo .env.local and .env.example not found. Please create environment configuration.
        )
    )
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

:: Run the development server and open the browser
:: Vite handles 'q' to quit and 'h' for help commands automatically
:: We use 'call' to ensure the script waits for npm to finish if it's a child process, 
:: though here it will occupy the foreground which is intended.
echo Server is starting. Press 'q' in this window to stop the server.
echo.
:: call npm run dev -- --open
call npm run dev -- --port 3002 --open

endlocal
