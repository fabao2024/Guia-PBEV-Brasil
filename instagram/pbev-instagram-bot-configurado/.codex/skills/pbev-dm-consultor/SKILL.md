---
name: pbev-dm-consultor
description: Use when improving Instagram DM/comment responses, adjusting the EletriBrasil assistant persona, grounding answers in the vehicle catalog, or tuning anti-spam and dedupe behavior. Trigger on requests like "melhore as DMs", "ajuste o consultor", "o bot respondeu errado", "corrija comentários duplicados", or "quero o mesmo consultor do site".
---

# PBEV DM Consultor

Use this skill for the conversational assistant in DMs and comments.

Common triggers:
- "melhore as DMs"
- "ajuste o consultor"
- "quero o mesmo consultor do site"
- "o bot respondeu errado"
- "corrija comentários duplicados"
- "melhore as respostas"

Primary files:
- `auto_responder.py`
- `ev_knowledge.py`
- `publisher.py`
- `main.py`
- `database.py`

Core rules:
- The assistant should mirror the EletriBrasil consultant behavior from the main Guia PBEV site.
- Responses must be grounded in the local catalog context when talking about models.
- Do not invent specs, incentives, or availability.
- Keep answers short enough for Instagram.
- For costs, route users to the TCO simulator.
- For comparisons, route users to the comparator when useful.
- Ignore spam and avoid loops from self-generated events.

Operational guardrails:
- DMs depend on `FACEBOOK_PAGE_ACCESS_TOKEN`.
- Comment replies depend on `META_ACCESS_TOKEN`.
- Comment handling must ignore events from the bot itself.
- Comment handling must dedupe repeated webhook deliveries.
- DM auth failures should degrade safely without flooding logs.

Workflow:
1. Inspect `get_consultor_system_context()` in `ev_knowledge.py`.
2. Inspect `_generate_response()` in `auto_responder.py`.
3. Check webhook filtering in `main.py`.
4. Check DM/comment delivery behavior in `publisher.py`.
5. Preserve logging and database traces for investigation.

Validation:
- Test one DM query about a known model.
- Test one comparison request.
- Test a repeated comment delivery scenario and confirm dedupe.
