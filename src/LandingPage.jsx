import { useState, useEffect, useRef } from "react";

// Vedartha in all Indian languages — English stays static on top
const INDIAN_TRANSLATIONS = [
  { text: "वेदार्थ",         lang: "Hindi"      },
  { text: "வேதார்த்தம்",    lang: "Tamil"      },
  { text: "వేదార్థం",       lang: "Telugu"     },
  { text: "ವೇದಾರ್ಥ",       lang: "Kannada"    },
  { text: "വേദാർത്ഥം",     lang: "Malayalam"  },
  { text: "বেদার্থ",        lang: "Bengali"    },
  { text: "વેદાર્થ",        lang: "Gujarati"   },
  { text: "ਵੇਦਾਰਥ",        lang: "Punjabi"    },
  { text: "वेदार्थ",        lang: "Marathi"    },
  { text: "वेदार्थः",       lang: "Sanskrit"   },
  { text: "ଭେଦାର୍ଥ",       lang: "Odia"       },
  { text: "বেদাৰ্থ",        lang: "Assamese"   },
  { text: "وید ارتھ",       lang: "Urdu"       },
  { text: "वेदार्थ",        lang: "Nepali"     },
  { text: "वेदार्थ",        lang: "Maithili"   },
  { text: "वेदार्थ",        lang: "Dogri"      },
  { text: "वेदार्थ",        lang: "Kashmiri"   },
  { text: "वेदार्थ",        lang: "Sindhi"     },
  { text: "वेदार्थ",        lang: "Bodo"       },
  { text: "ৱেদাৰ্থ",       lang: "Meitei"     },
  { text: "वेदार्थ",        lang: "Santali"    },
  { text: "వేదార్థం",       lang: "Konkani"    },
  { text: "ವೇದಾರ್ಥ",       lang: "Tulu"       },
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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = INDIAN_TRANSLATIONS[idx];

  return (
    <div style={{ textAlign: "center", marginBottom: 8 }}>



      {/* Decorative line before language — with side ornaments */}
      <div style={{ display:"flex", alignItems:"center", gap:10, margin:"6px auto 14px", width:"min(320px,70vw)" }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,111,0,0.45))" }}/>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <div style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,111,0,0.5)" }}/>
          <div style={{ width:5, height:5, transform:"rotate(45deg)", background:"rgba(255,111,0,0.65)", borderRadius:1 }}/>
          <div style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,111,0,0.5)" }}/>
        </div>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,111,0,0.45),transparent)" }}/>
      </div>

      {/* ROTATING Indian language name — simple fade only, no scale */}
      <div style={{
        fontSize: "clamp(22px,4vw,42px)",
        fontWeight: 700,
        lineHeight: 1.2,
        background: "linear-gradient(135deg,#ff6f00,#ffd54f,#ff6f00)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        backgroundSize: "200% auto",
        animation: "shimmer 4s linear infinite",
        opacity: fade ? 1 : 0,
        transition: "opacity 0.3s ease",
        minHeight: "1.4em",
        fontFamily: "'Noto Sans',sans-serif",
      }}>
        {current.text}
      </div>

      {/* Language name label */}
      <div style={{
        fontSize: 9,
        color: "rgba(255,111,0,0.45)",
        letterSpacing: ".25em",
        fontFamily: "'Nunito',sans-serif",
        fontWeight: 700,
        marginTop: 8,
        opacity: fade ? 0.9 : 0,
        transition: "opacity 0.3s ease",
        minHeight: "1.2em",
      }}>
        {current.lang.toUpperCase()}
      </div>
    </div>
  );
}

// Simulated ticker data
const TICKER_DATA = [
  { symbol: "NIFTY 50", value: "23,847.65", change: "+1.24%", up: true },
  { symbol: "SENSEX", value: "78,553.20", change: "+1.18%", up: true },
  { symbol: "NIFTY BANK", value: "51,203.40", change: "-0.32%", up: false },
  { symbol: "NIFTY IT", value: "38,921.75", change: "+2.15%", up: true },
  { symbol: "NIFTY MIDCAP", value: "44,610.30", change: "+0.87%", up: true },
  { symbol: "NIFTY PHARMA", value: "20,134.55", change: "-0.45%", up: false },
  { symbol: "GOLD", value: "₹71,450", change: "+0.63%", up: true },
  { symbol: "USD/INR", value: "83.42", change: "-0.12%", up: false },
  { symbol: "CRUDE OIL", value: "$78.34", change: "+1.05%", up: true },
  { symbol: "RELIANCE", value: "₹2,934.50", change: "+1.78%", up: true },
  { symbol: "TCS", value: "₹3,812.25", change: "+0.94%", up: true },
  { symbol: "HDFCBANK", value: "₹1,678.90", change: "-0.22%", up: false },
  { symbol: "INFY", value: "₹1,543.60", change: "+2.31%", up: true },
  { symbol: "WIPRO", value: "₹512.45", change: "+1.67%", up: true },
];

