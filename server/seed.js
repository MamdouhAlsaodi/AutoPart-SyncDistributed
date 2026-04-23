const bcrypt = require('bcryptjs');
const { connect, sql } = require('./src/config/db');

async function seed() {
    try {
        const pool = await connect();
        const hash = await bcrypt.hash('admin123', 10);

        // Insert admin user
        await pool.request()
            .input('nome', sql.VarChar, 'Administrador')
            .input('email', sql.VarChar, 'admin@autopecas.com')
            .input('senha', sql.VarChar, hash)
            .input('perfil', sql.VarChar, 'admin')
            .query(`IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@autopecas.com')
                     INSERT INTO usuarios (nome, email, senha, perfil) VALUES (@nome, @email, @senha, @perfil)`);

        // Insert sample categories
        const cats = [['Motor', 'Peças do motor'], ['Freios', 'Sistema de frenagem'], ['Elétrica', 'Componentes elétricos'], ['Suspensão', 'Sistema de suspensão']];
        for (const [nome, desc] of cats) {
            await pool.request().input('nome', sql.VarChar, nome).input('desc', sql.VarChar, desc)
                .query(`IF NOT EXISTS (SELECT 1 FROM categorias WHERE nome = @nome) INSERT INTO categorias (nome, descricao) VALUES (@nome, @desc)`);
        }

        // Insert sample suppliers
        const sups = [['AutoParts Brasil', '12.345.678/0001-90', '(11) 99999-0001', 'contato@autopartsbr.com'], ['MotorMax Ltda', '98.765.432/0001-10', '(21) 98888-0002', 'vendas@motormax.com']];
        for (const [nome, cnpj, tel, email] of sups) {
            await pool.request().input('nome', sql.VarChar, nome).input('cnpj', sql.VarChar, cnpj).input('tel', sql.VarChar, tel).input('email', sql.VarChar, email)
                .query(`IF NOT EXISTS (SELECT 1 FROM fornecedores WHERE cnpj = @cnpj) INSERT INTO fornecedores (nome, cnpj, telefone, email) VALUES (@nome, @cnpj, @tel, @email)`);
        }

        // Insert sample parts
        const parts = [
            ['FLT-001', 'Filtro de Óleo', 'Filtro de óleo universal', 15.00, 35.00, 50, 10, 1, 1],
            ['PAS-002', 'Pastilha de Freio', 'Pastilha cerâmica dianteira', 45.00, 89.90, 30, 5, 2, 1],
            ['BAT-003', 'Bateria 60Ah', 'Bateria automotiva 60Ah', 180.00, 320.00, 12, 3, 3, 2],
            ['AMO-004', 'Amortecedor Dianteiro', 'Amortecedor a gás', 120.00, 249.90, 20, 5, 4, 2],
            ['VEL-005', 'Vela de Ignição', 'Vela de platina', 8.50, 22.00, 3, 10, 1, 1],
        ];
        for (const [codigo, nome, desc, custo, venda, estoque, minimo, catId, fornId] of parts) {
            await pool.request()
                .input('codigo', sql.VarChar, codigo).input('nome', sql.VarChar, nome).input('desc', sql.VarChar, desc)
                .input('custo', sql.Decimal(10,2), custo).input('venda', sql.Decimal(10,2), venda)
                .input('estoque', sql.Int, estoque).input('minimo', sql.Int, minimo)
                .input('catId', sql.Int, catId).input('fornId', sql.Int, fornId)
                .query(`IF NOT EXISTS (SELECT 1 FROM pecas WHERE codigo = @codigo)
                    INSERT INTO pecas (codigo, nome, descricao, preco_custo, preco_venda, estoque_atual, estoque_minimo, categoria_id, fornecedor_id)
                    VALUES (@codigo, @nome, @desc, @custo, @venda, @estoque, @minimo, @catId, @fornId)`);
        }

        console.log('✅ Seed data inserted successfully!');
        console.log('📧 Admin: admin@autopecas.com / 🔑 Password: admin123');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed error:', e.message);
        process.exit(1);
    }
}

seed();
