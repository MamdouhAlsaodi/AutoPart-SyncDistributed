# Evidência visual

Capturas reais realizadas em **2026-09-16** durante uma sessão local autorizada, com o runtime em `http://localhost:5500` e dados acadêmicos genéricos.

## Aplicação AutoPart

- `autopart-storefront-desktop.png` — vitrine em viewport desktop (1440×900).
- `autopart-storefront-mobile.png` — vitrine responsiva em viewport mobile (390×844).
- `autopart-admin-desktop.png` — área administrativa autenticada, sem exposição de senha ou token.

## Apresentação HTML

- `apresentacao-desktop-slide-1.png` — capa do deck em desktop.
- `apresentacao-desktop-slide-12-notas.png` — slide final com notas árabes do apresentador ativadas.
- `apresentacao-mobile-slide-11.png` — sequência de demonstração em mobile após correção do cabeçalho responsivo.

## O que foi verificado na captura

- nenhuma exceção JavaScript observada;
- ausência de overflow horizontal em desktop e mobile;
- login admin concluído e título `Central de operações` renderizado;
- controles do deck visíveis em 390 px;
- navegação por teclado, hash, notas e 12 slides verificadas por Chromium headless.

## Limites

Estas imagens comprovam a vitrine, a responsividade, a área administrativa e a apresentação HTML. Ainda não constituem screenshots separadas das seis provas obrigatórias: carrinho, formulário de cadastro/login, histórico e checkout simulado não foram capturados como imagens individuais. A cobertura funcional desses fluxos permanece sustentada pelos testes automatizados registrados na matriz de evidências.

As imagens não demonstram pagamento, entrega, logística, URL pública, produção ou disponibilidade permanente. Nenhum valor de `JWT_SECRET`, token, dado pessoal ou endereço privado de infraestrutura foi incluído.
