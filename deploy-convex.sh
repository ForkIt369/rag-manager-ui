#!/bin/bash

# Deploy Convex functions to production
echo "Deploying Convex functions to production..."

# Export the Convex URL
export CONVEX_URL="https://artful-ibis-284.convex.cloud"

# Deploy using the production URL
npx convex deploy --url "$CONVEX_URL" --yes 2>&1 || {
    echo "Direct deployment failed, trying alternative approach..."
    
    # Alternative: push functions directly
    echo "Pushing functions to Convex..."
    npx convex push --url "$CONVEX_URL" --yes 2>&1
}

echo "Deployment complete!"