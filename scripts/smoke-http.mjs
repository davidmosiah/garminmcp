import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const port = String(43000 + Math.floor(Math.random() * 1000));
const endpoint = `http://127.0.0.1:${port}/mcp`;
const child = spawn(process.execPath, ['dist/index.js', '--http'], {
  env: { ...process.env, GARMIN_MCP_PORT: port, GARMIN_MCP_HOST: '127.0.0.1' },
  stdio: ['ignore', 'ignore', 'pipe']
});

let stderr = '';
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: 1000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          resolve({ statusCode: response.statusCode, data: JSON.parse(body) });
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('timeout', () => request.destroy(new Error('HTTP health check timed out')));
    request.on('error', reject);
  });
}

try {
  let ok = false;
  for (let i = 0; i < 30; i += 1) {
    try {
      const { statusCode, data } = await getJson(`http://127.0.0.1:${port}/health`);
      assert.equal(statusCode, 200);
      assert.equal(data.ok, true);
      ok = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  if (!ok) throw new Error(`HTTP server did not become healthy. stderr=${stderr}`);

  const client = new Client({ name: 'Garmin MCP-http-smoke-test', version: '0.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    assert.ok(tools.tools.some((tool) => tool.name === 'garmin_capabilities'));
    const capabilities = await client.callTool({ name: 'garmin_capabilities', arguments: { response_format: 'json' } });
    assert.equal(capabilities.structuredContent?.links?.docs, 'https://garminconnectmcp.vercel.app/');
    console.log(JSON.stringify({ ok: true, transport: 'http', port: Number(port), endpoint: '/mcp', tools: tools.tools.length }, null, 2));
  } finally {
    await client.close().catch(() => undefined);
  }
} finally {
  child.kill('SIGTERM');
}
