#!/bin/bash

echo "Starting Queens Solver..."
echo

# Check for environment files
if [ ! -f ".env.local" ]; then
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo ".env.local not found. Creating .env from .env.example..."
            cp .env.example .env
        else
            echo ".env.local and .env.example not found. Please create environment configuration."
        fi
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi

# Run the development server and open the browser
echo "Server is starting. Press 'Ctrl+C' to stop the server."
echo
npm run dev -- --port 3002 --open
