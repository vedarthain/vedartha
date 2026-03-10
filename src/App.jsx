import { useState, useMemo, useEffect } from "react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, BarChart, LineChart, Legend, Cell, ReferenceLine
} from "recharts";

// ─── DATA GENERATORS ──────────────────────────────────────────────────────────

function seed(s) { let x = Math.sin(s) * 10000; return x - Math.floor(x); }

function genOHLCV(basePrice, months, vol = 0.03) {
  const data = [];
  let close = basePrice;
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const startYear = 2020;
  for (let i = 0; i < months; i++) {
    const yr = startYear + Math.floor(i / 12);
    const mo = i % 12;
    const r1 = seed(i * 7 + 1), r2 = seed(i * 7 + 2), r3 = seed(i * 7 + 3), r4 = seed(i * 7 + 4);
    const open = close;
    close = open * (1 + (r1 - 0.47) * vol);
    const high = Math.max(open, close) * (1 + r2 * vol * 0.5);
    const low  = Math.min(open, close) * (1 - r3 * vol * 0.5);
    const volume = Math.round((r4 * 8000 + 2000) * 10);
    data.push({ date: `${labels[mo]} ${yr}`, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume });
  }
  return data;
}

function genIndex(base, months, drift = 0.008) {
  const data = [];
  let val = base;
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const startYear = 2020;
  for (let i = 0; i < months; i++) {
    val = val * (1 + (seed(i * 13 + 5) - 0.46) * 0.04 + drift * 0.1);
    const yr = startYear + Math.floor(i / 12);
    data.push({ date: `${labels[i%12]} ${yr}`, nifty: +val.toFixed(2), sensex: +(val * 3.33).toFixed(2) });
  }
  return data;
}

const SECTORS = ["IT","Banking","Auto","Pharma","Energy","FMCG","Metal","Realty"];
const SECTOR_COLORS = ["#38bdf8","#818cf8","#f97316","#22c55e","#fb7185","#fbbf24","#a78bfa","#34d399"];

function genSectorPerf(months) {
  return Array.from({ length: months }, (_, i) => {
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const yr = 2020 + Math.floor(i / 12);
    const row = { date: `${labels[i%12]} ${yr}` };
    SECTORS.forEach((s, si) => {
      row[s] = +((seed(i * 17 + si * 3 + 1) - 0.45) * 12).toFixed(2);
    });
    return row;
  });
}

function genFIIDII(months) {
  const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const startYear = 2020;
  return Array.from({ length: months }, (_, i) => {
    const yr = startYear + Math.floor(i / 12);
    const fii = +((seed(i * 11 + 3) - 0.48) * 25000).toFixed(0);
    const dii = +((seed(i * 11 + 7) - 0.44) * 18000).toFixed(0);
    return { date: `${labels[i%12]} ${yr}`, fii, dii, net: fii + dii };
  });
}

const STOCKS = {
  "RELIANCE": { base: 1900, vol: 0.035 },
  "TCS": { base: 2800, vol: 0.028 },
  "HDFCBANK": { base: 1200, vol: 0.032 },
  "INFY": { base: 1100, vol: 0.03 },
  "WIPRO": { base: 380, vol: 0.038 },
};

const RANGES = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "3Y", months: 36 },
  { label: "5Y", months: 60 },
];

// ─── NSE FULL STOCK LISTINGS DATA ─────────────────────────────────────────────

