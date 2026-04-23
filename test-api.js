const http = require('http');

const API_BASE = 'http://localhost:3000/api';

async function request(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testEndpoints() {
    console.log('=== Testing AutoPart API Endpoints ===\n');

    let token = null;
    let userId = null;

    // Test 1: Login
    console.log('1. POST /auth/login');
    try {
        const loginRes = await request('POST', '/auth/login', {
            email: 'admin@autopecas.com',
            password: 'admin123'
        });
        if (loginRes.status === 200) {
            token = loginRes.data.token;
            userId = loginRes.data.user.id;
            console.log('✅ Login successful');
            console.log(`   Token: ${token.substring(0, 30)}...`);
            console.log(`   User: ${loginRes.data.user.nome} (${loginRes.data.user.perfil})\n`);
        } else {
            console.log(`❌ Login failed: ${loginRes.status}\n`);
        }
    } catch (err) {
        console.log(`❌ Login error: ${err.message}\n`);
    }

    if (!token) {
        console.log('Cannot continue without token.');
        return;
    }

    // Test 2: Get all parts
    console.log('2. GET /pecas');
    try {
        const partsRes = await request('GET', '/pecas', null, token);
        if (partsRes.status === 200) {
            const count = partsRes.data.data?.length || partsRes.data?.length || 0;
            console.log(`✅ Got ${count} parts\n`);
        } else {
            console.log(`❌ Failed: ${partsRes.status} - ${JSON.stringify(partsRes.data)}\n`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
    }

    // Test 3: Get history (the problematic endpoint)
    console.log('3. GET /pecas/history');
    try {
        const historyRes = await request('GET', '/pecas/history', null, token);
        if (historyRes.status === 200) {
            console.log('✅ History endpoint working');
            console.log(`   Got ${Array.isArray(historyRes.data) ? historyRes.data.length : 0} movements\n`);
        } else {
            console.log(`❌ Failed: ${historyRes.status} - ${JSON.stringify(historyRes.data)}\n`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
    }

    // Test 4: Get categories
    console.log('4. GET /categorias');
    try {
        const catsRes = await request('GET', '/categorias', null, token);
        if (catsRes.status === 200) {
            console.log(`✅ Got ${Array.isArray(catsRes.data) ? catsRes.data.length : 0} categories\n`);
        } else {
            console.log(`❌ Failed: ${catsRes.status}\n`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
    }

    // Test 5: Get suppliers
    console.log('5. GET /fornecedores');
    try {
        const supRes = await request('GET', '/fornecedores', null, token);
        if (supRes.status === 200) {
            console.log(`✅ Got ${Array.isArray(supRes.data) ? supRes.data.length : 0} suppliers\n`);
        } else {
            console.log(`❌ Failed: ${supRes.status}\n`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
    }

    // Test 6: Get low stock
    console.log('6. GET /pecas?estoque=baixo');
    try {
        const lowRes = await request('GET', '/pecas?estoque=baixo', null, token);
        if (lowRes.status === 200) {
            const data = lowRes.data.data || lowRes.data;
            const count = Array.isArray(data) ? data.length : 0;
            console.log(`✅ Got ${count} items with low stock\n`);
        } else {
            console.log(`❌ Failed: ${lowRes.status}\n`);
        }
    } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
    }

    console.log('=== All tests completed ===');
}

testEndpoints();
