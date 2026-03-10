import { useState, useEffect, useRef } from "react";

const INDIAN_TRANSLATIONS = [
  { text: "वेदार्थ",        lang: "Hindii"     },
  { text: "வேதார்த்தம்",   lang: "Tamil"     },
  { text: "వేదార్థం",      lang: "Telugu"    },
  { text: "ವೇದಾರ್ಥ",      lang: "Kannada"   },
  { text: "വേദാർത്ഥം",    lang: "Malayalam" },
  { text: "বেদার্থ",       lang: "Bengali"   },
  { text: "વેદાર્થ",       lang: "Gujarati"  },
  { text: "ਵੇਦਾਰਥ",       lang: "Punjabi"   },
  { text: "वेदार्थ",       lang: "Marathi"   },
  { text: "वेदार्थः",      lang: "Sanskrit"  },
  { text: "ଭେଦାର୍ଥ",      lang: "Odia"      },
  { text: "বেদাৰ্থ",       lang: "Assamese"  },
  { text: "وید ارتھ",      lang: "Urdu"      },
  { text: "वेदार्थ",       lang: "Nepali"    },
  { text: "वेदार्थ",       lang: "Maithili"  },
  { text: "వేదార్థం",      lang: "Konkani"   },
  { text: "ವೇದಾರ್ಥ",      lang: "Tulu"      },
];

