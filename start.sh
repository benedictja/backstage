#!/bin/bash

# Stop on error
set -e

# Change to repo root (if script is run from elsewhere)
cd "$(dirname "$0")"

# Load env vars from .env (if it exists)
if [ -f .env ]; then
  echo "🔧 Loading environment variables from .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  No .env file found, continuing without it"
fi

# Optional: Print key env vars for debugging
echo "🌍 APP_BASE_URL=$APP_BASE_URL"
echo "🎯 BACKEND_BASE_URL=$BACKEND_BASE_URL"

# Start Backstage (frontend and backend)
echo "🚀 Starting Backstage app..."
yarn start
