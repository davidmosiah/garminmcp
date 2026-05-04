import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function userPrompt(text: string) {
  return { messages: [{ role: "user" as const, content: { type: "text" as const, text } }] };
}

export function registerGarminPrompts(server: McpServer): void {
  server.registerPrompt("garmin_daily_checkin", {
    title: "Garmin Daily Check-in",
    description: "Ask an agent to create a practical daily health and training check-in from Garmin.",
    argsSchema: { focus: z.string().optional().describe("Optional focus, e.g. sleep, training, recovery, Body Battery, stress.") }
  }, ({ focus }) => userPrompt(`Use Garmin MCP for a daily check-in${focus ? ` focused on ${focus}` : ""}.

Required flow:
1. Call garmin_connection_status.
2. If ready, call garmin_daily_summary with response_format=json.
3. Only drill into low-level tools if the summary shows a concrete question.

Return:
- main signal
- what changed or needs attention
- 3 practical actions for today
- confidence and missing data
- no medical diagnosis.`));

  server.registerPrompt("garmin_weekly_review", {
    title: "Garmin Weekly Review",
    description: "Ask an agent to review Garmin trends across activity, sleep, stress, Body Battery and heart context.",
    argsSchema: { goal: z.string().optional().describe("Optional goal, e.g. fat loss, tennis conditioning, endurance base, sleep repair.") }
  }, ({ goal }) => userPrompt(`Use Garmin MCP for a weekly review${goal ? ` for this goal: ${goal}` : ""}.

Required flow:
1. Call garmin_connection_status.
2. Call garmin_weekly_summary with response_format=json.
3. Use garmin_get_sleep_day, garmin_get_heart_day, garmin_get_hrv_day, garmin_get_stress_day or garmin_get_body_battery_day only to investigate specific bottlenecks.

Return:
- scorecard
- bottlenecks
- next-week actions
- risks/unknowns
- no medical diagnosis.`));

  server.registerPrompt("garmin_intraday_investigation", {
    title: "Garmin Day Signal Investigation",
    description: "Investigate one day of Garmin heart, stress, Body Battery and activity details without pretending to have raw telemetry.",
    argsSchema: { date: z.string().describe("yyyy-MM-dd or today"), focus: z.string().optional().describe("Optional focus such as stress, heart, body battery, workout.") }
  }, ({ date, focus }) => userPrompt(`Investigate Garmin signals for date=${date}${focus ? ` with focus=${focus}` : ""}.

Required flow:
1. Call garmin_get_heart_day with response_format=json.
2. Call garmin_get_stress_day and garmin_get_body_battery_day if available.
3. If the question is workout-specific, call garmin_list_activities and then garmin_get_activity_details for the relevant activity id.

Explain:
- what the processed Garmin data can and cannot prove
- notable periods or missing data
- whether follow-up should use sleep/activity tools
- no diagnosis or alarmism.`));
}
