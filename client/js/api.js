const API_BASE = '/api';

async function request(method, endpoint, body = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : null
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw { erro: true, codigo: response.status, mensagem: data.mensagem || 'Erro no servidor', campo: data.campo || null };
        }
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

const api = {
    login: (cred) => request('POST', '/auth/login', cred),
    me: () => request('GET', '/auth/me'),
    getParts: (params) => {
        const q = new URLSearchParams(params || {}).toString();
        return request('GET', `/pecas${q ? '?' + q : ''}`);
    },
    getPartById: (id) => request('GET', `/pecas/${id}`),
    createPart: (data) => request('POST', '/pecas', data),
    recordEntry: (data) => request('POST', '/pecas/entrada', data),
    recordExit: (data) => request('POST', '/pecas/saida', data),
    getHistory: (pecaId) => request('GET', pecaId ? `/pecas/history/${pecaId}` : '/pecas/history'),
    getLowStock: () => request('GET', '/pecas?estoque=baixo'),
    getCategories: () => request('GET', '/categorias'),
    getSuppliers: () => request('GET', '/fornecedores'),
};
