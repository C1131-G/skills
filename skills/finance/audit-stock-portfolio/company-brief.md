# Company brief — one doc per suggested company

Every company the report suggests buying or adding to gets its own brief: a Markdown file the investor can read, save and come back to. Write it for someone who has never read a balance sheet. If a term needs jargon, explain it in brackets the first time.

Save to `stock-research/<YYYY-MM-DD>/<SYMBOL>.md` in the working directory, link every brief from the report, and tell the investor the paths. If the session has a first-party document tool (for example Claude Docs), publish the briefs there as well.

## Rules

- **The three mentors decide.** A company is suggested only if it passes Warren Buffett, Charlie Munger **and** Anand Srinivasan in `masters.md`. A brief never says "fails one mentor, but…". If a mentor fails, the company goes to the watchlist or is dropped, and the brief is not written as a buy.
- **Every mentor section ends in a verdict line** — `✅ Passes`, with the facts that prove it — and quotes the mentor's own principle in plain words.
- **Plain language first, numbers second.** Each number gets one line saying what it means for the investor ("ROCE 28% — for every ₹100 the business uses, it earns ₹28 a year").
- **Cite every number** with source and date, as in the main rules.
- **Show the bad side too.** The "How this could go wrong" section is mandatory; a brief with no risks is not finished.

## Template

```markdown
# <Company name> (<NSE: SYMBOL>)
> Research support, not SEBI-registered investment advice. Data as of <date>.

## In one line
What the company does, as you would tell a friend.

## What the company does — simply
- What it sells, and who buys it (with an everyday example: "the paint on your walls", "the bank your salary goes into").
- How it makes money — where each ₹100 of revenue comes from.
- Why people keep buying from it instead of a competitor.

## Why this company — the strong case
Three to five reasons, most important first. Each reason is one fact and one line on why it matters to the investor.

## The three mentors' verdict

### Warren Buffett — "a wonderful business at a fair price"
- Can you understand it? <yes, because…>
- Moat (what protects it from competitors): <type + 10-year evidence>
- Economics: ROE / ROCE over 10 years, debt level
- Management: <capital allocation, honesty evidence>
- Price vs value: fair value range ₹<a>–₹<b>, price today ₹<p>, margin of safety <x>%
- **Verdict: ✅ Passes Buffett** — <one-line reason>

### Charlie Munger — "invert, always invert"
- How this investment could lose half its value: 1… 2… 3… — and why each is unlikely, with evidence
- Incentives: how promoters and management are rewarded; related-party dealings
- Quality over cheapness: <why this is a great business, not just a cheap one>
- **Verdict: ✅ Passes Munger** — <one-line reason>

### Anand Srinivasan — "ordinary stocks, extraordinary profits"
- The ordinary business that compounds: <why a dull business still grows>
- Moat first, then price: <moat, then valuation>
- Indian realities: promoter behaviour, policy and PSU risk, demand, unorganised competition
- **Verdict: ✅ Passes Anand Srinivasan** — <one-line reason>

## Fundamentals — in plain words
| Measure | Value | What it means for you |
|---|---|---|
| Sales growth (10y / 5y) | | |
| Profit growth (10y / 5y) | | |
| ROCE / ROE | | |
| Debt-to-equity | | |
| Cash from operations vs profit | | |
| P/E vs its 10-year median | | |

## Who owns it — promoters, insiders, institutions
Promoter holding and trend, pledge, insider buys or sells, FII/DII trend — each with one line on what it signals.

## Technicals — when to buy, not whether
Price vs 50- and 200-day averages, RSI, 52-week range. End with the buying plan: how many tranches, at roughly what prices.

## How this could go wrong
The real risks, plainly stated, and what you would watch in each quarterly result to catch them early.

## Your plan
- Amount: ₹<x> of your ₹<total> (<y>% of portfolio)
- Buy: <tranches and timing>
- Review: next quarterly results on <date>; sell only if <thesis-breaking events>

## Sources
Every URL used, with date.
```
