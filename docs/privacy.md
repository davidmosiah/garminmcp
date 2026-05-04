# Privacy

Garmin health data is sensitive. Garmin MCP is local-first and read-only by design.

## Local files

- Tokens: `~/.garmin-mcp/garmin_tokens.json`
- Config: `~/.garmin-mcp/config.json`
- Optional cache: `~/.garmin-mcp/cache.sqlite`

Token/config files are written with user-only permissions on Unix-like systems.

## Privacy modes

- `summary`: minimized identifiers and profile/GPS details.
- `structured`: normalized data suitable for agents.
- `raw`: full supported Garmin Connect payloads. Use only by explicit request.

## What not to paste into chat

- Garmin password
- MFA codes
- `di_token`, `di_refresh_token`, `jwt_web`, CSRF token values
- raw GPS exports or private activity payloads

## Boundary

This project reads processed Garmin Connect data. It does not expose unrestricted raw device telemetry and it does not provide medical advice.
