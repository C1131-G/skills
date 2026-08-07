---
name: apply-structured-logging
role: leaf
parent: route-backend
description: LEAF of route-backend — not a main skill. Pino structured logs, levels, request context.
disable-model-invocation: true
---
# apply-structured-logging

**Leaf — not main.** Parent: `route-backend`. If invoked alone, load parent with the same mode and Decision-select this leaf only. Do not report this name as a top-level run.

Apply these rules whenever writing or reviewing logging code in a backend/server project (Node.js, Hono, etc.).

Logs are cheap to add and a fast way to get real information about production behavior — when in doubt, add a few targeted log lines rather than reasoning about a bug from code alone. It's fine for some logs to be temporary: add them while investigating a problem or validating a new feature, and remove them once they're no longer earning their keep. Not every log line needs to be a permanent fixture.

## What to log

Four categories are consistently worth a log line:

- **Runtime decisions your application makes on the fly** — a feature flag routing a user to an experimental flow, a mobile client redirected to a different experience, a paid vs. free user getting different behavior. When code branches based on something request-specific, log both *why* the branch was taken and *what* resulted — this is what lets you explain why two users saw different behavior, and reproduce a bug that only affects one cohort.
- **Step-by-step outcomes of a multi-stage feature or algorithm** — log the outcome at each meaningful stage (e.g. "import started" with how much work is about to happen, then "import finished" with a breakdown of what succeeded/was skipped and why). See rule 2 below for how to structure that breakdown so it stays queryable.
- **Audit and access events** — creates, updates, deletes, permission changes, access to sensitive resources. These are what let you answer "who changed this, and when" when a user reports something unexpected — restoring confidence that the system isn't behaving randomly. Depending on the domain, this may also be a compliance requirement (e.g. HIPAA) — audit logging alone doesn't satisfy a compliance requirement on its own, but it's typically part of one.
- **Context surrounding a failure that isn't (yet) a full error.** Not every failure should immediately escalate to exception tracking — e.g. a flaky upstream API retried N times only needs to become a real error after the Nth attempt. For the attempts before that, a log line capturing the retry count, the status/error code returned, and relevant runtime state (feature flags, config) is exactly the context you'll want when debugging why the retry loop happened at all.

## How to write the message

1. **Never use `console.log`/`console.error` for application logging in server code.** `console.*` has no severity levels, no structured output, and no way to filter or route logs — fine for a one-off debug print you delete before committing, not for anything that stays in the codebase.

2. **Use a structured logger that outputs JSON, not plain text — and give each distinct outcome its own scalar field.** Structured logs (each field — level, time, message, context — as its own JSON property) can be filtered, queried, and aggregated by log tooling; plain-text strings require fragile regex parsing to get the same information back out. When a single event has multiple possible outcomes (e.g. a batch import that can skip records for several different reasons), give each reason its own scalar field rather than nesting them in one object — that's what lets you chart or alert on one specific outcome (e.g. a spike in one particular skip reason) independently of the others.

   ```ts
   // Less useful: nested/opaque, harder to chart one reason in isolation
   logger.info({ importResult: { skipped: { missingName: 3, unknownGrade: 1 } } }, "Import finished");

   // Prefer: each outcome is its own flat, queryable field
   logger.info({
     "import.entries_received": entries.length,
     "import.imported": imported,
     "import.skipped.missing_name": skipDetails.missingName,
     "import.skipped.unknown_grade": skipDetails.unknownGrade,
   }, "Import finished");
   ```

3. **A good log answers who, what, and when.** *Who* performed the action (the authenticated user, if any), *what* happened (a human-readable message plus supporting metadata), and *when* it happened (usually added automatically by the logging system's timestamp — don't hand-roll this). Structure calls so all three are present rather than relying on the reader to infer "who" from surrounding context they may not have.

4. **Let context accumulate as a request moves through the system, rather than starting over at each log call.** A log emitted before authentication won't have user info yet; one emitted after should include it. Correlate log lines back to the same request/trace wherever the logging setup supports it (a trace ID, a request ID) — that's what turns a pile of individual log lines back into a single coherent sequence of events for one request.

5. **Default logger for this stack: Pino.** It's the standard for high-throughput Node/TypeScript backends — JSON output by default, minimal overhead (log formatting happens off the main thread), and integrates natively with Hono/Fastify-style frameworks. Use `pino-pretty` only in local development for human-readable output; production always gets raw JSON to stdout.

