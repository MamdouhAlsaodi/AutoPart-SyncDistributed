const bcrypt = require('bcryptjs');
const Categoria = require('./src/models/Category');
const Fornecedor = require('./src/models/Supplier');
const Peca = require('./src/models/Part');
const Usuario = require('./src/models/User');
const Movimentacao = require('./src/models/Movement');

async function seed() {
    try {
        // Clear all collections
        await Promise.all([
            Categoria.deleteMany({}),
            Fornecedor.deleteMany({}),
            Peca.deleteMany({}),
            Usuario.deleteMany({}),
            Movimentacao.deleteMany({})
        ]);

        // 1. Insert Categories
        const cats = await Categoria.insertMany([
            { nome: 'Motor', descricao: 'Componentes e peças internas do motor' },
            { nome: 'Freios', descricao: 'Pastilhas, discos, cilindros e componentes de frenagem' },
            { nome: 'Elétrica', descricao: 'Baterias, alternadores, velas e fiação elétrica' },
            { nome: 'Suspensão', descricao: 'Amortecedores, molas, pivôs e bandejas' },
            { nome: 'Transmissão', descricao: 'Kits de embreagem, juntas homocinéticas e caixas' }
        ]);

        // 2. Insert Suppliers
        const sups = await Fornecedor.insertMany([
            { nome: 'AutoParts Brasil', cnpj: '12.345.678/0001-90', telefone: '(11) 99999-0001', email: 'contato@autopartsbr.com' },
            { nome: 'MotorMax Distribuidora', cnpj: '98.765.432/0001-10', telefone: '(21) 98888-0002', email: 'vendas@motormax.com' },
            { nome: 'Importadora Sul-Americana', cnpj: '45.888.777/0001-55', telefone: '(31) 97777-0003', email: 'importacoes@sulamericana.com' }
        ]);

        // 3. Encrypt Passwords and Insert Users
        const [hAdmin, hOper, hUser, hCarlos, hJose, hAna] = await Promise.all([
            bcrypt.hash('admin123', 10),
            bcrypt.hash('oper123', 10),
            bcrypt.hash('user123', 10),
            bcrypt.hash('carlos123', 10),
            bcrypt.hash('jose123', 10),
            bcrypt.hash('ana123', 10)
        ]);

        const usersList = await Usuario.insertMany([
            { nome: 'Mamdouh Alsaudi', email: 'admin@autopecas.com', senha: hAdmin, perfil: 'admin', ativo: true },
            { nome: 'Carlos Silva', email: 'carlos.operador@autopecas.com', senha: hCarlos, perfil: 'operador', ativo: true },
            { nome: 'Ana Souza', email: 'ana.consulta@autopecas.com', senha: hAna, perfil: 'consulta', ativo: true },
            { nome: 'José Oliveira', email: 'jose.gerente@autopecas.com', senha: hJose, perfil: 'admin', ativo: true },
            { nome: 'Mariana Costa', email: 'mariana.vendas@autopecas.com', senha: hOper, perfil: 'operador', ativo: true },
            { nome: 'Ricardo Santos', email: 'ricardo.auditor@autopecas.com', senha: hUser, perfil: 'consulta', ativo: false }
        ]);

        // 4. Insert 15 Parts
        const partsList = await Peca.insertMany([
            { codigo: 'PF-001', nome: 'Pastilha de Freio Bosch', descricao: 'Pastilha de freio cerâmica premium', preco_custo: 95.00, preco_venda: 189.90, estoque_atual: 18, estoque_minimo: 10, categoria_id: cats[1]._id, fornecedor_id: sups[0]._id },
            { codigo: 'DF-002', nome: 'Disco de Freio Fremax', descricao: 'Disco de freio dianteiro ventilado', preco_custo: 120.00, preco_venda: 249.00, estoque_atual: 4, estoque_minimo: 6, categoria_id: cats[1]._id, fornecedor_id: sups[0]._id },
            { codigo: 'BA-003', nome: 'Bomba de Água Urba', descricao: 'Bomba de água para motores flex', preco_custo: 90.00, preco_venda: 198.50, estoque_atual: 3, estoque_minimo: 5, categoria_id: cats[0]._id, fornecedor_id: sups[1]._id },
            { codigo: 'CD-004', nome: 'Correia Dentada Gates', descricao: 'Correia sincronizadora reforçada', preco_custo: 40.00, preco_venda: 85.00, estoque_atual: 25, estoque_minimo: 8, categoria_id: cats[0]._id, fornecedor_id: sups[1]._id },
            { codigo: 'FO-005', nome: 'Filtro de Óleo Fram', descricao: 'Filtro de óleo blindado de alta vazão', preco_custo: 15.00, preco_venda: 34.90, estoque_atual: 42, estoque_minimo: 15, categoria_id: cats[0]._id, fornecedor_id: sups[0]._id },
            { codigo: 'AL-006', nome: 'Alternador Valeo 12V', descricao: 'Alternador de 90 amperes completo', preco_custo: 420.00, preco_venda: 850.00, estoque_atual: 2, estoque_minimo: 3, categoria_id: cats[2]._id, fornecedor_id: sups[1]._id },
            { codigo: 'BT-007', nome: 'Bateria Moura 60Ah', descricao: 'Bateria Moura livre de manutenção', preco_custo: 230.00, preco_venda: 489.90, estoque_atual: 12, estoque_minimo: 5, categoria_id: cats[2]._id, fornecedor_id: sups[2]._id },
            { codigo: 'VI-008', nome: 'Vela de Ignição NGK', descricao: 'Vela de ignição Iridium resistiva', preco_custo: 12.00, preco_venda: 29.90, estoque_atual: 64, estoque_minimo: 20, categoria_id: cats[2]._id, fornecedor_id: sups[2]._id },
            { codigo: 'AM-009', nome: 'Amortecedor Monroe', descricao: 'Amortecedor dianteiro pressurizado a gás', preco_custo: 180.00, preco_venda: 389.00, estoque_atual: 5, estoque_minimo: 8, categoria_id: cats[3]._id, fornecedor_id: sups[1]._id },
            { codigo: 'PV-010', nome: 'Pivô de Suspensão Nakata', descricao: 'Pivô da bandeja de suspensão dianteira', preco_custo: 50.00, preco_venda: 110.00, estoque_atual: 14, estoque_minimo: 6, categoria_id: cats[3]._id, fornecedor_id: sups[0]._id },
            { codigo: 'KE-011', nome: 'Kit de Embreagem LUK', descricao: 'Kit com platô, disco e rolamento', preco_custo: 310.00, preco_venda: 620.00, estoque_atual: 2, estoque_minimo: 4, categoria_id: cats[4]._id, fornecedor_id: sups[1]._id },
            { codigo: 'JH-012', nome: 'Junta Homocinética Cofap', descricao: 'Junta homocinética lado roda dianteiro', preco_custo: 80.00, preco_venda: 175.00, estoque_atual: 8, estoque_minimo: 4, categoria_id: cats[4]._id, fornecedor_id: sups[0]._id },
            { codigo: 'FA-013', nome: 'Filtro de Ar Tecfil', descricao: 'Filtro de ar do motor lavável', preco_custo: 18.00, preco_venda: 42.00, estoque_atual: 30, estoque_minimo: 10, categoria_id: cats[0]._id, fornecedor_id: sups[0]._id },
            { codigo: 'RD-014', nome: 'Radiador Denso', descricao: 'Radiador de água de alumínio brasado', preco_custo: 200.00, preco_venda: 410.00, estoque_atual: 1, estoque_minimo: 2, categoria_id: cats[0]._id, fornecedor_id: sups[0]._id },
            { codigo: 'SA-015', nome: 'Sensor de ABS Bosch', descricao: 'Sensor de velocidade ABS roda dianteira', preco_custo: 70.00, preco_venda: 145.00, estoque_atual: 7, estoque_minimo: 4, categoria_id: cats[2]._id, fornecedor_id: sups[0]._id }
        ]);

        // 5. Insert 15 Historical Movements
        // Fetch specific IDs to link them correctly
        await Movimentacao.insertMany([
            { tipo: 'entrada', quantidade: 20, motivo: 'Compra de estoque do distribuidor Bosch Brasil', peca_id: partsList[0]._id, usuario_id: usersList[1]._id },
            { tipo: 'saida', quantidade: 2, motivo: 'Venda para oficina mecânica AutoCenter', peca_id: partsList[6]._id, usuario_id: usersList[1]._id },
            { tipo: 'entrada', quantidade: 50, motivo: 'Reposição de estoque via importadora', peca_id: partsList[4]._id, usuario_id: usersList[0]._id },
            { tipo: 'saida', quantidade: 4, motivo: 'Ordem de serviço nº 4983', peca_id: partsList[8]._id, usuario_id: usersList[4]._id },
            { tipo: 'saida', quantidade: 2, motivo: 'Venda direta ao cliente no balcão', peca_id: partsList[1]._id, usuario_id: usersList[4]._id },
            { tipo: 'entrada', quantidade: 5, motivo: 'Entrada de devolução de garantia de cliente', peca_id: partsList[5]._id, usuario_id: usersList[0]._id },
            { tipo: 'saida', quantidade: 16, motivo: 'Venda atacado para Auto Elétrica Silva', peca_id: partsList[7]._id, usuario_id: usersList[1]._id },
            { tipo: 'entrada', quantidade: 15, motivo: 'Compra local para reposição urgente', peca_id: partsList[3]._id, usuario_id: usersList[1]._id },
            { tipo: 'saida', quantidade: 1, motivo: 'Ordem de serviço nº 4991', peca_id: partsList[10]._id, usuario_id: usersList[4]._id },
            { tipo: 'saida', quantidade: 4, motivo: 'Instalação na oficina interna', peca_id: partsList[9]._id, usuario_id: usersList[1]._id },
            { tipo: 'entrada', quantidade: 3, motivo: 'Importação direta Lote B', peca_id: partsList[13]._id, usuario_id: usersList[0]._id },
            { tipo: 'saida', quantidade: 2, motivo: 'Venda Balcão', peca_id: partsList[14]._id, usuario_id: usersList[4]._id },
            { tipo: 'entrada', quantidade: 10, motivo: 'Ajuste de inventário anual', peca_id: partsList[11]._id, usuario_id: usersList[0]._id },
            { tipo: 'saida', quantidade: 2, motivo: 'Venda direta', peca_id: partsList[0]._id, usuario_id: usersList[1]._id },
            { tipo: 'saida', quantidade: 5, motivo: 'Ordem de serviço nº 4995', peca_id: partsList[12]._id, usuario_id: usersList[4]._id }
        ]);

        const movsCount = await Movimentacao.countDocuments();
        console.log(`✅ Seed: ${partsList.length} parts, ${cats.length} categories, ${sups.length} suppliers, ${usersList.length} users, ${movsCount} movements`);
        console.log('📧 admin@autopecas.com / admin123');
        console.log('📧 operador@autopecas.com / oper123 (mapped to carlos.operador / carlos123)');
        console.log('📧 user@example.com / user123 (mapped to ana.consulta / ana123)');
    } catch (e) {
        console.error('❌ Seed error:', e.message);
    }
}

module.exports = seed;
