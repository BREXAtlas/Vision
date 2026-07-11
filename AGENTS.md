# Vision 2031 Engineering Guide

## Purpose
Build a private-by-default, static, aspirational five-year learning game. Vision Story is possibility; Real Plan is measurable action; Learning Lab is sourced education. Outcomes are never promised.

## Architecture and conventions
React + strict TypeScript + Vite, HashRouter, CSS tokens, typed content and deterministic engines. Browser-local versioned persistence only. Components use semantic HTML; calculations stay pure and tested. Content is original, supportive, specific, and never shaming. TOS remains undefined until edited by the user.

## Commands
`pnpm run dev`, `lint`, `typecheck`, `test`, `test:e2e`, `validate:content`, `build`, `preview`, and `verify`.

## Quality requirements
Tests cover dates, generators, scoring, persistence/import, calculations, and sources. Run `pnpm run verify` before completion. Check mobile and keyboard flows. No required TODOs, dead controls, secrets, remote analytics, or private console logging.

## Accessibility
Target WCAG 2.2 AA: landmarks, skip link, logical headings, labels, visible focus, keyboard support, 44px targets, contrast, reduced motion, live quiz feedback, text alternatives, focus restoration, and table alternatives for charts.

## Financial and factual guardrails
Educational illustrations are not financial, investment, tax, legal, accounting, or medical advice. Label assumptions; never guarantee returns or outcomes. Link factual lessons to official sources. Rules change; recommend current licensed professional guidance. Distinguish revenue, profit, cash flow, valuation, paper wealth, liquidity, and accessible cash.

## Review checklist
- All routes and interactive controls work at `/Vision/`.
- No gaps/overlaps across 15 quarters; daily generation is deterministic.
- State export/import/reset are safe and local.
- Content counts and source references validate.
- Responsive, keyboard, screen reader, reduced-motion, and build checks pass.
