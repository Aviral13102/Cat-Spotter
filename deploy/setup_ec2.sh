#!/bin/bash
# CAT Spotter EC2 Setup Script
# Run as root on a fresh Ubuntu 22.04/24.04 instance
set -euo pipefail

echo "=== CAT Spotter EC2 Setup ==="

# Update system
apt update && apt upgrade -y

# Install Python 3.11+
apt install -y python3 python3-venv python3-pip

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx and Certbot
apt install -y nginx certbot python3-certbot-nginx

# Install git and build tools
apt install -y git build-essential

# Create app directory
mkdir -p /opt/cat-spotter
mkdir -p /var/www/cat-spotter

# Clone or copy the repository
if [ -d "/opt/cat-spotter/backend" ]; then
    echo "App directory already exists, pulling latest..."
    cd /opt/cat-spotter && git pull
else
    echo "Clone your repository to /opt/cat-spotter"
    echo "e.g.: git clone <repo-url> /opt/cat-spotter"
fi

# Setup Python virtual environment
cd /opt/cat-spotter
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Generate data and train model ON THE HOST
cd /opt/cat-spotter/backend
python -m app.ml.augment
python -m app.ml.train

# Build frontend
cd /opt/cat-spotter/frontend
npm ci
npm run build

# Copy frontend build to web root
cp -r /opt/cat-spotter/frontend/dist/* /var/www/cat-spotter/

# Setup Nginx
cp /opt/cat-spotter/deploy/nginx.conf /etc/nginx/sites-available/cat-spotter
ln -sf /etc/nginx/sites-available/cat-spotter /etc/nginx/sites-enabled/cat-spotter
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup systemd service
cp /opt/cat-spotter/deploy/cat-spotter.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cat-spotter
systemctl start cat-spotter

# Setup TLS (optional — requires a domain or sslip.io)
echo ""
echo "=== Setup Complete ==="
echo "To add TLS (required for microphone):"
echo "  certbot --nginx -d <your-domain-or-ip>.sslip.io"
echo ""
echo "Check status: systemctl status cat-spotter"
echo "View logs: journalctl -u cat-spotter -f"
