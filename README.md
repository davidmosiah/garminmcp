# Garmin MCP Unofficial

Unofficial, local-first Garmin Connect MCP server for AI agents. It lets Claude, Cursor, Windsurf, Hermes, OpenClaw and any MCP-compatible client read processed Garmin signals such as sleep, HRV, Body Battery, stress, training readiness, daily movement and activities.

> Not affiliated with Garmin. Not medical advice. Garmin Connect personal mode is unofficial and can break if Garmin changes private auth or endpoints.

## Why this exists

Garmin has excellent health and training signals, but the official Garmin Health API is primarily partner-approved. This project gives individual Garmin users a practical open-source bridge for personal AI agents while keeping credentials and tokens local.

## What it supports

- Profile, user settings and registered devices.
- Daily movement: steps, calories, distance, floors and intensity minutes.
- Sleep: duration, stages and score when available.
- Recovery context: HRV, Body Battery, stress, training readiness/status, respiration and SpO2 when supported by the device/account.
- Activities: recent activities, activity details, splits, weather and heart-rate zones.
- Body logs: weight range and hydration when available.
- Agent summaries: daily and weekly diagnostics with confidence, bottlenecks and practical actions.

## Install

```bash
npx -y garmin-mcp-unofficial setup
npx -y garmin-mcp-unofficial auth --install-helper
npx -y garmin-mcp-unofficial doctor
```

For Hermes:

```bash
npx -y garmin-mcp-unofficial setup --client hermes
npx -y garmin-mcp-unofficial auth --install-helper
npx -y garmin-mcp-unofficial doctor --client hermes
```

The auth helper prompts locally for Garmin email, password and MFA if needed. This MCP does not store your Garmin password. Tokens are saved under `~/.garmin-mcp/garmin_tokens.json` with user-only permissions.

## MCP client config

Generic MCP config:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "garmin-mcp-unofficial"]
    }
  }
}
```

Useful optional env/config values:

```bash
GARMIN_TOKEN_PATH=~/.garmin-mcp/garmin_tokens.json
GARMIN_PRIVACY_MODE=summary   # summary | structured | raw
GARMIN_CACHE=sqlite
GARMIN_CACHE_PATH=~/.garmin-mcp/cache.sqlite
GARMIN_DOMAIN=garmin.com      # or garmin.cn
```

## Tool highlights

Start with:

- `garmin_agent_manifest`
- `garmin_auth_instructions`
- `garmin_connection_status`
- `garmin_daily_summary`
- `garmin_weekly_summary`

Low-level tools include:

- `garmin_get_profile`
- `garmin_get_user_settings`
- `garmin_list_devices`
- `garmin_get_daily_summary`
- `garmin_get_sleep_day`
- `garmin_get_heart_day`
- `garmin_get_hrv_day`
- `garmin_get_stress_day`
- `garmin_get_body_battery_day`
- `garmin_get_training_readiness_day`
- `garmin_list_activities`
- `garmin_get_activity_details`
- `garmin_get_weight_range`
- `garmin_privacy_audit`

## Privacy modes

- `summary`: minimized identifiers and sensitive fields.
- `structured`: normalized useful data for agents.
- `raw`: upstream Garmin Connect payloads. Use only when explicitly needed.

## Raw data boundary

This MCP reads processed Garmin Connect data and supported activity detail payloads. It does not provide unrestricted raw accelerometer, gyroscope or continuous device telemetry.

## Development

```bash
npm install
npm test
npm run build
```

## Links

- Docs: https://garminmcp.vercel.app/
- GitHub: https://github.com/davidmosiah/garminmcp
- npm: https://www.npmjs.com/package/garmin-mcp-unofficial
- Garmin Health API program: https://developer.garmin.com/gc-developer-program/health-api/
