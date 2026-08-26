function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (typeof secret !== 'string' || secret.length < 32) {
        throw new Error('JWT_SECRET configuration error: configure a non-empty value with at least 32 characters.');
    }
    return secret;
}

module.exports = { getJwtSecret };
