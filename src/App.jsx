import { useState, useMemo, useEffect, useRef } from "react";
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, BarChart, LineChart,
  Legend, Cell, ReferenceLine, ComposedChart
} from "recharts";

// ─── DATA GENERATORS ──────────────────────────────────────────────────────────
function seed(s) { let x = Math.sin(s) * 10000; return x - Math.floor(x); }

function genOHLCV(basePrice, months, vol = 0.03) {
  const data = []; let close = basePrice;
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 0; i < months; i++) {
    const yr = 2020 + Math.floor(i / 12), mo = i % 12;
    const r1=seed(i*7+1),r2=seed(i*7+2),r3=seed(i*7+3),r4=seed(i*7+4);
    const open=close; close=open*(1+(r1-0.47)*vol);
    const high=Math.max(open,close)*(1+r2*vol*0.5), low=Math.min(open,close)*(1-r3*vol*0.5);
    data.push({date:`${labels[mo]} ${yr}`,open:+open.toFixed(2),high:+high.toFixed(2),low:+low.toFixed(2),close:+close.toFixed(2),volume:Math.round((r4*8000+2000)*10)});
  }
  return data;
}

function genIndex(base, months) {
  const data = []; let val = base;
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (let i = 0; i < months; i++) {
    val = val*(1+(seed(i*13+5)-0.46)*0.04+0.0008);
    data.push({date:`${labels[i%12]} ${2020+Math.floor(i/12)}`,nifty:+val.toFixed(2),sensex:+(val*3.33).toFixed(2)});
  }
  return data;
}

const SECTORS = ["IT","Banking","Auto","Pharma","Energy","FMCG","Metal","Realty"];
const SECTOR_COLORS = ["#00d4ff","#7c3aed","#f97316","#10b981","#f43f5e","#fbbf24","#a78bfa","#34d399"];

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

