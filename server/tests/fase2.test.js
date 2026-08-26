const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connect, close } = require('../src/config/db');
const { createApp } = require('../src/app');
const Category = require('../src/models/Category');
const Part = require('../src/models/Part');
const URI = 'mongodb://127.0.0.1:27018/autopart_fase1_test';
let server;

test.before(async () => {
  if (process.env.MONGODB_URI !== URI) throw new Error('isolated test URI required');
  await connect(URI);
  await mongoose.connection.dropDatabase();
  server = createApp().listen(0);
});

test.after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await close();
});

test('public catalogue filters, projects detail, and protects inventory', async () => {
  const category = await Category.create({ nome: 'Motor' });
  const secondaryCategory = await Category.create({ nome: 'Freios' });
  await Part.create([
    {
      codigo: 'F2-A', nome: 'Filtro Azul', descricao: 'Filtro de ar azul', preco_custo: 1,
      preco_venda: 10, estoque_atual: 7, categoria_id: category._id,
      compatibilidades: [{ marca: 'Ford', modelo: 'Ka', anos: [2020] }]
    },
    {
      codigo: 'F2-B', nome: 'Pastilha', descricao: 'Pastilha de freio', preco_custo: 2,
      preco_venda: 20, estoque_atual: 3, categoria_id: secondaryCategory._id,
      compatibilidades: [{ marca: 'Fiat', modelo: 'Uno', anos: [2020] }]
    }
  ]);
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = async query => {
    const response = await fetch(base + '/api/catalogo' + query);
    return { response, body: await response.json() };
  };

  for (const query of ['?busca=Filtro', '?marca=Ford', '?modelo=Ka', '?categoria=Motor']) {
    const result = await get(query);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.count, 1);
    assert.equal(result.body.data[0].nome, 'Filtro Azul');
  }

  const combined = await get('?marca=Ford&modelo=Ka&categoria=Motor');
  assert.equal(combined.body.count, 1);
  assert.equal(combined.body.data[0].nome, 'Filtro Azul');

  const id = combined.body.data[0].id;
  const detailResponse = await fetch(base + '/api/catalogo/' + id);
  const detail = await detailResponse.json();
  assert.equal(detailResponse.status, 200);
  assert.equal(detail.data.descricao, 'Filtro de ar azul');
  assert.deepEqual(detail.data.compatibilidades[0], { marca: 'Ford', modelo: 'Ka', anos: [2020] });
  assert.equal(detail.data.preco_venda, 10);
  assert.equal(detail.data.estoque_atual, 7);
  assert.equal('preco_custo' in detail.data, false);

  assert.equal((await fetch(base + '/api/catalogo/' + new mongoose.Types.ObjectId())).status, 404);
  assert.equal((await fetch(base + '/api/catalogo?busca=%5B')).status, 200);
  assert.equal((await fetch(base + '/api/pecas')).status, 401);
});
