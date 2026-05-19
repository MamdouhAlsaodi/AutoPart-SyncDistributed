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
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { mensagem: text || `Erro ${response.status}: Resposta não-JSON do servidor` };
        }

        if (!response.ok) {
            throw { erro: true, codigo: response.status, mensagem: data.mensagem || 'Erro no servidor', campo: data.campo || null };
        }
        return data;
    } catch (err) {
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
    createCategory: (data) => request('POST', '/categorias', data),
    getSuppliers: () => request('GET', '/fornecedores'),
    createSupplier: (data) => request('POST', '/fornecedores', data),
    // User Management
    getUsers: () => request('GET', '/users'),
    createUser: (data) => request('POST', '/users', data),
    toggleUserStatus: (id) => request('PATCH', `/users/${id}/status`),
};
