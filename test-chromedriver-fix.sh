#!/bin/bash

# Test ChromeDriver deployment script for Railway

echo "🚀 Testing ChromeDriver deployment updates..."

# Test the Railway API endpoints
RAILWAY_URL="https://gramsetu-production.up.railway.app"

echo "1️⃣ Testing health endpoint..."
curl -s "$RAILWAY_URL/health" | jq .

echo ""
echo "2️⃣ Testing ChromeDriver with Maharashtra data..."
curl -s "$RAILWAY_URL/request?state=Maharashtra&commodity=Jowar&market=Mumbai" | jq .

echo ""
echo "3️⃣ Testing batch request..."
curl -s -X POST "$RAILWAY_URL/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"state": "Maharashtra", "commodity": "Jowar", "market": "Mumbai"},
      {"state": "Maharashtra", "commodity": "Bajra", "market": "Mumbai"}
    ]
  }' | jq .

echo ""
echo "✅ ChromeDriver tests completed!"
echo ""
echo "📝 If you see errors, the Dockerfile deployment is needed."
echo "   Railway will rebuild automatically when you push the changes."