function MultiLangTitle() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % INDIAN_TRANSLATIONS.length);
        setFade(true);
      }, 300);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const current = INDIAN_TRANSLATIONS[idx];

  return (
    <div style={{ textAlign: "center", marginBottom: 8 }}>

      {/* Calligraphy SVG */}
      <svg viewBox="0 0 860 140" width="min(860px,92vw)" height="auto" style={{ display: "block", margin: "0 auto 2px", overflow: "visible" }}>
        <defs>
          <linearGradient id="gld" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f97316" />
            <stop offset="25%"  stopColor="#e879f9" />
            <stop offset="55%"  stopColor="#38bdf8" />
            <stop offset="80%"  stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0" />
            <stop offset="20%"  stopColor="#e879f9" stopOpacity="0.8" />
            <stop offset="50%"  stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="80%"  stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
            .vt-main {
              font-family: 'Dancing Script', cursive;
              font-size: 112px; font-weight: 700;
              fill: url(#gld); filter: url(#softglow); letter-spacing: 8px;
              animation: vtFadeUp 1s ease 0.1s both;
            }
            @keyframes vtFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
            @keyframes drawLine { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
            @keyframes dotPop   { from { opacity:0; r:0; } to { opacity:1; r:2.5; } }
          `}</style>
        </defs>

        <text x="50%" y="108" textAnchor="middle" className="vt-main">VEDARTHA</text>

        {/* Animated double underline */}
        <line x1="30"  y1="124" x2="830" y2="124"
          stroke="url(#strokeGrad)" strokeWidth="0.8"
          strokeDasharray="900" strokeDashoffset="900"
          style={{ animation: "drawLine 2s ease 0.8s forwards" }} />
        <line x1="80"  y1="128" x2="780" y2="128"
          stroke="url(#strokeGrad)" strokeWidth="0.4"
          strokeDasharray="800" strokeDashoffset="800"
          style={{ animation: "drawLine 2s ease 1.1s forwards", opacity: 0.4 }} />

        {/* Serif extenders */}
        <line x1="10"  y1="108" x2="90"  y2="108" stroke="#f97316" strokeWidth="0.6"
          strokeDasharray="90" strokeDashoffset="90"
          style={{ animation: "drawLine 0.8s ease 1.6s forwards", opacity: 0.35 }} />
        <line x1="770" y1="108" x2="850" y2="108" stroke="#34d399" strokeWidth="0.6"
          strokeDasharray="90" strokeDashoffset="90"
          style={{ animation: "drawLine 0.8s ease 1.6s forwards", opacity: 0.35 }} />

        {/* End dots */}
        <circle cx="30"  cy="124" r="0" fill="#f97316" style={{ animation: "dotPop 0.4s ease 2.7s forwards" }} />
        <circle cx="830" cy="124" r="0" fill="#38bdf8" style={{ animation: "dotPop 0.4s ease 2.7s forwards" }} />

        {/* Center diamond */}
        <polygon points="430,118 434,124 430,130 426,124" fill="#e879f9" opacity="0"
          style={{ animation: "vtFadeUp 0.5s ease 2.9s both", opacity: 0.6 }} />
      </svg>

      {/* Ornament divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px auto 14px", width: "min(320px,70vw)" }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.5))" }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(56,189,248,0.6)" }} />
          <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "rgba(232,121,249,0.75)", borderRadius: 1 }} />
          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(52,211,153,0.6)" }} />
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.5),transparent)" }} />
      </div>

      {/* Rotating lingual name */}
      <div style={{
        fontSize: "clamp(22px,4vw,42px)", fontWeight: 700, lineHeight: 1.2,
        background: "linear-gradient(135deg,#f97316,#e879f9,#38bdf8,#34d399)",
        backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
        backgroundSize: "200% auto", animation: "shimmer 4s linear infinite",
        opacity: fade ? 1 : 0, transition: "opacity 0.3s ease",
        minHeight: "1.4em", fontFamily: "'Noto Sans',sans-serif",
      }}>
        {current.text}
      </div>

      {/* Language label */}
      <div style={{
        fontSize: 9, color: "rgba(232,121,249,0.55)", letterSpacing: ".25em",
        fontFamily: "'Nunito',sans-serif", fontWeight: 700, marginTop: 8,
        opacity: fade ? 0.9 : 0, transition: "opacity 0.3s ease", minHeight: "1.2em",
      }}>
        {current.lang.toUpperCase()}
      </div>
    </div>
  );
}

const TICKER_DATA = [
  { symbol: "NIFTY 50",    value: "23,847.65", change: "+1.24%", up: true  },
  { symbol: "SENSEX",      value: "78,553.20", change: "+1.18%", up: true  },
  { symbol: "NIFTY BANK",  value: "51,203.40", change: "-0.32%", up: false },
  { symbol: "NIFTY IT",    value: "38,921.75", change: "+2.15%", up: true  },
  { symbol: "NIFTY MIDCAP",value: "44,610.30", change: "+0.87%", up: true  },
  { symbol: "NIFTY PHARMA",value: "20,134.55", change: "-0.45%", up: false },
  { symbol: "GOLD",        value: "₹71,450",   change: "+0.63%", up: true  },
  { symbol: "USD/INR",     value: "83.42",     change: "-0.12%", up: false },
  { symbol: "CRUDE OIL",   value: "$78.34",    change: "+1.05%", up: true  },
];

const FEATURES = [
  { icon: "📈", title: "OHLCV Charts",      desc: "Deep dive into Open, High, Low, Close & Volume for top NSE stocks across multiple timeframes.", accent: "#f97316" },
  { icon: "📊", title: "Index History",     desc: "Track Nifty 50 and Sensex trends side by side with normalised comparison charts.", accent: "#38bdf8" },
  { icon: "🏭", title: "Sector Performance",desc: "Compare IT, Banking, Auto, Pharma and 5 more — monthly trends and cumulative leaderboards.", accent: "#34d399" },
  { icon: "💰", title: "FII / DII Flows",   desc: "Follow institutional money — monthly buy/sell activity with bias indicators.", accent: "#e879f9" },
  { icon: "📋", title: "NSE All Listings",  desc: "Complete NSE equity listings — 1,800+ stocks with search, sector filter, and sort.", accent: "#fbbf24" },
  { icon: "🔍", title: "Smart Search",      desc: "Instantly find any stock by symbol, company name, or ISIN across the entire NSE universe.", accent: "#fb7185" },
];

function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const STAR_COLORS = ["rgba(249,115,22,", "rgba(56,189,248,", "rgba(232,121,249,", "rgba(52,211,153,", "rgba(251,191,36,"];
    const stars = Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      colorIdx: i % STAR_COLORS.length,
    }));
    const lines = Array.from({ length: 6 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      len: Math.random() * 180 + 60,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.12 + 0.04,
      angle: Math.random() * Math.PI * 2,
    }));
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;
      lines.forEach(l => {
        l.x += Math.cos(l.angle) * l.speed;
        l.y += Math.sin(l.angle) * l.speed;
        if (l.x < -200 || l.x > W + 200 || l.y < -200 || l.y > H + 200) { l.x = Math.random() * W; l.y = Math.random() * H; }
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.angle);
        const g = ctx.createLinearGradient(0, 0, l.len, 0);
        g.addColorStop(0, `rgba(56,189,248,0)`);
        g.addColorStop(0.5, `rgba(232,121,249,${l.opacity})`);
        g.addColorStop(1, `rgba(249,115,22,0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(l.len, 0); ctx.stroke();
        ctx.restore();
      });
      stars.forEach(s => {
        s.y += s.speed; s.pulse += 0.02;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        const op = s.opacity * (0.7 + 0.3 * Math.sin(s.pulse));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = STAR_COLORS[s.colorIdx] + op + ")"; ctx.fill();
      });
      ctx.strokeStyle = "rgba(56,189,248,0.022)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

function Ticker() {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div style={{ background: "rgba(6,5,15,0.88)", borderTop: "1px solid rgba(249,115,22,0.2)", borderBottom: "1px solid rgba(56,189,248,0.2)", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0" }}>
      <div style={{ display: "inline-flex", gap: 0, animation: "ticker 40s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: ".14em", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>{item.symbol}</span>
            <span style={{ fontSize: 11, color: "#f0eeff", fontFamily: "'Courier Prime',monospace", fontWeight: 700 }}>{item.value}</span>
            <span style={{ fontSize: 10, color: item.up ? "#34d399" : "#fb7185", fontFamily: "'Courier Prime',monospace", fontWeight: 700 }}>{item.up ? "▲" : "▼"} {item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnter }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#06050f", color: "#f0eeff", fontFamily: "'Nunito',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Nunito:wght@400;500;600;700;800&family=Courier+Prime:wght@400;700&family=Noto+Sans:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;min-height:100vh}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#06050f}
        ::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.35);border-radius:2px}
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.45),0 0 60px rgba(232,121,249,0.12)} 50%{box-shadow:0 0 40px rgba(56,189,248,0.55),0 0 100px rgba(249,115,22,0.18)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .enter-btn {
          background: linear-gradient(135deg,#f97316,#e879f9,#38bdf8,#f97316);
          background-size: 200% auto;
          border: none; border-radius: 50px;
          padding: 16px 48px;
          font-family: 'Outfit',sans-serif; font-size: 14px; font-weight: 700;
          color: #fff; letter-spacing: .12em;
          cursor: pointer; transition: all 0.3s;
          animation: glow 3s infinite, shimmer 3s linear infinite;
          position: relative; overflow: hidden;
        }
        .enter-btn:hover { transform: scale(1.05); letter-spacing: .18em; }
        .enter-btn::after { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:linear-gradient(transparent,rgba(255,255,255,0.12),transparent); transform:rotate(45deg); transition:0.5s; }
        .enter-btn:hover::after { left:100%; }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px 24px;
          transition: all 0.3s; cursor: default;
          position: relative; overflow: hidden;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-4px);
        }
        .feature-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg,transparent,var(--accent),transparent);
          opacity:0; transition:opacity 0.3s;
        }
        .feature-card:hover::before { opacity:1; }
        .nav-link { color:rgba(240,238,255,0.45); font-size:11px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:color 0.2s; background:none; border:none; font-family:'Nunito',sans-serif; }
        .nav-link:hover { color:#e879f9; }
        .stat-num { font-family:'Courier Prime',monospace; font-size:28px; font-weight:700; line-height:1; }
      `}</style>

      <StarField />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg,rgba(6,5,15,0.95),rgba(6,5,15,0))", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#f97316,#e879f9)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 16px rgba(249,115,22,0.4)" }}>वे</div>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, color: "#f0eeff", letterSpacing: ".08em" }}>VEDARTHA<span style={{ color: "#f97316" }}>.IN</span></div>
            <div style={{ fontSize: 7, color: "rgba(232,121,249,0.5)", letterSpacing: ".2em", fontFamily: "'Nunito',sans-serif" }}>KNOWLEDGE OF WEALTH</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Markets", "About"].map(l => <button key={l} className="nav-link">{l}</button>)}
          <button className="enter-btn" style={{ padding: "8px 24px", fontSize: 11, animation: "none" }} onClick={onEnter}>ENTER DASHBOARD</button>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, paddingTop: 64 }}>
        <Ticker />
      </div>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Decorative rings */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.07)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateSlow 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(56,189,248,0.09)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateSlow 40s linear infinite reverse", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 30, marginBottom: 32, animation: "fadeUp 0.6s ease 0.2s both" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 9, color: "#f97316", letterSpacing: ".2em", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>NSE · BSE · LIVE MARKET DATA</span>
        </div>

        {/* Calligraphy + linguals */}
        <div style={{ animation: "fadeUp 0.7s ease 0.3s both", marginBottom: 20 }}>
          <MultiLangTitle />
        </div>

        {/* Hero headline */}
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(32px,5vw,62px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20, color: "#f0eeff", animation: "fadeUp 0.7s ease 0.4s both" }}>
          India's Markets,{" "}
          <span style={{ background: "linear-gradient(135deg,#f97316,#e879f9,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Simplified.
          </span>
        </h1>

        {/* Tagline */}
        <p style={{ fontSize: "clamp(13px,2vw,17px)", color: "rgba(240,238,255,0.5)", maxWidth: 500, lineHeight: 1.75, marginBottom: 48, fontFamily: "'Nunito',sans-serif", fontWeight: 500, animation: "fadeUp 0.7s ease 0.5s both" }}>
          The ancient pursuit of <em style={{ color: "#38bdf8", fontStyle: "normal" }}>Artha</em> — wealth and meaning — meets modern market intelligence. Your complete window into Indian equities.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.7s ease 0.6s both" }}>
          <button className="enter-btn" onClick={onEnter}>ENTER DASHBOARD &nbsp;→</button>
          <button style={{ background: "transparent", border: "1px solid rgba(240,238,255,0.15)", borderRadius: 50, padding: "16px 36px", color: "rgba(240,238,255,0.55)", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", cursor: "pointer", transition: "all 0.3s" }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(232,121,249,0.5)"; e.target.style.color = "#e879f9"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(240,238,255,0.15)"; e.target.style.color = "rgba(240,238,255,0.55)"; }}>
            LEARN MORE ↓
          </button>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", animation: "float 2.5s ease-in-out infinite", opacity: 0.3 }}>
          <div style={{ width: 1, height: 48, background: "linear-gradient(180deg,transparent,#e879f9)", margin: "0 auto 4px" }} />
          <div style={{ fontSize: 8, color: "#e879f9", letterSpacing: ".2em", fontFamily: "'Nunito',sans-serif" }}>SCROLL</div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(249,115,22,0.12)", borderBottom: "1px solid rgba(56,189,248,0.12)", background: "rgba(6,5,15,0.7)", backdropFilter: "blur(10px)", padding: "32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, textAlign: "center" }}>
          {[
            ["1,800+", "NSE Listed Stocks", "#f97316"],
            ["5",      "Year Historical Data", "#38bdf8"],
            ["8",      "Sector Trackers", "#e879f9"],
            ["100%",   "Free to Use", "#34d399"],
            ["Live",   "Market Ticker", "#fbbf24"],
          ].map(([num, label, color], i) => (
            <div key={i} style={{ animation: `fadeUp 0.6s ease ${0.1 * i}s both` }}>
              <div className="stat-num" style={{ color }}>{num}</div>
              <div style={{ fontSize: 10, color: "rgba(240,238,255,0.35)", letterSpacing: ".14em", marginTop: 6, fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 9, color: "#f97316", letterSpacing: ".25em", fontFamily: "'Nunito',sans-serif", fontWeight: 700, marginBottom: 14 }}>WHAT'S INSIDE</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 700, color: "#f0eeff", lineHeight: 1.2 }}>
            Everything you need to<br />
            <span style={{ background: "linear-gradient(135deg,#f97316,#e879f9,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>read the market</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ "--accent": f.accent, animation: `fadeUp 0.6s ease ${0.1 * i}s both` }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ fontSize: 28, marginBottom: 14, display: "inline-block", animation: hoveredFeature === i ? "float 1.5s ease-in-out infinite" : "none" }}>{f.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: f.accent, letterSpacing: ".12em", marginBottom: 8, fontFamily: "'Nunito',sans-serif" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(240,238,255,0.5)", lineHeight: 1.65, fontFamily: "'Nunito',sans-serif" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#f97316,#e879f9)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", fontWeight: 900, fontFamily: "'Outfit',sans-serif", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(249,115,22,0.4)", animation: "glow 3s infinite" }}>वे</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(22px,4vw,38px)", fontWeight: 700, color: "#f0eeff", marginBottom: 16, lineHeight: 1.3 }}>
            Begin your journey into<br />
            <span style={{ background: "linear-gradient(135deg,#38bdf8,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Indian market wisdom</span>
          </h2>
          <p style={{ fontSize: 13, color: "rgba(240,238,255,0.4)", marginBottom: 36, lineHeight: 1.7, fontFamily: "'Nunito',sans-serif" }}>
            From ancient philosophy to modern analytics — Vedartha brings you the knowledge of wealth, free and open.
          </p>
          <button className="enter-btn" onClick={onEnter} style={{ fontSize: 13, padding: "18px 56px" }}>
            OPEN VEDARTHA DASHBOARD
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(249,115,22,0.1)", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "rgba(6,5,15,0.7)" }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(240,238,255,0.22)", letterSpacing: ".08em" }}>VEDARTHA<span style={{ color: "rgba(249,115,22,0.38)" }}>.IN</span></div>
        <div style={{ fontSize: 10, color: "rgba(240,238,255,0.18)", fontFamily: "'Nunito',sans-serif" }}>Simulated data for demonstration · Not financial advice</div>
        <div style={{ fontSize: 9, color: "rgba(232,121,249,0.28)", fontFamily: "'Courier Prime',monospace", letterSpacing: ".1em" }}>वेदार्थ · KNOWLEDGE OF WEALTH</div>
      </footer>
    </div>
  );
}
