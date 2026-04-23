const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connect } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const partsRoutes = require('./routes/partsRoutes');
const otherRoutes = require('./routes/otherRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pecas', partsRoutes);
app.use('/api/movimentacoes', partsRoutes);
app.use('/api', otherRoutes);

// Health Check
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'AutoPart Sync API is running', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        erro: true,
        codigo: err.status || 500,
        mensagem: err.message || 'Internal Server Error',
        campo: err.campo || null
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    try { await connect(); } catch { console.error('⚠️ DB connection failed'); }
});

module.exports = app;
