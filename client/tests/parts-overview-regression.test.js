const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');
const css = fs.readFileSync(__dirname + '/../css/operations.css', 'utf8');
const context = vm.createContext({ document: { readyState: 'loading', addEventListener() {} }, console });
vm.runInContext(source + '\nglobalThis.AppUnderTest = App;', context);
const App = context.AppUnderTest;

test('parts filter matches names and codes as the query changes and restores the list', () => {
  const rows = [{codigo:'QA-100',nome:'Freio'}, {codigo:'QA-200',nome:'Filtro'}];
  assert.equal(App.filterParts(rows, 'fre').length, 1);
  assert.equal(App.filterParts(rows, 'QA-200')[0].nome, 'Filtro');
  assert.equal(App.filterParts(rows, '').length, 2);
});

test('parts search is bound to live input and add dialog closes on navigation', () => {
  const parts = source.slice(source.indexOf('async pageParts()'), source.indexOf('async savePart('));
  assert.match(parts, /(?:oninput|addEventListener\(['"]input['"])/);
  const go = source.slice(source.indexOf('go(page)'), source.indexOf('managementShell('));
  assert.match(go, /closeAddPartModal\(\)/);
  assert.match(parts, /aria-modal="true"/);
  assert.match(css, /\.part-modal\s*\{[^}]*position:\s*fixed/s);
});

test('overview derives stock summary from real API and supports loading errors', () => {
  const start = source.indexOf('async pageDashboard()');
  const dashboard = source.slice(start, source.indexOf('pageAccount()', start));
  assert.match(dashboard, /api\.getParts\(\)/);
  assert.match(dashboard, /summarizeOperations/);
  assert.match(dashboard, /catch/);
});
