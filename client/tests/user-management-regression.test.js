const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../js/app.js','utf8');
const css=fs.readFileSync(__dirname+'/../css/operations.css','utf8');

test('user creation is a viewport dialog with labels, accessible name and cleanup',()=>{
 const start=source.indexOf('async pageUsers()');
 const page=source.slice(start,source.indexOf('async toggleUser(',start));
 assert.match(page,/class="part-modal" hidden/);
 assert.match(page,/role="dialog" aria-modal="true"/);
 assert.match(page,/<label[^>]*>Nome[^<]*<input/);
 assert.match(page,/user-modal-error/);
 assert.match(page,/Escape/);
 assert.match(css,/\.part-modal\[hidden\]\s*\{\s*display:\s*none/);
 const go=source.slice(source.indexOf('go(page)'),source.indexOf('managementShell('));
 assert.match(go,/closeUserModal\(\)/);
});

test('user table escapes dynamic values and uses delegated safe actions',()=>{
 const start=source.indexOf('async pageUsers()');
 const page=source.slice(start,source.indexOf('async toggleUser(',start));
 assert.match(page,/this\.escape\(u\.nome\)/);
 assert.match(page,/this\.escape\(u\.email\)/);
 assert.match(page,/data-toggle-user/);
 assert.doesNotMatch(page,/onclick="App\.toggleUser\('\$\{u\._id\}'\)"/);
});
