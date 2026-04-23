const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true }
};

let pool = null;

async function connect() {
    if (!pool) {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to MSSQL Server');
    }
    return pool;
}

async function close() {
    if (pool) { await pool.close(); pool = null; }
}

module.exports = { connect, close, sql };
