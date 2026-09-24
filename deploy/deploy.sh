#!/bin/bash
# CAT Spotter Deploy Script
# Run from the project root on the server
set -euo pipefail

echo "=== CAT Spotter Deploy ==="

# Pull latest
cd /opt/cat-spotter
git pull

# Update backend
source venv/bin/activate
pip install -r backend/requirements.txt

# Regenerate data and retrain model
cd /opt/cat-spotter/backend
python -m app.ml.augment
python -m app.ml.train

# Rebuild frontend
cd /opt/cat-spotter/frontend
npm ci
npm run build

# Copy frontend
rm -rf /var/www/cat-spotter/*
cp -r /opt/cat-spotter/frontend/dist/* /var/www/cat-spotter/

# Restart service
systemctl restart cat-spotter

# Wait for startup
sleep 3

# Smoke test
echo "Running smoke test..."
cd /opt/cat-spotter
python scripts/smoke_ws.py || echo "WARNING: Smoke test failed"

echo "=== Deploy Complete ==="
echo "Check: curl http://localhost/api/health"
