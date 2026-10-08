# Sizing and the report

## Asset allocation first

No interview is run. Use the **moderate** row by default and state it in the report's assumptions:

| Profile | Direct stocks | Index / mutual funds | Debt, FD, gold |
|---|---|---|---|
| Conservative or new investor | 10–25% | 40–50% | Rest |
| Moderate, 5–10 year horizon | 30–50% | 30–40% | Rest |
| Aggressive, 10+ years, held through a crash before | 50–70% | 20–30% | Rest |

Add one line to the report: money needed within 3 years, and a 6-month emergency fund, should stay out of stocks.

## Position sizing

- Max per stock: 15% (moderate default).
- Max per sector: 30–35%.
- Small caps combined: at most 25% of direct stocks, less for conservative profiles.
- Stagger lump sums over 3–6 months when Nifty P/E is above its 10-year median.
- Fund new ideas from Exit verdicts first; check tax before selling.

## Indian tax check (verify current rules each run)

- Listed equity held > 12 months: LTCG at 12.5% on gains above ₹1.25 lakh per year.
- Held ≤ 12 months: STCG at 20%.
- Dividends taxed at the investor's slab.
- Selling a loss-making holding can offset gains — mention tax-loss harvesting near March.

## Report shape

```markdown
# Portfolio review — <date>
> Research support, not SEBI-registered investment advice. Data as of <date>, sources listed below.

## Assumptions
Amount, default moderate profile, 5+ year horizon — one short paragraph.

## Market today
Nifty 50 P/E vs 10-year median, India VIX, one line on what it means for timing.

## Holdings verdicts
| Stock | Weight | Verdict | Why (2–3 facts) | Red flags |

## Portfolio health
Concentration, sector mix, number of stocks, review-checklist hits.

## Where the new ₹<amount> could go
| Stock | Amount ₹ | Tranches | Buffett | Munger | Anand Srinivasan | Margin of safety | Brief |
Every row shows ✅ for all three mentors and links its brief (`stock-research/<date>/<SYMBOL>.md`, see `company-brief.md`). Plus any index-fund or debt portion from the allocation table.

## Watchlist
Good businesses waiting for a better price, with the buy-below price.

## Sources
Every URL used, with date.
```

End with a review date (next quarterly results).
