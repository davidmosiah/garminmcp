# Agent Development Notes

## Scope

This repo is the unofficial Garmin Connect MCP connector for local agent workflows. Garmin auth is more fragile than OAuth-based providers, so changes must be conservative.

## Commands

- Install: `npm ci`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Fast smoke: `npm run smoke`
- HTTP smoke: `npm run smoke:http`
- Full gate: `npm test`

## Rules

- Never commit Garmin tokens, helper cookies, credentials, personal health data, or local config.
- Keep the connector explicitly unofficial and local-first.
- Preserve agent-ready surfaces: manifest, connection status, privacy audit, CLI UX, Hermes agent manifest, and metadata checks.
- Avoid making network auth tests mandatory in CI; use fixture or readiness checks instead.
