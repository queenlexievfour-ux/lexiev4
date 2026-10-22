'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const dns = require('node:dns').promises;
const https = require('node:https');
const path = require('node:path');
const net = require('node:net');

const app = express();
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

function normalizeHost(input) {
  if (typeof input !== 'string') throw new Error('Enter a hostname or public IP address.');
  let host = input.trim().replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].replace(/\.$/, '');
  if (!host || host.length > 253 || /\s/.test(host) || host.includes('@')) throw new Error('Enter a valid hostname or IP address.');
  if (net.isIP(host)) return host;
  if (!/^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(host)) throw new Error('That hostname format is not valid.');
  return host.toLowerCase();
}
function isPublicIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a,b] = p;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || (a === 198 && b === 51) || (a === 203 && b === 0));
}
function isPublicIPv6(ip) {
  const s = ip.toLowerCase();
  return !s.startsWith('::') && !s.startsWith('fe80:') && !s.startsWith('fc') && !s.startsWith('fd') && !s.startsWith('ff') && !s.startsWith('2001:db8:');
}
async function publicAddresses(host) {
  if (net.isIP(host) === 4) {
    if (!isPublicIPv4(host)) throw new Error('Private or reserved IP addresses are not allowed.');
    return [{ address: host, family: 4 }];
  }
  if (net.isIP(host) === 6) {
    if (!isPublicIPv6(host)) throw new Error('Private or reserved IP addresses are not allowed.');
    return [{ address: host, family: 6 }];
  }
  const records = await dns.lookup(host, { all: true, verbatim: true });
  if (!records.length) throw new Error('No IP addresses were found for this hostname.');
  for (const r of records) {
    if ((r.family === 4 && !isPublicIPv4(r.address)) || (r.family === 6 && !isPublicIPv6(r.address))) {
      throw new Error('This hostname resolves to a private or reserved address, so it cannot be checked.');
    }
  }
  return records;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ZIG HOST CHECKER API', developer: 'ZIGALY XR' }));
app.get('/api/dns', async (req, res) => {
  try {
    const host = normalizeHost(req.query.host);
    const addresses = await publicAddresses(host);
    res.json({ ok: true, host, addresses });
  } catch (e) { res.status(400).json({ ok: false, error: e.message || 'DNS lookup failed.' }); }
});

// Only performs a short HTTPS request to a validated public host. No port scans or arbitrary URL fetching.
app.post('/api/check', async (req, res) => {
  let host;
  try {
    host = normalizeHost(req.body && req.body.host);
    await publicAddresses(host);
  } catch (e) { return res.status(400).json({ ok: false, host: host || null, error: e.message || 'Invalid host.' }); }

  const started = Date.now();
  const request = https.request({
    hostname: host,
    path: '/',
    method: 'HEAD',
    timeout: 5000,
    headers: { 'User-Agent': 'ZIG-Host-Checker/1.0' },
    rejectUnauthorized: true,
    maxHeaderSize: 8192
  }, response => {
    response.resume();
    res.json({ ok: true, host, reachable: true, statusCode: response.statusCode, responseTimeMs: Date.now() - started, message: 'HTTPS server responded. This is not an ICMP ping.' });
  });
  request.on('timeout', () => request.destroy(new Error('Request timed out after 5 seconds.')));
  request.on('error', err => {
    if (!res.headersSent) res.status(200).json({ ok: true, host, reachable: false, responseTimeMs: Date.now() - started, message: err.message || 'No HTTPS response could be confirmed. The host may block HTTPS.' });
  });
  request.end();
});

// Serve only public website assets; do not expose backend source files.
const webRoot = path.resolve(__dirname, '..');
app.get('/', (_req, res) => res.sendFile(path.join(webRoot, 'index.html')));
app.get('/index.html', (_req, res) => res.sendFile(path.join(webRoot, 'index.html')));
app.get('/style.css', (_req, res) => res.sendFile(path.join(webRoot, 'style.css')));
app.get('/script.js', (_req, res) => res.sendFile(path.join(webRoot, 'script.js')));
app.get('*', (_req, res) => res.status(404).send('Not found'));
app.listen(PORT, '0.0.0.0', () => console.log(`ZIG HOST CHECKER backend listening on port ${PORT}`));
