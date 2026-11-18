import { build } from 'esbuild';
import assert from 'node:assert/strict';
const values = new Map();
globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
console.assert = (condition, message) => assert.ok(condition, message);
const result = await build({ entryPoints: ['src/lib/security/__tests__/security.test.ts'], bundle: true, write: false, platform: 'node', format: 'esm', define: { 'import.meta.env': '{"PROD":true}' } });
await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
console.log('Security assertions passed.');