const NSE_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy", series: "EQ", isin: "INE002A01018" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd.", sector: "IT", series: "EQ", isin: "INE467B01029" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE040A01034" },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "IT", series: "EQ", isin: "INE009A01021" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", sector: "FMCG", series: "EQ", isin: "INE030A01027" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE090A01021" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE237A01028" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", sector: "Telecom", series: "EQ", isin: "INE397D01024" },
  { symbol: "ITC", name: "ITC Ltd.", sector: "FMCG", series: "EQ", isin: "INE154A01025" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE238A01034" },
  { symbol: "WIPRO", name: "Wipro Ltd.", sector: "IT", series: "EQ", isin: "INE075A01022" },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", series: "EQ", isin: "INE062A01020" },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE018A01030" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd.", sector: "IT", series: "EQ", isin: "INE860A01027" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", sector: "Auto", series: "EQ", isin: "INE585B01010" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", sector: "Chemicals", series: "EQ", isin: "INE021A01026" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", sector: "NBFC", series: "EQ", isin: "INE296A01024" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", sector: "Pharma", series: "EQ", isin: "INE044A01036" },
  { symbol: "TITAN", name: "Titan Company Ltd.", sector: "Consumer", series: "EQ", isin: "INE280A01028" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd.", sector: "Cement", series: "EQ", isin: "INE481G01011" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd.", sector: "FMCG", series: "EQ", isin: "INE239A01016" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd.", sector: "IT", series: "EQ", isin: "INE669C01036" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd.", sector: "Energy", series: "EQ", isin: "INE213A01029" },
  { symbol: "POWERGRID", name: "Power Grid Corporation of India Ltd.", sector: "Power", series: "EQ", isin: "INE752E01010" },
  { symbol: "NTPC", name: "NTPC Ltd.", sector: "Power", series: "EQ", isin: "INE733E01010" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Auto", series: "EQ", isin: "INE155A01022" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", sector: "Auto", series: "EQ", isin: "INE101A01026" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd.", sector: "NBFC", series: "EQ", isin: "INE918I01026" },
  { symbol: "GRASIM", name: "Grasim Industries Ltd.", sector: "Diversified", series: "EQ", isin: "INE047A01021" },
  { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE742F01042" },
  { symbol: "COALINDIA", name: "Coal India Ltd.", sector: "Mining", series: "EQ", isin: "INE522F01014" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE095A01012" },
  { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd.", sector: "Energy", series: "EQ", isin: "INE029A01011" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd.", sector: "Pharma", series: "EQ", isin: "INE361B01024" },
  { symbol: "CIPLA", name: "Cipla Ltd.", sector: "Pharma", series: "EQ", isin: "INE059A01026" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd.", sector: "Pharma", series: "EQ", isin: "INE089A01031" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd.", sector: "Auto", series: "EQ", isin: "INE066A01021" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd.", sector: "Auto", series: "EQ", isin: "INE158A01026" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd.", sector: "Metal", series: "EQ", isin: "INE038A01020" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", sector: "Metal", series: "EQ", isin: "INE019A01038" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metal", series: "EQ", isin: "INE081A01020" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd.", sector: "Healthcare", series: "EQ", isin: "INE437A01024" },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd.", sector: "FMCG", series: "EQ", isin: "INE216A01030" },
  { symbol: "DABUR", name: "Dabur India Ltd.", sector: "FMCG", series: "EQ", isin: "INE016A01026" },
  { symbol: "GODREJCP", name: "Godrej Consumer Products Ltd.", sector: "FMCG", series: "EQ", isin: "INE102D01028" },
  { symbol: "PIDILITIND", name: "Pidilite Industries Ltd.", sector: "Chemicals", series: "EQ", isin: "INE318A01026" },
  { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd.", sector: "Insurance", series: "EQ", isin: "INE123W01016" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd.", sector: "Insurance", series: "EQ", isin: "INE795G01014" },
  { symbol: "ICICIPRULI", name: "ICICI Prudential Life Insurance Company Ltd.", sector: "Insurance", series: "EQ", isin: "INE726G01019" },
  { symbol: "SHREECEM", name: "Shree Cement Ltd.", sector: "Cement", series: "EQ", isin: "INE070A01015" },
  { symbol: "AMBUJACEM", name: "Ambuja Cements Ltd.", sector: "Cement", series: "EQ", isin: "INE079A01024" },
  { symbol: "ACC", name: "ACC Ltd.", sector: "Cement", series: "EQ", isin: "INE012A01025" },
  { symbol: "BOSCHLTD", name: "Bosch Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE323A01026" },
  { symbol: "MOTHERSON", name: "Samvardhana Motherson International Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE775I01010" },
  { symbol: "MCDOWELL-N", name: "United Spirits Ltd.", sector: "FMCG", series: "EQ", isin: "INE854D01024" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", sector: "FMCG", series: "EQ", isin: "INE192A01025" },
  { symbol: "VEDL", name: "Vedanta Ltd.", sector: "Metal", series: "EQ", isin: "INE205A01025" },
  { symbol: "NMDC", name: "NMDC Ltd.", sector: "Mining", series: "EQ", isin: "INE584A01023" },
  { symbol: "SAIL", name: "Steel Authority of India Ltd.", sector: "Metal", series: "EQ", isin: "INE114A01011" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", sector: "Banking", series: "EQ", isin: "INE028A01039" },
  { symbol: "CANBK", name: "Canara Bank", sector: "Banking", series: "EQ", isin: "INE476A01014" },
  { symbol: "PNB", name: "Punjab National Bank", sector: "Banking", series: "EQ", isin: "INE160A01022" },
  { symbol: "UNIONBANK", name: "Union Bank of India", sector: "Banking", series: "EQ", isin: "INE692A01016" },
  { symbol: "FEDERALBNK", name: "The Federal Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE171A01029" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE092T01019" },
  { symbol: "BANDHANBNK", name: "Bandhan Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE545U01014" },
  { symbol: "AUBANK", name: "AU Small Finance Bank Ltd.", sector: "Banking", series: "EQ", isin: "INE949L01017" },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd.", sector: "NBFC", series: "EQ", isin: "INE414G01012" },
  { symbol: "CHOLAFIN", name: "Cholamandalam Investment and Finance Company Ltd.", sector: "NBFC", series: "EQ", isin: "INE121A01024" },
  { symbol: "M&MFIN", name: "Mahindra & Mahindra Financial Services Ltd.", sector: "NBFC", series: "EQ", isin: "INE774D01024" },
  { symbol: "LICI", name: "Life Insurance Corporation of India", sector: "Insurance", series: "EQ", isin: "INE0J1Y01017" },
  { symbol: "GICRE", name: "General Insurance Corporation of India", sector: "Insurance", series: "EQ", isin: "INE481Y01014" },
  { symbol: "NIACL", name: "The New India Assurance Company Ltd.", sector: "Insurance", series: "EQ", isin: "INE470Y01017" },
  { symbol: "RECLTD", name: "REC Ltd.", sector: "Power Finance", series: "EQ", isin: "INE020B01018" },
  { symbol: "PFC", name: "Power Finance Corporation Ltd.", sector: "Power Finance", series: "EQ", isin: "INE134E01011" },
  { symbol: "IRFC", name: "Indian Railway Finance Corporation Ltd.", sector: "Finance", series: "EQ", isin: "INE053F01010" },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd.", sector: "Defence", series: "EQ", isin: "INE066F01012" },
  { symbol: "BEL", name: "Bharat Electronics Ltd.", sector: "Defence", series: "EQ", isin: "INE263A01024" },
  { symbol: "BHEL", name: "Bharat Heavy Electricals Ltd.", sector: "Capital Goods", series: "EQ", isin: "INE257A01026" },
  { symbol: "SIEMENS", name: "Siemens Ltd.", sector: "Capital Goods", series: "EQ", isin: "INE003A01024" },
  { symbol: "ABB", name: "ABB India Ltd.", sector: "Capital Goods", series: "EQ", isin: "INE117A01022" },
  { symbol: "HAVELLS", name: "Havells India Ltd.", sector: "Consumer Electricals", series: "EQ", isin: "INE176B01034" },
  { symbol: "VOLTAS", name: "Voltas Ltd.", sector: "Consumer Electricals", series: "EQ", isin: "INE226A01021" },
  { symbol: "BLUESTAR", name: "Blue Star Ltd.", sector: "Consumer Electricals", series: "EQ", isin: "INE386A01015" },
  { symbol: "WHIRLPOOL", name: "Whirlpool of India Ltd.", sector: "Consumer Electricals", series: "EQ", isin: "INE716A01013" },
  { symbol: "DIXON", name: "Dixon Technologies (India) Ltd.", sector: "Electronics", series: "EQ", isin: "INE935N01020" },
  { symbol: "KAJARIACER", name: "Kajaria Ceramics Ltd.", sector: "Building Materials", series: "EQ", isin: "INE217B01036" },
  { symbol: "CUMMINSIND", name: "Cummins India Ltd.", sector: "Industrial", series: "EQ", isin: "INE298A01020" },
  { symbol: "THERMAX", name: "Thermax Ltd.", sector: "Industrial", series: "EQ", isin: "INE152C01011" },
  { symbol: "MPHASIS", name: "Mphasis Ltd.", sector: "IT", series: "EQ", isin: "INE356A01018" },
  { symbol: "COFORGE", name: "Coforge Ltd.", sector: "IT", series: "EQ", isin: "INE591G01017" },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd.", sector: "IT", series: "EQ", isin: "INE262H01021" },
  { symbol: "LTTS", name: "L&T Technology Services Ltd.", sector: "IT", series: "EQ", isin: "INE010V01017" },
  { symbol: "MINDTREE", name: "LTIMindtree Ltd.", sector: "IT", series: "EQ", isin: "INE214T01019" },
  { symbol: "ZOMATO", name: "Zomato Ltd.", sector: "Internet", series: "EQ", isin: "INE758T01015" },
  { symbol: "NYKAA", name: "FSN E-Commerce Ventures Ltd.", sector: "Internet", series: "EQ", isin: "INE388Y01029" },
  { symbol: "POLICYBZR", name: "PB Fintech Ltd.", sector: "Internet", series: "EQ", isin: "INE417T01026" },
  { symbol: "PAYTM", name: "One 97 Communications Ltd.", sector: "Fintech", series: "EQ", isin: "INE982J01020" },
  { symbol: "CARTRADE", name: "CarTrade Tech Ltd.", sector: "Internet", series: "EQ", isin: "INE0GQ101017" },
  { symbol: "DELHIVERY", name: "Delhivery Ltd.", sector: "Logistics", series: "EQ", isin: "INE428Q01012" },
  { symbol: "MAPMYINDIA", name: "C.E. Info Systems Ltd.", sector: "Technology", series: "EQ", isin: "INE0GXB01014" },
  { symbol: "IRCTC", name: "Indian Railway Catering And Tourism Corporation Ltd.", sector: "Tourism", series: "EQ", isin: "INE335Y01020" },
  { symbol: "INDIGO", name: "InterGlobe Aviation Ltd.", sector: "Aviation", series: "EQ", isin: "INE646L01027" },
  { symbol: "SPICEJET", name: "SpiceJet Ltd.", sector: "Aviation", series: "EQ", isin: "INE285B01017" },
  { symbol: "CONCOR", name: "Container Corporation of India Ltd.", sector: "Logistics", series: "EQ", isin: "INE111A01025" },
  { symbol: "GLAND", name: "Gland Pharma Ltd.", sector: "Pharma", series: "EQ", isin: "INE068V01023" },
  { symbol: "AUROPHARMA", name: "Aurobindo Pharma Ltd.", sector: "Pharma", series: "EQ", isin: "INE406A01037" },
  { symbol: "ALKEM", name: "Alkem Laboratories Ltd.", sector: "Pharma", series: "EQ", isin: "INE540L01014" },
  { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals Ltd.", sector: "Pharma", series: "EQ", isin: "INE685A01028" },
  { symbol: "LUPIN", name: "Lupin Ltd.", sector: "Pharma", series: "EQ", isin: "INE326A01037" },
  { symbol: "BIOCON", name: "Biocon Ltd.", sector: "Pharma", series: "EQ", isin: "INE376G01013" },
  { symbol: "GRANULES", name: "Granules India Ltd.", sector: "Pharma", series: "EQ", isin: "INE101D01020" },
  { symbol: "LAURUSLABS", name: "Laurus Labs Ltd.", sector: "Pharma", series: "EQ", isin: "INE947Q01028" },
  { symbol: "IPCALAB", name: "IPCA Laboratories Ltd.", sector: "Pharma", series: "EQ", isin: "INE571A01020" },
  { symbol: "NATCOPHARM", name: "Natco Pharma Ltd.", sector: "Pharma", series: "EQ", isin: "INE987B01026" },
  { symbol: "TATAPOWER", name: "Tata Power Company Ltd.", sector: "Power", series: "EQ", isin: "INE245A01021" },
  { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd.", sector: "Renewable Energy", series: "EQ", isin: "INE364U01010" },
  { symbol: "TORNTPOWER", name: "Torrent Power Ltd.", sector: "Power", series: "EQ", isin: "INE813H01021" },
  { symbol: "CESC", name: "CESC Ltd.", sector: "Power", series: "EQ", isin: "INE486A01013" },
  { symbol: "ADANITRANS", name: "Adani Transmission Ltd.", sector: "Power", series: "EQ", isin: "INE931S01010" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", sector: "Diversified", series: "EQ", isin: "INE423A01024" },
  { symbol: "ADANIPOWER", name: "Adani Power Ltd.", sector: "Power", series: "EQ", isin: "INE814H01011" },
  { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd.", sector: "Energy", series: "EQ", isin: "INE094A01015" },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd.", sector: "Energy", series: "EQ", isin: "INE242A01010" },
  { symbol: "MRPL", name: "Mangalore Refinery And Petrochemicals Ltd.", sector: "Energy", series: "EQ", isin: "INE103A01014" },
  { symbol: "GAIL", name: "GAIL (India) Ltd.", sector: "Gas", series: "EQ", isin: "INE129A01019" },
  { symbol: "IGL", name: "Indraprastha Gas Ltd.", sector: "Gas", series: "EQ", isin: "INE203G01027" },
  { symbol: "MGL", name: "Mahanagar Gas Ltd.", sector: "Gas", series: "EQ", isin: "INE002S01010" },
  { symbol: "PETRONET", name: "Petronet LNG Ltd.", sector: "Gas", series: "EQ", isin: "INE347G01014" },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty Ltd.", sector: "Realty", series: "EQ", isin: "INE093I01010" },
  { symbol: "DLF", name: "DLF Ltd.", sector: "Realty", series: "EQ", isin: "INE271C01023" },
  { symbol: "GODREJPROP", name: "Godrej Properties Ltd.", sector: "Realty", series: "EQ", isin: "INE484J01027" },
  { symbol: "PRESTIGE", name: "Prestige Estates Projects Ltd.", sector: "Realty", series: "EQ", isin: "INE811K01011" },
  { symbol: "PHOENIXLTD", name: "Phoenix Mills Ltd.", sector: "Realty", series: "EQ", isin: "INE211B01039" },
  { symbol: "BRIGADE", name: "Brigade Enterprises Ltd.", sector: "Realty", series: "EQ", isin: "INE791I01019" },
  { symbol: "SOBHA", name: "Sobha Ltd.", sector: "Realty", series: "EQ", isin: "INE671H01015" },
  { symbol: "SUNTV", name: "Sun TV Network Ltd.", sector: "Media", series: "EQ", isin: "INE424H01027" },
  { symbol: "ZEEL", name: "Zee Entertainment Enterprises Ltd.", sector: "Media", series: "EQ", isin: "INE256A01028" },
  { symbol: "PVR", name: "PVR INOX Ltd.", sector: "Entertainment", series: "EQ", isin: "INE191H01014" },
  { symbol: "TATACOMM", name: "Tata Communications Ltd.", sector: "Telecom", series: "EQ", isin: "INE151A01013" },
  { symbol: "MTNL", name: "Mahanagar Telephone Nigam Ltd.", sector: "Telecom", series: "EQ", isin: "INE153A01019" },
  { symbol: "VODAFONEIDEA", name: "Vodafone Idea Ltd.", sector: "Telecom", series: "EQ", isin: "INE669E01016" },
  { symbol: "TATAELXSI", name: "Tata Elxsi Ltd.", sector: "IT", series: "EQ", isin: "INE670A01012" },
  { symbol: "CYIENT", name: "Cyient Ltd.", sector: "IT", series: "EQ", isin: "INE136B01020" },
  { symbol: "KPITTECH", name: "KPIT Technologies Ltd.", sector: "IT", series: "EQ", isin: "INE836A01035" },
  { symbol: "ZENSAR", name: "Zensar Technologies Ltd.", sector: "IT", series: "EQ", isin: "INE520A01027" },
  { symbol: "NIITTECH", name: "NIIT Technologies Ltd.", sector: "IT", series: "EQ", isin: "INE591G01017" },
  { symbol: "INGERRAND", name: "Ingersoll-Rand (India) Ltd.", sector: "Industrial", series: "EQ", isin: "INE177A01018" },
  { symbol: "SCHAEFFLER", name: "Schaeffler India Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE513A01022" },
  { symbol: "TIMKEN", name: "Timken India Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE325A01013" },
  { symbol: "SUNDRMFAST", name: "Sundram Fasteners Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE387A01021" },
  { symbol: "ENDURANCE", name: "Endurance Technologies Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE913H01037" },
  { symbol: "BALKRISIND", name: "Balkrishna Industries Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE294B01019" },
  { symbol: "MRF", name: "MRF Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE883A01011" },
  { symbol: "APOLLOTYRE", name: "Apollo Tyres Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE438A01022" },
  { symbol: "CEATLTD", name: "CEAT Ltd.", sector: "Auto Ancillary", series: "EQ", isin: "INE482A01020" },
  { symbol: "TVSMOTOR", name: "TVS Motor Company Ltd.", sector: "Auto", series: "EQ", isin: "INE494B01023" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd.", sector: "Auto", series: "EQ", isin: "INE917I01010" },
  { symbol: "ASHOKLEY", name: "Ashok Leyland Ltd.", sector: "Auto", series: "EQ", isin: "INE208A01029" },
  { symbol: "ESCORTS", name: "Escorts Kubota Ltd.", sector: "Auto", series: "EQ", isin: "INE042A01014" },
  { symbol: "FORCEMOT", name: "Force Motors Ltd.", sector: "Auto", series: "EQ", isin: "INE386C01029" },
  { symbol: "ISEC", name: "ICICI Securities Ltd.", sector: "Capital Markets", series: "EQ", isin: "INE763G01038" },
  { symbol: "ANGELONE", name: "Angel One Ltd.", sector: "Capital Markets", series: "EQ", isin: "INE732I01013" },
  { symbol: "MOTILALOFS", name: "Motilal Oswal Financial Services Ltd.", sector: "Capital Markets", series: "EQ", isin: "INE338I01027" },
  { symbol: "IIFL", name: "IIFL Finance Ltd.", sector: "NBFC", series: "EQ", isin: "INE530B01024" },
  { symbol: "MANAPPURAM", name: "Manappuram Finance Ltd.", sector: "NBFC", series: "EQ", isin: "INE522D01027" },
  { symbol: "SRTRANSFIN", name: "Shriram Finance Ltd.", sector: "NBFC", series: "EQ", isin: "INE721A01013" },
  { symbol: "PNBHOUSING", name: "PNB Housing Finance Ltd.", sector: "Housing Finance", series: "EQ", isin: "INE572E01012" },
  { symbol: "LICHSGFIN", name: "LIC Housing Finance Ltd.", sector: "Housing Finance", series: "EQ", isin: "INE115A01026" },
  { symbol: "CANFINHOME", name: "Can Fin Homes Ltd.", sector: "Housing Finance", series: "EQ", isin: "INE477A01020" },
  { symbol: "HOMEFIRST", name: "Home First Finance Company India Ltd.", sector: "Housing Finance", series: "EQ", isin: "INE481O01024" },
  { symbol: "APTUS", name: "Aptus Value Housing Finance India Ltd.", sector: "Housing Finance", series: "EQ", isin: "INE852O01025" },
  { symbol: "KFINTECH", name: "KFin Technologies Ltd.", sector: "Financial Services", series: "EQ", isin: "INE0J1Y01017" },
  { symbol: "CAMS", name: "Computer Age Management Services Ltd.", sector: "Financial Services", series: "EQ", isin: "INE596I01012" },
  { symbol: "BSE", name: "BSE Ltd.", sector: "Capital Markets", series: "EQ", isin: "INE118H01025" },
  { symbol: "MCX", name: "Multi Commodity Exchange of India Ltd.", sector: "Capital Markets", series: "EQ", isin: "INE745G01035" },
  { symbol: "CDSL", name: "Central Depository Services (India) Ltd.", sector: "Financial Services", series: "EQ", isin: "INE736A01011" },
  { symbol: "NSDL", name: "National Securities Depository Ltd.", sector: "Financial Services", series: "EQ", isin: "INE597I01010" },
  { symbol: "FINEORG", name: "Fine Organic Industries Ltd.", sector: "Chemicals", series: "EQ", isin: "INE579B01012" },
  { symbol: "NAVINFLUOR", name: "Navin Fluorine International Ltd.", sector: "Chemicals", series: "EQ", isin: "INE048G01026" },
  { symbol: "ALKYLAMINE", name: "Alkyl Amines Chemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE150B01021" },
  { symbol: "AAPL", name: "Aether Industries Ltd.", sector: "Chemicals", series: "EQ", isin: "INE02JW01016" },
  { symbol: "CLEAN", name: "Clean Science and Technology Ltd.", sector: "Chemicals", series: "EQ", isin: "INE Forest01018" },
  { symbol: "SRF", name: "SRF Ltd.", sector: "Chemicals", series: "EQ", isin: "INE647A01010" },
  { symbol: "ATUL", name: "Atul Ltd.", sector: "Chemicals", series: "EQ", isin: "INE100A01010" },
  { symbol: "DEEPAKNITR", name: "Deepak Nitrite Ltd.", sector: "Chemicals", series: "EQ", isin: "INE288B01029" },
  { symbol: "FLUOROCHEM", name: "Gujarat Fluorochemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE clip01010" },
  { symbol: "TATACHEM", name: "Tata Chemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE092A01019" },
  { symbol: "COLPAL", name: "Colgate-Palmolive (India) Ltd.", sector: "FMCG", series: "EQ", isin: "INE259A01022" },
  { symbol: "MARICO", name: "Marico Ltd.", sector: "FMCG", series: "EQ", isin: "INE196A01026" },
  { symbol: "EMAMILTD", name: "Emami Ltd.", sector: "FMCG", series: "EQ", isin: "INE548C01032" },
  { symbol: "JYOTHYLAB", name: "Jyothy Labs Ltd.", sector: "FMCG", series: "EQ", isin: "INE668F01031" },
  { symbol: "ZYDUSLIFE", name: "Zydus Lifesciences Ltd.", sector: "Pharma", series: "EQ", isin: "INE010B01027" },
  { symbol: "ABBOTINDIA", name: "Abbott India Ltd.", sector: "Pharma", series: "EQ", isin: "INE358A01014" },
  { symbol: "PFIZER", name: "Pfizer Ltd.", sector: "Pharma", series: "EQ", isin: "INE182A01018" },
  { symbol: "GLAXO", name: "GSK Pharmaceuticals Ltd.", sector: "Pharma", series: "EQ", isin: "INE315A01015" },
  { symbol: "HONAUT", name: "Honeywell Automation India Ltd.", sector: "Industrial", series: "EQ", isin: "INE870A01013" },
  { symbol: "3MINDIA", name: "3M India Ltd.", sector: "Diversified", series: "EQ", isin: "INE470A01017" },
  { symbol: "SANOFI", name: "Sanofi India Ltd.", sector: "Pharma", series: "EQ", isin: "INE058A01010" },
  { symbol: "INDHOTEL", name: "Indian Hotels Company Ltd.", sector: "Hotels", series: "EQ", isin: "INE053A01029" },
  { symbol: "LEMONTREE", name: "Lemon Tree Hotels Ltd.", sector: "Hotels", series: "EQ", isin: "INE970X01018" },
  { symbol: "CHALET", name: "Chalet Hotels Ltd.", sector: "Hotels", series: "EQ", isin: "INE427I01016" },
  { symbol: "EIH", name: "EIH Ltd.", sector: "Hotels", series: "EQ", isin: "INE230A01023" },
  { symbol: "JUBLFOOD", name: "Jubilant Foodworks Ltd.", sector: "QSR", series: "EQ", isin: "INE797F01020" },
  { symbol: "WESTLIFE", name: "Westlife Foodworld Ltd.", sector: "QSR", series: "EQ", isin: "INE274F01020" },
  { symbol: "DEVYANI", name: "Devyani International Ltd.", sector: "QSR", series: "EQ", isin: "INE274N01018" },
  { symbol: "SAPPHIRE", name: "Sapphire Foods India Ltd.", sector: "QSR", series: "EQ", isin: "INE295N01014" },
  { symbol: "DMART", name: "Avenue Supermarts Ltd.", sector: "Retail", series: "EQ", isin: "INE192R01011" },
  { symbol: "TRENT", name: "Trent Ltd.", sector: "Retail", series: "EQ", isin: "INE849A01020" },
  { symbol: "SHOPERSTOP", name: "Shoppers Stop Ltd.", sector: "Retail", series: "EQ", isin: "INE498B01024" },
  { symbol: "VMART", name: "V-Mart Retail Ltd.", sector: "Retail", series: "EQ", isin: "INE665J01013" },
  { symbol: "RELAXO", name: "Relaxo Footwears Ltd.", sector: "Consumer", series: "EQ", isin: "INE131B01039" },
  { symbol: "BATA", name: "Bata India Ltd.", sector: "Consumer", series: "EQ", isin: "INE176A01028" },
  { symbol: "CAMPUS", name: "Campus Activewear Ltd.", sector: "Consumer", series: "EQ", isin: "INE0EE601018" },
  { symbol: "KPRMILL", name: "K.P.R. Mill Ltd.", sector: "Textile", series: "EQ", isin: "INE930H01023" },
  { symbol: "PAGEIND", name: "Page Industries Ltd.", sector: "Textile", series: "EQ", isin: "INE761H01022" },
  { symbol: "RAYMOND", name: "Raymond Ltd.", sector: "Textile", series: "EQ", isin: "INE301A01014" },
  { symbol: "VEDANT", name: "Vedant Fashions Ltd.", sector: "Retail", series: "EQ", isin: "INE825M01014" },
  { symbol: "MANYAVAR", name: "Vedant Fashions Ltd.", sector: "Retail", series: "EQ", isin: "INE825M01014" },
  { symbol: "NAUKRI", name: "Info Edge (India) Ltd.", sector: "Internet", series: "EQ", isin: "INE663F01024" },
  { symbol: "JUSTDIAL", name: "Just Dial Ltd.", sector: "Internet", series: "EQ", isin: "INE599M01018" },
  { symbol: "INDIAMART", name: "Indiamart Intermesh Ltd.", sector: "Internet", series: "EQ", isin: "INE933S01016" },
  { symbol: "NAZARA", name: "Nazara Technologies Ltd.", sector: "Gaming", series: "EQ", isin: "INE418K01010" },
  { symbol: "IRCON", name: "Ircon International Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE962Y01021" },
  { symbol: "NCC", name: "NCC Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE868B01028" },
  { symbol: "KNRCON", name: "KNR Constructions Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE634I01029" },
  { symbol: "PNCINFRA", name: "PNC Infratech Ltd.", sector: "Infrastructure", series: "EQ", isin: "INE195J01029" },
  { symbol: "GPPL", name: "Gujarat Pipavav Port Ltd.", sector: "Ports", series: "EQ", isin: "INE505I01011" },
  { symbol: "ESABINDIA", name: "Esab India Ltd.", sector: "Industrial", series: "EQ", isin: "INE284A01012" },
  { symbol: "GRINDWELL", name: "Grindwell Norton Ltd.", sector: "Industrial", series: "EQ", isin: "INE536A01023" },
  { symbol: "CARBORUNIV", name: "Carborundum Universal Ltd.", sector: "Industrial", series: "EQ", isin: "INE120A01034" },
  { symbol: "GHCL", name: "GHCL Ltd.", sector: "Chemicals", series: "EQ", isin: "INE ankur01019" },
  { symbol: "GSFC", name: "Gujarat State Fertilizers & Chemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE026A01025" },
  { symbol: "COROMANDEL", name: "Coromandel International Ltd.", sector: "Agri", series: "EQ", isin: "INE169A01031" },
  { symbol: "RALLIS", name: "Rallis India Ltd.", sector: "Agri", series: "EQ", isin: "INE355A01028" },
  { symbol: "PI", name: "PI Industries Ltd.", sector: "Agri", series: "EQ", isin: "INE603J01030" },
  { symbol: "SUMICHEM", name: "Sumitomo Chemical India Ltd.", sector: "Agri", series: "EQ", isin: "INE0NE901012" },
  { symbol: "UPL", name: "UPL Ltd.", sector: "Agri", series: "EQ", isin: "INE628A01036" },
  { symbol: "CHAMBLFERT", name: "Chambal Fertilizers and Chemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE085A01013" },
  { symbol: "GNFC", name: "Gujarat Narmada Valley Fertilizers & Chemicals Ltd.", sector: "Chemicals", series: "EQ", isin: "INE113A01013" },
];

// Generate mock price data for each stock
function genStockPrice(idx, baseMultiplier = 1) {
  const base = 100 + seed(idx * 31 + 7) * 4900;
  const change = (seed(idx * 19 + 3) - 0.47) * 8;
  const price = +(base * baseMultiplier).toFixed(2);
  const prev = +(price / (1 + change / 100)).toFixed(2);
  const volume = Math.round((seed(idx * 13 + 5) * 5000000) + 100000);
  const mktCap = +(price * (seed(idx * 7 + 2) * 5000 + 500)).toFixed(0);
  return { price, change: +change.toFixed(2), prev, volume, mktCap };
}

const NSE_STOCKS_WITH_PRICES = NSE_STOCKS.map((s, i) => ({
  ...s,
  ...genStockPrice(i),
}));

const ALL_SECTORS_NSE = ["All", ...Array.from(new Set(NSE_STOCKS.map(s => s.sector))).sort()];


// ─── TOOLTIPS ─────────────────────────────────────────────────────────────────
const OHLCTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {[["O", d.open, "#64748b"], ["H", d.high, "#16a34a"], ["L", d.low, "#dc2626"], ["C", d.close, d.close >= d.open ? "#16a34a" : "#dc2626"]].map(([k, v, c]) => (
        <div key={k} style={{ color: c, marginBottom: 2 }}>{k}: ₹{v?.toLocaleString("en-IN")}</div>
      ))}
      <div style={{ color: "#94a3b8", marginTop: 4 }}>Vol: {d.volume?.toLocaleString("en-IN")}</div>
    </div>
  );
};

const IndexTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name.toUpperCase()}: {p.value?.toLocaleString("en-IN")}</div>)}
    </div>
  );
};

const FIITooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.dataKey === "fii" ? "#818cf8" : p.dataKey === "dii" ? "#16a34a" : "#f97316", marginBottom: 2 }}>
          {p.name.toUpperCase()}: ₹{Math.abs(p.value).toLocaleString("en-IN")} Cr {p.value < 0 ? "(Sell)" : "(Buy)"}
        </div>
      ))}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, sub, color = "#1e293b" }) => (
  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
    <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: ".18em", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "'Syne',sans-serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
  </div>
);

