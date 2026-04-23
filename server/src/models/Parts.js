const { connect, sql } = require('../config/db');

class PartsModel {
    async getAll(filters = {}) {
        const pool = await connect();
        let query = `SELECT p.*, c.nome as categoria, f.nome as fornecedor FROM pecas p LEFT JOIN categorias c ON p.categoria_id = c.id LEFT JOIN fornecedores f ON p.fornecedor_id = f.id WHERE p.ativo = 1`;
        const request = pool.request();
        if (filters.busca) { query += ` AND (p.nome LIKE @busca OR p.codigo LIKE @busca)`; request.input('busca', sql.VarChar, `%${filters.busca}%`); }
        if (filters.categoria_id) { query += ` AND p.categoria_id = @catId`; request.input('catId', sql.Int, filters.categoria_id); }
        if (filters.estoque === 'baixo') { query += ` AND p.estoque_atual <= p.estoque_minimo`; }
        query += ` ORDER BY p.nome`;
        const result = await request.query(query);
        return result.recordset;
    }

    async getById(id) {
        const pool = await connect();
        const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM pecas WHERE id = @id');
        return result.recordset[0];
    }

    async create(data) {
        const pool = await connect();
        return await pool.request()
            .input('codigo', sql.VarChar, data.codigo)
            .input('nome', sql.VarChar, data.nome)
            .input('descricao', sql.VarChar(500), data.descricao || null)
            .input('preco_custo', sql.Decimal(10,2), data.preco_custo)
            .input('preco_venda', sql.Decimal(10,2), data.preco_venda)
            .input('estoque_atual', sql.Int, data.estoque_atual || 0)
            .input('estoque_minimo', sql.Int, data.estoque_minimo || 5)
            .input('categoria_id', sql.Int, data.categoria_id || null)
            .input('fornecedor_id', sql.Int, data.fornecedor_id || null)
            .query(`INSERT INTO pecas (codigo, nome, descricao, preco_custo, preco_venda, estoque_atual, estoque_minimo, categoria_id, fornecedor_id) VALUES (@codigo, @nome, @descricao, @preco_custo, @preco_venda, @estoque_atual, @estoque_minimo, @categoria_id, @fornecedor_id); SELECT SCOPE_IDENTITY() as id`);
    }
}

module.exports = new PartsModel();
