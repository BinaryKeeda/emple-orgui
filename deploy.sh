#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo ".env file missing"
  exit 1
fi

echo "🚀 Deploying BinaryKeeda UI..."

docker compose down
docker compose build
docker compose up -d

echo "BinaryKeeda UI deployed successfully"