// ─── NSE STOCKS ───────────────────────────────────────────────────────────────
const NSE_STOCKS = [
  {symbol:"RELIANCE",name:"Reliance Industries Ltd.",sector:"Energy",series:"EQ",isin:"INE002A01018"},
  {symbol:"TCS",name:"Tata Consultancy Services Ltd.",sector:"IT",series:"EQ",isin:"INE467B01029"},
  {symbol:"HDFCBANK",name:"HDFC Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE040A01034"},
  {symbol:"INFY",name:"Infosys Ltd.",sector:"IT",series:"EQ",isin:"INE009A01021"},
  {symbol:"HINDUNILVR",name:"Hindustan Unilever Ltd.",sector:"FMCG",series:"EQ",isin:"INE030A01027"},
  {symbol:"ICICIBANK",name:"ICICI Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE090A01021"},
  {symbol:"KOTAKBANK",name:"Kotak Mahindra Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE237A01028"},
  {symbol:"BHARTIARTL",name:"Bharti Airtel Ltd.",sector:"Telecom",series:"EQ",isin:"INE397D01024"},
  {symbol:"ITC",name:"ITC Ltd.",sector:"FMCG",series:"EQ",isin:"INE154A01025"},
  {symbol:"AXISBANK",name:"Axis Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE238A01034"},
  {symbol:"WIPRO",name:"Wipro Ltd.",sector:"IT",series:"EQ",isin:"INE075A01022"},
  {symbol:"SBIN",name:"State Bank of India",sector:"Banking",series:"EQ",isin:"INE062A01020"},
  {symbol:"LT",name:"Larsen & Toubro Ltd.",sector:"Infrastructure",series:"EQ",isin:"INE018A01030"},
  {symbol:"HCLTECH",name:"HCL Technologies Ltd.",sector:"IT",series:"EQ",isin:"INE860A01027"},
  {symbol:"MARUTI",name:"Maruti Suzuki India Ltd.",sector:"Auto",series:"EQ",isin:"INE585B01010"},
  {symbol:"ASIANPAINT",name:"Asian Paints Ltd.",sector:"Chemicals",series:"EQ",isin:"INE021A01026"},
  {symbol:"BAJFINANCE",name:"Bajaj Finance Ltd.",sector:"NBFC",series:"EQ",isin:"INE296A01024"},
  {symbol:"SUNPHARMA",name:"Sun Pharmaceutical Industries Ltd.",sector:"Pharma",series:"EQ",isin:"INE044A01036"},
  {symbol:"TITAN",name:"Titan Company Ltd.",sector:"Consumer",series:"EQ",isin:"INE280A01028"},
  {symbol:"ULTRACEMCO",name:"UltraTech Cement Ltd.",sector:"Cement",series:"EQ",isin:"INE481G01011"},
  {symbol:"NESTLEIND",name:"Nestle India Ltd.",sector:"FMCG",series:"EQ",isin:"INE239A01016"},
  {symbol:"TECHM",name:"Tech Mahindra Ltd.",sector:"IT",series:"EQ",isin:"INE669C01036"},
  {symbol:"ONGC",name:"Oil & Natural Gas Corporation Ltd.",sector:"Energy",series:"EQ",isin:"INE213A01029"},
  {symbol:"POWERGRID",name:"Power Grid Corporation of India Ltd.",sector:"Power",series:"EQ",isin:"INE752E01010"},
  {symbol:"NTPC",name:"NTPC Ltd.",sector:"Power",series:"EQ",isin:"INE733E01010"},
  {symbol:"TATAMOTORS",name:"Tata Motors Ltd.",sector:"Auto",series:"EQ",isin:"INE155A01022"},
  {symbol:"M&M",name:"Mahindra & Mahindra Ltd.",sector:"Auto",series:"EQ",isin:"INE101A01026"},
  {symbol:"BAJAJFINSV",name:"Bajaj Finserv Ltd.",sector:"NBFC",series:"EQ",isin:"INE918I01026"},
  {symbol:"GRASIM",name:"Grasim Industries Ltd.",sector:"Diversified",series:"EQ",isin:"INE047A01021"},
  {symbol:"ADANIPORTS",name:"Adani Ports and Special Economic Zone Ltd.",sector:"Infrastructure",series:"EQ",isin:"INE742F01042"},
  {symbol:"COALINDIA",name:"Coal India Ltd.",sector:"Mining",series:"EQ",isin:"INE522F01014"},
  {symbol:"INDUSINDBK",name:"IndusInd Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE095A01012"},
  {symbol:"BPCL",name:"Bharat Petroleum Corporation Ltd.",sector:"Energy",series:"EQ",isin:"INE029A01011"},
  {symbol:"DIVISLAB",name:"Divi's Laboratories Ltd.",sector:"Pharma",series:"EQ",isin:"INE361B01024"},
  {symbol:"CIPLA",name:"Cipla Ltd.",sector:"Pharma",series:"EQ",isin:"INE059A01026"},
  {symbol:"DRREDDY",name:"Dr. Reddy's Laboratories Ltd.",sector:"Pharma",series:"EQ",isin:"INE089A01031"},
  {symbol:"EICHERMOT",name:"Eicher Motors Ltd.",sector:"Auto",series:"EQ",isin:"INE066A01021"},
  {symbol:"HEROMOTOCO",name:"Hero MotoCorp Ltd.",sector:"Auto",series:"EQ",isin:"INE158A01026"},
  {symbol:"HINDALCO",name:"Hindalco Industries Ltd.",sector:"Metal",series:"EQ",isin:"INE038A01020"},
  {symbol:"JSWSTEEL",name:"JSW Steel Ltd.",sector:"Metal",series:"EQ",isin:"INE019A01038"},
  {symbol:"TATASTEEL",name:"Tata Steel Ltd.",sector:"Metal",series:"EQ",isin:"INE081A01020"},
  {symbol:"APOLLOHOSP",name:"Apollo Hospitals Enterprise Ltd.",sector:"Healthcare",series:"EQ",isin:"INE437A01024"},
  {symbol:"BRITANNIA",name:"Britannia Industries Ltd.",sector:"FMCG",series:"EQ",isin:"INE216A01030"},
  {symbol:"DABUR",name:"Dabur India Ltd.",sector:"FMCG",series:"EQ",isin:"INE016A01026"},
  {symbol:"GODREJCP",name:"Godrej Consumer Products Ltd.",sector:"FMCG",series:"EQ",isin:"INE102D01028"},
  {symbol:"PIDILITIND",name:"Pidilite Industries Ltd.",sector:"Chemicals",series:"EQ",isin:"INE318A01026"},
  {symbol:"SBILIFE",name:"SBI Life Insurance Company Ltd.",sector:"Insurance",series:"EQ",isin:"INE123W01016"},
  {symbol:"HDFCLIFE",name:"HDFC Life Insurance Company Ltd.",sector:"Insurance",series:"EQ",isin:"INE795G01014"},
  {symbol:"ICICIPRULI",name:"ICICI Prudential Life Insurance Company Ltd.",sector:"Insurance",series:"EQ",isin:"INE726G01019"},
  {symbol:"SHREECEM",name:"Shree Cement Ltd.",sector:"Cement",series:"EQ",isin:"INE070A01015"},
  {symbol:"AMBUJACEM",name:"Ambuja Cements Ltd.",sector:"Cement",series:"EQ",isin:"INE079A01024"},
  {symbol:"ACC",name:"ACC Ltd.",sector:"Cement",series:"EQ",isin:"INE012A01025"},
  {symbol:"BOSCHLTD",name:"Bosch Ltd.",sector:"Auto Ancillary",series:"EQ",isin:"INE323A01026"},
  {symbol:"TATACONSUM",name:"Tata Consumer Products Ltd.",sector:"FMCG",series:"EQ",isin:"INE192A01025"},
  {symbol:"VEDL",name:"Vedanta Ltd.",sector:"Metal",series:"EQ",isin:"INE205A01025"},
  {symbol:"NMDC",name:"NMDC Ltd.",sector:"Mining",series:"EQ",isin:"INE584A01023"},
  {symbol:"SAIL",name:"Steel Authority of India Ltd.",sector:"Metal",series:"EQ",isin:"INE114A01011"},
  {symbol:"BANKBARODA",name:"Bank of Baroda",sector:"Banking",series:"EQ",isin:"INE028A01039"},
  {symbol:"CANBK",name:"Canara Bank",sector:"Banking",series:"EQ",isin:"INE476A01014"},
  {symbol:"PNB",name:"Punjab National Bank",sector:"Banking",series:"EQ",isin:"INE160A01022"},
  {symbol:"FEDERALBNK",name:"The Federal Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE171A01029"},
  {symbol:"IDFCFIRSTB",name:"IDFC First Bank Ltd.",sector:"Banking",series:"EQ",isin:"INE092T01019"},
  {symbol:"MUTHOOTFIN",name:"Muthoot Finance Ltd.",sector:"NBFC",series:"EQ",isin:"INE414G01012"},
  {symbol:"CHOLAFIN",name:"Cholamandalam Investment and Finance Company Ltd.",sector:"NBFC",series:"EQ",isin:"INE121A01024"},
  {symbol:"LICI",name:"Life Insurance Corporation of India",sector:"Insurance",series:"EQ",isin:"INE0J1Y01017"},
  {symbol:"RECLTD",name:"REC Ltd.",sector:"Power Finance",series:"EQ",isin:"INE020B01018"},
  {symbol:"PFC",name:"Power Finance Corporation Ltd.",sector:"Power Finance",series:"EQ",isin:"INE134E01011"},
  {symbol:"HAL",name:"Hindustan Aeronautics Ltd.",sector:"Defence",series:"EQ",isin:"INE066F01012"},
  {symbol:"BEL",name:"Bharat Electronics Ltd.",sector:"Defence",series:"EQ",isin:"INE263A01024"},
  {symbol:"BHEL",name:"Bharat Heavy Electricals Ltd.",sector:"Capital Goods",series:"EQ",isin:"INE257A01026"},
  {symbol:"SIEMENS",name:"Siemens Ltd.",sector:"Capital Goods",series:"EQ",isin:"INE003A01024"},
  {symbol:"HAVELLS",name:"Havells India Ltd.",sector:"Consumer Electricals",series:"EQ",isin:"INE176B01034"},
  {symbol:"VOLTAS",name:"Voltas Ltd.",sector:"Consumer Electricals",series:"EQ",isin:"INE226A01021"},
  {symbol:"DIXON",name:"Dixon Technologies (India) Ltd.",sector:"Electronics",series:"EQ",isin:"INE935N01020"},
  {symbol:"MPHASIS",name:"Mphasis Ltd.",sector:"IT",series:"EQ",isin:"INE356A01018"},
  {symbol:"COFORGE",name:"Coforge Ltd.",sector:"IT",series:"EQ",isin:"INE591G01017"},
  {symbol:"PERSISTENT",name:"Persistent Systems Ltd.",sector:"IT",series:"EQ",isin:"INE262H01021"},
  {symbol:"LTTS",name:"L&T Technology Services Ltd.",sector:"IT",series:"EQ",isin:"INE010V01017"},
  {symbol:"ZOMATO",name:"Zomato Ltd.",sector:"Internet",series:"EQ",isin:"INE758T01015"},
  {symbol:"NYKAA",name:"FSN E-Commerce Ventures Ltd.",sector:"Internet",series:"EQ",isin:"INE388Y01029"},
  {symbol:"PAYTM",name:"One 97 Communications Ltd.",sector:"Fintech",series:"EQ",isin:"INE982J01020"},
  {symbol:"DELHIVERY",name:"Delhivery Ltd.",sector:"Logistics",series:"EQ",isin:"INE428Q01012"},
  {symbol:"IRCTC",name:"Indian Railway Catering And Tourism Corporation Ltd.",sector:"Tourism",series:"EQ",isin:"INE335Y01020"},
  {symbol:"INDIGO",name:"InterGlobe Aviation Ltd.",sector:"Aviation",series:"EQ",isin:"INE646L01027"},
  {symbol:"CONCOR",name:"Container Corporation of India Ltd.",sector:"Logistics",series:"EQ",isin:"INE111A01025"},
  {symbol:"AUROPHARMA",name:"Aurobindo Pharma Ltd.",sector:"Pharma",series:"EQ",isin:"INE406A01037"},
  {symbol:"ALKEM",name:"Alkem Laboratories Ltd.",sector:"Pharma",series:"EQ",isin:"INE540L01014"},
  {symbol:"TORNTPHARM",name:"Torrent Pharmaceuticals Ltd.",sector:"Pharma",series:"EQ",isin:"INE685A01028"},
  {symbol:"LUPIN",name:"Lupin Ltd.",sector:"Pharma",series:"EQ",isin:"INE326A01037"},
  {symbol:"BIOCON",name:"Biocon Ltd.",sector:"Pharma",series:"EQ",isin:"INE376G01013"},
  {symbol:"TATAPOWER",name:"Tata Power Company Ltd.",sector:"Power",series:"EQ",isin:"INE245A01021"},
  {symbol:"ADANIGREEN",name:"Adani Green Energy Ltd.",sector:"Renewable Energy",series:"EQ",isin:"INE364U01010"},
  {symbol:"ADANIENT",name:"Adani Enterprises Ltd.",sector:"Diversified",series:"EQ",isin:"INE423A01024"},
  {symbol:"HINDPETRO",name:"Hindustan Petroleum Corporation Ltd.",sector:"Energy",series:"EQ",isin:"INE094A01015"},
  {symbol:"IOC",name:"Indian Oil Corporation Ltd.",sector:"Energy",series:"EQ",isin:"INE242A01010"},
  {symbol:"GAIL",name:"GAIL (India) Ltd.",sector:"Gas",series:"EQ",isin:"INE129A01019"},
  {symbol:"IGL",name:"Indraprastha Gas Ltd.",sector:"Gas",series:"EQ",isin:"INE203G01027"},
  {symbol:"PETRONET",name:"Petronet LNG Ltd.",sector:"Gas",series:"EQ",isin:"INE347G01014"},
  {symbol:"DLF",name:"DLF Ltd.",sector:"Realty",series:"EQ",isin:"INE271C01023"},
  {symbol:"GODREJPROP",name:"Godrej Properties Ltd.",sector:"Realty",series:"EQ",isin:"INE484J01027"},
  {symbol:"OBEROIRLTY",name:"Oberoi Realty Ltd.",sector:"Realty",series:"EQ",isin:"INE093I01010"},
  {symbol:"SUNTV",name:"Sun TV Network Ltd.",sector:"Media",series:"EQ",isin:"INE424H01027"},
  {symbol:"ZEEL",name:"Zee Entertainment Enterprises Ltd.",sector:"Media",series:"EQ",isin:"INE256A01028"},
  {symbol:"INDHOTEL",name:"Indian Hotels Company Ltd.",sector:"Hotels",series:"EQ",isin:"INE053A01029"},
  {symbol:"JUBLFOOD",name:"Jubilant Foodworks Ltd.",sector:"QSR",series:"EQ",isin:"INE797F01020"},
  {symbol:"DMART",name:"Avenue Supermarts Ltd.",sector:"Retail",series:"EQ",isin:"INE192R01011"},
  {symbol:"TRENT",name:"Trent Ltd.",sector:"Retail",series:"EQ",isin:"INE849A01020"},
  {symbol:"MRF",name:"MRF Ltd.",sector:"Auto Ancillary",series:"EQ",isin:"INE883A01011"},
  {symbol:"APOLLOTYRE",name:"Apollo Tyres Ltd.",sector:"Auto Ancillary",series:"EQ",isin:"INE438A01022"},
  {symbol:"TVSMOTOR",name:"TVS Motor Company Ltd.",sector:"Auto",series:"EQ",isin:"INE494B01023"},
  {symbol:"BAJAJ-AUTO",name:"Bajaj Auto Ltd.",sector:"Auto",series:"EQ",isin:"INE917I01010"},
  {symbol:"ASHOKLEY",name:"Ashok Leyland Ltd.",sector:"Auto",series:"EQ",isin:"INE208A01029"},
  {symbol:"ISEC",name:"ICICI Securities Ltd.",sector:"Capital Markets",series:"EQ",isin:"INE763G01038"},
  {symbol:"ANGELONE",name:"Angel One Ltd.",sector:"Capital Markets",series:"EQ",isin:"INE732I01013"},
  {symbol:"MOTILALOFS",name:"Motilal Oswal Financial Services Ltd.",sector:"Capital Markets",series:"EQ",isin:"INE338I01027"},
  {symbol:"IIFL",name:"IIFL Finance Ltd.",sector:"NBFC",series:"EQ",isin:"INE530B01024"},
  {symbol:"MANAPPURAM",name:"Manappuram Finance Ltd.",sector:"NBFC",series:"EQ",isin:"INE522D01027"},
  {symbol:"SRTRANSFIN",name:"Shriram Finance Ltd.",sector:"NBFC",series:"EQ",isin:"INE721A01013"},
  {symbol:"BSE",name:"BSE Ltd.",sector:"Capital Markets",series:"EQ",isin:"INE118H01025"},
  {symbol:"MCX",name:"Multi Commodity Exchange of India Ltd.",sector:"Capital Markets",series:"EQ",isin:"INE745G01035"},
  {symbol:"CDSL",name:"Central Depository Services (India) Ltd.",sector:"Financial Services",series:"EQ",isin:"INE736A01011"},
  {symbol:"SRF",name:"SRF Ltd.",sector:"Chemicals",series:"EQ",isin:"INE647A01010"},
  {symbol:"DEEPAKNITR",name:"Deepak Nitrite Ltd.",sector:"Chemicals",series:"EQ",isin:"INE288B01029"},
  {symbol:"TATACHEM",name:"Tata Chemicals Ltd.",sector:"Chemicals",series:"EQ",isin:"INE092A01019"},
  {symbol:"COLPAL",name:"Colgate-Palmolive (India) Ltd.",sector:"FMCG",series:"EQ",isin:"INE259A01022"},
  {symbol:"MARICO",name:"Marico Ltd.",sector:"FMCG",series:"EQ",isin:"INE196A01026"},
  {symbol:"ZYDUSLIFE",name:"Zydus Lifesciences Ltd.",sector:"Pharma",series:"EQ",isin:"INE010B01027"},
  {symbol:"PAGEIND",name:"Page Industries Ltd.",sector:"Textile",series:"EQ",isin:"INE761H01022"},
  {symbol:"NAUKRI",name:"Info Edge (India) Ltd.",sector:"Internet",series:"EQ",isin:"INE663F01024"},
  {symbol:"INDIAMART",name:"Indiamart Intermesh Ltd.",sector:"Internet",series:"EQ",isin:"INE933S01016"},
  {symbol:"UPL",name:"UPL Ltd.",sector:"Agri",series:"EQ",isin:"INE628A01036"},
  {symbol:"COROMANDEL",name:"Coromandel International Ltd.",sector:"Agri",series:"EQ",isin:"INE169A01031"},
  {symbol:"PI",name:"PI Industries Ltd.",sector:"Agri",series:"EQ",isin:"INE603J01030"},
  {symbol:"CHAMBLFERT",name:"Chambal Fertilizers and Chemicals Ltd.",sector:"Chemicals",series:"EQ",isin:"INE085A01013"},
];

