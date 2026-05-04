# Auth

Garmin MCP uses unofficial Garmin Connect personal token mode.

```bash
npx -y garmin-mcp-unofficial auth --install-helper
```

The command installs the Python `garminconnect` helper when missing, prompts locally for Garmin credentials and MFA, then writes tokens to `~/.garmin-mcp/garmin_tokens.json` with user-only permissions.

The MCP does not store Garmin passwords and does not return token values from any tool.
