const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const Categoria = require('../src/models/Category');
const Fornecedor = require('../src/models/Supplier');
const Peca = require('../src/models/Part');
const Usuario = require('../src/models/User');
const seed = require('../seed');

const models = [Categoria, Fornecedor, Peca, Usuario];
const destructiveMethods = ['deleteOne', 'deleteMany', 'remove', 'drop', 'dropCollection'];

test('seed cria as contas demo exatas sem operações destrutivas e com hash bcrypt', async () => {
    const originalMethods = new Map();
    const calls = { Categoria: [], Fornecedor: [], Peca: [], Usuario: [] };
    const ids = { Categoria: 0, Fornecedor: 0, Peca: 0, Usuario: 0 };

    for (const model of models) {
        originalMethods.set(model, new Map());
        for (const method of destructiveMethods) {
            originalMethods.get(model).set(method, model[method]);
            model[method] = () => { throw new Error(`destructive method called: ${model.modelName}.${method}`); };
        }
    }
    const stubs = [[Categoria, 'Categoria'], [Fornecedor, 'Fornecedor'], [Peca, 'Peca'], [Usuario, 'Usuario']];
    for (const [model, name] of stubs) {
        originalMethods.get(model).set('findOneAndUpdate', model.findOneAndUpdate);
        model.findOneAndUpdate = async (filter, update, options) => {
            calls[name].push({ filter, update, options });
            return { _id: `${name.toLowerCase()}-${++ids[name]}` };
        };
    }

    const password = 'a deliberately supplied academic password';
    const previousPassword = process.env.SEED_DEMO_PASSWORD;
    process.env.SEED_DEMO_PASSWORD = password;
    try {
        await seed();
    } finally {
        process.env.SEED_DEMO_PASSWORD = previousPassword;
        for (const model of models) {
            for (const [method, original] of originalMethods.get(model)) model[method] = original;
        }
    }

    const accounts = calls.Usuario.map(({ filter, update }) => ({ email: filter.email, perfil: update.$set.perfil, hash: update.$set.senha }));
    assert.deepEqual(accounts.map(({ email, perfil }) => ({ email, perfil })), [
        { email: 'admin.demo@autopart.test', perfil: 'admin' },
        { email: 'cliente.demo@autopart.test', perfil: 'cliente' }
    ]);
    for (const account of accounts) assert.equal(await bcrypt.compare(password, account.hash), true);

    for (const entries of Object.values(calls)) {
        for (const call of entries) {
            assert.equal(call.options.upsert, true);
            assert.ok(call.update.$setOnInsert || call.update.$set);
        }
    }
    assert.equal(calls.Categoria.length, 3);
    assert.equal(calls.Fornecedor.length, 1);
    assert.equal(calls.Usuario.length, 2);
    assert.equal(calls.Peca.length, 4);

    const categoryIds = new Set(calls.Categoria.map((_, index) => `categoria-${index + 1}`));
    const parts = calls.Peca.map(({ update }) => update.$setOnInsert);
    for (const part of parts) {
        assert.ok(part.categoria_id);
        assert.ok(categoryIds.has(part.categoria_id));
        assert.ok(Array.isArray(part.compatibilidades) && part.compatibilidades.length > 0);
    }
});
