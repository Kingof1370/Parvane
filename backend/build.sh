#!/usr/bin/env bash
set -e

echo "=== Building NestJS backend ==="
nest build

echo ""
echo "=== Building Admin Panel ==="
(
  set +e   # در این بلاک، خطا باعث توقف نمی‌شود
  cd ../admin || { echo "⚠️  admin dir not found, skipping"; exit 0; }
  
  echo "Installing admin dependencies..."
  npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    echo "⚠️  Admin npm install failed, skipping admin build"
    exit 0
  fi
  
  echo "Building admin panel with vite..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "⚠️  Admin vite build failed, skipping"
    exit 0
  fi
  
  echo "Copying admin dist to backend/admin-dist..."
  mkdir -p ../backend/admin-dist
  cp -r dist/. ../backend/admin-dist/
  echo "✅ Admin panel built successfully!"
)
# خطای subshell را نادیده می‌گیریم
true
