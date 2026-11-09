const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('parts search forwards and URL-encodes the search term', async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../js/api.js'), 'utf8');
  let requested;
  const context = {
    URLSearchParams,
    localStorage: { getItem: () => null },
    fetch: async url => {
      requested = url;
      return { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ data: [] }) };
    }
  };
  vm.runInNewContext(source + ';globalThis.client=api;', context);
  await context.client.getParts({ busca: 'freio & óleo' });
  const url = new URL(requested, 'http://localhost');
  assert.equal(url.pathname, '/api/pecas');
  assert.equal(url.searchParams.get('busca'), 'freio & óleo');
});