// ─── NSE LISTINGS TAB ─────────────────────────────────────────────────────────
function NSEListingsTab() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [sortKey, setSortKey] = useState("symbol");
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);
  const PAGE_SIZE = 25;

  const filtered = useMemo(() => {
    let data = NSE_STOCKS_WITH_PRICES;
    if (sectorFilter !== "All") data = data.filter(s => s.sector === sectorFilter);
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      data = data.filter(s => s.symbol.includes(q) || s.name.toUpperCase().includes(q) || s.isin.includes(q));
    }
    data = [...data].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") return sortDir * va.localeCompare(vb);
      return sortDir * (va - vb);
    });
    return data;
  }, [search, sectorFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(1); }
    setPage(0);
  };

  const gainers = NSE_STOCKS_WITH_PRICES.filter(s => s.change > 0).length;
  const losers = NSE_STOCKS_WITH_PRICES.filter(s => s.change < 0).length;
  const unchanged = NSE_STOCKS_WITH_PRICES.length - gainers - losers;

  const ThCol = ({ label, k, right }) => (
    <th onClick={() => toggleSort(k)} style={{ textAlign: right ? "right" : "left", padding: "8px 12px", color: sortKey === k ? "#0891b2" : "#94a3b8", fontWeight: 600, letterSpacing: ".08em", fontSize: 9, borderBottom: "1px solid #f1f5f9", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none", background: "#f8fafc" }}>
      {label} {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="fade">
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 18 }}>
        <Stat label="TOTAL LISTED" value={NSE_STOCKS_WITH_PRICES.length.toLocaleString("en-IN")} sub="NSE Equity Symbols" />
        <Stat label="GAINERS" value={gainers} color="#16a34a" sub="Today's advance" />
        <Stat label="LOSERS" value={losers} color="#dc2626" sub="Today's decline" />
        <Stat label="UNCHANGED" value={unchanged} color="#64748b" sub="Flat today" />
        <Stat label="SECTORS" value={ALL_SECTORS_NSE.length - 1} sub="Across NSE listings" />
      </div>

      {/* Advance / Decline bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 8, color: "#94a3b8", letterSpacing: ".18em", marginBottom: 10 }}>ADVANCE / DECLINE RATIO</div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
          <div style={{ flex: gainers, background: "#22c55e", transition: "flex 1s" }} />
          <div style={{ flex: unchanged, background: "#e2e8f0", transition: "flex 1s" }} />
          <div style={{ flex: losers, background: "#ef4444", transition: "flex 1s" }} />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
          {[["■ Gainers", "#16a34a", gainers], ["■ Unchanged", "#94a3b8", unchanged], ["■ Losers", "#dc2626", losers]].map(([l, c, v]) => (
            <span key={l} style={{ fontSize: 9, color: c, letterSpacing: ".08em" }}>{l}: {v}</span>
          ))}
        </div>
      </div>

      {/* Search & Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }}>⌕</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search symbol, name or ISIN..."
            style={{ width: "100%", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px 8px 30px", color: "#1e293b", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, outline: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ALL_SECTORS_NSE.slice(0, 10).map(s => (
            <button key={s} className={`rbtn${sectorFilter === s ? " on" : ""}`} onClick={() => { setSectorFilter(s); setPage(0); }} style={{ fontSize: 9, padding: "4px 10px" }}>{s}</button>
          ))}
          {ALL_SECTORS_NSE.length > 10 && (
            <select onChange={e => { setSectorFilter(e.target.value); setPage(0); }} value={sectorFilter} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#64748b", fontSize: 9, padding: "4px 8px", fontFamily: "'IBM Plex Mono',monospace", cursor: "pointer" }}>
              {ALL_SECTORS_NSE.slice(10).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: ".12em", marginBottom: 10 }}>
        SHOWING {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} OF {filtered.length} SYMBOLS
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: "auto", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              <ThCol label="#" k="symbol" />
              <ThCol label="SYMBOL" k="symbol" />
              <ThCol label="COMPANY NAME" k="name" />
              <ThCol label="SECTOR" k="sector" />
              <ThCol label="SERIES" k="series" />
              <ThCol label="LTP (₹)" k="price" right />
              <ThCol label="CHANGE %" k="change" right />
              <ThCol label="VOLUME" k="volume" right />
              <ThCol label="MKT CAP (Cr)" k="mktCap" right />
              <th style={{ textAlign: "right", padding: "8px 12px", color: "#94a3b8", fontSize: 9, borderBottom: "1px solid #f1f5f9", letterSpacing: ".08em", background: "#f8fafc" }}>ISIN</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((stock, i) => {
              const isUp = stock.change >= 0;
              const rowIdx = page * PAGE_SIZE + i;
              return (
                <tr
                  key={stock.symbol}
                  onMouseEnter={() => setHoveredRow(rowIdx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: "1px solid #f8fafc", background: hoveredRow === rowIdx ? "#f0f9ff" : "transparent", transition: "background .15s", cursor: "default" }}
                >
                  <td style={{ padding: "9px 12px", color: "#cbd5e1", fontSize: 9, minWidth: 32 }}>{rowIdx + 1}</td>
                  <td style={{ padding: "9px 12px", color: "#0891b2", fontWeight: 700, letterSpacing: ".05em", minWidth: 110, whiteSpace: "nowrap" }}>{stock.symbol}</td>
                  <td style={{ padding: "9px 12px", color: "#475569", minWidth: 200, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.name}</td>
                  <td style={{ padding: "9px 12px", minWidth: 100 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 9, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{stock.sector}</span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "#94a3b8", textAlign: "center", fontSize: 10 }}>{stock.series}</td>
                  <td style={{ padding: "9px 12px", color: "#1e293b", textAlign: "right", fontWeight: 700, minWidth: 90 }}>₹{stock.price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", minWidth: 80 }}>
                    <span style={{ color: isUp ? "#16a34a" : "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                      {isUp ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "#64748b", textAlign: "right", minWidth: 100 }}>{stock.volume.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", color: "#64748b", textAlign: "right", minWidth: 100 }}>{stock.mktCap.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "9px 12px", color: "#cbd5e1", textAlign: "right", fontSize: 9, letterSpacing: ".05em", minWidth: 130, whiteSpace: "nowrap" }}>{stock.isin}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button className="rbtn" onClick={() => setPage(0)} disabled={page === 0} style={{ opacity: page === 0 ? 0.3 : 1 }}>«</button>
        <button className="rbtn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ opacity: page === 0 ? 0.3 : 1 }}>‹</button>
        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          let pg = i;
          if (totalPages > 7) {
            if (page < 4) pg = i;
            else if (page > totalPages - 5) pg = totalPages - 7 + i;
            else pg = page - 3 + i;
          }
          return (
            <button key={pg} className={`rbtn${page === pg ? " on" : ""}`} onClick={() => setPage(pg)} style={{ minWidth: 32 }}>{pg + 1}</button>
          );
        })}
        <button className="rbtn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? 0.3 : 1 }}>›</button>
        <button className="rbtn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={{ opacity: page >= totalPages - 1 ? 0.3 : 1 }}>»</button>
        <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: ".1em", marginLeft: 4 }}>PAGE {page + 1} / {totalPages}</span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("ohlcv");
  const [range, setRange] = useState(5);
  const [stock, setStock] = useState("RELIANCE");
  const [activeSectors, setActiveSectors] = useState(["IT","Banking","Auto","Pharma"]);
  const [animKey, setAnimKey] = useState(0);

  const months = RANGES[range].months;

  const ohlcvData = useMemo(() => genOHLCV(STOCKS[stock].base, months, STOCKS[stock].vol), [stock, months]);
  const indexData = useMemo(() => genIndex(11500, months), [months]);
  const sectorData = useMemo(() => genSectorPerf(months), [months]);
  const fiiData    = useMemo(() => genFIIDII(months), [months]);

  const setRangeIdx = (i) => { setRange(i); setAnimKey(k => k + 1); };

  const ohlcvStats = useMemo(() => {
    if (!ohlcvData.length) return {};
    const high = Math.max(...ohlcvData.map(d => d.high));
    const low  = Math.min(...ohlcvData.map(d => d.low));
    const first = ohlcvData[0].close, last = ohlcvData[ohlcvData.length - 1].close;
    const change = ((last - first) / first * 100).toFixed(2);
    const avgVol = Math.round(ohlcvData.reduce((a, d) => a + d.volume, 0) / ohlcvData.length);
    return { high, low, change, avgVol, last };
  }, [ohlcvData]);

  const fiiStats = useMemo(() => {
    const totalFII = fiiData.reduce((a, d) => a + d.fii, 0);
    const totalDII = fiiData.reduce((a, d) => a + d.dii, 0);
    const net = totalFII + totalDII;
    const fiiBuy = fiiData.filter(d => d.fii > 0).length;
    return { totalFII, totalDII, net, fiiBuyPct: ((fiiBuy / fiiData.length) * 100).toFixed(0) };
  }, [fiiData]);

  const sectorCumul = useMemo(() => {
    const totals = {};
    SECTORS.forEach(s => { totals[s] = sectorData.reduce((a, d) => a + d[s], 0).toFixed(1); });
    return totals;
  }, [sectorData]);

  const toggleSector = (s) => setActiveSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const thinData = (data, maxPoints = 60) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", color: "#1e293b", fontFamily: "'IBM Plex Mono',monospace", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#e2e8f0}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}
        .tab{background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:10px 18px;color:#94a3b8;transition:all .2s;letter-spacing:.07em;white-space:nowrap}
        .tab:hover{color:#475569}.tab.on{color:#0891b2!important;border-bottom-color:#0891b2!important}
        .rbtn{background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:10px;padding:5px 12px;color:#64748b;transition:all .2s;letter-spacing:.07em;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
        .rbtn:hover{border-color:#0891b2;color:#0891b2}.rbtn.on{border-color:#0891b2;color:#0891b2;background:#e0f2fe}
        .rbtn:disabled{cursor:not-allowed;opacity:.4}
        .sbtn{background:#ffffff;border:1px solid #e2e8f0;border-radius:7px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:10px;padding:5px 12px;color:#64748b;transition:all .2s;letter-spacing:.05em;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
        .sbtn:hover{border-color:#0891b2;color:#0891b2}.sbtn.on{border-color:#0891b2;color:#0891b2;background:#e0f2fe}
        .secbtn{border:1px solid transparent;border-radius:20px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 10px;transition:all .2s;letter-spacing:.05em;opacity:.4;background:#fff}
        .secbtn.on{opacity:1!important;border-color:currentColor}
        .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:20px 22px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
        .fade{animation:fu .3s ease forwards}
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .lbl{font-size:8px;color:#94a3b8;letter-spacing:.2em;margin-bottom:12px}
        input::placeholder{color:#cbd5e1}
        input:focus{border-color:#0891b2!important;outline:none;box-shadow:0 0 0 3px #bae6fd55}
        select{cursor:pointer;outline:none}
        .nse-badge{display:inline-flex;align-items:center;gap:5px;background:#e0f2fe;border:1px solid #bae6fd;border-radius:20px;padding:2px 10px;font-size:8px;color:#0891b2;letter-spacing:.15em}
        tr:hover td{background:#f8fafc}
      `}</style>

      {/* NAV */}
      <div style={{ borderBottom: "1px solid #e2e8f0", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", position: "sticky", top: 0, zIndex: 100, gap: 12, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#0891b2,#0369a1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>◈</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: ".06em", color: "#0f172a" }}>DALAL<span style={{ color: "#0891b2" }}>ARCHIVE</span></span>
          <span style={{ fontSize: 8, color: "#cbd5e1", letterSpacing: ".2em" }}>HISTORICAL MARKET DATA</span>
          {tab === "nse" && <span className="nse-badge">● NSE LIVE</span>}
        </div>
        {tab !== "nse" && (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#cbd5e1", letterSpacing: ".15em", marginRight: 4 }}>RANGE</span>
            {RANGES.map((r, i) => (
              <button key={r.label} className={`rbtn${range === i ? " on" : ""}`} onClick={() => setRangeIdx(i)}>{r.label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: 22, overflowX: "auto", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          {[
            ["ohlcv","OHLCV · Stock"],
            ["index","Index History"],
            ["sector","Sector Performance"],
            ["fiidii","FII / DII Flows"],
            ["nse","NSE All Listings"],
          ].map(([id,label]) => (
            <button key={id} className={`tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
              {id === "nse" ? <span>📋 {label}</span> : label}
            </button>
          ))}
        </div>

        {/* ── NSE LISTINGS ──────────────────────────────────────────────── */}
        {tab === "nse" && <NSEListingsTab />}

        {/* ── OHLCV ─────────────────────────────────────────────────────── */}
        {tab === "ohlcv" && (
          <div key={`ov${animKey}`} className="fade">
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: ".15em", marginRight: 4 }}>STOCK</span>
              {Object.keys(STOCKS).map(s => (
                <button key={s} className={`sbtn${stock === s ? " on" : ""}`} onClick={() => setStock(s)}>{s}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 18 }}>
              <Stat label="LAST CLOSE" value={`₹${ohlcvStats.last?.toLocaleString("en-IN")}`} />
              <Stat label="PERIOD RETURN" value={`${ohlcvStats.change > 0 ? "+" : ""}${ohlcvStats.change}%`} color={ohlcvStats.change > 0 ? "#16a34a" : "#dc2626"} />
              <Stat label="PERIOD HIGH" value={`₹${ohlcvStats.high?.toLocaleString("en-IN")}`} color="#16a34a" />
              <Stat label="PERIOD LOW" value={`₹${ohlcvStats.low?.toLocaleString("en-IN")}`} color="#dc2626" />
              <Stat label="AVG VOLUME" value={ohlcvStats.avgVol?.toLocaleString("en-IN")} />
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">CLOSE PRICE · {RANGES[range].label} · {stock}</div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={thinData(ohlcvData)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(ohlcvData).length / 6)} />
                  <YAxis domain={["auto","auto"]} tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v.toLocaleString("en-IN")}`} width={72} />
                  <Tooltip content={<OHLCTooltip />} />
                  <Area type="monotone" dataKey="close" stroke="#0891b2" strokeWidth={2} fill="url(#cg)" dot={false} activeDot={{ r: 4, fill: "#0891b2", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">VOLUME · {RANGES[range].label}</div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={thinData(ohlcvData)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(ohlcvData).length / 6)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={42} />
                  <Tooltip formatter={(v) => [v.toLocaleString("en-IN"), "Volume"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                  <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                    {thinData(ohlcvData).map((d, i) => <Cell key={i} fill={d.close >= d.open ? "#bbf7d0" : "#fecaca"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ marginTop: 14, overflowX: "auto" }}>
              <div className="lbl">OHLCV TABLE · LAST 12 ENTRIES</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>{["Date","Open","High","Low","Close","Volume","Change"].map(h => (
                    <th key={h} style={{ textAlign: "right", padding: "6px 10px", color: "#94a3b8", fontWeight: 600, letterSpacing: ".08em", fontSize: 9, borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[...ohlcvData].reverse().slice(0, 12).map((d, i) => {
                    const chg = ((d.close - d.open) / d.open * 100).toFixed(2);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "8px 10px", color: "#94a3b8", textAlign: "right" }}>{d.date}</td>
                        <td style={{ padding: "8px 10px", color: "#475569", textAlign: "right" }}>₹{d.open.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: "#16a34a", textAlign: "right" }}>₹{d.high.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: "#dc2626", textAlign: "right" }}>₹{d.low.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: d.close >= d.open ? "#16a34a" : "#dc2626", fontWeight: 700, textAlign: "right" }}>₹{d.close.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: "#94a3b8", textAlign: "right" }}>{d.volume.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: chg >= 0 ? "#16a34a" : "#dc2626", textAlign: "right", fontWeight: 600 }}>{chg > 0 ? "+" : ""}{chg}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INDEX ─────────────────────────────────────────────────────── */}
        {tab === "index" && (
          <div key={`ix${animKey}`} className="fade">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 18 }}>
              {(() => {
                const first = indexData[0], last = indexData[indexData.length - 1];
                const nChg = ((last.nifty - first.nifty) / first.nifty * 100).toFixed(2);
                const sChg = ((last.sensex - first.sensex) / first.sensex * 100).toFixed(2);
                return [
                  <Stat key="n" label="NIFTY 50 (LATEST)" value={last.nifty.toLocaleString("en-IN")} />,
                  <Stat key="s" label="SENSEX (LATEST)" value={last.sensex.toLocaleString("en-IN")} />,
                  <Stat key="nc" label={`NIFTY ${RANGES[range].label} RETURN`} value={`${nChg > 0 ? "+" : ""}${nChg}%`} color={nChg > 0 ? "#16a34a" : "#dc2626"} />,
                  <Stat key="sc" label={`SENSEX ${RANGES[range].label} RETURN`} value={`${sChg > 0 ? "+" : ""}${sChg}%`} color={sChg > 0 ? "#16a34a" : "#dc2626"} />,
                ];
              })()}
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">NIFTY 50 · {RANGES[range].label}</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={thinData(indexData)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(indexData).length / 6)} />
                  <YAxis domain={["auto","auto"]} tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString("en-IN")} width={68} />
                  <Tooltip content={<IndexTooltip />} />
                  <Area type="monotone" dataKey="nifty" stroke="#818cf8" strokeWidth={2} fill="url(#ng)" dot={false} activeDot={{ r: 4, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">SENSEX · {RANGES[range].label}</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={thinData(indexData)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(indexData).length / 6)} />
                  <YAxis domain={["auto","auto"]} tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString("en-IN")} width={78} />
                  <Tooltip content={<IndexTooltip />} />
                  <Area type="monotone" dataKey="sensex" stroke="#f97316" strokeWidth={2} fill="url(#sg)" dot={false} activeDot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="lbl">NIFTY vs SENSEX · NORMALISED (BASE 100)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={thinData(indexData).map(d => ({
                  ...d,
                  niftyN: +(d.nifty / indexData[0].nifty * 100).toFixed(2),
                  sensexN: +(d.sensex / indexData[0].sensex * 100).toFixed(2),
                }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(indexData).length / 6)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={38} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                  <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="niftyN" name="NIFTY" stroke="#818cf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sensexN" name="SENSEX" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 10, color: "#94a3b8" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── SECTOR ────────────────────────────────────────────────────── */}
        {tab === "sector" && (
          <div key={`se${animKey}`} className="fade">
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "#94a3b8", letterSpacing: ".15em", marginRight: 4 }}>SECTORS</span>
              {SECTORS.map((s, i) => (
                <button key={s} className={`secbtn${activeSectors.includes(s) ? " on" : ""}`}
                  style={{ color: SECTOR_COLORS[i], background: activeSectors.includes(s) ? `${SECTOR_COLORS[i]}18` : "#fff" }}
                  onClick={() => toggleSector(s)}>{s}</button>
              ))}
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">CUMULATIVE RETURN · {RANGES[range].label} (%)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={SECTORS.filter(s => activeSectors.includes(s)).map((s) => ({ name: s, value: parseFloat(sectorCumul[s]), color: SECTOR_COLORS[SECTORS.indexOf(s)] }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
                  <ReferenceLine y={0} stroke="#e2e8f0" />
                  <Tooltip formatter={v => [`${v}%`, "Cumul. Return"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {SECTORS.filter(s => activeSectors.includes(s)).map((s) => (
                      <Cell key={s} fill={SECTOR_COLORS[SECTORS.indexOf(s)]} fillOpacity={parseFloat(sectorCumul[s]) >= 0 ? 0.85 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">MONTHLY RETURN TREND · {RANGES[range].label}</div>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={thinData(sectorData, 36)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(sectorData, 36).length / 6)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={36} />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 10 }} />
                  {activeSectors.map((s) => (
                    <Line key={s} type="monotone" dataKey={s} stroke={SECTOR_COLORS[SECTORS.indexOf(s)]} strokeWidth={1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="lbl">SECTOR LEADERBOARD · {RANGES[range].label}</div>
              {[...SECTORS].sort((a, b) => parseFloat(sectorCumul[b]) - parseFloat(sectorCumul[a])).map((s, i) => {
                const val = parseFloat(sectorCumul[s]);
                const color = SECTOR_COLORS[SECTORS.indexOf(s)];
                const maxAbs = Math.max(...SECTORS.map(x => Math.abs(parseFloat(sectorCumul[x]))));
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < SECTORS.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <div style={{ width: 20, fontSize: 10, color: "#cbd5e1", textAlign: "right" }}>#{i + 1}</div>
                    <div style={{ width: 60, fontSize: 12, color, fontWeight: 600 }}>{s}</div>
                    <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(Math.abs(val) / maxAbs) * 100}%`, background: val >= 0 ? color : "#ef4444", borderRadius: 3, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontSize: 12, fontWeight: 700, color: val >= 0 ? "#16a34a" : "#dc2626" }}>
                      {val >= 0 ? "+" : ""}{val}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FII / DII ─────────────────────────────────────────────────── */}
        {tab === "fiidii" && (
          <div key={`fi${animKey}`} className="fade">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 18 }}>
              <Stat label="TOTAL FII FLOW" value={`₹${Math.abs(fiiStats.totalFII).toLocaleString("en-IN")} Cr`} color={fiiStats.totalFII >= 0 ? "#16a34a" : "#dc2626"} sub={fiiStats.totalFII >= 0 ? "Net Buying" : "Net Selling"} />
              <Stat label="TOTAL DII FLOW" value={`₹${Math.abs(fiiStats.totalDII).toLocaleString("en-IN")} Cr`} color={fiiStats.totalDII >= 0 ? "#16a34a" : "#dc2626"} sub={fiiStats.totalDII >= 0 ? "Net Buying" : "Net Selling"} />
              <Stat label="NET COMBINED" value={`₹${Math.abs(fiiStats.net).toLocaleString("en-IN")} Cr`} color={fiiStats.net >= 0 ? "#16a34a" : "#dc2626"} sub={fiiStats.net >= 0 ? "Positive" : "Negative"} />
              <Stat label="FII BUY MONTHS" value={`${fiiStats.fiiBuyPct}%`} color="#818cf8" sub={`of ${months} months`} />
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">FII vs DII MONTHLY FLOWS · {RANGES[range].label} (₹ Cr)</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={thinData(fiiData, 48)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%">
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(fiiData, 48).length / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${v > 0 ? "+" : ""}${(v / 1000).toFixed(0)}K`} width={46} />
                  <ReferenceLine y={0} stroke="#e2e8f0" />
                  <Tooltip content={<FIITooltip />} />
                  <Bar dataKey="fii" name="FII" radius={[2, 2, 0, 0]}>
                    {thinData(fiiData, 48).map((d, i) => <Cell key={i} fill={d.fii >= 0 ? "#818cf8" : "#c7d2fe"} />)}
                  </Bar>
                  <Bar dataKey="dii" name="DII" radius={[2, 2, 0, 0]}>
                    {thinData(fiiData, 48).map((d, i) => <Cell key={i} fill={d.dii >= 0 ? "#22c55e" : "#bbf7d0"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {[["■ FII/FPI", "#818cf8"], ["■ DII (MF+Insurance)", "#22c55e"]].map(([label, color]) => (
                  <span key={label} style={{ fontSize: 9, color, letterSpacing: ".1em" }}>{label}</span>
                ))}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="lbl">NET COMBINED FLOW · {RANGES[range].label} (₹ Cr)</div>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={thinData(fiiData, 48)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="netg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} interval={Math.floor(thinData(fiiData, 48).length / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={40} />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")} Cr`, "Net Flow"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                  <Area type="monotone" dataKey="net" stroke="#f97316" strokeWidth={2} fill="url(#netg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ overflowX: "auto" }}>
              <div className="lbl">FLOW TABLE · LAST 12 MONTHS</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>{["Month","FII Flow (₹ Cr)","DII Flow (₹ Cr)","Net Flow","Bias"].map(h => (
                    <th key={h} style={{ textAlign: "right", padding: "6px 10px", color: "#94a3b8", fontWeight: 600, letterSpacing: ".08em", fontSize: 9, borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[...fiiData].reverse().slice(0, 12).map((d, i) => {
                    const bias = d.fii > 0 && d.dii > 0 ? "Both Buy" : d.fii < 0 && d.dii < 0 ? "Both Sell" : d.fii > 0 ? "FII Buy" : "DII Buy";
                    const biasColor = bias === "Both Buy" ? "#16a34a" : bias === "Both Sell" ? "#dc2626" : "#d97706";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "8px 10px", color: "#94a3b8", textAlign: "right" }}>{d.date}</td>
                        <td style={{ padding: "8px 10px", color: d.fii >= 0 ? "#818cf8" : "#a5b4fc", textAlign: "right", fontWeight: 600 }}>{d.fii >= 0 ? "+" : ""}{d.fii.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: d.dii >= 0 ? "#16a34a" : "#86efac", textAlign: "right", fontWeight: 600 }}>{d.dii >= 0 ? "+" : ""}{d.dii.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", color: d.net >= 0 ? "#f97316" : "#dc2626", textAlign: "right", fontWeight: 700 }}>{d.net >= 0 ? "+" : ""}{d.net.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right" }}><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 9, fontWeight: 700, background: `${biasColor}18`, color: biasColor, letterSpacing: ".08em", border: `1px solid ${biasColor}33` }}>{bias.toUpperCase()}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}