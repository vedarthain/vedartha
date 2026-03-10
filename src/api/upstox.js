// api/upstox.js — Proxy for all Upstox API calls
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://vedartha.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  const query = new URLSearchParams(params).toString();
  const url = `https://api.upstox.com/v2/${endpoint}${query ? "?" + query : ""}`;

  try {
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Proxy request failed", detail: err.message });
  }
}
