#!/bin/bash

# Configuration
PROJECT_NAME="cpa-yearly-report"
REMOTE_DIR="/opt/$PROJECT_NAME"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "Error: backend/.env not found. Please create it first."
    exit 1
fi

echo "🚀 Preparing deployment package..."

# Create a temporary directory for deployment
DEPLOY_DIR="deploy_tmp"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp docker-compose.yml $DEPLOY_DIR/
cp -r backend $DEPLOY_DIR/
cp -r frontend $DEPLOY_DIR/
# Remove node_modules and other local artifacts
rm -rf $DEPLOY_DIR/backend/node_modules
rm -rf $DEPLOY_DIR/frontend/node_modules
rm -rf $DEPLOY_DIR/frontend/dist

echo "📦 Deployment package ready in $DEPLOY_DIR"
echo "Next steps:"
echo "1. Upload the contents of $DEPLOY_DIR to your Akamai server."
echo "2. On the server, run: docker compose up -d --build"
echo "3. Remember to set your environment variables (especially MYSQL_ROOT_PASSWORD)."
