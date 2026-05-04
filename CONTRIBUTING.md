# Contributing

Garmin MCP Unofficial is designed for personal Garmin Connect users and AI agents. Contributions should preserve the local-first, read-only and privacy-aware posture.

## Good contributions

- Safer setup UX for non-technical users.
- More Garmin endpoint coverage with clear privacy handling.
- Better summaries, tests and MCP client examples.
- Agent manifests and prompts that reduce integration friction.
- Documentation that distinguishes unofficial Garmin Connect mode from Garmin Health API partner access.

## Rules

- Do not log or return Garmin tokens.
- Do not ask users to paste Garmin passwords into agent chat.
- Keep write/upload actions out of the default toolset.
- Add tests for new tools, privacy behavior and agent-readable output.
- Explain Garmin endpoint drift clearly in errors and docs.

## Development

```bash
npm install
npm test
```
