// api/login.js — builds the Upstox login URL server-side and redirects
export default async function handler(req, res) {
  const clientId    = process.env.UPSTOX_API_KEY;
  const redirectUri = process.env.UPSTOX_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: "Missing UPSTOX_API_KEY or UPSTOX_REDIRECT_URI env vars" });
  }

  const url = `https://api.upstox.com/v2/login/authorization/dialog`
    + `?response_type=code`
    + `&client_id=${encodeURIComponent(clientId)}`
    + `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Redirect browser directly to Upstox login
  res.redirect(302, url);
}