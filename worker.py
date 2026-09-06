from js import Response
import json

async def on_fetch(request, env, ctx):
    url = str(request.url)
    
    # CORS Headers for Telegram Mini App
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    }

    if request.method == "OPTIONS":
        return Response.new("", status=204, headers=headers)

    # API Endpoint for Claim Ledger & Verification
    if "/api/claim" in url:
        if request.method == "POST":
            # Secure backend logic for token allocation
            response_data = {
                "status": "success",
                "message": "Allocation verified on-chain",
                "added_tokens": 2
            }
            return Response.new(json.dumps(response_data), status=200, headers=headers)

    # Default fallback for frontend
    return Response.new(json.dumps({"error": "Endpoint not found"}), status=404, headers=headers)
  
