import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { buildAgentManifest, formatAgentManifestMarkdown } from "../services/agent-manifest.js";
import { buildCapabilities } from "../services/capabilities.js";
import { buildDataInventory } from "../services/inventory.js";
import { getConfig } from "../services/config.js";
import { applyPrivacy, resolvePrivacyMode } from "../services/privacy.js";
import { buildDailySummary, buildWeeklySummary, formatSummaryMarkdown } from "../services/summary.js";
import { GarminClient } from "../services/garmin-client.js";

function textResource(uri: URL, text: string, mimeType = "text/markdown"): ReadResourceResult {
  return { contents: [{ uri: uri.toString(), mimeType, text }] };
}

async function profileResource(uri: URL) {
  const config = getConfig();
  const endpoint = "/userprofile-service/socialProfile";
  const data = applyPrivacy(endpoint, await new GarminClient(config).get(endpoint), resolvePrivacyMode(config));
  return textResource(uri, JSON.stringify({ endpoint, data }, null, 2), "application/json");
}

async function latestActivityResource(uri: URL) {
  const config = getConfig();
  const endpoint = "/activitylist-service/activities/search/activities";
  const result = await new GarminClient(config).listActivities({ limit: 1 });
  const data = applyPrivacy(endpoint, { records: result.records }, resolvePrivacyMode(config));
  return textResource(uri, JSON.stringify(data, null, 2), "application/json");
}

async function dailySummaryResource(uri: URL) {
  const summary = await buildDailySummary(new GarminClient(getConfig()), { days: 7, timezone: "UTC" });
  return textResource(uri, formatSummaryMarkdown(summary));
}

async function weeklySummaryResource(uri: URL) {
  const summary = await buildWeeklySummary(new GarminClient(getConfig()), { days: 7, compare_days: 7, timezone: "UTC" });
  return textResource(uri, formatSummaryMarkdown(summary));
}

export function registerGarminResources(server: McpServer): void {
  server.registerResource("garmin_data_inventory", "garmin://inventory", { title: "Garmin Data Inventory", description: "Static inventory of supported Garmin data domains, privacy modes and recommended first calls.", mimeType: "application/json" }, async (uri) => textResource(uri, JSON.stringify(buildDataInventory(), null, 2), "application/json"));
  server.registerResource("garmin_capabilities", "garmin://capabilities", { title: "Garmin MCP Capabilities", description: "Static capabilities, API boundary, privacy modes and recommended agent workflow.", mimeType: "application/json" }, async (uri) => textResource(uri, JSON.stringify(buildCapabilities(), null, 2), "application/json"));
  server.registerResource("garmin_agent_manifest", "garmin://agent-manifest", { title: "Garmin Agent Manifest", description: "Machine-readable install and operating instructions for AI agents.", mimeType: "text/markdown" }, async (uri) => textResource(uri, formatAgentManifestMarkdown(buildAgentManifest("generic"))));
  server.registerResource("garmin_profile", "garmin://profile", { title: "Garmin Profile", description: "Authenticated Garmin profile using the configured privacy mode.", mimeType: "application/json" }, profileResource);
  server.registerResource("garmin_latest_activity", "garmin://latest/activity", { title: "Latest Garmin Activity", description: "Most recent Garmin activity log in the configured privacy mode.", mimeType: "application/json" }, latestActivityResource);
  server.registerResource("garmin_daily_summary", "garmin://summary/daily", { title: "Garmin Daily Summary", description: "Daily Garmin health summary built from API data.", mimeType: "text/markdown" }, dailySummaryResource);
  server.registerResource("garmin_weekly_summary", "garmin://summary/weekly", { title: "Garmin Weekly Summary", description: "Weekly Garmin health review built from API data.", mimeType: "text/markdown" }, weeklySummaryResource);
}
