# Agentic Guardians · AI / investor-bot discoverability kit (v2)

**v2 (filled draft):** combines the live site with the founders' one-page proposal and their own product materials. New in v2: "runtime trust layer" positioning, SME focus, the "AI trust you can prove" tagline (approved), allow / pause / block, "designed to align with" NIST AI RMF, ISO/IEC 42001, ISO/IEC 27001 and GDPR, stage, the founders with LinkedIn URLs, and a suggested contact. Remaining placeholders are listed in `FACTS-NEEDED.md`.

For Jagad. Goal: when an investor's AI assistant (ChatGPT, Perplexity, Grok, Claude, Gemini…) scouts deals, it finds Agentic Guardians and gets an accurate, machine-readable picture. Every product claim in this kit comes from the live site (developer-v7, envelope-v2) or the founders' own proposal and product materials (see "Claims audit" below). Facts only Armine has are `[[PLACEHOLDERS]]`; see `FACTS-NEEDED.md`.

## Files and where they go

| File | What it is | Where it goes |
| --- | --- | --- |
| `llms.txt` | Plain-markdown summary written for AI assistants (llmstxt.org format: H1, blockquote summary, sections, link lists, "Optional" section) | **Domain root** → `/llms.txt` |
| `robots.txt` | Explicitly allows the major search and AI crawlers, points to the sitemap | **Domain root** → `/robots.txt` |
| `sitemap.xml` | Sitemap template (home, /investors/, /llms.txt) | **Domain root** → `/sitemap.xml` |
| `investors/index.html` | "For investors" page: Problem, Why now, Product, How it's different, Traction, Team, The ask, Contact. Semantic HTML, minimal neutral inline CSS so you can restyle it | `/investors/index.html` next to the chosen version (move the inline `<style>` into that version's `styles.css` if you like) |
| `head-meta.html` | `<title>`, meta description, canonical, robots, Open Graph, Twitter card, llms.txt + sitemap links | Paste into `<head>` of the chosen version's `index.html` (and adapt canonical/og:url on /investors/) |
| `jsonld.html` | schema.org JSON-LD `@graph`: Organization, SoftwareApplication, WebSite | Paste into `<head>` of the home page (optionally the investors page too) |
| `FACTS-NEEDED.md` | What Armine must supply | Not deployed |

### Important: GitHub Pages project sites
`https://bynkn.github.io/ags-preview/` is a **project site**, so everything is served from the `/ags-preview/` subpath. Crawlers only ever request `https://<host>/robots.txt` and assistants look for `https://<host>/llms.txt` at the **host root**, so `robots.txt`, `llms.txt` and `sitemap.xml` **do nothing** while the site lives under `bynkn.github.io/ags-preview/`. They start working once the chosen version is served at the root of the final domain (custom domain on Pages, or any other host). `head-meta.html`, `jsonld.html` and `investors/` work at any path, but canonical/og URLs should still point at the final domain.

### Before launch (checklist)
1. Replace every `[[...]]`. In `jsonld.html`, **delete** any property you can't fill rather than shipping a placeholder.
2. **Remove `<meta name="robots" content="noindex,nofollow">`**: envelope-v2 (and the old envelope and the preview index) carry it. If it ships, no crawler or assistant will index the page and this kit is pointless. developer-v7 does not have it.
3. Standardise the meta description on the developer-v7 wording (envelope-v2 uses a variant).
4. Validate: https://validator.schema.org/, https://search.google.com/test/rich-results, and an Open Graph preview tool.
5. Link `/investors/` from the main page footer (e.g. next to "Contact the founders") so crawlers can find it.

## Keyword set
Used in titles, descriptions, llms.txt and JSON-LD `knowsAbout`; keep them in visible copy where it reads naturally:
- AI agent security
- agent guardrails
- agentic trust layer / trust layer for AI agents
- AI agent runtime safety
- behavioural anomaly detection for AI agents
- agent action monitoring (file reads, API calls, shell commands)
- prompt-injection-resistant (it doesn't read prompts, so it can't be injected)
- signed, verifiable blocks (Ed25519)
- runtime trust layer for AI agents
- AI agent governance for SMEs
- NIST AI RMF / ISO 42001 / ISO 27001 / GDPR alignment (always "designed to align with", never "certified" or "compliant")
- local, CPU-only, no language model in the decision path