const FEATURES = [
  {
    icon: "📈",
    title: "OHLCV Charts",
    desc: "Deep dive into Open, High, Low, Close & Volume history for top NSE stocks across multiple timeframes.",
    accent: "#ff6f00",
  },
  {
    icon: "📊",
    title: "Index History",
    desc: "Track Nifty 50 and Sensex trends side by side with normalised comparison charts.",
    accent: "#00b0ff",
  },
  {
    icon: "🏭",
    title: "Sector Performance",
    desc: "Compare IT, Banking, Auto, Pharma and 5 more sectors — monthly trends and cumulative leaderboards.",
    accent: "#ff6f00",
  },
  {
    icon: "💰",
    title: "FII / DII Flows",
    desc: "Follow foreign and domestic institutional money — monthly buy/sell activity with bias indicators.",
    accent: "#7c4dff",
  },
  {
    icon: "📋",
    title: "NSE All Listings",
    desc: "Complete NSE equity listings — 1800+ stocks with search, sector filter, sort and pagination.",
    accent: "#ffd740",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Instantly find any stock by symbol, company name or ISIN across the entire NSE universe.",
    accent: "#ff1744",
  },
];

// Animated canvas background
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const lines = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: Math.random() * 180 + 60,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.15 + 0.05,
      angle: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      // Draw glowing lines (market chart aesthetic)
      lines.forEach((l) => {
        l.x += Math.cos(l.angle) * l.speed;
        l.y += Math.sin(l.angle) * l.speed;
        if (l.x < -200 || l.x > W + 200 || l.y < -200 || l.y > H + 200) {
          l.x = Math.random() * W;
          l.y = Math.random() * H;
        }
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        const grad = ctx.createLinearGradient(0, 0, l.len, 0);
        grad.addColorStop(0, `rgba(255,111,0,0)`);
        grad.addColorStop(0.5, `rgba(255,111,0,${l.opacity})`);
        grad.addColorStop(1, `rgba(255,111,0,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(l.len, 0);
        ctx.stroke();
        ctx.restore();
      });

      // Draw stars
      stars.forEach((s) => {
        s.y += s.speed;
        s.pulse += 0.02;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        const op = s.opacity * (0.7 + 0.3 * Math.sin(s.pulse));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(105,240,174,${op})`;
        ctx.fill();
      });

      // Subtle grid lines (chart paper effect)
      ctx.strokeStyle = "rgba(255,111,0,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

// Infinite ticker
function Ticker() {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div style={{ background: "rgba(13,8,0,0.85)", borderTop: "1px solid rgba(255,111,0,0.2)", borderBottom: "1px solid rgba(255,111,0,0.2)", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0" }}>
      <div style={{ display: "inline-flex", gap: 0, animation: "ticker 40s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: ".14em", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>{item.symbol}</span>
            <span style={{ fontSize: 11, color: "#e8f5e9", fontFamily: "'Courier Prime',monospace", fontWeight: 700 }}>{item.value}</span>
            <span style={{ fontSize: 10, color: item.up ? "#00c853" : "#ff5252", fontFamily: "'Courier Prime',monospace", fontWeight: 700 }}>{item.up ? "▲" : "▼"} {item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#020d06", color: "#e8f5e9", fontFamily: "'Nunito',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Nunito:wght@400;500;600;700;800&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;min-height:100vh}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#020d06}::-webkit-scrollbar-thumb{background:#ff6f0055;border-radius:2px}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,111,0,0.4),0 0 60px rgba(255,111,0,0.1)}50%{box-shadow:0 0 40px rgba(255,111,0,0.7),0 0 100px rgba(255,111,0,0.2)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .enter-btn{
          background:linear-gradient(135deg,#ff6f00,#ffab00,#ff6f00);
          background-size:200% auto;
          border:none;border-radius:50px;
          padding:16px 48px;
          font-family:'Outfit',serif;font-size:14px;font-weight:700;
          color:#020d06;letter-spacing:.12em;
          cursor:pointer;
          transition:all 0.3s;
          animation:glow 3s infinite,shimmer 3s linear infinite;
          position:relative;overflow:hidden;
        }
        .enter-btn:hover{transform:scale(1.05);letter-spacing:.18em;}
        .enter-btn::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(transparent,rgba(255,255,255,0.1),transparent);transform:rotate(45deg);transition:0.5s;}
        .enter-btn:hover::after{left:100%;}
        .feature-card{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,111,0,0.12);
          border-radius:16px;padding:28px 24px;
          transition:all 0.3s;cursor:default;
          position:relative;overflow:hidden;
        }
        .feature-card:hover{
          background:rgba(255,111,0,0.06);
          border-color:rgba(255,111,0,0.35);
          transform:translateY(-4px);
        }
        .feature-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,var(--accent),transparent);
          opacity:0;transition:opacity 0.3s;
        }
        .feature-card:hover::before{opacity:1;}
        .nav-link{color:rgba(232,245,233,0.5);font-size:11px;font-weight:700;letter-spacing:.12em;cursor:pointer;transition:color 0.2s;background:none;border:none;font-family:'Nunito',sans-serif;}
        .nav-link:hover{color:#ffab00;}
        .stat-num{font-family:'Courier Prime',monospace;font-size:28px;font-weight:700;color:#ffab00;line-height:1;}
      `}</style>

      <StarField />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg,rgba(13,8,0,0.95),rgba(13,8,0,0))", backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ff6f00,#ffab00)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#020d06", fontWeight: 900, flexShrink: 0, boxShadow: "0 0 16px rgba(255,111,0,0.4)" }}>वे</div>
          <div>
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 20, fontWeight: 700, color: "#e8f5e9", letterSpacing: ".04em", lineHeight: 1 }}>Vedartha<span style={{ color: "#ff6f00" }}>.in</span></div>
            <div style={{ fontSize: 7, color: "rgba(255,111,0,0.45)", letterSpacing: ".18em", fontFamily: "'Nunito',sans-serif", marginTop: 1 }}>KNOWLEDGE OF WEALTH</div>
          </div>

        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Markets", "About"].map(l => <button key={l} className="nav-link">{l}</button>)}
          <button className="enter-btn" style={{ padding: "8px 24px", fontSize: 11, animation: "none", position: "relative", zIndex: 200 }} onClick={onEnter}>ENTER DASHBOARD</button>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, paddingTop: 64 }}>
        <Ticker />
      </div>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 80px", position: "relative", zIndex: 2 }}>

        {/* Decorative ring */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(255,111,0,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateSlow 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,111,0,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateSlow 40s linear infinite reverse", pointerEvents: "none" }} />

        {/* Multilanguage cycling headline — above badge */}
        <div style={{ animation: "fadeUp 0.6s ease 0.2s both", marginBottom: 20 }}>
          <MultiLangTitle />
        </div>

        {/* Search box — below lingual */}
        <div style={{ position: "relative", marginBottom: 24, animation: "fadeUp 0.6s ease 0.35s both", zIndex: 10 }}>
          <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "rgba(255,111,0,0.5)", pointerEvents: "none" }}>⌕</span>
          <input
            placeholder="Search stocks, NIFTY, SENSEX..."
            style={{ background: "rgba(255,111,0,0.07)", border: "1px solid rgba(255,111,0,0.25)", borderRadius: 40, padding: "14px 24px 14px 46px", color: "#e8f5e9", fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: "none", width: "clamp(260px,38vw,480px)", transition: "all 0.25s", backdropFilter: "blur(8px)" }}
            onFocus={e => { e.target.style.borderColor = "rgba(255,111,0,0.7)"; e.target.style.background = "rgba(255,111,0,0.12)"; e.target.style.boxShadow = "0 0 24px rgba(255,111,0,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,111,0,0.25)"; e.target.style.background = "rgba(255,111,0,0.07)"; e.target.style.boxShadow = "none"; }}
            onKeyDown={e => { if(e.key === "Enter") onEnter(); }}
          />
        </div>

        {/* Badge — below search */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "rgba(255,111,0,0.1)", border: "1px solid rgba(255,111,0,0.3)", borderRadius: 30, marginBottom: 28, animation: `fadeUp 0.6s ease 0.4s both` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6f00", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 9, color: "#ff6f00", letterSpacing: ".2em", fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>NSE · BSE · LIVE MARKET DATA</span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: "clamp(13px,2vw,17px)", color: "rgba(232,245,233,0.55)", maxWidth: 520, lineHeight: 1.7, marginBottom: 48, fontFamily: "'Nunito',sans-serif", fontWeight: 500, animation: `fadeUp 0.7s ease 0.5s both` }}>
          The ancient pursuit of <em style={{ color: "#ff6f00", fontStyle: "normal" }}>Artha</em> — wealth and meaning — meets the precision of modern market intelligence. Your complete window into Indian equities.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center", animation: `fadeUp 0.7s ease 0.6s both`, position: "relative", zIndex: 10 }}>
          <button className="enter-btn" onClick={onEnter}>
            ENTER DASHBOARD &nbsp;→
          </button>
          <button style={{ background: "transparent", border: "1px solid rgba(232,245,233,0.15)", borderRadius: 50, padding: "16px 36px", color: "rgba(232,245,233,0.6)", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", cursor: "pointer", transition: "all 0.3s" }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(255,111,0,0.5)"; e.target.style.color = "#ffab00"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(232,245,233,0.15)"; e.target.style.color = "rgba(232,245,233,0.6)"; }}>
            LEARN MORE ↓
          </button>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", animation: "float 2.5s ease-in-out infinite", opacity: 0.3 }}>
          <div style={{ width: 1, height: 48, background: "linear-gradient(180deg,transparent,#ff6f00)", margin: "0 auto 4px" }} />
          <div style={{ fontSize: 8, color: "#ff6f00", letterSpacing: ".2em", fontFamily: "'Nunito',sans-serif" }}>SCROLL</div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,111,0,0.1)", borderBottom: "1px solid rgba(255,111,0,0.1)", background: "rgba(13,8,0,0.7)", backdropFilter: "blur(10px)", padding: "32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, textAlign: "center" }}>
          {[
            ["1,800+", "NSE Listed Stocks"],
            ["5", "Year Historical Data"],
            ["8", "Sector Trackers"],
            ["100%", "Free to Use"],
            ["Live", "Market Ticker"],
          ].map(([num, label], i) => (
            <div key={i} style={{ animation: `fadeUp 0.6s ease ${0.1 * i}s both` }}>
              <div className="stat-num">{num}</div>
              <div style={{ fontSize: 10, color: "rgba(232,245,233,0.4)", letterSpacing: ".14em", marginTop: 6, fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 9, color: "#ff6f00", letterSpacing: ".25em", fontFamily: "'Nunito',sans-serif", fontWeight: 700, marginBottom: 14 }}>WHAT'S INSIDE</div>
          <h2 style={{ fontFamily: "'Outfit',serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 700, color: "#e8f5e9", lineHeight: 1.2 }}>
            Everything you need to<br />
            <span style={{ color: "#ff6f00" }}>read the market</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ "--accent": f.accent, animation: `fadeUp 0.6s ease ${0.1 * i}s both` }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ fontSize: 28, marginBottom: 14, animation: hoveredFeature === i ? "float 1.5s ease-in-out infinite" : "none" }}>{f.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: f.accent, letterSpacing: ".12em", marginBottom: 8, fontFamily: "'Nunito',sans-serif" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(232,245,233,0.55)", lineHeight: 1.65, fontFamily: "'Nunito',sans-serif" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#ff6f00,#ffab00)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#020d06", fontWeight: 900, fontFamily: "'Outfit',serif", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(255,111,0,0.35)", animation: "glow 3s infinite" }}>वे</div>
          <h2 style={{ fontFamily: "'Outfit',serif", fontSize: "clamp(22px,4vw,38px)", fontWeight: 700, color: "#e8f5e9", marginBottom: 16, lineHeight: 1.3 }}>
            Begin your journey into<br /><span style={{ color: "#ff6f00" }}>Indian market wisdom</span>
          </h2>
          <p style={{ fontSize: 13, color: "rgba(232,245,233,0.45)", marginBottom: 36, lineHeight: 1.7, fontFamily: "'Nunito',sans-serif" }}>
            From ancient philosophy to modern analytics — Vedartha brings you the knowledge of wealth, free and open.
          </p>
          <button className="enter-btn" onClick={onEnter} style={{ fontSize: 13, padding: "18px 56px" }}>
            OPEN DASHBOARD
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,111,0,0.1)", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "rgba(13,8,0,0.7)" }}>
        <div style={{ fontFamily: "'Outfit',serif", fontSize: 12, fontWeight: 700, color: "rgba(232,245,233,0.25)", letterSpacing: ".08em" }}>vedartha<span style={{ color: "rgba(255,111,0,0.3)" }}>.IN</span></div>
        <div style={{ fontSize: 10, color: "rgba(232,245,233,0.2)", fontFamily: "'Nunito',sans-serif" }}>Simulated data for demonstration · Not financial advice</div>
        <div style={{ fontSize: 9, color: "rgba(255,111,0,0.3)", fontFamily: "'Courier Prime',monospace", letterSpacing: ".1em" }}>वेदार्थ · KNOWLEDGE OF WEALTH</div>
      </footer>
    </div>
  );
}