function genStockPrice(idx) {
  const base=100+seed(idx*31+7)*4900, change=(seed(idx*19+3)-0.47)*8;
  return {price:+base.toFixed(2),change:+change.toFixed(2),volume:Math.round((seed(idx*13+5)*5000000)+100000),mktCap:+(base*(seed(idx*7+2)*5000+500)).toFixed(0)};
}
const NSE_STOCKS_WITH_PRICES = NSE_STOCKS.map((s,i)=>({...s,...genStockPrice(i)}));
const ALL_SECTORS_NSE = ["All",...Array.from(new Set(NSE_STOCKS.map(s=>s.sector))).sort()];

// ─── TOOLTIP STYLE ────────────────────────────────────────────────────────────
const ttStyle = {background:"#0a0e1a",border:"1px solid rgba(0,212,255,0.2)",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:11,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"};

const OHLCTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  const d=payload[0]?.payload; if(!d) return null;
  return <div style={ttStyle}><div style={{color:"#6b7280",marginBottom:6,fontSize:10}}>{label}</div>
    {[["O",d.open,"#94a3b8"],["H",d.high,"#10b981"],["L",d.low,"#f43f5e"],["C",d.close,d.close>=d.open?"#10b981":"#f43f5e"]].map(([k,v,c])=>(
      <div key={k} style={{color:c,marginBottom:2,fontFamily:"'DM Mono',monospace"}}>{k}: ₹{v?.toLocaleString("en-IN")}</div>))}
    <div style={{color:"#4b5563",marginTop:4}}>Vol: {d.volume?.toLocaleString("en-IN")}</div></div>;
};
const IndexTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return <div style={ttStyle}><div style={{color:"#6b7280",marginBottom:6,fontSize:10}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.color,marginBottom:2,fontFamily:"'DM Mono',monospace"}}>{p.name.toUpperCase()}: {p.value?.toLocaleString("en-IN")}</div>)}</div>;
};
const FIITooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return <div style={ttStyle}><div style={{color:"#6b7280",marginBottom:6,fontSize:10}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.dataKey==="fii"?"#7c3aed":p.dataKey==="dii"?"#10b981":"#f97316",marginBottom:2,fontFamily:"'DM Mono',monospace"}}>
      {p.name.toUpperCase()}: ₹{Math.abs(p.value).toLocaleString("en-IN")} Cr {p.value<0?"(Sell)":"(Buy)"}</div>)}</div>;
};

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const StatCard = ({label,value,sub,color="#0f172a",delay=0}) => (
  <div style={{background:"#fff",borderRadius:16,padding:"18px 20px",border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",animation:`slideUp 0.5s ease ${delay}s both`,position:"relative",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s",cursor:"default"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.1)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.05)";}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color}55,${color})`}}/>
    <div style={{fontSize:9,color:"#94a3b8",letterSpacing:".14em",marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{label}</div>
    <div style={{fontSize:20,fontWeight:800,color,fontFamily:"'Orbitron',monospace",letterSpacing:"-0.01em",lineHeight:1.2}}>{value}</div>
    {sub && <div style={{fontSize:10,color:"#94a3b8",marginTop:5,fontFamily:"'DM Sans',sans-serif"}}>{sub}</div>}
  </div>
);

const SectionHeader = ({title,sub}) => (
  <div style={{marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:3,height:18,background:"linear-gradient(180deg,#00d4ff,#7c3aed)",borderRadius:2}}/>
      <span style={{fontSize:11,fontWeight:700,color:"#0f172a",letterSpacing:".12em",fontFamily:"'DM Sans',sans-serif"}}>{title}</span>
    </div>
    {sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:3,marginLeft:13,fontFamily:"'DM Sans',sans-serif"}}>{sub}</div>}
  </div>
);