## Copy rules applied
- Product name always "Agentic Guardians".
- Signing line exactly: "Every block is signed (Ed25519). Anyone can verify it." Only blocks are signed; nothing says every decision or allow is signed. The retired line is not used.
- "Stays local. No cloud round-trip." used verbatim.
- Meta description kept as is.
- No statistics, no named integrations, no identity or authorization claims, no competitor names, never the word "judge". The Detection Certificate example values (score, ID, timestamp) are **not** reused, so they can't be read as stats.

## Claims audit (kit claim → site source)
| Kit claim | Source on site |
| --- | --- |
| The trust layer for AI agents | developer-v7 hero / `<title>` |
| Scores your agent's behaviour before every action runs. Doesn't read prompts. Can't be persuaded. | developer-v7 meta description; closing line on both |
| Your AI agent is already out there. Do you know what it's doing right now? | both, hero |
| It drifts. It makes things up. It gets weaponized. Then it acts. You'll never know it happened. Until it's too late. | developer-v7 problem section |
| Does it do what it's told, and only that? | developer-v7 |
| AI can't watch AI. Lock and the thief in the same paradigm. A prompt that reaches the agent can reach the guard. Can't ask a corrupted process to report its own corruption. | both, "The paradigm" |
| Watches what your agent does. Works outside the paradigm. Doesn't read prompts, so it can't be injected. No language model. No GPU. | developer-v7 |
| Learn / Check / Block (fingerprint, scored before it runs, any deviation from the baseline is blocked) | both |
| Input: agent actions (file reads, API calls, shell commands). Not prompts, not tokens. | both, "Built different" / "How it works" |
| Statistical behavioural model. No language model in the decision path. | both |
| On CPU. No GPU needed. | both |
| Stays local. No cloud round-trip. | developer-v7 "Data" row |
| Output: allow or block | envelope-v2 "Output" row |
| Every block is signed (Ed25519). Anyone can verify it. | developer-v7 "Proof" row |
| Detection Certificate; payments-01 example (read_file → match_ledger → write_report; http.post to an account never seen; blocked before it ran) | both, demo |
| Private beta, early access, a few teams at a time | developer-v7 access section; envelope-v2 "onboarding our first teams personally" |
| Your agent is running right now. Nobody is watching it yet. | developer-v7 closing |
| © 2026 Agentic Guardians | both, footer |
| Runtime trust layer for AI agents; built for SMEs; regulation aligned; trust you can prove | founders' proposal (header) |
| Learn → evaluate next action before execution → detect sequence deviation in real time → allow / pause / block → verifiable proof artefact | founders' proposal ("Breakthrough Logic") |
| Not AI watching AI; enforcement outside the semantic reasoning layer | founders' proposal |
| Prompt filters / logs / manual review / AI supervising AI comparison (no names) | founders' proposal ("State of the Art Failure") |
| SMEs lack AI security teams; machine-speed harm in payments, development, personnel data, legal, health admin; unintended GDPR / AI Act breaches | founders' proposal ("Consequences") |
| Lightweight enough for SMEs; robust enough for regulated workflows; auditability, human review, compliance evidence | founders' proposal ("Why it matters") |
| Designed to align with NIST AI RMF, ISO/IEC 42001, ISO/IEC 27001, GDPR | founders' proposal ("Aligned with"); softened to "designed to align with" |
| AI trust you can prove | founders (approved tagline) |
| Why-now lines, "who guards the guardians", "no rules to write", database queries, founder bios, IEEE Access (2020) research | founders' product materials |
| Every block is signed (Ed25519). Anyone can verify it. | site, reconfirmed by Armine |

### Wording choice: "deterministic" vs "statistical"
The proposal says "deterministic behavioural enforcement" and "deterministic runtime control". The site says "Statistical behavioural model", and the certificate shows an anomaly score. Both can be true: the scoring is statistical, and the enforcement (allow / pause / block before execution) is a definite outcome. To avoid an AI assistant reading a contradiction, the kit says "statistical behavioural model" for the engine and "behavioural enforcement before execution" for the outcome, and doesn't use "deterministic". The founders can adopt "deterministic enforcement" once they're comfortable it holds publicly.
