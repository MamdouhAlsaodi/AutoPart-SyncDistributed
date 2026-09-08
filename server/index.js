const { createApp } = require('./src/app');
const { connect } = require('./src/config/db');
const seed = require('./seed');

async function startServer() {
    await connect();
    if (process.env.SEED_DEMO_DATA === 'true') await seed();
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '127.0.0.1';
    return createApp().listen(port, host, () => console.log(`🚀 Server on port ${port}`));
}

if (require.main === module) startServer().catch(err => { console.error('❌ Server startup failed:', err.message); process.exitCode = 1; });
module.exports = { startServer };
