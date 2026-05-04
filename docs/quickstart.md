# Garmin MCP Quickstart

## 1. Install setup

```bash
npx -y garmin-mcp-unofficial setup
```

For Hermes:

```bash
npx -y garmin-mcp-unofficial setup --client hermes
```

## 2. Connect Garmin locally

```bash
npx -y garmin-mcp-unofficial auth --install-helper
```

The helper prompts locally for Garmin email, password and MFA when needed. The MCP does not store your Garmin password.

## 3. Check readiness

```bash
npx -y garmin-mcp-unofficial doctor
```

## 4. Ask your agent

Start with:

```text
Call garmin_connection_status. If ready, call garmin_daily_summary with response_format=json and give me today's main recovery/training signal with 3 practical actions. Do not provide medical diagnosis.
```

## Notes

Garmin MCP is unofficial. It uses personal Garmin Connect token mode, not official Garmin Health API partner access.
