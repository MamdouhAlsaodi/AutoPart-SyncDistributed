const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: true, codigo: 401, mensagem: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: true, codigo: 401, mensagem: 'Token inválido ou expirado' });
    }
};

const permissionMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.perfil)) {
            return res.status(403).json({
                erro: true,
                codigo: 403,
                mensagem: 'Você não tem permissão para acessar este recurso'
            });
        }
        next();
    };
};

module.exports = { authMiddleware, permissionMiddleware };
