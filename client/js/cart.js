const Cart = (() => {
    const KEY = 'autopart.cart.v1';
    const validId = id => id !== undefined && id !== null && String(id).trim() !== '';
    const price = value => { const n = Math.round(Number(value) * 100); return Number.isFinite(n) && n >= 0 ? n : null; };
    const quantity = value => { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : null; };
    const normalize = item => { if (!item || !validId(item.id) || !Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0 || !quantity(item.quantity)) return null; return { id: String(item.id), nome: String(item.nome || ''), unitPriceCents: item.unitPriceCents, quantity: item.quantity }; };
    const read = () => { try { const raw = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(raw)) return []; return raw.map(normalize).filter(Boolean); } catch { return []; } };
    const save = items => localStorage.setItem(KEY, JSON.stringify(items.map(normalize).filter(Boolean)));
    return {
        items: () => read().map(item => ({ ...item })),
        addProduct(product) { const id = product?.id ?? product?._id, unitPriceCents = price(product?.preco_venda); if (!validId(id) || unitPriceCents === null) return false; const items = read(), existing = items.find(i => i.id === String(id)); if (existing) existing.quantity += 1; else items.push({ id: String(id), nome: String(product.nome || ''), unitPriceCents, quantity: 1 }); save(items); return true; },
        setQuantity(id, amount) { const q = quantity(amount), items = read(), item = items.find(i => i.id === String(id)); if (!item || q === null) return false; item.quantity = q; save(items); return true; },
        remove(id) { const items = read(), next = items.filter(i => i.id !== String(id)); if (next.length === items.length) return false; save(next); return true; },
        lineSubtotal: item => item && Number.isInteger(item.unitPriceCents) && Number.isInteger(item.quantity) ? item.unitPriceCents * item.quantity : 0,
        total: () => read().reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
        count: () => read().reduce((sum, item) => sum + item.quantity, 0),
        clear: () => localStorage.removeItem(KEY)
    };
})();
