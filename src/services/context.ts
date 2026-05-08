import type { GarminClient } from "./garmin-client.js";
import { buildDailySummary, type SummaryOptions } from "./summary.js";

type ContextOptions = SummaryOptions & {
  soreness?: string[];
  injury_flags?: string[];
  notes?: string;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function trainingLoad(activeMinutes?: number, readiness?: number): "low" | "normal" | "high" | "unknown" {
  if (activeMinutes === undefined && readiness === undefined) return "unknown";
  if ((activeMinutes ?? 0) >= 120 && (readiness ?? 100) < 70) return "high";
  if ((activeMinutes ?? 0) <= 20) return "low";
  return "normal";
}

export async function buildWellnessContext(client: Pick<GarminClient, "get" | "getDisplayName">, options: ContextOptions) {
  const summary = await buildDailySummary(client as GarminClient, options);
  const scorecard = record(summary.scorecard);
  const readiness = num(scorecard.training_readiness_score);
  const sleepScore = num(scorecard.sleep_score);
  const bodyBattery = num(scorecard.body_battery_end);
  const activeMinutes = num(scorecard.active_minutes);
  const recentTrainingLoad = trainingLoad(activeMinutes, readiness);
  const notes = [
    bodyBattery === undefined ? "Body Battery unavailable for this account/device or endpoint today." : `Body Battery end: ${bodyBattery}.`,
    readiness === undefined ? "Training readiness unavailable for this account/device today." : `Training readiness: ${readiness}.`,
    options.notes
  ].filter((note): note is string => Boolean(note));

  return {
    source: "garmin",
    context_contract_version: "delx-wellness-context/v1",
    context_type: "wellness_context",
    generated_at: summary.generated_at,
    readiness_score: readiness,
    sleep_score: sleepScore,
    body_battery: bodyBattery,
    recent_training_load: recentTrainingLoad,
    recent_training_load_minutes: activeMinutes,
    soreness: options.soreness ?? [],
    injury_flags: options.injury_flags ?? [],
    notes,
    data_quality: summary.data_quality,
    recommended_handoff: {
      tool: "exercise_catalog_recommend_session",
      reason: "Use Garmin readiness, sleep, Body Battery and movement load to scale workout intensity and volume.",
    },
    telegram_summary: [
      "Garmin wellness context",
      readiness !== undefined ? `Readiness: ${readiness}` : undefined,
      sleepScore !== undefined ? `Sleep: ${sleepScore}` : undefined,
      bodyBattery !== undefined ? `Body Battery: ${bodyBattery}` : undefined,
      `Load: ${recentTrainingLoad}`
    ].filter(Boolean).join(" | ")
  };
}

export function formatWellnessContextMarkdown(context: Record<string, unknown>): string {
  const lines = ["# Garmin Wellness Context", ""];
  for (const key of ["context_contract_version", "context_type", "readiness_score", "sleep_score", "body_battery", "recent_training_load"]) {
    if (context[key] !== undefined) lines.push(`- **${key}**: ${String(context[key])}`);
  }
  const handoff = record(context.recommended_handoff);
  if (handoff.tool !== undefined || handoff.reason !== undefined) {
    lines.push("", "## Recommended Handoff");
    if (handoff.tool !== undefined) lines.push(`- **tool**: ${String(handoff.tool)}`);
    if (handoff.reason !== undefined) lines.push(`- **reason**: ${String(handoff.reason)}`);
  }
  if (Array.isArray(context.notes) && context.notes.length) {
    lines.push("", "## Notes");
    for (const note of context.notes) lines.push(`- ${String(note)}`);
  }
  return lines.join("\n");
}
