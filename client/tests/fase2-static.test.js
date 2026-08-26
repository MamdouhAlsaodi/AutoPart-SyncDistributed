const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const root = __dirname + '/..';

test('public client uses catalogue contract and storefront anchors', () => {
  const api = fs.readFileSync(root + '/js/api.js', 'utf8');
  const app = fs.readFileSync(root + '/js/app.js', 'utf8');
  const html = fs.readFileSync(root + '/index.html', 'utf8');
  const storefront = app.slice(app.indexOf('async pageStorefront()'), app.indexOf('    go(page) {'));

  assert.match(api, /getCatalogue/);
  assert.match(api, /getCatalogueDetail/);
  assert.match(api, /URLSearchParams/);
  assert.match(app, /pageStorefront/);
  assert.match(app, /Área administrativa/);
  assert.match(app, /escape\(/);
  assert.match(storefront, /id="featured-grid"/);
  assert.match(storefront, /items\.slice\(0, 3\)/);
  assert.match(storefront, /p\.compatibilidades/);
  assert.match(storefront, /c\.marca/);
  assert.match(storefront, /c\.modelo/);
  assert.match(storefront, /c\.anos/);
  assert.doesNotMatch(storefront, /api\.getParts\(\)/);
  assert.doesNotMatch(html, /https?:\/\//);
  assert.match(html, /js\/api\.js/);
});
