#!/bin/sh

echo "=== Building NestJS backend ==="
./node_modules/.bin/nest build
if [ $? -ne 0 ]; then
  echo "ERROR: nest build failed"
  exit 1
fi

echo ""
echo "=== Building Admin Panel (non-fatal) ==="
cd ../admin && \
  npm install --legacy-peer-deps && \
  npm run build && \
  mkdir -p ../backend/admin-dist && \
  cp -r dist/. ../backend/admin-dist/ && \
  echo "Admin panel built OK" || \
  echo "Admin build failed - skipping (non-fatal)"

exit 0
