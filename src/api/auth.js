// api/auth.js — Upstox OAuth token exchange
// Vercel serverless function — runs on server, never exposes secrets to browser

export default async function handler(req, res) {
  // Allow CORS from your frontend
  res.setHeader("Access-Control-Allow-Origin", "https://vedartha.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing auth code" });
  }

  try {
    const response = await fetch("https://api.upstox.com/v2/login/authorization/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.UPSTOX_API_KEY,
        client_secret: process.env.UPSTOX_API_SECRET,
        redirect_uri:  process.env.UPSTOX_REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Return token to frontend — frontend stores in sessionStorage
    return res.status(200).json({ access_token: data.access_token });

  } catch (err) {
    return res.status(500).json({ error: "Token exchange failed", detail: err.message });
  }
}
