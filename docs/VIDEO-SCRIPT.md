# EthiScope — Video Script (<3 min)

**Formato:** YouTube, público, con audio. <3 minutos.
**Grabar con:** OBS Studio o Xbox Game Bar (Win+G).

## Estructura

| Tramo | Tiempo | Contenido |
|---|---|---|
| Hook | 0:00–0:15 | El problema: ¿quién audita al agente? |
| Demo UI | 0:15–0:45 | Criterios, estados, filtros por marco |
| Demo agente | 0:45–1:50 | ChatGPT: draft + evidence + compile (con el giro de aprobación) |
| El trust loop | 1:50–2:30 | Por qué WebMCP es el candidato perfecto para esto |
| Cierre | 2:30–2:50 | Learn page, repo, llamado |

## Guion narrado (inglés)

**Hook:**
"AI agents can now act on the web. But when an agent drafts an audit of an AI system… who audits the agent? This is EthiScope — a human-in-the-loop AI audit studio, built on WebMCP."

**Demo como humano:**
"Here's the audit workspace: fifteen criteria across two frameworks — the EU AI Act and the NIST AI RMF. Each criterion starts pending. You can filter by framework, name the system under audit, and describe it. Nothing here is magic yet — until the agent shows up."

**Demo con agente (ChatGPT):**
"I open EthiScope in ChatGPT's in-app browser. Five tools are available. Let me ask it to draft an assessment."
*[Prompt: "Draft an assessment of this chatbot against the EU AI Act transparency criterion."]*
"The agent calls `draft_assessment`. Watch what happens: the draft appears in the UI as *pending review*. I can read it, check the evidence it added with `add_evidence` — and then I decide. Approve."
*[Click Approve]*
"Only now does it enter the report. Watch what happens if I don't approve."
*[Prompt: "Draft an assessment for data governance too."]*
"That second draft stays pending — and `compile_report` proves the point: the report contains only what I approved. Drafts never leak in."

**El trust loop:**
"This is why WebMCP is the right tool for this job. Its safety model says: sensitive actions need human confirmation. EthiScope makes that model the product. The agent has real power — it writes, it gathers evidence, it compiles — but the human's approval is the gate. Every action is logged: actor, tool, result."

**Cierre:**
"EthiScope is open source — check the Learn page for all five tools and the repo link below. Open it in ChatGPT, audit something together, and see the trust loop for yourself. Thanks for watching!"

## Prompts exactos

1. `Draft an assessment of this chatbot against the EU AI Act transparency criterion.`
2. `Add evidence for that assessment: a link to our disclosure policy.`
3. `Draft an assessment for the NIST incident response criterion.`
4. `Compile the report.`

## Checklist

- [ ] Reset de auditoría antes de grabar
- [ ] ChatGPT desktop con GPT-5.6 Sol/Terra
- [ ] Mostrar "Available site tools" del browser de ChatGPT
- [ ] Mostrar el flujo completo: draft → pending → approve → aparece en reporte
- [ ] Audio claro, sin música con copyright, <3 min
