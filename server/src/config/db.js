const mongoose = require('mongoose');

const TEST_URI = 'mongodb://127.0.0.1:27018/autopart_fase1_test';

async function connect(uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autopart_sync') {
    if (process.env.NODE_ENV === 'test' && uri !== TEST_URI) {
        throw new Error(`NODE_ENV=test requires ${TEST_URI}`);
    }
    await mongoose.connect(uri);
}

async function close() {
    await mongoose.disconnect();
}

module.exports = { connect, close };
