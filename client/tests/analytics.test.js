const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},console});
vm.runInContext(fs.readFileSync(__dirname+'/../js/app.js','utf8')+'\nglobalThis.app=App;',ctx);
const app=ctx.app;
test('statistics visualization shows categories and empty state',()=>{
 const filled=app.renderStockChart([{ativo:true,estoque_atual:0,estoque_minimo:2},{ativo:true,estoque_atual:4,estoque_minimo:2}]);
 assert.match(filled,/Sem estoque/); assert.match(filled,/Adequado/); assert.match(filled,/stock-donut/);
 assert.match(app.renderStockChart([]),/Nenhuma peça ativa/);
});
test('stock chart categories are disjoint and sum to active products',()=>{
 const p=[{ativo:true,estoque_atual:0,estoque_minimo:2},{ativo:true,estoque_atual:2,estoque_minimo:2},{ativo:true,estoque_atual:8,estoque_minimo:2},{ativo:false,estoque_atual:0,estoque_minimo:2}];
 assert.deepEqual(JSON.parse(JSON.stringify(app.stockDistribution(p))),{zero:1,low:1,healthy:1,total:3});
 assert.deepEqual(JSON.parse(JSON.stringify(app.stockDistribution([]))),{zero:0,low:0,healthy:0,total:0});
});
test('CSV protects spreadsheet formulas and escapes quoted data',()=>{
 const csv=app.toCsv([['Nome','Quantidade'],['=HYPERLINK("bad")',2],['Peça, "A"',0],['  +2',4]]);
 assert.match(csv,/'=HYPERLINK/); assert.match(csv,/"Peça, ""A"""/); assert.match(csv,/'  \+2/);
});
