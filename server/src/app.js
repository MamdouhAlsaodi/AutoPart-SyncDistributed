const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connect } = require('./config/db');
const seed = require('../seed');
const authRoutes = require('./routes/authRoutes');
const partsRoutes = require('./routes/partsRoutes');
const otherRoutes = require('./routes/otherRoutes');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pecas', partsRoutes);
app.use('/api/movimentacoes', partsRoutes);
app.use('/api', otherRoutes);

app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', db: 'MongoDB', message: 'AutoPart Sync API', timestamp: new Date().toISOString() });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ erro: true, codigo: err.status || 500, mensagem: err.message || 'Internal Server Error', campo: err.campo || null });
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connect();
        await seed();
    } catch { console.error('⚠️ DB/Seed failed'); }
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
}

start();

module.exports = app;