6. **Use log levels correctly, and make the threshold configurable via an environment variable** (e.g. `LOG_LEVEL`), not hardcoded:
   - `trace` / `debug` — verbose diagnostic detail, useful only when actively debugging. Off by default in production; a `beforeSend`-style filter (if the logging platform supports one) is a good place to strip these out based on level rather than not emitting them at all.
   - `info` — normal application events: runtime decisions, algorithm/step outcomes, audit events. The normal production default.
   - `warn` — a recoverable event that may still need attention (a retry, a fallback path taken, latency crossing a threshold on an upstream call).
   - `error` — an unexpected failure that was handled gracefully in code. If the failure actually resulted in an unhandled exception, prefer capturing it through the project's dedicated error-tracking mechanism (e.g. Sentry's capture-exception API) rather than only writing a duplicate `error`-level log line — that gets you issue grouping, triage workflows, and stack-trace-aware tooling a plain log line doesn't have. A log line is for narrating *context around* a failure (the retry count, the request state); the exception capture is for the failure itself.
   - `fatal` — the process cannot continue and is about to crash/exit.

7. **Log errors with full context, not just the message.** Pass the actual `Error` object to the logger (most structured loggers auto-serialize it, including the stack trace) rather than just interpolating `err.message` into a string — the stack trace is often the only way to find where something actually failed.

   ```ts
   // Avoid:
   logger.error(`Failed to save order: ${err.message}`);

   // Prefer:
   logger.error({ err, orderId }, "Failed to save order");
   ```

8. **Attach request-scoped context (request ID, user ID, route) via a child logger, not by repeating it in every call.** Create one child logger per request with the relevant IDs bound to it, then log through that child — every entry automatically carries the context without manually passing it each time.

   ```ts
   const requestLogger = logger.child({ requestId, userId });
   requestLogger.info("Processing payment");
   requestLogger.error({ err }, "Payment failed");
   ```

9. **Never log secrets or sensitive personal data.** Before logging any field, ask: what's the impact if the wrong person got access to this? Concretely:
   - Prefer an opaque user ID over an email address or full name wherever the ID alone is enough to look the user up later.
   - Passwords, access tokens, API keys, and similar secrets should never appear in a log line — they belong only in a system built for secret storage.
   - Other personal information (age, gender, postal code, and more) may be regulated depending on jurisdiction — be aware of what applies to the project (GDPR, CCPA, HIPAA, PCI, and similar).
   - Set up redaction at the logger config level (most structured loggers support a `redact` option for specific fields, and some logging platforms add server-side scrubbing on top) so this is enforced automatically rather than relying on every call site to remember. Be intentional — log the minimum needed to debug and operate the system, not everything that happens to be available.

10. **Don't over-log.** Every `info`-level call is a line someone has to read or a query has to filter through, and a storage/ingestion cost in production. Log meaningful events (a request completed, a job finished, a state changed) — not every intermediate step of a function. Instrumenting every function call or every line of code is a job for profiling/tracing tooling, not logs — reach for that instead if that's actually the goal.

11. **Don't log large blobs of unstructured data without a specific purpose.** There are legitimate reasons to do this occasionally — a full LLM prompt/response to debug unexpected model behavior, a full webhook body to debug a third-party integration — but it comes with real cost and risk: users may put sensitive information into free-text input like an LLM prompt, and entire HTTP requests/responses can carry tokens or secrets you didn't intend to log. Most logging platforms also charge by volume, so ask whether the data will actually get used before logging all of it. Prefer logging the specific fields actually needed over an entire request/response/document; if a purpose-built tool exists for a specific case (e.g. a conversation-monitoring feature for LLM exchanges), that's usually a better fit than routing it through general-purpose logs.

12. **Write logs to stdout/stderr, not directly to files from application code.** In containerized/cloud environments, the platform's log collector reads stdout — writing to files yourself adds complexity (rotation, disk space) that the platform already handles.

## Applying these rules

- **Writing new code**: use the project's existing logger setup if one exists; if none exists yet, set up Pino as described above before adding log calls. Check the "what to log" section first — runtime decisions, algorithm/step outcomes, audit events, and pre-error context are the highest-value places to add a log line, and it's fine to add them liberally while building/debugging and prune later.
- **Reviewing existing code**: flag any `console.log`/`console.error` left in server code, any error logged without the `Error` object, any place a secret or PII could end up in a log line, any large unstructured blob (full request/response bodies, full LLM exchanges) logged without a specific stated purpose, any unhandled exception represented only by a log line instead of the project's actual error-tracking capture mechanism, and any multi-outcome event logged as a nested blob instead of flat, individually-queryable fields.

