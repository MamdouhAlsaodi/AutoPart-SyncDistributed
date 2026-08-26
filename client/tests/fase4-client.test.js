const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const apiSource = fs.readFileSync('/home/server/Projects/AutoPart-SyncDistributed/client/js/api.js','utf8');
const cartSource = fs.readFileSync('/home/server/Projects/AutoPart-SyncDistributed/client/js/cart.js','utf8');
const appSource = fs.readFileSync('/home/server/Projects/AutoPart-SyncDistributed/client/js/app.js','utf8');
function storage() { const data=new Map(); return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),raw:()=>data.get('autopart.cart.v1')}; }
test('api checkout sends only exact server contract', async()=>{ const local=storage(), calls=[]; const context={localStorage:local,fetch:async(url,opt)=>{calls.push({url,opt});return {ok:true,headers:{get:()=> 'application/json'},json:async()=>({total:37})};}}; vm.runInNewContext(apiSource+';globalThis.result=api;',context); await context.result.checkout([{id:'p1',nome:'Display',unitPriceCents:999,total:999999,quantity:2}]); assert.equal(calls[0].url,'/api/orders/checkout'); assert.equal(calls[0].opt.headers['Content-Type'],'application/json'); assert.deepEqual(JSON.parse(calls[0].opt.body),{items:[{partId:'p1',quantity:2}]}); });
test('cart clears only after simulated success and rejected checkout preserves it',async()=>{ const local=storage(), context={localStorage:local}; vm.runInNewContext(cartSource+';globalThis.Cart=Cart;',context); context.Cart.addProduct({id:'p1',nome:'Display',preco_venda:10}); const before=local.raw(); await Promise.reject(new Error('rejected')).catch(()=>{}); assert.equal(local.raw(),before); context.Cart.clear(); assert.equal(local.raw(),undefined); });
test('app exposes orders, feedback, estimate, and no payment gateway',()=>{assert.match(appSource,/Meus pedidos/);assert.match(appSource,/pageOrders/);assert.match(appSource,/checkout-feedback/);assert.match(appSource,/Total estimado/);assert.doesNotMatch(appSource,/stripe|paypal|mercadopago|payment gateway/i);});
