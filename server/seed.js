const bcrypt = require('bcryptjs');
const Categoria = require('./src/models/Category');
const Fornecedor = require('./src/models/Supplier');
const Peca = require('./src/models/Part');
const Usuario = require('./src/models/User');

async function seed() {
    const seedPassword = process.env.SEED_DEMO_PASSWORD;
    if (typeof seedPassword !== 'string' || seedPassword.length < 12) {
        throw new Error('SEED_DEMO_PASSWORD configuration error: provide at least 12 characters to run the demo seed.');
    }

    const categorias = [
        { nome: 'Filtros e manutenção', descricao: 'Peças genéricas de filtragem e manutenção automotiva' },
        { nome: 'Freios e segurança', descricao: 'Peças genéricas para o sistema de freios' },
        { nome: 'Suspensão e direção', descricao: 'Peças genéricas para suspensão e direção' }
    ];
    const categoriasCriadas = [];
    for (const categoria of categorias) {
        categoriasCriadas.push(await Categoria.findOneAndUpdate(
            { nome: categoria.nome },
            { $setOnInsert: categoria },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ));
    }

    const fornecedor = await Fornecedor.findOneAndUpdate(
        { email: 'fornecedor@autopart.demo.test' },
        { $setOnInsert: { nome: 'Fornecedor Genérico de Demonstração', cnpj: '00.000.000/0000-00', telefone: '0000000000', email: 'fornecedor@autopart.demo.test' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const senha = await bcrypt.hash(seedPassword, 10);
    const contas = [
        { email: 'admin.demo@autopart.test', nome: 'Admin Demo', perfil: 'admin' },
        { email: 'cliente.demo@autopart.test', nome: 'Cliente Demo', perfil: 'cliente' }
    ];
    for (const conta of contas) {
        await Usuario.findOneAndUpdate(
            { email: conta.email },
            { $set: { ...conta, senha, ativo: true } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    const pecas = [
        { codigo: 'AUT-FIL-001', nome: 'Filtro de óleo automotivo genérico', descricao: 'Filtro de óleo para manutenção preventiva', preco_custo: 18, preco_venda: 32, estoque_atual: 24, estoque_minimo: 5, categoria_id: categoriasCriadas[0]._id, fornecedor_id: fornecedor._id, compatibilidades: [{ marca: 'Marca Genérica', modelo: 'Modelo Compacto', anos: [2020] }] },
        { codigo: 'AUT-FIL-002', nome: 'Filtro de ar automotivo genérico', descricao: 'Filtro de ar para uso automotivo', preco_custo: 22, preco_venda: 39, estoque_atual: 18, estoque_minimo: 4, categoria_id: categoriasCriadas[0]._id, fornecedor_id: fornecedor._id, compatibilidades: [{ marca: 'Marca Genérica', modelo: 'Modelo Utilitário', anos: [2021] }] },
        { codigo: 'AUT-FRE-001', nome: 'Pastilha de freio dianteira genérica', descricao: 'Jogo de pastilhas para sistema de freio dianteiro', preco_custo: 45, preco_venda: 78, estoque_atual: 12, estoque_minimo: 3, categoria_id: categoriasCriadas[1]._id, fornecedor_id: fornecedor._id, compatibilidades: [{ marca: 'Marca Genérica', modelo: 'Modelo Sedan', anos: [2019] }] },
        { codigo: 'AUT-SUS-001', nome: 'Amortecedor dianteiro genérico', descricao: 'Amortecedor para suspensão dianteira', preco_custo: 110, preco_venda: 185, estoque_atual: 8, estoque_minimo: 2, categoria_id: categoriasCriadas[2]._id, fornecedor_id: fornecedor._id, compatibilidades: [{ marca: 'Marca Genérica', modelo: 'Modelo Hatch', anos: [2022] }] }
    ];
    for (const peca of pecas) {
        await Peca.findOneAndUpdate(
            { codigo: peca.codigo },
            { $setOnInsert: peca },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    console.log('Seed de demonstração concluído sem remoção de dados existentes.');
}

module.exports = seed;
