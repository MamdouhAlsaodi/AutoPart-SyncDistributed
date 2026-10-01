const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const slides = fs.readFileSync(path.join(root, '../docs/apresentacao.html'), 'utf8');

test('AutoPart logo is used in storefront, admin sidebar and presentation', () => {
  const mark = fs.readFileSync(path.join(root, 'favicon.svg'), 'utf8');
  assert.match(mark, /<title[^>]*>AutoPart/);
  assert.match(mark, /#e6a35e/i);
  assert.match(app, /class="site-brand"/);
  assert.match(app, /class="brand-mark" src="\/favicon\.svg"/);
  assert.match(slides, /class="brand-mark" viewBox="0 0 64 64"/);
  assert.match(slides, /class="cover-brand"/);
  assert.match(html, /css\/brand\.css/);
});

test('shared accessible palette has readable call-to-action contrast', () => {
  const css = fs.readFileSync(path.join(root, 'css/brand.css'), 'utf8');
  assert.match(css, /--orange:\s*#bb4f1a/i);
  assert.match(css, /--graphite:\s*#172630/i);
  const channel = hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);
  const luminance = hex => channel(hex).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126,.7152,.0722][i],0);
  const ratio = (a,b) => (Math.max(luminance(a),luminance(b)) + .05) / (Math.min(luminance(a),luminance(b)) + .05);
  assert.ok(ratio('#bb4f1a','#ffffff') >= 4.5);
  assert.ok(ratio('#e6a35e','#172630') >= 4.5);
});
