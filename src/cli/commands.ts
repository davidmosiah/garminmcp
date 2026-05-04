import { buildConnectionStatus } from "../services/connection-status.js";
import { SERVER_VERSION } from "../constants.js";
import { parseAgentClientName } from "../services/agent-manifest.js";
import { runAuthCommand } from "./auth.js";
import { runSetupCommand } from "./setup.js";

export async function runCliCommand(args: string[]): Promise<number | undefined> {
  const [command, ...rest] = args;
  if (!command || command === "--http") return undefined;
  if (command === "setup") return runSetupCommand(rest);
  if (command === "doctor" || command === "status") return runDoctor(rest);
  if (command === "auth") return runAuthCommand(rest);
  if (command === "version" || command === "--version" || command === "-v") {
    console.log(SERVER_VERSION);
    return 0;
  }
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }
  if (!command.startsWith("--")) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return 1;
  }
  return undefined;
}

async function runDoctor(args: string[]): Promise<number> {
  const options = parseDoctorOptions(args);
  const status = await buildConnectionStatus({ client: options.client });
  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    printDoctor(status);
  }
  return options.strict && !status.ok ? 1 : 0;
}

function parseDoctorOptions(args: string[]) {
  let client: ReturnType<typeof parseAgentClientName> | undefined;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--client") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) throw new Error("Missing value for --client.");
      client = parseAgentClientName(value);
      index += 1;
    }
  }
  return {
    json: args.includes("--json"),
    strict: args.includes("--strict"),
    client
  };
}

function printDoctor(status: Awaited<ReturnType<typeof buildConnectionStatus>>): void {
  console.log("Garmin MCP Doctor");
  console.log(`Status: ${status.ok ? "ready" : "needs setup"}`);
  if (status.client) console.log(`Client: ${status.client}`);
  console.log("");
  console.log("Checks:");
  console.log(`- Node.js >=20: ${status.node.supported ? "ok" : `needs update (${status.node.version})`}`);
  console.log(`- Garmin local config: ${status.config.exists ? "ok" : "optional"}`);
  console.log(`- Local config: ${status.config.exists ? `${status.config.source} at ${status.config.path}` : "missing"}`);
  console.log(`- Token file: ${status.token.exists ? status.token.path : "missing"}`);
  if (status.token.exists) {
    console.log(`- Token permissions: ${status.token.secure_permissions === false ? "insecure" : "ok"}`);
    console.log(`- DI token: ${status.token.has_di_token ? "present" : "missing"}`);
    console.log(`- DI refresh token: ${status.token.has_refresh_token ? "present" : "missing"}`);
    if (status.token.display_name) console.log(`- Garmin display name: ${status.token.display_name}`);
  }
  console.log(`- Privacy mode: ${status.privacy_mode}`);
  console.log(`- Cache: ${status.cache.enabled ? `enabled at ${status.cache.path}` : "disabled"}`);
  if (status.client_checks?.hermes) {
    const hermes = status.client_checks.hermes;
    console.log("- Hermes config:");
    console.log(`  path: ${hermes.config_path}`);
    console.log(`  configured: ${hermes.garmin_server_configured ? "ok" : "missing"}`);
    console.log(`  pinned package: ${hermes.package_pinned ? "ok" : "missing"}`);
    console.log(`  skill: ${hermes.skill_installed ? hermes.skill_path : "missing"}`);
    console.log(`  direct tool prefix: ${hermes.direct_tool_prefix}`);
  }
  console.log("");
  console.log("Next steps:");
  status.next_steps.forEach((step, index) => console.log(`${index + 1}. ${step}`));
  if (status.client_checks?.hermes?.recommendations.length) {
    console.log("");
    console.log("Hermes recommendations:");
    status.client_checks.hermes.recommendations.forEach((step, index) => console.log(`${index + 1}. ${step}`));
  }
}

function printHelp(): void {
  console.log(`Garmin MCP Server

Usage:
  garmin-mcp-server                 Start MCP stdio server
  garmin-mcp-server --http          Start local HTTP MCP server
  garmin-mcp-server setup           Guided setup, local config, and MCP client config
  garmin-mcp-server doctor          Check setup and next steps
  garmin-mcp-server doctor --json   Print setup status as JSON
  garmin-mcp-server doctor --client hermes
  garmin-mcp-server auth            Login locally through the helper and save ~/.garmin-mcp/garmin_tokens.json
  garmin-mcp-server auth --install-helper
                                  Install the Python garminconnect helper if missing

Optional env/config:
  GARMIN_TOKEN_PATH=~/.garmin-mcp/garmin_tokens.json
  GARMIN_PRIVACY_MODE=summary|structured|raw
  GARMIN_CACHE=sqlite
`);
}
