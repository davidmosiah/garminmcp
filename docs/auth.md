# Auth

Garmin MCP uses unofficial Garmin Connect personal token mode.

```bash
npx -y garmin-mcp-unofficial auth --install-helper
```

The command installs the Python `garminconnect` helper when missing, prompts locally for Garmin credentials and MFA, then writes tokens to `~/.garmin-mcp/garmin_tokens.json` with user-only permissions.

The MCP does not store Garmin passwords and does not return token values from any tool.

`auth --install-helper` first tries the active Python environment. If that environment cannot install packages because of Homebrew/PEP 668 restrictions, it creates an isolated helper environment at `~/.garmin-mcp/venv` and installs `garminconnect` there.

`setup` and `auth` are separate by default so the user can see exactly when credentials are requested. Use `setup --auth` only when you intentionally want setup to continue directly into Garmin login.
