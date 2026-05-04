# Security

Report security issues through GitHub issues if they do not contain secrets. Do not paste Garmin passwords, Garmin Connect tokens, raw GPS exports or private activity payloads into public issues.

## Sensitive data

Treat these as secrets:

- Garmin password and MFA codes
- `di_token`, `di_refresh_token`, `jwt_web` and CSRF token values
- raw Garmin Connect payloads with profile, location or GPS data
- local SQLite cache if enabled

## Local storage

By default tokens are stored at `~/.garmin-mcp/garmin_tokens.json` with `0600` permissions. The MCP never returns token values from tools.

## Supported posture

- Read-only tools only.
- Local-first token storage.
- `summary` and `structured` privacy modes for normal agent use.
- `raw` mode only by explicit opt-in.
- No medical diagnosis or treatment claims.

Run:

```bash
npx -y garmin-mcp-unofficial doctor
npx -y garmin-mcp-unofficial doctor --client hermes
```
