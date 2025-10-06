#!/bin/bash

# Deployment script for React Native Expo Web to VPS
# Run this script from your local machine

set -e

VPS_IP="62.3.42.208"
VPS_PORT="3031"
VPS_USER="root"
PROJECT_NAME="ash_mehr_frontend"
REMOTE_DIR="/opt/$PROJECT_NAME"

echo "🚀 Deploying React Native Expo Web to VPS..."

# Create a temporary directory for deployment files
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Copy project files (excluding node_modules and other unnecessary files)
echo "📦 Copying project files..."
rsync -av \
  --exclude 'node_modules' \
  --exclude '.expo' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'android' \
  --exclude 'ios' \
  --exclude '.env.local' \
  ./ "$TEMP_DIR/"

# Create deployment package
cd "$TEMP_DIR"
tar -czf project.tar.gz .

echo "📤 Uploading to VPS..."
scp -P $VPS_PORT project.tar.gz $VPS_USER@$VPS_IP:/tmp/

echo "🔧 Setting up on VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

PROJECT_NAME="ash_mehr_frontend"
REMOTE_DIR="/opt/$PROJECT_NAME"

# Create project directory
sudo mkdir -p $REMOTE_DIR
cd $REMOTE_DIR

# Extract project files
sudo tar -xzf /tmp/project.tar.gz
sudo rm /tmp/project.tar.gz

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "📦 Installing dependencies..."
sudo npm install

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
fi

# Create PM2 ecosystem file
sudo tee ecosystem.config.js > /dev/null << EOF
module.exports = {
  apps: [{
    name: 'ash-mehr-frontend',
    script: 'npx',
    args: 'expo start --web --port 3000 --host 0.0.0.0',
    cwd: '$REMOTE_DIR',
    env: {
      NODE_ENV: 'production',
      EXPO_PUBLIC_API_BASE_URL: 'http://62.3.42.208:8000',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'
    },
    log_file: '/var/log/ash-mehr-frontend.log',
    error_file: '/var/log/ash-mehr-frontend-error.log',
    out_file: '/var/log/ash-mehr-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start the application with PM2
echo "🚀 Starting Expo web server..."
sudo pm2 delete ash-mehr-frontend 2>/dev/null || true
sudo pm2 start ecosystem.config.js
sudo pm2 save
sudo pm2 startup

echo "✅ Frontend deployed successfully!"
echo "🌐 Expo web server running on http://62.3.42.208:3000"

ENDSSH

# Cleanup
rm -rf "$TEMP_DIR"

echo "🎉 Deployment completed!"
echo ""
echo "Your React Native Expo Web app is now running on:"
echo "  http://62.3.42.208:3000"
echo ""
echo "To check logs:"
echo "  ssh -p 3031 root@62.3.42.208 'pm2 logs ash-mehr-frontend'"
echo ""
echo "To restart:"
echo "  ssh -p 3031 root@62.3.42.208 'pm2 restart ash-mehr-frontend'"
