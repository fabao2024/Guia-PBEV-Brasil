# Guia PBEV Brasil · Public Roadmap

This roadmap covers only the public product available at [guiapbev.cloud](https://guiapbev.cloud) and the frontend code in this repository.

Administrative operations, personal data, matching rules, credentials, private infrastructure and partner information are not part of this repository.

## Principles

- Vehicle data sourced from public and official sources, with a visible update date.
- Mobile-first, accessible and progressive experience.
- Reproducible calculations for range, energy, IPVA and TCO.
- Privacy by default and explicit consent in forms.
- No credentials embedded in the static build.
- External integrations handled through minimal, tested HTTP contracts.

## Shipped

| Public area | Status | Summary |
|---|---:|---|
| BEV catalog | ✅ | Search, filters, images, spec sheet and PBE/INMETRO data |
| Comparison | ✅ | Side-by-side comparison with shareable URLs |
| Savings simulator | ✅ | Energy, fuel, IPVA and editable assumptions |
| TCO | ✅ | Total cost of ownership with reproducible scenarios |
| Recommendation quiz | ✅ | Local recommendation based on the informed profile |
| Route planning | ✅ | Consumption estimate and charging stations along the route |
| PWA | ✅ | Manifest, installation and responsive experience |
| Internationalization | ✅ | PT-BR and English |
| Public observability | ✅ | Product events with no personally identifiable data |
| Client security | ✅ | CSP, sanitization, rate limit and secret scanner on the build |
| Data governance | ✅ | Official collectors, versioned provenance, fail-closed reports and auditable monthly maintenance |
| Service interest | ✅ | Consent-based form for wallbox, solar energy and solar panel cleaning in SP |
| Partner program | ✅ | Landing page with open signup for wallbox, solar energy and solar system cleaning, transparent terms, measurable funnel and human review |

## Public partner program

Partner signup for wallbox, solar energy and solar system cleaning in SP follows rules displayed on the `/parceiros/` landing page itself:

- single free-tier limit displayed and accepted on the landing page: 1 qualified and accepted lead, at no cost, per partner, regardless of origin or campaign;
- Wallbox residential (PF): R$ 100 per accepted lead after the pilot;
- Wallbox business (PJ): R$ 150 per accepted lead after the pilot;
- solar energy integrated with charging (PF/PJ): R$ 250 per accepted lead after the pilot;
- solar panel system cleaning (PF/PJ): R$ 35 per accepted lead after the pilot;
- no additional leads before a new proposal, contract, adequate legal and tax structure, payment method and formal acceptance;
- no promise of volume or conversion;
- contact sharing only after consent and human review.

The frontend submits applications to an external API under a versioned contract, including the exact numeric limit shown in the acceptance. Administrative implementation, data and automations remain outside this public repository.

## Upcoming public increments

### Short term

- expand accessibility tests for the catalog, comparison and partners routes;
- publish the methodology behind TCO and consumption estimates;
- improve Core Web Vitals and bundle splitting;
- display data freshness and provenance in a more granular way.

### Medium term

- comparable public price history;
- new residential and public charging scenarios;
- shareable export of comparisons and simulations;
- geographic expansion of the partner program only after pilot validation.

### Out of public scope

- administrative dashboards;
- internal Kanbans;
- consumer or partner data;
- private deduplication, matching and due diligence rules;
- credentials, infrastructure, jobs and operational runbooks;
- individual commercial terms.

## Completion criteria

A public deliverable is only marked as complete after:

1. relevant automated testing;
2. production build;
3. artifact secret scanner;
4. public documentation without private operational information;
5. deploy verified at the canonical URL.
