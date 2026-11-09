const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');

test('order list removes loading status on success', () => {
 const start=source.indexOf('async pageOrders()');
 const end=source.indexOf('// ============ PARTS',start);
 const page=source.slice(start,end);
 assert.match(page,/status\.textContent\s*=\s*''/);
});

test('successful checkout clears the visible stale cart before confirming', () => {
 const start=source.indexOf('pageCart() {');
 const end=source.indexOf('async pageOrders()',start);
 const page=source.slice(start,end);
 assert.match(page,/Cart\.clear\(\);[\s\S]*?this\.pageCart\(\)/);
});
