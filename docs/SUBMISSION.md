# EthiScope — Devpost Submission Texts (English)

## Tagline

A human-in-the-loop AI audit studio — the agent drafts, you decide. Powered by WebMCP.

## Text description

### Why your use case is a strong fit for WebMCP

Auditing an AI system is a sensitive, high-stakes workflow: assessments must be accurate, evidence-backed, and — critically — **approved by a human**. WebMCP's safety model is built around exactly this: structured tools with confirmation gates for consequential actions. EthiScope turns that model into the product. The agent uses five tools (`list_frameworks`, `get_audit_state`, `draft_assessment`, `add_evidence`, `compile_report`) to work against the EU AI Act and NIST AI RMF, but drafts only ever enter the final report after explicit human approval in the UI.

### How it creates a better user experience

Human and agent share one live audit: when the agent drafts an assessment, it appears instantly as *pending review* in the workspace. The human reads it, checks the attached evidence, and clicks Approve or Reject — and that decision is the only thing that gates content into the report. Every action is logged with actor and tool, so the audit trail is visible, not implied. No account, no backend: the workspace persists in localStorage and runs entirely in the browser.

### What people and agents can do together that was difficult or impossible before

Before WebMCP, an agent auditing via a UI would type into text fields and hope: no structured knowledge of which criteria exist, no enforced approval gate, no shared state with the human reviewer. EthiScope makes the division of labor explicit: **the agent does the drafting and evidence-gathering; the human does the approving.** The agent audits the AI — the human audits the agent.

### How you implemented WebMCP

Five tools registered imperatively on `document.modelContext` (feature-detected, top-level page). Read-only tools use `annotations.readOnlyHint: true`. Inputs are validated strictly in code with descriptive errors (unknown criterion ids, invalid ratings, empty drafts). The approval flow is enforced in the store: `draft_assessment` can only set a criterion to `draft`; only the UI's Approve button (human action) transitions it to `approved`; `compile_report` filters exclusively on `approved` state. The frameworks are static TypeScript data — EU AI Act risk-based obligations and NIST AI RMF Govern/Map/Measure/Manage — so the whole system is deterministic, tested (31 vitest tests), and free to run.

---

## Build & test

```bash
cd ethiscope
npm install
npm run dev      # local
npm test         # 31 tests
npm run build    # production build
```

Live URL (Netlify): *(fill after deploy)*

Repository: *(fill with GitHub URL)*

## Testing in ChatGPT

1. Open the live URL in the ChatGPT desktop app's in-app browser (GPT-5.6 Sol or Terra).
2. Check "Available site tools" in the address bar — 5 tools registered.
3. Try: *"Draft an assessment of this chatbot against the EU AI Act transparency criterion."* then approve it in the UI and run *"Compile the report."*
