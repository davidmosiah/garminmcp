import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildConnectionStatus } from '../dist/services/connection-status.js';
import { formatCollection } from '../dist/services/format.js';

const dir = mkdtempSync(join(tmpdir(), 'Garmin MCP-agent-readiness-'));

try {
  const markdown = formatCollection('Garmin Activities', [
    { activityId: 1, activityName: 'Morning Tennis', activityType: 'tennis', startTimeLocal: '2026-04-27 12:30:43', distance: 41.3 },
    { activityId: 2, activityName: 'Afternoon Tennis', activityType: 'tennis', startTimeLocal: '2026-04-26 20:05:51', distance: 4557 }
  ], {
    endpoint: '/activitylist-service/activities/search/activities',
    privacy_mode: 'summary',
    count: 2,
    records: [{ activityId: 1 }, { activityId: 2 }],
    pages_fetched: 1
  });

  assert.doesNotMatch(markdown, /\[object Object\]/, 'Markdown previews must never leak JavaScript object stringification.');
  assert.doesNotMatch(markdown, /\*\*records\*\*/i, 'Collection markdown should not duplicate full record arrays in metadata.');
  assert.match(markdown, /Morning Tennis/);

  const tokenPath = join(dir, 'garmin_tokens.json');
  writeFileSync(tokenPath, JSON.stringify({
    di_refresh_token: 'refresh',
    di_client_id: 'client-id'
  }), { mode: 0o600 });

  const limited = await buildConnectionStatus({
    env: {
      GARMIN_TOKEN_PATH: tokenPath
    },
    homeDir: dir,
    nowMs: 1_000_000
  });

  assert.equal(limited.ready_for_garmin_api, true, 'A refresh-token-only Garmin Connect token can refresh before API calls.');
  assert.equal(limited.ok, true);
  assert.deepEqual(limited.oauth.granted_scopes, ['garmin-connect-personal']);
  assert.deepEqual(limited.oauth.missing_recommended_scopes, []);
  assert.equal(limited.oauth.activity_tools_ready, false);
  assert.equal(limited.oauth.profile_tools_ready, false);

  writeFileSync(tokenPath, JSON.stringify({
    di_token: 'not-a-jwt',
    di_refresh_token: 'refresh',
    di_client_id: 'client-id',
    display_name: 'fixture-user'
  }), { mode: 0o600 });

  const ready = await buildConnectionStatus({
    env: {
      GARMIN_TOKEN_PATH: tokenPath
    },
    homeDir: dir,
    nowMs: 1_000_000
  });

  assert.equal(ready.ok, true);
  assert.equal(ready.ready_for_garmin_api, true);
  assert.deepEqual(ready.oauth.missing_recommended_scopes, []);
  assert.equal(ready.oauth.activity_tools_ready, true);

  console.log(JSON.stringify({ ok: true, markdown: true, personal_token_readiness: true }, null, 2));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
