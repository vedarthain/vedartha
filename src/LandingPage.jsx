import { useState, useMemo } from "react";
import LandingPage from "./LandingPage.jsx";
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, BarChart, LineChart,
  Legend, Cell, ReferenceLine
} from "recharts";
import { NSE_ALL_STOCKS } from "./nseStocks.js";

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function seed(s) { let x = Math.sin(s) * 10000; return x - Math.floor(x); }

function genOHLCV(basePrice, months, vol = 0.03) {
  const data = []; let close = basePrice;
  const L = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 0; i < months; i++) {
    const yr = 2020 + Math.floor(i / 12), mo = i % 12;
    const r1=seed(i*7+1),r2=seed(i*7+2),r3=seed(i*7+3),r4=seed(i*7+4);
    const open=close; close=open*(1+(r1-0.47)*vol);
    const high=Math.max(open,close)*(1+r2*vol*0.5), low=Math.min(open,close)*(1-r3*vol*0.5);
    data.push({date:`${L[mo]} ${yr}`,open:+open.toFixed(2),high:+high.toFixed(2),low:+low.toFixed(2),close:+close.toFixed(2),volume:Math.round((r4*8000+2000)*10)});
  }
  return data;
}

function genIndex(base, months) {
  const data = []; let val = base;
  const L = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 0; i < months; i++) {
    val = val*(1+(seed(i*13+5)-0.46)*0.04+0.0008);
    data.push({date:`${L[i%12]} ${2020+Math.floor(i/12)}`,nifty:+val.toFixed(2),sensex:+(val*3.33).toFixed(2)});
  }
  return data;
}

const SECTORS = ["IT","Banking","Auto","Pharma","Energy","FMCG","Metal","Realty"];
const SECTOR_COLORS = ["#f97316","#f59e0b","#fb923c","#ea580c","#d97706","#fbbf24","#94a3b8","#ef4444"];

function genSectorPerf(months) {
  return Array.from({length:months},(_,i)=>{
    const row={date:`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i%12]} ${2020+Math.floor(i/12)}`};
    SECTORS.forEach((s,si)=>{row[s]=+((seed(i*17+si*3+1)-0.45)*12).toFixed(2);});
    return row;
  });
}

function genFIIDII(months) {
  const L=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Array.from({length:months},(_,i)=>{
    const fii=+((seed(i*11+3)-0.48)*25000).toFixed(0), dii=+((seed(i*11+7)-0.44)*18000).toFixed(0);
    return {date:`${L[i%12]} ${2020+Math.floor(i/12)}`,fii,dii,net:fii+dii};
  });
}

const STOCKS = {"RELIANCE":{base:1900,vol:0.035},"TCS":{base:2800,vol:0.028},"HDFCBANK":{base:1200,vol:0.032},"INFY":{base:1100,vol:0.03},"WIPRO":{base:380,vol:0.038}};
const RANGES = [{label:"1M",months:1},{label:"3M",months:3},{label:"6M",months:6},{label:"1Y",months:12},{label:"3Y",months:36},{label:"5Y",months:60}];


// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- loaded from nseStocks.js (run convertStocks.cjs first) ---------------
function genStockPrice(idx) {
  const base=100+seed(idx*31+7)*4900, change=(seed(idx*19+3)-0.47)*8;
  return {price:+base.toFixed(2),change:+change.toFixed(2),volume:Math.round((seed(idx*13+5)*5000000)+100000),mktCap:+(base*(seed(idx*7+2)*5000+500)).toFixed(0)};
}
const NSE_STOCKS_WITH_PRICES = NSE_ALL_STOCKS.map(function(s,i){ return Object.assign({},s,genStockPrice(i)); });
const ALL_SECTORS_NSE = ["All"].concat(Array.from(new Set(NSE_ALL_STOCKS.map(function(s){ return s.sector; }))).sort());

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const TT = {background:"#fff",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:"10px 14px",fontFamily:"'Outfit',sans-serif",fontSize:11,boxShadow:"0 8px 24px rgba(0,0,0,0.08)"};

const OHLCTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  const d=payload[0]?.payload; if(!d) return null;
  return <div style={TT}><div style={{color:"#f97316",marginBottom:6,fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{label}</div>
    {[["O",d.open,"#f97316"],["H",d.high,"#16a34a"],["L",d.low,"#ef4444"],["C",d.close,d.close>=d.open?"#16a34a":"#ef4444"]].map(([k,v,c])=>(
      <div key={k} style={{color:c,marginBottom:2,fontFamily:"'Courier Prime',monospace"}}>{k}: ₹{v?.toLocaleString("en-IN")}</div>))}
    <div style={{color:"#f97316",marginTop:4,fontFamily:"'Nunito',sans-serif"}}>Vol: {d.volume?.toLocaleString("en-IN")}</div>
  </div>;
};
const IndexTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return <div style={TT}><div style={{color:"#f97316",marginBottom:6,fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.color,marginBottom:2,fontFamily:"'Courier Prime',monospace"}}>{p.name.toUpperCase()}: {p.value?.toLocaleString("en-IN")}</div>)}</div>;
};
const FIITooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return <div style={TT}><div style={{color:"#f97316",marginBottom:6,fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.dataKey==="fii"?"#f97316":p.dataKey==="dii"?"#f59e0b":"#fb923c",marginBottom:2,fontFamily:"'Courier Prime',monospace"}}>
      {p.name.toUpperCase()}: ₹{Math.abs(p.value).toLocaleString("en-IN")} Cr {p.value<0?"(Sell)":"(Buy)"}</div>)}</div>;
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const StatCard = ({label,value,sub,accent="#f97316",delay=0}) => (
  <div style={{background:"#fff",borderRadius:16,padding:"18px 20px",border:"1px solid #fed7aa",boxShadow:"0 2px 16px rgba(249,115,22,0.07)",animation:`fadeUp 0.5s ease ${delay}s both`,transition:"transform 0.2s,box-shadow 0.2s",position:"relative",overflow:"hidden"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(249,115,22,0.15)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 16px rgba(249,115,22,0.07)";}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${accent}44,${accent})`}}/>
    <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${accent}08`}}/>
    <div style={{fontSize:9,color:"#92400e",letterSpacing:".14em",marginBottom:8,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color:"#1c1917",fontFamily:"'Outfit',sans-serif",letterSpacing:"-0.01em",lineHeight:1.2}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:"#f97316",marginTop:5,fontFamily:"'Nunito',sans-serif"}}>{sub}</div>}
  </div>
);

const SectionHeader = ({title,sub}) => (
  <div style={{marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:3,height:18,background:"linear-gradient(180deg,#f97316,#fbbf24)",borderRadius:2}}/>
      <span style={{fontSize:11,fontWeight:700,color:"#92400e",letterSpacing:".12em",fontFamily:"'Nunito',sans-serif"}}>{title}</span>
    </div>
    {sub&&<div style={{fontSize:10,color:"#f97316",marginTop:3,marginLeft:13,fontFamily:"'Nunito',sans-serif"}}>{sub}</div>}
  </div>
);

const Card = ({children,style={}}) => (
  <div style={{background:"#fff",borderRadius:18,padding:"22px 24px",border:"1px solid #fed7aa",boxShadow:"0 2px 16px rgba(249,115,22,0.05)",...style}}>{children}</div>
);

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function NSEListingsTab() {
  const [search,setSearch]=useState(""), [sectorFilter,setSectorFilter]=useState("All");
  const [sortKey,setSortKey]=useState("symbol"), [sortDir,setSortDir]=useState(1);
  const [page,setPage]=useState(0), [hovered,setHovered]=useState(null);
  const PS=25;

  const filtered=useMemo(()=>{
    let d=NSE_STOCKS_WITH_PRICES;
    if(sectorFilter!=="All") d=d.filter(s=>s.sector===sectorFilter);
    if(search.trim()){const q=search.trim().toUpperCase();d=d.filter(s=>s.symbol.includes(q)||s.name.toUpperCase().includes(q)||s.isin.includes(q));}
    return [...d].sort((a,b)=>{let va=a[sortKey],vb=b[sortKey];return typeof va==="string"?sortDir*va.localeCompare(vb):sortDir*(va-vb);});
  },[search,sectorFilter,sortKey,sortDir]);

  const tp=Math.ceil(filtered.length/PS), pd=filtered.slice(page*PS,(page+1)*PS);
  const ts=k=>{if(sortKey===k)setSortDir(d=>d*-1);else{setSortKey(k);setSortDir(1);}setPage(0);};
  const gainers=NSE_STOCKS_WITH_PRICES.filter(s=>s.change>0).length;
  const losers=NSE_STOCKS_WITH_PRICES.filter(s=>s.change<0).length;
  const unchanged=NSE_STOCKS_WITH_PRICES.length-gainers-losers;

  const Th=({label,k,right})=>(
    <th onClick={()=>ts(k)} style={{textAlign:right?"right":"left",padding:"10px 14px",color:sortKey===k?"#f97316":"#92400e",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #e7e5e4",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none",background:"#fff7ed",fontFamily:"'Nunito',sans-serif"}}>
      {label}{sortKey===k?(sortDir===1?" ↑":" ↓"):""}
    </th>
  );

  return (
    <div style={{animation:"fadeUp 0.4s ease both"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
        <StatCard label="TOTAL LISTED" value={NSE_STOCKS_WITH_PRICES.length} accent="#f97316" sub="NSE Equity" delay={0}/>
        <StatCard label="GAINERS" value={gainers} accent="#16a34a" sub="Advancing" delay={0.05}/>
        <StatCard label="LOSERS" value={losers} accent="#ef4444" sub="Declining" delay={0.1}/>
        <StatCard label="UNCHANGED" value={unchanged} accent="#f59e0b" sub="Flat" delay={0.15}/>
        <StatCard label="SECTORS" value={ALL_SECTORS_NSE.length-1} accent="#fb923c" sub="Categories" delay={0.2}/>
      </div>

      <Card style={{marginBottom:16}}>
        <SectionHeader title="ADVANCE / DECLINE" sub="Market breadth snapshot"/>
        <div style={{display:"flex",height:10,borderRadius:8,overflow:"hidden",gap:2}}>
          <div style={{flex:gainers,background:"linear-gradient(90deg,#16a34a,#22c55e)",borderRadius:"8px 0 0 8px",transition:"flex 1.2s ease"}}/>
          <div style={{flex:unchanged,background:"#e7e5e4",transition:"flex 1.2s ease"}}/>
          <div style={{flex:losers,background:"linear-gradient(90deg,#ef4444,#f87171)",borderRadius:"0 8px 8px 0",transition:"flex 1.2s ease"}}/>
        </div>
        <div style={{display:"flex",gap:24,marginTop:10}}>
          {[["▲ Gainers","#16a34a",gainers],["— Unchanged","#a8a29e",unchanged],["▼ Losers","#ef4444",losers]].map(([l,c,v])=>(
            <span key={l} style={{fontSize:10,color:c,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{l}: {v}</span>))}
        </div>
      </Card>

      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:"1 1 220px"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#f97316",fontSize:14}}>⌕</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Search symbol, name or ISIN…"
            style={{width:"100%",background:"#fff",border:"1.5px solid #fed7aa",borderRadius:10,padding:"9px 12px 9px 34px",color:"#1c1917",fontFamily:"'Nunito',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s,box-shadow 0.2s"}}
            onFocus={e=>{e.target.style.borderColor="#f97316";e.target.style.boxShadow="0 0 0 3px rgba(249,115,22,0.1)";}}
            onBlur={e=>{e.target.style.borderColor="#fed7aa";e.target.style.boxShadow="none";}}/>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {ALL_SECTORS_NSE.slice(0,9).map(s=>(
            <button key={s} onClick={()=>{setSectorFilter(s);setPage(0);}}
              style={{background:sectorFilter===s?"#f97316":"#fff",border:sectorFilter===s?"1.5px solid #f97316":"1.5px solid #fed7aa",borderRadius:20,padding:"5px 14px",fontSize:10,color:sectorFilter===s?"#fff":"#92400e",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,transition:"all 0.2s"}}>{s}</button>))}
          {ALL_SECTORS_NSE.length>9&&(
            <select onChange={e=>{setSectorFilter(e.target.value);setPage(0);}} value={sectorFilter}
              style={{background:"#fff",border:"1.5px solid #fed7aa",borderRadius:20,color:"#92400e",fontSize:10,padding:"5px 12px",fontFamily:"'Nunito',sans-serif",cursor:"pointer",outline:"none"}}>
              {ALL_SECTORS_NSE.slice(9).map(s=><option key={s} value={s}>{s}</option>)}
            </select>)}
        </div>
      </div>

      <div style={{fontSize:9,color:"#f97316",letterSpacing:".1em",marginBottom:10,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
        SHOWING {page*PS+1}–{Math.min((page+1)*PS,filtered.length)} OF {filtered.length} SYMBOLS
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>
              <Th label="#" k="symbol"/><Th label="SYMBOL" k="symbol"/><Th label="COMPANY" k="name"/>
              <Th label="SECTOR" k="sector"/><Th label="SERIES" k="series"/><Th label="LTP ₹" k="price" right/>
              <Th label="CHANGE %" k="change" right/><Th label="VOLUME" k="volume" right/>
              <Th label="MKT CAP Cr" k="mktCap" right/>
              <th style={{textAlign:"right",padding:"10px 14px",color:"#92400e",fontSize:9,borderBottom:"1px solid #fed7aa",letterSpacing:".1em",background:"#fff7ed",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>ISIN</th>
            </tr></thead>
            <tbody>
              {pd.map((stock,i)=>{
                const isUp=stock.change>=0, ri=page*PS+i;
                return <tr key={stock.symbol} onMouseEnter={()=>setHovered(ri)} onMouseLeave={()=>setHovered(null)}
                  style={{borderBottom:"1px solid #0f1a0f",background:hovered===ri?"#fff7ed":"transparent",transition:"background 0.15s"}}>
                  <td style={{padding:"10px 14px",color:"#f97316",fontSize:9,fontFamily:"'Nunito',sans-serif"}}>{ri+1}</td>
                  <td style={{padding:"10px 14px",fontWeight:800,color:"#f97316",fontFamily:"'Courier Prime',monospace",fontSize:12,whiteSpace:"nowrap"}}>{stock.symbol}</td>
                  <td style={{padding:"10px 14px",color:"#44403c",fontFamily:"'Nunito',sans-serif",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stock.name}</td>
                  <td style={{padding:"10px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:9,background:"#fff7ed",color:"#c2410c",border:"1px solid #fed7aa",fontFamily:"'Nunito',sans-serif",whiteSpace:"nowrap",fontWeight:700}}>{stock.sector}</span></td>
                  <td style={{padding:"10px 14px",color:"#f97316",textAlign:"center",fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{stock.series}</td>
                  <td style={{padding:"10px 14px",color:"#1c1917",textAlign:"right",fontWeight:700,fontFamily:"'Courier Prime',monospace"}}>₹{stock.price.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",textAlign:"right"}}><span style={{color:isUp?"#16a34a":"#ef4444",fontWeight:700,fontFamily:"'Courier Prime',monospace",fontSize:12,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3}}>{isUp?"▲":"▼"}{Math.abs(stock.change).toFixed(2)}%</span></td>
                  <td style={{padding:"10px 14px",color:"#78716c",textAlign:"right",fontFamily:"'Courier Prime',monospace",fontSize:11}}>{stock.volume.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",color:"#78716c",textAlign:"right",fontFamily:"'Courier Prime',monospace",fontSize:11}}>{stock.mktCap.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",color:"#a8a29e",textAlign:"right",fontSize:9,fontFamily:"'Courier Prime',monospace",whiteSpace:"nowrap"}}>{stock.isin}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:18,alignItems:"center",flexWrap:"wrap"}}>
        {[["«",()=>setPage(0),page===0],["‹",()=>setPage(p=>Math.max(0,p-1)),page===0]].map(([l,fn,d])=>(
          <button key={l} onClick={fn} disabled={d} style={{background:"#fff",border:"1.5px solid #fed7aa",borderRadius:8,padding:"6px 12px",cursor:d?"not-allowed":"pointer",color:d?"#fbbf24":"#f97316",opacity:d?0.5:1,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{l}</button>))}
        {Array.from({length:Math.min(7,tp)},(_,i)=>{
          let pg=i;
          if(tp>7){if(page<4)pg=i;else if(page>tp-5)pg=tp-7+i;else pg=page-3+i;}
          return <button key={pg} onClick={()=>setPage(pg)} style={{background:page===pg?"#f97316":"#fff",border:page===pg?"none":"1.5px solid #fed7aa",borderRadius:8,padding:"6px 0",minWidth:34,cursor:"pointer",color:page===pg?"#fff":"#78716c",fontWeight:page===pg?700:400,fontSize:12,fontFamily:"'Nunito',sans-serif"}}>{pg+1}</button>;
        })}
        {[["›",()=>setPage(p=>Math.min(tp-1,p+1)),page>=tp-1],["»",()=>setPage(tp-1),page>=tp-1]].map(([l,fn,d])=>(
          <button key={l} onClick={fn} disabled={d} style={{background:"#fff",border:"1.5px solid #fed7aa",borderRadius:8,padding:"6px 12px",cursor:d?"not-allowed":"pointer",color:d?"#fbbf24":"#f97316",opacity:d?0.5:1,fontSize:14,fontFamily:"'Nunito',sans-serif"}}>{l}</button>))}
        <span style={{fontSize:10,color:"#f97316",marginLeft:6,fontFamily:"'Nunito',sans-serif"}}>Page {page+1} / {tp}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function App() {
  const [showLanding,setShowLanding]=useState(true);
  const [tab,setTab]=useState("ohlcv"), [range,setRange]=useState(5);
  const [stock,setStock]=useState("RELIANCE"), [activeSectors,setActiveSectors]=useState(["IT","Banking","Auto","Pharma"]);
  const [animKey,setAnimKey]=useState(0);
  const months=RANGES[range].months;

  const ohlcvData=useMemo(()=>genOHLCV(STOCKS[stock].base,months,STOCKS[stock].vol),[stock,months]);
  const indexData=useMemo(()=>genIndex(11500,months),[months]);
  const sectorData=useMemo(()=>genSectorPerf(months),[months]);
  const fiiData=useMemo(()=>genFIIDII(months),[months]);
  const setRangeIdx=i=>{setRange(i);setAnimKey(k=>k+1);};

  const ohlcvStats=useMemo(()=>{
    if(!ohlcvData.length) return {};
    const high=Math.max(...ohlcvData.map(d=>d.high)), low=Math.min(...ohlcvData.map(d=>d.low));
    const first=ohlcvData[0].close, last=ohlcvData[ohlcvData.length-1].close;
    return {high,low,change:((last-first)/first*100).toFixed(2),avgVol:Math.round(ohlcvData.reduce((a,d)=>a+d.volume,0)/ohlcvData.length),last};
  },[ohlcvData]);

  const fiiStats=useMemo(()=>{
    const tF=fiiData.reduce((a,d)=>a+d.fii,0), tD=fiiData.reduce((a,d)=>a+d.dii,0);
    return {totalFII:tF,totalDII:tD,net:tF+tD,fiiBuyPct:((fiiData.filter(d=>d.fii>0).length/fiiData.length)*100).toFixed(0)};
  },[fiiData]);

  const sectorCumul=useMemo(()=>{
    const t={}; SECTORS.forEach(s=>{t[s]=sectorData.reduce((a,d)=>a+d[s],0).toFixed(1);}); return t;
  },[sectorData]);

  const toggleSector=s=>setActiveSectors(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const thin=(data,max=60)=>{if(data.length<=max)return data;const step=Math.ceil(data.length/max);return data.filter((_,i)=>i%step===0||i===data.length-1);};
  const axTick={fill:"#a8a29e",fontSize:9,fontFamily:"Nunito"};
  const grid=<CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" vertical={false}/>;
  const TABS=[["ohlcv","\u{1F4C8}","OHLCV"],["index","\u{1F4CA}","Indices"],["sector","\u{1F3ED}","Sectors"],["fiidii","\u{1F4B0}","FII/DII"],["nse","\u{1F4CB}","NSE All"]];

  if(showLanding) return <LandingPage onEnter={()=>setShowLanding(false)}/>;

  return (
    <div style={{minHeight:"100vh",background:"#fafaf9",fontFamily:"'Nunito',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;min-height:100vh}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#fff7ed}::-webkit-scrollbar-thumb{background:#f97316;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes softPulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 16px;cursor:pointer;border:none;background:transparent;color:#92400e;transition:all 0.25s;border-radius:10px;font-family:'Nunito',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;position:relative}
        .nav-btn:hover{color:#f97316;background:rgba(249,115,22,0.08)}
        .nav-btn.on{color:#f97316;background:rgba(249,115,22,0.12)}
        .nav-btn.on::after{content:'';position:absolute;bottom:0;left:25%;right:25%;height:2px;background:linear-gradient(90deg,transparent,#f97316,transparent);border-radius:2px}
        .rbtn{background:transparent;border:1px solid rgba(249,115,22,0.2);border-radius:8px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:10px;padding:5px 12px;color:#92400e;transition:all 0.2s;font-weight:600}
        .rbtn:hover{border-color:#f97316;color:#f97316}
        .rbtn.on{background:#f97316;border-color:#f97316;color:#fff;font-weight:800}
        .sbtn{background:#fff;border:1.5px solid #fed7aa;border-radius:20px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:10px;padding:5px 16px;color:#92400e;transition:all 0.2s;font-weight:700}
        .sbtn:hover{border-color:#f97316;color:#f97316}
        .sbtn.on{background:#f97316;border-color:#f97316;color:#fff;font-weight:800}
        .secbtn{border:1.5px solid transparent;border-radius:20px;cursor:pointer;font-size:10px;padding:4px 14px;transition:all 0.2s;opacity:0.4;background:#fff7ed;font-weight:700;font-family:'Nunito',sans-serif}
        .secbtn.on{opacity:1!important;border-color:currentColor}
        input::placeholder{color:#fbbf24}
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav style={{background:"linear-gradient(135deg,#ffffff 0%,#fffbf5 100%)",borderBottom:"1px solid rgba(249,115,22,0.15)",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 24px rgba(0,0,0,0.25)",flexWrap:"wrap",gap:8}}>

        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0"}}>
          <div style={{width:40,height:40,background:"linear-gradient(135deg,#f97316,#fbbf24)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",fontWeight:800,flexShrink:0,boxShadow:"0 4px 12px rgba(249,115,22,0.3)"}}>वे</div>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#1c1917",letterSpacing:".04em",lineHeight:1}}>Vedartha<span style={{color:"#f59e0b"}}>.in</span></div>
            <div style={{fontSize:7,color:"rgba(0,230,118,0.5)",letterSpacing:".22em",marginTop:2,fontFamily:"'Nunito',sans-serif"}}>KNOWLEDGE OF WEALTH</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.3)",borderRadius:20,marginLeft:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#f97316",animation:"softPulse 2s infinite"}}/>
            <span style={{fontSize:8,color:"#f59e0b",letterSpacing:".1em",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",alignItems:"center",gap:2,overflowX:"auto"}}>
          {TABS.map(([id,icon,label])=>(
            <button key={id} className={`nav-btn${tab===id?" on":""}`} onClick={()=>setTab(id)}>
              <span style={{fontSize:15}}>{icon}</span>
              <span>{label}</span>
            </button>))}
        </div>

        {/* Range */}
        {tab!=="nse"&&(
          <div style={{display:"flex",gap:4,alignItems:"center",padding:"10px 0"}}>
            <span style={{fontSize:8,color:"rgba(52,211,153,0.15)",letterSpacing:".2em",marginRight:4,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>RANGE</span>
            {RANGES.map((r,i)=>(
              <button key={r.label} className={`rbtn${range===i?" on":""}`} onClick={()=>setRangeIdx(i)}>{r.label}</button>))}
          </div>)}
      </nav>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <main style={{maxWidth:1300,margin:"0 auto",padding:"28px 20px 60px"}}>

        {/* Page header */}
        <div style={{marginBottom:24,animation:"fadeUp 0.4s ease both"}}>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:700,color:"#1c1917",letterSpacing:"0em",lineHeight:1.1}}>
            {tab==="ohlcv"&&`${stock} · Price History`}
            {tab==="index"&&"Index History"}
            {tab==="sector"&&"Sector Performance"}
            {tab==="fiidii"&&"FII / DII Flows"}
            {tab==="nse"&&"NSE All Listings"}
          </h1>
          <p style={{fontSize:12,color:"#f97316",marginTop:6,fontFamily:"'Nunito',sans-serif"}}>
            {tab==="ohlcv"&&`Historical OHLCV data · ${RANGES[range].label} range`}
            {tab==="index"&&`Nifty 50 & Sensex · ${RANGES[range].label} range`}
            {tab==="sector"&&`8 sector comparison · ${RANGES[range].label} range`}
            {tab==="fiidii"&&`Institutional flows · ${RANGES[range].label} range`}
            {tab==="nse"&&`${NSE_STOCKS_WITH_PRICES.length}+ equity symbols across all sectors`}
          </p>
        </div>

        {/* NSE */}
        {tab==="nse"&&<NSEListingsTab/>}

        {/* OHLCV */}
        {tab==="ohlcv"&&(
          <div key={`ov${animKey}`} style={{animation:"fadeUp 0.4s ease both"}}>
            <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:9,color:"#92400e",letterSpacing:".15em",marginRight:4,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>SELECT STOCK</span>
              {Object.keys(STOCKS).map(s=><button key={s} className={`sbtn${stock===s?" on":""}`} onClick={()=>setStock(s)}>{s}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
              <StatCard label="LAST CLOSE" value={`₹${ohlcvStats.last?.toLocaleString("en-IN")}`} accent="#f97316" delay={0}/>
              <StatCard label="PERIOD RETURN" value={`${ohlcvStats.change>0?"+":""}${ohlcvStats.change}%`} accent={ohlcvStats.change>0?"#16a34a":"#ef4444"} delay={0.05}/>
              <StatCard label="PERIOD HIGH" value={`₹${ohlcvStats.high?.toLocaleString("en-IN")}`} accent="#f97316" delay={0.1}/>
              <StatCard label="PERIOD LOW" value={`₹${ohlcvStats.low?.toLocaleString("en-IN")}`} accent="#f59e0b" delay={0.15}/>
              <StatCard label="AVG VOLUME" value={ohlcvStats.avgVol?.toLocaleString("en-IN")} accent="#fb923c" delay={0.2}/>
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title={`CLOSE PRICE · ${stock}`} sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={thin(ohlcvData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                  {grid}
                  <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(ohlcvData).length/6)}/>
                  <YAxis domain={["auto","auto"]} tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v.toLocaleString("en-IN")}`} width={74}/>
                  <Tooltip content={<OHLCTooltip/>}/>
                  <Area type="monotone" dataKey="close" stroke="#f97316" strokeWidth={2.5} fill="url(#cg)" dot={false} activeDot={{r:5,fill:"#f97316",stroke:"#fff",strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="VOLUME" sub="Monthly traded volume"/>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={thin(ohlcvData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  {grid}
                  <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(ohlcvData).length/6)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={42}/>
                  <Tooltip formatter={v=>[v.toLocaleString("en-IN"),"Volume"]} contentStyle={TT}/>
                  <Bar dataKey="volume" radius={[3,3,0,0]}>
                    {thin(ohlcvData).map((d,i)=><Cell key={i} fill={d.close>=d.open?"#f59e0b55":"#f9731655"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{overflowX:"auto"}}>
              <SectionHeader title="OHLCV TABLE" sub="Last 12 entries"/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["Date","Open","High","Low","Close","Volume","Change"].map(h=>(
                  <th key={h} style={{textAlign:"right",padding:"7px 12px",color:"#92400e",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #fed7aa",fontFamily:"'Nunito',sans-serif"}}>{h}</th>))}</tr></thead>
                <tbody>{[...ohlcvData].reverse().slice(0,12).map((d,i)=>{
                  const chg=((d.close-d.open)/d.open*100).toFixed(2);
                  return <tr key={i} style={{borderBottom:"1px solid #fef3c7"}}>
                    <td style={{padding:"9px 12px",color:"#78716c",textAlign:"right",fontFamily:"'Nunito',sans-serif"}}>{d.date}</td>
                    <td style={{padding:"9px 12px",color:"#fed7aa",textAlign:"right",fontFamily:"'Courier Prime',monospace"}}>₹{d.open.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#f97316",textAlign:"right",fontFamily:"'Courier Prime',monospace"}}>₹{d.high.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#ff5252",textAlign:"right",fontFamily:"'Courier Prime',monospace"}}>₹{d.low.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.close>=d.open?"#f97316":"#ff5252",fontWeight:700,textAlign:"right",fontFamily:"'Courier Prime',monospace"}}>₹{d.close.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#78716c",textAlign:"right",fontFamily:"'Courier Prime',monospace"}}>{d.volume.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:chg>=0?"#f97316":"#ff5252",textAlign:"right",fontWeight:700,fontFamily:"'Courier Prime',monospace"}}>{chg>0?"+":""}{chg}%</td>
                  </tr>;})}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* INDEX */}
        {tab==="index"&&(
          <div key={`ix${animKey}`} style={{animation:"fadeUp 0.4s ease both"}}>
            {(()=>{
              const first=indexData[0],last=indexData[indexData.length-1];
              const nC=((last.nifty-first.nifty)/first.nifty*100).toFixed(2), sC=((last.sensex-first.sensex)/first.sensex*100).toFixed(2);
              return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
                <StatCard label="NIFTY 50" value={last.nifty.toLocaleString("en-IN")} accent="#fb923c" delay={0}/>
                <StatCard label="SENSEX" value={last.sensex.toLocaleString("en-IN")} accent="#f97316" delay={0.05}/>
                <StatCard label={`NIFTY ${RANGES[range].label}`} value={`${nC>0?"+":""}${nC}%`} accent={nC>0?"#f59e0b":"#f97316"} delay={0.1}/>
                <StatCard label={`SENSEX ${RANGES[range].label}`} value={`${sC>0?"+":""}${sC}%`} accent={sC>0?"#f59e0b":"#f97316"} delay={0.15}/>
              </div>;
            })()}
            <Card style={{marginBottom:16}}>
              <SectionHeader title="NIFTY 50" sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={thin(indexData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb923c" stopOpacity={0.2}/><stop offset="95%" stopColor="#fb923c" stopOpacity={0}/></linearGradient></defs>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(indexData).length/6)}/>
                  <YAxis domain={["auto","auto"]} tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>v.toLocaleString("en-IN")} width={70}/>
                  <Tooltip content={<IndexTooltip/>}/>
                  <Area type="monotone" dataKey="nifty" stroke="#fb923c" strokeWidth={2.5} fill="url(#ng)" dot={false} activeDot={{r:5,fill:"#fb923c",stroke:"#fff",strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="SENSEX" sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={thin(indexData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.12}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(indexData).length/6)}/>
                  <YAxis domain={["auto","auto"]} tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>v.toLocaleString("en-IN")} width={80}/>
                  <Tooltip content={<IndexTooltip/>}/>
                  <Area type="monotone" dataKey="sensex" stroke="#f97316" strokeWidth={2.5} fill="url(#sg)" dot={false} activeDot={{r:5,fill:"#f97316",stroke:"#fff",strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionHeader title="NIFTY vs SENSEX NORMALISED" sub="Base 100 comparison"/>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={thin(indexData).map(d=>({...d,niftyN:+(d.nifty/indexData[0].nifty*100).toFixed(2),sensexN:+(d.sensex/indexData[0].sensex*100).toFixed(2)}))} margin={{top:4,right:4,bottom:0,left:0}}>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(indexData).length/6)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} width={38}/>
                  <Tooltip contentStyle={TT}/><ReferenceLine y={100} stroke="#e7e5e4" strokeDasharray="4 4"/>
                  <Line type="monotone" dataKey="niftyN" name="NIFTY" stroke="#fb923c" strokeWidth={2.5} dot={false}/>
                  <Line type="monotone" dataKey="sensexN" name="SENSEX" stroke="#f97316" strokeWidth={2.5} dot={false}/>
                  <Legend wrapperStyle={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#92400e"}}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* SECTOR */}
        {tab==="sector"&&(
          <div key={`se${animKey}`} style={{animation:"fadeUp 0.4s ease both"}}>
            <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:9,color:"#92400e",letterSpacing:".15em",marginRight:4,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>SECTORS</span>
              {SECTORS.map((s,i)=>(
                <button key={s} className={`secbtn${activeSectors.includes(s)?" on":""}`}
                  style={{color:SECTOR_COLORS[i],background:activeSectors.includes(s)?`${SECTOR_COLORS[i]}18`:"#fff"}}
                  onClick={()=>toggleSector(s)}>{s}</button>))}
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="CUMULATIVE RETURN" sub={`${RANGES[range].label} total return`}/>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SECTORS.filter(s=>activeSectors.includes(s)).map(s=>({name:s,value:parseFloat(sectorCumul[s]),color:SECTOR_COLORS[SECTORS.indexOf(s)]}))} margin={{top:4,right:4,bottom:0,left:0}}>
                  {grid}<XAxis dataKey="name" tick={{...axTick,fill:"#78716c",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} width={40}/>
                  <ReferenceLine y={0} stroke="#e7e5e4"/>
                  <Tooltip formatter={v=>[`${v}%`,"Return"]} contentStyle={TT}/>
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {SECTORS.filter(s=>activeSectors.includes(s)).map(s=>(
                      <Cell key={s} fill={SECTOR_COLORS[SECTORS.indexOf(s)]} fillOpacity={parseFloat(sectorCumul[s])>=0?0.85:0.5}/>))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="MONTHLY TREND" sub={`${RANGES[range].label} monthly performance`}/>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={thin(sectorData,36)} margin={{top:4,right:4,bottom:0,left:0}}>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(sectorData,36).length/6)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} width={36}/>
                  <ReferenceLine y={0} stroke="#e7e5e4" strokeDasharray="4 4"/>
                  <Tooltip contentStyle={TT}/>
                  {activeSectors.map(s=><Line key={s} type="monotone" dataKey={s} stroke={SECTOR_COLORS[SECTORS.indexOf(s)]} strokeWidth={2} dot={false}/>)}
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionHeader title="SECTOR LEADERBOARD" sub={`Ranked by ${RANGES[range].label} return`}/>
              {[...SECTORS].sort((a,b)=>parseFloat(sectorCumul[b])-parseFloat(sectorCumul[a])).map((s,i)=>{
                const val=parseFloat(sectorCumul[s]), color=SECTOR_COLORS[SECTORS.indexOf(s)];
                const maxAbs=Math.max(...SECTORS.map(x=>Math.abs(parseFloat(sectorCumul[x]))));
                return <div key={s} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:i<SECTORS.length-1?"1px solid #0f1a0f":"none"}}>
                  <div style={{width:22,fontSize:10,color:"#f97316",textAlign:"right",fontFamily:"'Courier Prime',monospace",fontWeight:700}}>#{i+1}</div>
                  <div style={{width:64,fontSize:12,color,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{s}</div>
                  <div style={{flex:1,height:7,background:"#f5f5f4",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(Math.abs(val)/maxAbs)*100}%`,background:val>=0?`linear-gradient(90deg,${color}66,${color})`:"linear-gradient(90deg,#f9731666,#f97316)",borderRadius:4,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
                  </div>
                  <div style={{width:72,textAlign:"right",fontSize:13,fontWeight:800,color:val>=0?"#16a34a":"#ef4444",fontFamily:"'Courier Prime',monospace"}}>{val>=0?"+":""}{val}%</div>
                </div>;
              })}
            </Card>
          </div>
        )}

        {/* FII/DII */}
        {tab==="fiidii"&&(
          <div key={`fi${animKey}`} style={{animation:"fadeUp 0.4s ease both"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
              <StatCard label="TOTAL FII" value={`₹${Math.abs(fiiStats.totalFII).toLocaleString("en-IN")} Cr`} accent={fiiStats.totalFII>=0?"#f97316":"#ef4444"} sub={fiiStats.totalFII>=0?"Net Buying":"Net Selling"} delay={0}/>
              <StatCard label="TOTAL DII" value={`₹${Math.abs(fiiStats.totalDII).toLocaleString("en-IN")} Cr`} accent={fiiStats.totalDII>=0?"#f59e0b":"#ef4444"} sub={fiiStats.totalDII>=0?"Net Buying":"Net Selling"} delay={0.05}/>
              <StatCard label="NET COMBINED" value={`₹${Math.abs(fiiStats.net).toLocaleString("en-IN")} Cr`} accent={fiiStats.net>=0?"#fb923c":"#ef4444"} sub={fiiStats.net>=0?"Positive":"Negative"} delay={0.1}/>
              <StatCard label="FII BUY MONTHS" value={`${fiiStats.fiiBuyPct}%`} accent="#f97316" sub={`of ${months} months`} delay={0.15}/>
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="FII vs DII FLOWS" sub={`${RANGES[range].label} monthly activity (₹ Cr)`}/>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={thin(fiiData,48)} margin={{top:4,right:4,bottom:0,left:0}} barCategoryGap="20%">
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(fiiData,48).length/7)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${v>0?"+":""}${(v/1000).toFixed(0)}K`} width={48}/>
                  <ReferenceLine y={0} stroke="#e7e5e4"/>
                  <Tooltip content={<FIITooltip/>}/>
                  <Bar dataKey="fii" name="FII" radius={[3,3,0,0]}>{thin(fiiData,48).map((d,i)=><Cell key={i} fill={d.fii>=0?"#f97316":"#fed7aa"}/>)}</Bar>
                  <Bar dataKey="dii" name="DII" radius={[3,3,0,0]}>{thin(fiiData,48).map((d,i)=><Cell key={i} fill={d.dii>=0?"#f59e0b":"#fde68a"}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:20,marginTop:10}}>
                {[["■ FII/FPI","#f97316"],["■ DII (MF+Ins)","#f59e0b"]].map(([l,c])=>(
                  <span key={l} style={{fontSize:10,color:c,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{l}</span>))}
              </div>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="NET COMBINED FLOW" sub={`${RANGES[range].label} net activity`}/>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={thin(fiiData,48)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="netg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(fiiData,48).length/7)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={42}/>
                  <ReferenceLine y={0} stroke="#e7e5e4" strokeDasharray="4 4"/>
                  <Tooltip formatter={v=>[`₹${v.toLocaleString("en-IN")} Cr`,"Net Flow"]} contentStyle={TT}/>
                  <Area type="monotone" dataKey="net" stroke="#fb923c" strokeWidth={2.5} fill="url(#netg)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{overflowX:"auto"}}>
              <SectionHeader title="FLOW TABLE" sub="Last 12 months"/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["Month","FII Flow (₹ Cr)","DII Flow (₹ Cr)","Net Flow","Bias"].map(h=>(
                  <th key={h} style={{textAlign:"right",padding:"7px 12px",color:"#92400e",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #fed7aa",fontFamily:"'Nunito',sans-serif"}}>{h}</th>))}</tr></thead>
                <tbody>{[...fiiData].reverse().slice(0,12).map((d,i)=>{
                  const bias=d.fii>0&&d.dii>0?"Both Buy":d.fii<0&&d.dii<0?"Both Sell":d.fii>0?"FII Buy":"DII Buy";
                  const bc=bias==="Both Buy"?"#16a34a":bias==="Both Sell"?"#ef4444":"#f97316";
                  return <tr key={i} style={{borderBottom:"1px solid #fef3c7"}}>
                    <td style={{padding:"9px 12px",color:"#78716c",textAlign:"right",fontFamily:"'Nunito',sans-serif"}}>{d.date}</td>
                    <td style={{padding:"9px 12px",color:d.fii>=0?"#f97316":"#ef4444",textAlign:"right",fontWeight:700,fontFamily:"'Courier Prime',monospace"}}>{d.fii>=0?"+":""}{d.fii.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.dii>=0?"#f59e0b":"#ef4444",textAlign:"right",fontWeight:700,fontFamily:"'Courier Prime',monospace"}}>{d.dii>=0?"+":""}{d.dii.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.net>=0?"#16a34a":"#ef4444",textAlign:"right",fontWeight:800,fontFamily:"'Courier Prime',monospace"}}>{d.net>=0?"+":""}{d.net.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",textAlign:"right"}}>
                      <span style={{padding:"3px 12px",borderRadius:20,fontSize:9,fontWeight:700,background:`${bc}15`,color:bc,border:`1px solid ${bc}44`,fontFamily:"'Nunito',sans-serif",letterSpacing:".06em"}}>{bias.toUpperCase()}</span>
                    </td>
                  </tr>;})}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{background:"linear-gradient(135deg,#fffbf5,#fff7ed)",borderTop:"1px solid rgba(249,115,22,0.15)",padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:"rgba(28,25,23,0.4)",letterSpacing:".04em"}}>Vedartha<span style={{color:"rgba(232,168,124,0.35)"}}>.in</span></div>
        <div style={{fontSize:10,color:"rgba(120,113,108,0.6)",fontFamily:"'Nunito',sans-serif"}}>Simulated data · Not financial advice</div>
        <div style={{fontSize:9,color:"rgba(249,115,22,0.4)",fontFamily:"'Courier Prime',monospace",letterSpacing:".1em"}}>वेदार्थ · KNOWLEDGE OF WEALTH</div>
      </footer>
    </div>
  );
}