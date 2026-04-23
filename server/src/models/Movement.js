const { connect, sql } = require('../config/db');

class MovementModel {
    async recordMovement(data) {
        const pool = await connect();
        return await pool.request()
            .input('peca_id', sql.Int, data.peca_id)
            .input('usuario_id', sql.Int, data.usuario_id)
            .input('quantidade', sql.Int, data.quantidade)
            .input('tipo', sql.VarChar, data.tipo)
            .input('motivo', sql.VarChar, data.motivo || null)
            .execute('sp_RegisterStockMovement');
    }

    async getHistory(pecaId = null) {
        const pool = await connect();
        let query = `SELECT m.*, p.nome as peca_nome, u.nome as usuario_nome FROM movimentacoes m JOIN pecas p ON m.peca_id = p.id JOIN usuarios u ON m.usuario_id = u.id`;
        const request = pool.request();
        if (pecaId) { query += ` WHERE m.peca_id = @pecaId`; request.input('pecaId', sql.Int, pecaId); }
        query += ` ORDER BY m.criado_em DESC`;
        const result = await request.query(query);
        return result.recordset;
    }
}

module.exports = new MovementModel();
