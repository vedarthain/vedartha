// src/upstoxClient.js — All Upstox API fetch functions for Vedartha

const PROXY = "/api/upstox";

export function getToken() { return sessionStorage.getItem("upstox_token"); }
export function setToken(token) { sessionStorage.setItem("upstox_token", token); }
export function isLoggedIn() { return !!getToken(); }

async function upstoxFetch(endpoint, params = {}) {
  const token = getToken();
  if (!token) throw new Error("Not logged in");
  const query = new URLSearchParams({ endpoint, ...params }).toString();
  const res = await fetch(`${PROXY}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getLoginURL() {
  const apiKey = import.meta.env.VITE_UPSTOX_API_KEY;
  const redirectUri = encodeURIComponent("https://vedartha.vercel.app");
  return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${redirectUri}`;
}

export async function exchangeToken(code) {
  const res = await fetch(`/api/auth?code=${code}`);
  if (!res.ok) throw new Error("Token exchange failed");
  const data = await res.json();
  setToken(data.access_token);
  return data.access_token;
}

export async function getOHLCV(isin, interval = "day", fromDate, toDate) {
  const instrumentKey = encodeURIComponent(`NSE_EQ|${isin}`);
  const data = await upstoxFetch(
    `historical-candle/${instrumentKey}/${interval}/${toDate}/${fromDate}`
  );
  return (data.data?.candles || []).map(([ts, o, h, l, c, v]) => ({
    date:   new Date(ts).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    open:   +o.toFixed(2),
    high:   +h.toFixed(2),
    low:    +l.toFixed(2),
    close:  +c.toFixed(2),
    volume: v,
  })).reverse();
}

export async function getMarketQuotes(isinList) {
  const symbols = isinList.map(isin => `NSE_EQ|${isin}`).join(",");
  const data = await upstoxFetch("market-quote/quotes", { symbol: symbols });
  return data.data || {};
}

export function dateRange(months) {
  const to = new Date(), from = new Date();
  from.setMonth(from.getMonth() - months);
  return {
    fromDate: from.toISOString().split("T")[0],
    toDate:   to.toISOString().split("T")[0],
  };
}

export const STOCK_ISINS = {
  RELIANCE:  "INE002A01018",
  TCS:       "INE467B01029",
  HDFCBANK:  "INE040A01034",
  INFY:      "INE009A01021",
  WIPRO:     "INE075A01022",
  SBIN:      "INE062A01020",
  ICICIBANK: "INE090A01021",
  AXISBANK:  "INE238A01034",
  LT:        "INE018A01030",
  HCLTECH:   "INE860A01027",
};
