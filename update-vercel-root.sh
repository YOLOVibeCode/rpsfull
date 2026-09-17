#!/bin/bash
# Script to help update Vercel Root Directory via API

PROJECT_ID="prj_jiwxOrdWk3sNl1VLPCGAPku6ALZK"
TEAM_ID="team_CXtiPAIj022FycrTCz0TAltC"

echo "To update the Root Directory via API, you need a Vercel token."
echo ""
echo "1. Get your token from: https://vercel.com/account/tokens"
echo "2. Then run:"
echo ""
echo "curl -X PATCH 'https://api.vercel.com/v9/projects/$PROJECT_ID' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"rootDirectory\":\"packages/frontend\"}'"
echo ""
echo "Or update it manually in the dashboard:"
echo "https://vercel.com/rvegajrs-projects/frontend/settings/general"
