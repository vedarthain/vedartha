const Papa = require("papaparse");
const fs = require("fs");

const csv = fs.readFileSync("./src/nse_stocks.csv", "utf8");

const result = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (h) => h.trim(), // ← fixes extra spaces in column names
});

const stocks = result.data.map((row) => ({
  symbol: row["SYMBOL"]?.trim(),
  name: row["NAME OF COMPANY"]?.trim(),
  series: row["SERIES"]?.trim(),
  isin: row["ISIN NUMBER"]?.trim(),
})).filter(s => s.symbol && s.series === "EQ");

const output = `export const NSE_ALL_STOCKS = ${JSON.stringify(stocks, null, 2)};`;

require("fs").writeFileSync("./src/nseStocks.js", output);
console.log(`✅ Done! ${stocks.length} stocks written to src/nseStocks.js`);
