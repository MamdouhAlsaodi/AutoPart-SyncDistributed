// Explicit, non-destructive academic demo fixture. Never run on a remote database.
const { createHash } = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Categoria = require('./src/models/Category');
const Fornecedor = require('./src/models/Supplier');
const Peca = require('./src/models/Part');
const Usuario = require('./src/models/User');
const Order = require('./src/models/Order');

const CATEGORIES = [
    'Filtros', 'Freios', 'Suspensão', 'Direção', 'Motor', 'Ignição',
    'Elétrica', 'Iluminação', 'Arrefecimento', 'Transmissão', 'Correias', 'Acessórios'
];
const SUPPLIER_COUNT = 12;
const PART_COUNT = 600;
const ORDER_COUNT = 120;
const PRODUCT_TYPES = [
    'Filtro de óleo', 'Pastilha de freio', 'Amortecedor', 'Terminal de direção',
    'Junta do motor', 'Vela de ignição', 'Bateria', 'Lâmpada',
    'Radiador', 'Kit de embreagem', 'Correia dentada', 'Palheta limpadora'
];

function makePart(index, categoryIds, supplierIds) {
    if (!Number.isInteger(index) || index < 0 || categoryIds.length !== CATEGORIES.length || supplierIds.length !== SUPPLIER_COUNT) {
        throw new Error('Parâmetros inválidos para a peça de demonstração');
    }
    const type = index % CATEGORIES.length;
    const number = String(index + 1).padStart(4, '0');
    const price = Math.round((24 + (index * 17 % 380) + (index % 4) * 0.25) * 100) / 100;
    return {
        codigo: `DEMO-${number}`,
        nome: `${PRODUCT_TYPES[type]} — Série Demo ${number}`,
        descricao: `Item fictício para demonstração acadêmica. Compatibilidade de veículo inventada; não usar para compra real. Lote ${number}.`,
        preco_custo: Math.round(price * 0.65 * 100) / 100,
        preco_venda: price,
        estoque_atual: index % 13 === 0 ? 0 : 2 + (index * 7 % 60),
        estoque_minimo: 5 + (index % 4),
        categoria_id: categoryIds[type],
        fornecedor_id: supplierIds[index % supplierIds.length],
        compatibilidades: [{ marca: `Marca Demo ${String.fromCharCode(65 + index % 6)}`, modelo: `Modelo Fictício ${1 + index % 12}`, anos: [2019 + index % 6] }],
        imagem_referencia: '/favicon.svg'
    };
}

function makeOrder(index, customerId, products) {
    if (!Number.isInteger(index) || index < 0 || !products.length) throw new Error('Parâmetros inválidos para pedido demo');
    const selected = [products[(index * 7) % products.length], products[(index * 7 + 1) % products.length]];
    const items = selected.map((p, itemIndex) => ({
        partId: p._id,
        partCode: p.codigo,
        partName: p.nome,
        unitPrice: p.preco_venda,
        quantity: itemIndex === 0 ? 1 + index % 3 : 1
    }));
    const hash = createHash('sha256').update(`autopart-demo-order-v1:${index}`).digest('hex').slice(0, 24);
    return {
        _id: new mongoose.Types.ObjectId(hash),
        customerId,
        items,
        total: Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100,
        status: ['pendente', 'confirmado', 'em_processamento', 'enviado', 'concluido', 'cancelado'][index % 6]
    };
}

function assertLocalDemoUri(uri) {
    if (uri !== 'mongodb://127.0.0.1:27017/autopart_sync') {
        throw new Error('A carga de demonstração só pode usar mongodb://127.0.0.1:27017/autopart_sync');
    }
}

async function seedLargeDemo({ partCount = PART_COUNT, orderCount = ORDER_COUNT, password } = {}) {
    if (!mongoose.connection.db) throw new Error('MongoDB precisa estar conectado antes do seed');
    if (typeof password !== 'string' || password.length < 12) throw new Error('SEED_DEMO_PASSWORD local (12+ caracteres) obrigatório');
    if (!Number.isInteger(partCount) || partCount < 2 || partCount > PART_COUNT ||
        !Number.isInteger(orderCount) || orderCount < 0 || orderCount > ORDER_COUNT) {
        throw new Error('Tamanho da carga de demonstração inválido');
    }
    await Promise.all([Peca.init(), Usuario.init(), Fornecedor.init(), Order.init()]);
    const categoryIds = [];
    for (const name of CATEGORIES) {
        const doc = await Categoria.findOneAndUpdate({ nome: `Demo • ${name}` },
            { $setOnInsert: { nome: `Demo • ${name}`, descricao: 'Categoria fictícia para o catálogo acadêmico' } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        categoryIds.push(doc._id);
    }
    const supplierIds = [];
    for (let i = 0; i < SUPPLIER_COUNT; i++) {
        const email = `fornecedor-demo-${String(i + 1).padStart(2, '0')}@autopart.test`;
        const doc = await Fornecedor.findOneAndUpdate({ email },
            { $setOnInsert: { nome: `Fornecedor Fictício ${String(i + 1).padStart(2, '0')}`, email } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        supplierIds.push(doc._id);
    }
    const products = Array.from({ length: partCount }, (_, i) => makePart(i, categoryIds, supplierIds));
    await Peca.bulkWrite(products.map(p => ({ updateOne: {
        filter: { codigo: p.codigo }, update: { $setOnInsert: p }, upsert: true
    } })), { ordered: false });

    const hash = await bcrypt.hash(password, 10);
    const accounts = [
        { email: 'admin.demo@autopart.test', nome: 'Admin Demo', perfil: 'admin' },
        { email: 'cliente.demo@autopart.test', nome: 'Cliente Demo', perfil: 'cliente' }
    ];
    for (const account of accounts) {
        await Usuario.findOneAndUpdate({ email: account.email },
            { $setOnInsert: { ...account, senha: hash, ativo: true } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
    }
    const customer = await Usuario.findOne({ email: 'cliente.demo@autopart.test' });
    const savedProducts = await Peca.find({ codigo: { $in: products.map(p => p.codigo) } })
        .select('_id codigo nome preco_venda').sort({ codigo: 1 }).lean();
    if (savedProducts.length !== partCount) throw new Error('A carga de peças ficou incompleta');
    if (orderCount) await Order.bulkWrite(Array.from({ length: orderCount }, (_, i) => {
        const order = makeOrder(i, customer._id, savedProducts);
        return { updateOne: { filter: { _id: order._id }, update: { $setOnInsert: order }, upsert: true } };
    }), { ordered: false });
    return { categories: categoryIds.length, suppliers: supplierIds.length, parts: savedProducts.length,
        demoOrders: orderCount, accounts: accounts.length };
}

if (require.main === module) {
    require('dotenv').config({ path: require('node:path').resolve(__dirname, '..', '.env') });
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autopart_sync';
    (async () => {
        assertLocalDemoUri(uri);
        if (process.env.NODE_ENV === 'test') throw new Error('Não executar seed demo no ambiente de teste');
        await mongoose.connect(uri);
        try {
            const result = await seedLargeDemo({ password: process.env.SEED_DEMO_PASSWORD });
            console.log('Carga de demonstração preservando registros existentes:', JSON.stringify(result));
        } finally {
            await mongoose.disconnect();
        }
    })().catch(error => { console.error('Falha no seed de demonstração:', error.message); process.exitCode = 1; });
}

module.exports = { CATEGORIES, SUPPLIER_COUNT, makePart, makeOrder, assertLocalDemoUri, seedLargeDemo };
