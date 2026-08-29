# EthiScope ⚖️

A human-in-the-loop AI audit studio. You and an AI agent audit an AI system together against the EU AI Act and NIST AI RMF — powered by [WebMCP](https://webmachinelearning.github.io/webmcp/).

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com) (Aug 25 – Sep 3, 2026).

## The idea

**The agent drafts, the human approves.** The agent uses structured tools to write assessments and attach evidence, but every draft lands in `pending_review`. Only criteria you explicitly approve in the UI enter the final report. The agent audits the AI — you audit the agent.

## The 5 WebMCP tools

| Tool | Type | Purpose |
|---|---|---|
| `list_frameworks` | read | EU AI Act + NIST AI RMF criteria (15), with ids and descriptions |
| `get_audit_state` | read | Which criteria are pending / draft / approved / rejected |
| `draft_assessment` | write | Save a draft + proposed rating → `pending_review` |
| `add_evidence` | write | Attach evidence (URL / note) to a criterion |
| `compile_report` | read | Build the final markdown report from **approved criteria only** |

## Why WebMCP?

AI auditing is the perfect trust-demo for WebMCP: the agent can write, but a sensitive action — putting content in the final report — requires human confirmation. The spec's safety model (confirmation for consequential actions) is the product here, applied to an ethics domain. Everything is logged: actor, tool, action.

## Stack

- Vite + React 19 + TypeScript (strict)
- Zustand + localStorage (no backend, no LLM calls — the frameworks are static data)
- [michi-router](https://www.npmjs.com/package/@arielgonzaguer/michi-router)
- Vitest + Testing Library (31 tests: store approval flow + WebMCP tool execution)

## Run

```bash
cd ethiscope
npm install
npm run dev
```

Test: `npm test` · Build: `npm run build`

## Try it with an agent

Open the live URL in the ChatGPT desktop app (GPT-5.6 Sol/Terra). Try: *"Draft an assessment of this chatbot against the EU AI Act transparency criterion."* Then approve it in the UI and run *"Compile the report."*

## License

MIT — see [LICENSE](../LICENSE).
