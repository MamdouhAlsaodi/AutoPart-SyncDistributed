const bcrypt = require('bcryptjs');
const Categoria = require('./src/models/Category');
const Fornecedor = require('./src/models/Supplier');
const Peca = require('./src/models/Part');
const Usuario = require('./src/models/User');

async function seed() {
    try {
        await Promise.all([Categoria.deleteMany({}), Fornecedor.deleteMany({}), Peca.deleteMany({}), Usuario.deleteMany({})]);

        const cats = await Categoria.insertMany([
            { nome: 'Motor', descricao: 'Peças do motor' },
            { nome: 'Freios', descricao: 'Sistema de frenagem' },
            { nome: 'Elétrica', descricao: 'Componentes elétricos' },
            { nome: 'Suspensão', descricao: 'Sistema de suspensão' },
        ]);

        const sups = await Fornecedor.insertMany([
            { nome: 'AutoParts Brasil', cnpj: '12.345.678/0001-90', telefone: '(11) 99999-0001', email: 'contato@autopartsbr.com' },
            { nome: 'MotorMax Ltda', cnpj: '98.765.432/0001-10', telefone: '(21) 98888-0002', email: 'vendas@motormax.com' },
        ]);

        await Peca.insertMany([
            { codigo: 'FLT-001', nome: 'Filtro de Óleo', descricao: 'Filtro universal', preco_custo: 15, preco_venda: 35, estoque_atual: 50, estoque_minimo: 10, categoria_id: cats[0]._id, fornecedor_id: sups[0]._id },
            { codigo: 'PAS-002', nome: 'Pastilha de Freio', descricao: 'Pastilha cerâmica', preco_custo: 45, preco_venda: 89.9, estoque_atual: 30, estoque_minimo: 5, categoria_id: cats[1]._id, fornecedor_id: sups[0]._id },
            { codigo: 'BAT-003', nome: 'Bateria 60Ah', descricao: 'Bateria automotiva', preco_custo: 180, preco_venda: 320, estoque_atual: 12, estoque_minimo: 3, categoria_id: cats[2]._id, fornecedor_id: sups[1]._id },
            { codigo: 'AMO-004', nome: 'Amortecedor', descricao: 'Amortecedor a gás', preco_custo: 120, preco_venda: 249.9, estoque_atual: 20, estoque_minimo: 5, categoria_id: cats[3]._id, fornecedor_id: sups[1]._id },
            { codigo: 'VEL-005', nome: 'Vela de Ignição', descricao: 'Vela platina', preco_custo: 8.5, preco_venda: 22, estoque_atual: 3, estoque_minimo: 10, categoria_id: cats[0]._id, fornecedor_id: sups[0]._id },
            { codigo: 'COR-006', nome: 'Correia Dentada', descricao: 'Correia do comando', preco_custo: 55, preco_venda: 120, estoque_atual: 15, estoque_minimo: 5, categoria_id: cats[0]._id, fornecedor_id: sups[1]._id },
            { codigo: 'DIS-007', nome: 'Disco de Freio', descricao: 'Disco ventilado', preco_custo: 80, preco_venda: 165, estoque_atual: 8, estoque_minimo: 4, categoria_id: cats[1]._id, fornecedor_id: sups[0]._id },
            { codigo: 'ALT-008', nome: 'Alternador', descricao: 'Alternador 90A', preco_custo: 250, preco_venda: 480, estoque_atual: 2, estoque_minimo: 3, categoria_id: cats[2]._id, fornecedor_id: sups[1]._id },
        ]);

        const hash = await bcrypt.hash('admin123', 10);
        await Usuario.create({ nome: 'Administrador', email: 'admin@autopecas.com', senha: hash, perfil: 'admin' });
        await Usuario.create({ nome: 'Operador', email: 'operador@autopecas.com', senha: hash, perfil: 'operador' });

        console.log('✅ Seed: 8 parts, 4 categories, 2 suppliers, 2 users');
        console.log('📧 admin@autopecas.com / admin123');
    } catch (e) { console.error('❌ Seed error:', e.message); }
}

module.exports = seed;
