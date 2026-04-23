const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

async function connect() {
    try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        console.log('✅ Connected to in-memory MongoDB:', uri.substring(0, 30) + '...');
    } catch (err) {
        console.error('❌ MongoDB Error:', err.message);
        throw err;
    }
}

function getUri() { return mongoServer?.getUri(); }

async function close() {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
}

module.exports = { connect, close, getUri };
