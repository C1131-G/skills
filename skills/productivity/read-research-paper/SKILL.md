---
name: read-research-paper
description: Read and analyze research papers with a three-pass method. Use for triage, comprehension, deep review, structured notes, critique, and deciding how much reading depth a paper deserves.
---
# read-research-paper

Use this skill directly for reading, reviewing, or taking notes on a research paper.

Source method: S. Keshav, "How to Read a Paper," ACM SIGCOMM Computer Communication Review, 2007. Apply this instead of reading a paper linearly start-to-finish — each pass has a specific goal, a time budget, and a decision point at the end about whether to continue to the next pass.

## The core idea

Don't read a paper once, deeply, front to back. Make **up to three passes**, each one going deeper than the last, and decide after each pass whether the paper warrants the next level of effort. Most papers you encounter only need pass one; a smaller set need pass two; only papers you're reviewing, building on, or need to master require pass three.

## Pass 1 — the bird's-eye view (5-10 minutes)

Goal: decide what this paper is and whether it's worth more of your time.

Do, in order:
1. Read the title, abstract, and introduction carefully.
2. Read the section and sub-section headings — skip the body text entirely at this stage.
3. Read the conclusion.
4. Skim the reference list, noting which ones you already recognize/have read.

At the end of pass 1, you should be able to answer the **five Cs**:
1. **Category** — what kind of paper is this? (e.g. a measurement study, an analysis of an existing system, a description of a new prototype, a theory paper)
2. **Context** — which other papers and theoretical foundations does it relate to?
3. **Correctness** — do the paper's core assumptions look sound?
4. **Contributions** — what does the paper actually claim to contribute?
5. **Clarity** — is it well written?

Decision point: if the five Cs reveal the paper isn't relevant, is outside what you can currently understand, or rests on assumptions you don't buy, it's reasonable to stop here. Pass 1 alone is the right amount of effort for papers adjacent to your interests but not core to them.

(Side note if you're the one *writing* a paper, not reading one: most reviewers and readers will only ever give it a pass-1-level read. A paper needs a coherent structure and a genuinely concise, comprehensive abstract, or it risks being misjudged — and possibly rejected — before anyone gets further than five minutes in.)

## Pass 2 — grasp the content, not the details (up to ~1 hour)

Goal: be able to explain the paper's main argument and supporting evidence to someone else, without yet being able to defend every detail.

- Read the whole paper with real attention this time, but skip anything that requires working through — proofs, derivations, heavy math.
- Jot notes/margin comments as you go; this pass benefits from active annotation, not passive reading.
- Look closely at figures, diagrams, and especially graphs. Check the basics that separate careful work from sloppy work: are axes labeled? Do results include error bars/statistical significance where they should?
- Mark any references that look worth reading later — this is how you'll build outward understanding of the paper's background.

At the end of pass 2 you should be able to summarize the paper's main thrust and evidence to someone else. This is the right depth for a paper that interests you but isn't in your specific specialty.

If you still don't understand the paper after pass 2, it's usually one of: unfamiliar terminology/subject matter, an unfamiliar proof or experimental technique the paper leans on, genuinely poor writing (unsubstantiated claims, heavy forward-referencing), or just reading it at the wrong time/energy level. At that point, choose one of: set it aside, come back later after reading background material, or push into pass 3 anyway.

## Pass 3 — full understanding, by virtual re-implementation (4-5 hours for a beginner, ~1 hour once experienced)

Goal: understand the paper deeply enough to reconstruct its structure from memory and identify both its strengths and its hidden weaknesses.

The core technique: **mentally re-implement the paper.** Make the same assumptions the authors made and try to recreate their work yourself — the method, the proof, the system design — before comparing your version against what they actually did. The gap between your reconstruction and their actual paper is where the real insight lives: it surfaces both genuine innovations you might've missed and hidden flaws/assumptions the paper doesn't surface on its own.

This pass demands real attention to detail:
- Challenge every assumption in every statement — don't accept a claim just because it's written confidently.
- Think about how *you* would have presented the same idea, and compare that against the authors' actual presentation/proof technique. This comparison is what sharpens your own toolkit for future work, not just your understanding of this one paper.
- Note ideas for follow-up/future work as they occur to you — pass 3 is often where genuinely new research directions get sparked.

By the end, you should be able to reconstruct the paper's entire structure from memory and pinpoint specific weak points: implicit assumptions, missing citations to relevant related work, or flaws in the experimental or analytical method.

## Doing a literature survey with this method

A survey means reading tens of papers, often in an area you don't know well yet. Use the three passes as the engine for narrowing down what's actually worth reading in depth:

1. **Find 3-5 recent papers** via an academic search tool and well-chosen keywords. Give each one a pass-1 read, then specifically read their related-work sections — this gives you a thumbnail map of the field, and with some luck, a pointer to an existing survey paper. If you find a good one, you may be largely done already.
2. **If no survey exists**, look for citations and author names that keep recurring across your initial set of papers — those are the field's key papers and key researchers. Pull the key papers aside. Then check where those researchers have published most recently; that tells you which venues/conferences matter most in this area, since strong researchers tend to cluster at the strongest venues.
3. **Check the recent proceedings of those top venues directly.** A quick scan usually turns up more high-quality, closely related work. Combine this with the papers set aside in step 2 — that combined set is the first draft of your survey.
4. **Give that full set two passes.** If a paper you missed keeps getting cited across everything you've now read, go find and read it too, and repeat this loop until nothing new keeps surfacing.

## Applying this skill

- **When asked to read/summarize one paper**: default to pass 1 unless the request implies deeper engagement (a review, "explain in depth," "critique the methodology") — then go to pass 2, and to pass 3 only if genuinely required (writing a formal review, building directly on the paper's method, or explicitly asked for a deep critique).
- **When asked to do a literature survey/review of a field**: follow the four-step survey process above rather than trying to deeply read every paper found — the method is designed specifically to avoid that.
- **When summarizing back to the user**: structure the summary around whichever pass was actually done — a pass-1 summary should hit the five Cs; a pass-2 summary should cover the main argument plus supporting evidence; a pass-3 summary should include identified weaknesses/assumptions, not just a restatement of the paper's claims.

