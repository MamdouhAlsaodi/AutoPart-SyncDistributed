// User-space bridge for this temporary host when tailscale serve requires sudo.
// It listens ONLY on this machine's Tailscale IPv4 address, never on LAN or 0.0.0.0.
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { isIP } = require('node:net');

const address = execFileSync('tailscale', ['ip', '-4'], { encoding: 'utf8', timeout: 5000 }).trim();
if (isIP(address) !== 4 || !address.startsWith('100.')) throw new Error('Tailscale IPv4 unavailable');
const port = 3000;

const server = http.createServer((request, response) => {
    const upstream = http.request({
        hostname: '127.0.0.1', port, method: request.method, path: request.url,
        headers: { ...request.headers, host: `127.0.0.1:${port}` }
    }, upstreamResponse => {
        response.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
        upstreamResponse.pipe(response);
    });
    upstream.on('error', error => {
        if (response.headersSent) response.destroy(error);
        else response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' }).end('AutoPart local service unavailable');
    });
    request.on('aborted', () => upstream.destroy());
    request.pipe(upstream);
});
server.on('upgrade', (request, socket) => socket.end('HTTP/1.1 426 Upgrade Required\r\nConnection: close\r\n\r\n'));
server.listen(port, address, () => console.log(`AutoPart tailnet bridge listening on ${address}:${port}`));
