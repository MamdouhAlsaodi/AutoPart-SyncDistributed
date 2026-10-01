const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync(__dirname + '/../../docs/apresentacao.html', 'utf8');

test('opening slide contains the editable architecture overview and Arabic presenter notes', () => {
    const first = html.slice(html.indexOf('id="slide-1"'), html.indexOf('id="slide-2"'));
    assert.match(first, /<h1 id="h-s1">Diagrama de Arquitetura de Software<\/h1>/);
    assert.match(first, /<svg viewBox="0 0 1160 360" role="img"/);
    assert.equal((first.match(/class="hero-node"/g) || []).length, 6);
    for (const label of ['Navegador', 'API Express', 'MongoDB', 'Carrinho local', 'Segurança e regras', 'Persistência local']) assert.ok(first.includes(label), label);
    assert.match(first, /class="pnotes" lang="ar" dir="rtl"/);
    assert.match(first, /rs0 عضو واحد فقط/);
    assert.match(first, /ليست خدمات أو أجهزة مستقلة/);
    assert.equal((html.match(/<section class="slide/g) || []).length, 12);
});
