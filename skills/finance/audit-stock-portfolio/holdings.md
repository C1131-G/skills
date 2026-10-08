# Loading holdings

## Getting the sheet

Ask: "Share your Google Sheet link, or download it as CSV (File → Download → CSV) and give me the file path."

**Shared link.** The sheet must be set to *Anyone with the link → Viewer*. Build the export URL from the link:

```text
https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
```

`<SHEET_ID>` is the part after `/d/`; `<GID>` is the number after `gid=` (default `0`, the first tab). Fetch it. If the fetch returns a login page, the sheet is private — ask the investor to change sharing or upload a CSV instead. Never ask for their Google password.

**File.** Read the CSV or XLSX directly. A broker export (Zerodha Console holdings, Groww, Upstox, Angel) works as-is.

## Columns

Map whatever headers exist to these; ask about any that are missing.

| Needed | Common headers |
|---|---|
| Symbol | Symbol, Ticker, Instrument, Stock, Scrip |
| Quantity | Qty, Quantity, Shares, Units |
| Average cost | Avg. cost, Avg price, Buy price |
| Buy date (optional) | Date, Purchase date — needed for the LTCG/STCG check |

Normalise symbols to NSE (`RELIANCE`, `HDFCBANK`). If a name is ambiguous, ask. Mark mutual funds, ETFs and SGBs separately — they are counted in allocation but not scored as companies.

## Confirm before analysis

Show the table and ask "Is this complete and correct?":

| Symbol | Qty | Avg cost ₹ | Price ₹ | Value ₹ | Weight % | Gain % |
|---|---|---|---|---|---|---|

## Live data sources (India)

| Need | Source |
|---|---|
| Price, 52-week range, volume | nseindia.com quote page, Moneycontrol, Google Finance |
| 10-year financials, ratios, shareholding, pledge | screener.in/company/<SYMBOL>/consolidated/ |
| Insider (PIT) and SAST disclosures, bulk/block deals | NSE → Corporate filings → Insider trading / SAST; BSE corporate announcements |
| Annual report, concall transcripts | Company investor-relations page, BSE filings |
| Market valuation | Nifty 50 / Nifty 500 P/E and P/B on niftyindices.com |

Prefer the primary source (NSE/BSE filing) over an aggregator when they disagree.