const Card = ({children,style={}}) => (
  <div style={{background:"#fff",borderRadius:16,padding:"22px 24px",border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",...style}}>{children}</div>
);

// ─── NSE TAB ──────────────────────────────────────────────────────────────────
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
    <th onClick={()=>ts(k)} style={{textAlign:right?"right":"left",padding:"10px 14px",color:sortKey===k?"#00d4ff":"#64748b",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #f1f5f9",cursor:"pointer",whiteSpace:"nowrap",userSelect:"none",background:"#f8faff",fontFamily:"'DM Sans',sans-serif"}}>
      {label}{sortKey===k?(sortDir===1?" ↑":" ↓"):""}
    </th>
  );

  return (
    <div style={{animation:"slideUp 0.4s ease both"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
        <StatCard label="TOTAL LISTED" value={NSE_STOCKS_WITH_PRICES.length} color="#7c3aed" sub="NSE Equity" delay={0}/>
        <StatCard label="GAINERS" value={gainers} color="#10b981" sub="Advancing" delay={0.05}/>
        <StatCard label="LOSERS" value={losers} color="#f43f5e" sub="Declining" delay={0.1}/>
        <StatCard label="UNCHANGED" value={unchanged} color="#64748b" sub="Flat" delay={0.15}/>
        <StatCard label="SECTORS" value={ALL_SECTORS_NSE.length-1} color="#00d4ff" sub="Categories" delay={0.2}/>
      </div>

      <Card style={{marginBottom:16}}>
        <SectionHeader title="ADVANCE / DECLINE" sub="Market breadth snapshot"/>
        <div style={{display:"flex",height:10,borderRadius:6,overflow:"hidden",gap:2}}>
          <div style={{flex:gainers,background:"linear-gradient(90deg,#10b981,#34d399)",borderRadius:"6px 0 0 6px",transition:"flex 1.2s ease"}}/>
          <div style={{flex:unchanged,background:"#e2e8f0",transition:"flex 1.2s ease"}}/>
          <div style={{flex:losers,background:"linear-gradient(90deg,#f43f5e,#fb7185)",borderRadius:"0 6px 6px 0",transition:"flex 1.2s ease"}}/>
        </div>
        <div style={{display:"flex",gap:24,marginTop:10}}>
          {[["▲ Gainers","#10b981",gainers],["— Unchanged","#94a3b8",unchanged],["▼ Losers","#f43f5e",losers]].map(([l,c,v])=>(
            <span key={l} style={{fontSize:10,color:c,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{l}: {v}</span>))}
        </div>
      </Card>

      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:"1 1 220px"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:14}}>⌕</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Search symbol, name or ISIN…"
            style={{width:"100%",background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"9px 12px 9px 34px",color:"#0f172a",fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s,box-shadow 0.2s"}}
            onFocus={e=>{e.target.style.borderColor="#00d4ff";e.target.style.boxShadow="0 0 0 3px rgba(0,212,255,0.1)";}}
            onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}/>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {ALL_SECTORS_NSE.slice(0,9).map(s=>(
            <button key={s} onClick={()=>{setSectorFilter(s);setPage(0);}}
              style={{background:sectorFilter===s?"linear-gradient(135deg,#00d4ff22,#7c3aed22)":"#fff",border:sectorFilter===s?"1px solid #00d4ff":"1px solid #e2e8f0",borderRadius:8,padding:"5px 12px",fontSize:9,color:sectorFilter===s?"#0891b2":"#64748b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:".06em",transition:"all 0.2s"}}>{s}</button>))}
          {ALL_SECTORS_NSE.length>9&&(
            <select onChange={e=>{setSectorFilter(e.target.value);setPage(0);}} value={sectorFilter}
              style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,color:"#64748b",fontSize:9,padding:"5px 10px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer",outline:"none"}}>
              {ALL_SECTORS_NSE.slice(9).map(s=><option key={s} value={s}>{s}</option>)}
            </select>)}
        </div>
      </div>

      <div style={{fontSize:9,color:"#94a3b8",letterSpacing:".1em",marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
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
              <th style={{textAlign:"right",padding:"10px 14px",color:"#64748b",fontSize:9,borderBottom:"1px solid #f1f5f9",letterSpacing:".1em",background:"#f8faff",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>ISIN</th>
            </tr></thead>
            <tbody>
              {pd.map((stock,i)=>{
                const isUp=stock.change>=0, ri=page*PS+i;
                return <tr key={stock.symbol} onMouseEnter={()=>setHovered(ri)} onMouseLeave={()=>setHovered(null)}
                  style={{borderBottom:"1px solid #f8fafc",background:hovered===ri?"#f0f9ff":"transparent",transition:"background 0.15s"}}>
                  <td style={{padding:"10px 14px",color:"#cbd5e1",fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>{ri+1}</td>
                  <td style={{padding:"10px 14px",fontWeight:700,color:"#0891b2",fontFamily:"'DM Mono',monospace",fontSize:12,whiteSpace:"nowrap"}}>{stock.symbol}</td>
                  <td style={{padding:"10px 14px",color:"#475569",fontFamily:"'DM Sans',sans-serif",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stock.name}</td>
                  <td style={{padding:"10px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:9,background:"#f1f5f9",color:"#64748b",border:"1px solid #e2e8f0",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",fontWeight:600}}>{stock.sector}</span></td>
                  <td style={{padding:"10px 14px",color:"#94a3b8",textAlign:"center",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>{stock.series}</td>
                  <td style={{padding:"10px 14px",color:"#0f172a",textAlign:"right",fontWeight:700,fontFamily:"'DM Mono',monospace"}}>₹{stock.price.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",textAlign:"right"}}><span style={{color:isUp?"#10b981":"#f43f5e",fontWeight:700,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3}}>{isUp?"▲":"▼"}{Math.abs(stock.change).toFixed(2)}%</span></td>
                  <td style={{padding:"10px 14px",color:"#64748b",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11}}>{stock.volume.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",color:"#64748b",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11}}>{stock.mktCap.toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px 14px",color:"#cbd5e1",textAlign:"right",fontSize:9,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{stock.isin}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:18,alignItems:"center",flexWrap:"wrap"}}>
        {[["«",()=>setPage(0),page===0],["‹",()=>setPage(p=>Math.max(0,p-1)),page===0]].map(([l,fn,d])=>(
          <button key={l} onClick={fn} disabled={d} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 12px",cursor:d?"not-allowed":"pointer",color:d?"#cbd5e1":"#475569",opacity:d?0.4:1,fontSize:14}}>{l}</button>))}
        {Array.from({length:Math.min(7,tp)},(_,i)=>{
          let pg=i;
          if(tp>7){if(page<4)pg=i;else if(page>tp-5)pg=tp-7+i;else pg=page-3+i;}
          return <button key={pg} onClick={()=>setPage(pg)} style={{background:page===pg?"linear-gradient(135deg,#00d4ff,#7c3aed)":"#fff",border:page===pg?"none":"1px solid #e2e8f0",borderRadius:8,padding:"6px 0",minWidth:34,cursor:"pointer",color:page===pg?"#fff":"#475569",fontWeight:page===pg?700:400,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{pg+1}</button>;
        })}
        {[["›",()=>setPage(p=>Math.min(tp-1,p+1)),page>=tp-1],["»",()=>setPage(tp-1),page>=tp-1]].map(([l,fn,d])=>(
          <button key={l} onClick={fn} disabled={d} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 12px",cursor:d?"not-allowed":"pointer",color:d?"#cbd5e1":"#475569",opacity:d?0.4:1,fontSize:14}}>{l}</button>))}
        <span style={{fontSize:10,color:"#94a3b8",marginLeft:6,fontFamily:"'DM Sans',sans-serif"}}>Page {page+1} / {tp}</span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
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
  const axTick={fill:"#94a3b8",fontSize:9,fontFamily:"DM Sans"};
  const grid=<CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false}/>;
  const TABS=[["ohlcv","📈","OHLCV"],["index","📊","Indices"],["sector","🏭","Sectors"],["fiidii","💰","FII/DII"],["nse","📋","NSE All"]];

  return (
    <div style={{minHeight:"100vh",background:"#f5f7ff",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,212,255,0.4)}50%{box-shadow:0 0 22px rgba(0,212,255,0.7),0 0 40px rgba(124,58,237,0.3)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 16px;cursor:pointer;border:none;background:transparent;color:#4b5563;transition:all 0.25s;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;position:relative}
        .nav-btn:hover{color:#00d4ff;background:rgba(0,212,255,0.08)}
        .nav-btn.on{color:#00d4ff;background:rgba(0,212,255,0.12)}
        .nav-btn.on::after{content:'';position:absolute;bottom:0;left:25%;right:25%;height:2px;background:linear-gradient(90deg,transparent,#00d4ff,transparent);border-radius:2px}
        .rbtn{background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:7px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;padding:5px 12px;color:#6b7280;transition:all 0.2s;font-weight:500}
        .rbtn:hover{border-color:#00d4ff;color:#00d4ff}
        .rbtn.on{border-color:#00d4ff;color:#0a0e1a;background:#00d4ff;font-weight:700}
        .sbtn{background:#fff;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;padding:5px 14px;color:#64748b;transition:all 0.2s;font-weight:500}
        .sbtn:hover{border-color:#00d4ff;color:#0891b2}
        .sbtn.on{background:linear-gradient(135deg,#00d4ff,#0891b2);border-color:transparent;color:#fff;font-weight:700}
        .secbtn{border:1px solid transparent;border-radius:20px;cursor:pointer;font-size:10px;padding:4px 12px;transition:all 0.2s;opacity:0.4;background:#fff;font-weight:600;font-family:'DM Sans',sans-serif}
        .secbtn.on{opacity:1!important;border-color:currentColor}
        input::placeholder{color:#cbd5e1}
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav style={{background:"linear-gradient(135deg,#0a0e1a 0%,#0f1628 100%)",borderBottom:"1px solid rgba(0,212,255,0.12)",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 30px rgba(0,0,0,0.5)",flexWrap:"wrap",gap:8}}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0"}}>
          <div style={{width:38,height:38,background:"linear-gradient(135deg,#00d4ff,#7c3aed)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:"#fff",fontWeight:900,animation:"glow 3s infinite",flexShrink:0}}>वे</div>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,letterSpacing:".08em",color:"#fff",lineHeight:1}}>VEDARTHA<span style={{color:"#00d4ff"}}>.IN</span></div>
            <div style={{fontSize:7,color:"rgba(0,212,255,0.45)",letterSpacing:".22em",marginTop:2}}>KNOWLEDGE OF WEALTH</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:20,marginLeft:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#10b981",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:8,color:"#10b981",letterSpacing:".1em",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>LIVE</span>
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
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".2em",marginRight:4,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>RANGE</span>
            {RANGES.map((r,i)=>(
              <button key={r.label} className={`rbtn${range===i?" on":""}`} onClick={()=>setRangeIdx(i)}>{r.label}</button>))}
          </div>)}
      </nav>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <main style={{maxWidth:1300,margin:"0 auto",padding:"28px 20px 60px"}}>

        {/* Page header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <div style={{animation:"slideUp 0.4s ease both"}}>
            <h1 style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#0f172a",letterSpacing:".04em",lineHeight:1.1}}>
              {tab==="ohlcv"&&`${stock} · OHLCV`}
              {tab==="index"&&"INDEX HISTORY"}
              {tab==="sector"&&"SECTOR PERFORMANCE"}
              {tab==="fiidii"&&"FII / DII FLOWS"}
              {tab==="nse"&&"NSE ALL LISTINGS"}
            </h1>
            <p style={{fontSize:11,color:"#94a3b8",marginTop:5,fontFamily:"'DM Sans',sans-serif"}}>
              {tab==="ohlcv"&&`Historical price data · ${RANGES[range].label} range`}
              {tab==="index"&&`Nifty 50 & Sensex · ${RANGES[range].label} range`}
              {tab==="sector"&&`8 sector performance · ${RANGES[range].label} range`}
              {tab==="fiidii"&&`Institutional flows · ${RANGES[range].label} range`}
              {tab==="nse"&&`${NSE_STOCKS_WITH_PRICES.length}+ equity symbols · All sectors`}
            </p>
          </div>
        </div>

        {/* NSE */}
        {tab==="nse"&&<NSEListingsTab/>}

        {/* OHLCV */}
        {tab==="ohlcv"&&(
          <div key={`ov${animKey}`} style={{animation:"slideUp 0.4s ease both"}}>
            <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:9,color:"#94a3b8",letterSpacing:".15em",marginRight:4,fontWeight:700}}>SELECT STOCK</span>
              {Object.keys(STOCKS).map(s=><button key={s} className={`sbtn${stock===s?" on":""}`} onClick={()=>setStock(s)}>{s}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
              <StatCard label="LAST CLOSE" value={`₹${ohlcvStats.last?.toLocaleString("en-IN")}`} color="#0f172a" delay={0}/>
              <StatCard label="PERIOD RETURN" value={`${ohlcvStats.change>0?"+":""}${ohlcvStats.change}%`} color={ohlcvStats.change>0?"#10b981":"#f43f5e"} delay={0.05}/>
              <StatCard label="PERIOD HIGH" value={`₹${ohlcvStats.high?.toLocaleString("en-IN")}`} color="#10b981" delay={0.1}/>
              <StatCard label="PERIOD LOW" value={`₹${ohlcvStats.low?.toLocaleString("en-IN")}`} color="#f43f5e" delay={0.15}/>
              <StatCard label="AVG VOLUME" value={ohlcvStats.avgVol?.toLocaleString("en-IN")} color="#7c3aed" delay={0.2}/>
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title={`CLOSE PRICE · ${stock}`} sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={thin(ohlcvData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00d4ff" stopOpacity={0.15}/><stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/></linearGradient></defs>
                  {grid}
                  <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(ohlcvData).length/6)}/>
                  <YAxis domain={["auto","auto"]} tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v.toLocaleString("en-IN")}`} width={74}/>
                  <Tooltip content={<OHLCTooltip/>}/>
                  <Area type="monotone" dataKey="close" stroke="#00d4ff" strokeWidth={2.5} fill="url(#cg)" dot={false} activeDot={{r:5,fill:"#00d4ff",stroke:"#fff",strokeWidth:2}}/>
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
                  <Tooltip formatter={v=>[v.toLocaleString("en-IN"),"Volume"]} contentStyle={ttStyle}/>
                  <Bar dataKey="volume" radius={[3,3,0,0]}>
                    {thin(ohlcvData).map((d,i)=><Cell key={i} fill={d.close>=d.open?"#10b98144":"#f43f5e44"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{overflowX:"auto"}}>
              <SectionHeader title="OHLCV TABLE" sub="Last 12 entries"/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["Date","Open","High","Low","Close","Volume","Change"].map(h=>(
                  <th key={h} style={{textAlign:"right",padding:"7px 12px",color:"#94a3b8",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #f1f5f9",fontFamily:"'DM Sans',sans-serif"}}>{h}</th>))}</tr></thead>
                <tbody>{[...ohlcvData].reverse().slice(0,12).map((d,i)=>{
                  const chg=((d.close-d.open)/d.open*100).toFixed(2);
                  return <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                    <td style={{padding:"9px 12px",color:"#94a3b8",textAlign:"right",fontFamily:"'DM Sans',sans-serif"}}>{d.date}</td>
                    <td style={{padding:"9px 12px",color:"#475569",textAlign:"right",fontFamily:"'DM Mono',monospace"}}>₹{d.open.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#10b981",textAlign:"right",fontFamily:"'DM Mono',monospace"}}>₹{d.high.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#f43f5e",textAlign:"right",fontFamily:"'DM Mono',monospace"}}>₹{d.low.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.close>=d.open?"#10b981":"#f43f5e",fontWeight:700,textAlign:"right",fontFamily:"'DM Mono',monospace"}}>₹{d.close.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:"#94a3b8",textAlign:"right",fontFamily:"'DM Mono',monospace"}}>{d.volume.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:chg>=0?"#10b981":"#f43f5e",textAlign:"right",fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{chg>0?"+":""}{chg}%</td>
                  </tr>;})}</tbody>
              </table>
            </Card>
          </div>
        )}

        {/* INDEX */}
        {tab==="index"&&(
          <div key={`ix${animKey}`} style={{animation:"slideUp 0.4s ease both"}}>
            {(()=>{
              const first=indexData[0],last=indexData[indexData.length-1];
              const nC=((last.nifty-first.nifty)/first.nifty*100).toFixed(2), sC=((last.sensex-first.sensex)/first.sensex*100).toFixed(2);
              return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
                <StatCard label="NIFTY 50" value={last.nifty.toLocaleString("en-IN")} color="#7c3aed" delay={0}/>
                <StatCard label="SENSEX" value={last.sensex.toLocaleString("en-IN")} color="#f97316" delay={0.05}/>
                <StatCard label={`NIFTY ${RANGES[range].label}`} value={`${nC>0?"+":""}${nC}%`} color={nC>0?"#10b981":"#f43f5e"} delay={0.1}/>
                <StatCard label={`SENSEX ${RANGES[range].label}`} value={`${sC>0?"+":""}${sC}%`} color={sC>0?"#10b981":"#f43f5e"} delay={0.15}/>
              </div>;
            })()}
            <Card style={{marginBottom:16}}>
              <SectionHeader title="NIFTY 50" sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={thin(indexData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(indexData).length/6)}/>
                  <YAxis domain={["auto","auto"]} tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>v.toLocaleString("en-IN")} width={70}/>
                  <Tooltip content={<IndexTooltip/>}/>
                  <Area type="monotone" dataKey="nifty" stroke="#7c3aed" strokeWidth={2.5} fill="url(#ng)" dot={false} activeDot={{r:5,fill:"#7c3aed",stroke:"#fff",strokeWidth:2}}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="SENSEX" sub={`${RANGES[range].label} trend`}/>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={thin(indexData)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
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
                  <Tooltip contentStyle={ttStyle}/><ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="4 4"/>
                  <Line type="monotone" dataKey="niftyN" name="NIFTY" stroke="#7c3aed" strokeWidth={2.5} dot={false}/>
                  <Line type="monotone" dataKey="sensexN" name="SENSEX" stroke="#f97316" strokeWidth={2.5} dot={false}/>
                  <Legend wrapperStyle={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#94a3b8"}}/>
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* SECTOR */}
        {tab==="sector"&&(
          <div key={`se${animKey}`} style={{animation:"slideUp 0.4s ease both"}}>
            <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:9,color:"#94a3b8",letterSpacing:".15em",marginRight:4,fontWeight:700}}>SECTORS</span>
              {SECTORS.map((s,i)=>(
                <button key={s} className={`secbtn${activeSectors.includes(s)?" on":""}`}
                  style={{color:SECTOR_COLORS[i],background:activeSectors.includes(s)?`${SECTOR_COLORS[i]}18`:"#fff"}}
                  onClick={()=>toggleSector(s)}>{s}</button>))}
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="CUMULATIVE RETURN" sub={`${RANGES[range].label} total return`}/>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SECTORS.filter(s=>activeSectors.includes(s)).map(s=>({name:s,value:parseFloat(sectorCumul[s]),color:SECTOR_COLORS[SECTORS.indexOf(s)]}))} margin={{top:4,right:4,bottom:0,left:0}}>
                  {grid}<XAxis dataKey="name" tick={{...axTick,fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} width={40}/>
                  <ReferenceLine y={0} stroke="#e2e8f0"/>
                  <Tooltip formatter={v=>[`${v}%`,"Return"]} contentStyle={ttStyle}/>
                  <Bar dataKey="value" radius={[5,5,0,0]}>
                    {SECTORS.filter(s=>activeSectors.includes(s)).map(s=>(
                      <Cell key={s} fill={SECTOR_COLORS[SECTORS.indexOf(s)]} fillOpacity={parseFloat(sectorCumul[s])>=0?0.9:0.5}/>))}
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
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4"/>
                  <Tooltip contentStyle={ttStyle}/>
                  {activeSectors.map(s=><Line key={s} type="monotone" dataKey={s} stroke={SECTOR_COLORS[SECTORS.indexOf(s)]} strokeWidth={2} dot={false}/>)}
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionHeader title="SECTOR LEADERBOARD" sub={`Ranked by ${RANGES[range].label} return`}/>
              {[...SECTORS].sort((a,b)=>parseFloat(sectorCumul[b])-parseFloat(sectorCumul[a])).map((s,i)=>{
                const val=parseFloat(sectorCumul[s]), color=SECTOR_COLORS[SECTORS.indexOf(s)];
                const maxAbs=Math.max(...SECTORS.map(x=>Math.abs(parseFloat(sectorCumul[x]))));
                return <div key={s} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:i<SECTORS.length-1?"1px solid #f8fafc":"none"}}>
                  <div style={{width:22,fontSize:10,color:"#cbd5e1",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700}}>#{i+1}</div>
                  <div style={{width:64,fontSize:12,color,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{s}</div>
                  <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(Math.abs(val)/maxAbs)*100}%`,background:val>=0?`linear-gradient(90deg,${color}66,${color})`:"linear-gradient(90deg,#f43f5e66,#f43f5e)",borderRadius:4,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
                  </div>
                  <div style={{width:72,textAlign:"right",fontSize:13,fontWeight:800,color:val>=0?"#10b981":"#f43f5e",fontFamily:"'DM Mono',monospace"}}>{val>=0?"+":""}{val}%</div>
                </div>;
              })}
            </Card>
          </div>
        )}

        {/* FII/DII */}
        {tab==="fiidii"&&(
          <div key={`fi${animKey}`} style={{animation:"slideUp 0.4s ease both"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
              <StatCard label="TOTAL FII" value={`₹${Math.abs(fiiStats.totalFII).toLocaleString("en-IN")} Cr`} color={fiiStats.totalFII>=0?"#10b981":"#f43f5e"} sub={fiiStats.totalFII>=0?"Net Buying":"Net Selling"} delay={0}/>
              <StatCard label="TOTAL DII" value={`₹${Math.abs(fiiStats.totalDII).toLocaleString("en-IN")} Cr`} color={fiiStats.totalDII>=0?"#10b981":"#f43f5e"} sub={fiiStats.totalDII>=0?"Net Buying":"Net Selling"} delay={0.05}/>
              <StatCard label="NET COMBINED" value={`₹${Math.abs(fiiStats.net).toLocaleString("en-IN")} Cr`} color={fiiStats.net>=0?"#10b981":"#f43f5e"} sub={fiiStats.net>=0?"Positive":"Negative"} delay={0.1}/>
              <StatCard label="FII BUY MONTHS" value={`${fiiStats.fiiBuyPct}%`} color="#7c3aed" sub={`of ${months} months`} delay={0.15}/>
            </div>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="FII vs DII FLOWS" sub={`${RANGES[range].label} monthly activity (₹ Cr)`}/>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={thin(fiiData,48)} margin={{top:4,right:4,bottom:0,left:0}} barCategoryGap="20%">
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(fiiData,48).length/7)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${v>0?"+":""}${(v/1000).toFixed(0)}K`} width={48}/>
                  <ReferenceLine y={0} stroke="#e2e8f0"/>
                  <Tooltip content={<FIITooltip/>}/>
                  <Bar dataKey="fii" name="FII" radius={[3,3,0,0]}>{thin(fiiData,48).map((d,i)=><Cell key={i} fill={d.fii>=0?"#7c3aed":"#c4b5fd"}/>)}</Bar>
                  <Bar dataKey="dii" name="DII" radius={[3,3,0,0]}>{thin(fiiData,48).map((d,i)=><Cell key={i} fill={d.dii>=0?"#10b981":"#a7f3d0"}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:20,marginTop:10}}>
                {[["■ FII/FPI","#7c3aed"],["■ DII (MF+Ins)","#10b981"]].map(([l,c])=>(
                  <span key={l} style={{fontSize:10,color:c,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{l}</span>))}
              </div>
            </Card>
            <Card style={{marginBottom:16}}>
              <SectionHeader title="NET COMBINED FLOW" sub={`${RANGES[range].label} net activity`}/>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={thin(fiiData,48)} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs><linearGradient id="netg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                  {grid}<XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} interval={Math.floor(thin(fiiData,48).length/7)}/>
                  <YAxis tick={axTick} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={42}/>
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4"/>
                  <Tooltip formatter={v=>[`₹${v.toLocaleString("en-IN")} Cr`,"Net Flow"]} contentStyle={ttStyle}/>
                  <Area type="monotone" dataKey="net" stroke="#f97316" strokeWidth={2.5} fill="url(#netg)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{overflowX:"auto"}}>
              <SectionHeader title="FLOW TABLE" sub="Last 12 months"/>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["Month","FII Flow (₹ Cr)","DII Flow (₹ Cr)","Net Flow","Bias"].map(h=>(
                  <th key={h} style={{textAlign:"right",padding:"7px 12px",color:"#94a3b8",fontWeight:700,fontSize:9,letterSpacing:".1em",borderBottom:"1px solid #f1f5f9",fontFamily:"'DM Sans',sans-serif"}}>{h}</th>))}</tr></thead>
                <tbody>{[...fiiData].reverse().slice(0,12).map((d,i)=>{
                  const bias=d.fii>0&&d.dii>0?"Both Buy":d.fii<0&&d.dii<0?"Both Sell":d.fii>0?"FII Buy":"DII Buy";
                  const bc=bias==="Both Buy"?"#10b981":bias==="Both Sell"?"#f43f5e":"#f97316";
                  return <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                    <td style={{padding:"9px 12px",color:"#94a3b8",textAlign:"right",fontFamily:"'DM Sans',sans-serif"}}>{d.date}</td>
                    <td style={{padding:"9px 12px",color:d.fii>=0?"#7c3aed":"#a78bfa",textAlign:"right",fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{d.fii>=0?"+":""}{d.fii.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.dii>=0?"#10b981":"#6ee7b7",textAlign:"right",fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{d.dii>=0?"+":""}{d.dii.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",color:d.net>=0?"#f97316":"#f43f5e",textAlign:"right",fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{d.net>=0?"+":""}{d.net.toLocaleString("en-IN")}</td>
                    <td style={{padding:"9px 12px",textAlign:"right"}}>
                      <span style={{padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:700,background:`${bc}15`,color:bc,border:`1px solid ${bc}33`,fontFamily:"'DM Sans',sans-serif",letterSpacing:".06em"}}>{bias.toUpperCase()}</span>
                    </td>
                  </tr>;})}</tbody>
              </table>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{background:"linear-gradient(135deg,#0a0e1a,#0f1628)",borderTop:"1px solid rgba(0,212,255,0.1)",padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>VEDARTHA<span style={{color:"rgba(0,212,255,0.35)"}}>.IN</span></div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.18)",fontFamily:"'DM Sans',sans-serif"}}>Simulated data · Not financial advice</div>
        <div style={{fontSize:9,color:"rgba(0,212,255,0.28)",fontFamily:"'DM Mono',monospace",letterSpacing:".12em"}}>वेदार्थ · KNOWLEDGE OF WEALTH</div>
      </footer>
    </div>
  );
}