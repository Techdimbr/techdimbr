/* ==========================================================================
   ThreatScanner Kether_1 — diagnóstico real de rede e privacidade no navegador
   --------------------------------------------------------------------------
   Serviços públicos consultados (todos com CORS aberto), só após o clique:
   - Cloudflare trace  → versão TLS/HTTP, troca de chaves pós-quântica, ECH, WARP
   - ipify             → IPv4 e IPv6 públicos
   - GeoJS / ipinfo    → provedor, ASN e localização aproximada
   - ip-api EDNS       → IP e operador do servidor DNS que o visitante usa
   - Cloudflare speed  → latência, jitter, download e upload
   A TECHDIM não recebe nada: o relatório só sai pelo botão "Exportar WhatsApp".
   Clicar em "Iniciar Diagnóstico" ou "Testar só a velocidade" registra o aceite
   dos termos (#termos-diagnostico no index.html).
   ========================================================================== */
let lastScanResult = null;
let scanRunning = false;

const DIAG = {
  trace: 'https://www.cloudflare.com/cdn-cgi/trace',
  ipv4: 'https://api.ipify.org?format=json',
  ipv6: 'https://api6.ipify.org?format=json',
  geo: 'https://get.geojs.io/v1/ip/geo.json',
  geoFallback: 'https://ipinfo.io/json',
  dns: 'https://edns.ip-api.com/json',
  speedDown: 'https://speed.cloudflare.com/__down',
  speedUp: 'https://speed.cloudflare.com/__up',
  stun: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302']
};

// Resolvedores DNS públicos conhecidos (trecho do nome do operador → rótulo, peso de privacidade)
const PUBLIC_RESOLVERS = [
  [/cloudflare/i, 'Cloudflare 1.1.1.1', 'privacy'],
  [/quad9|woodynet|packet clearing/i, 'Quad9 (bloqueia malware)', 'privacy'],
  [/nextdns/i, 'NextDNS', 'privacy'],
  [/adguard/i, 'AdGuard DNS', 'privacy'],
  [/mullvad/i, 'Mullvad DNS', 'privacy'],
  [/control ?d|windscribe/i, 'Control D', 'privacy'],
  [/google/i, 'Google Public DNS', 'public'],
  [/opendns|cisco/i, 'Cisco OpenDNS', 'public']
];

function initThreatScanner() {
  const btnTrigger = document.getElementById('btnTriggerScan');
  const btnReset = document.getElementById('btnResetScan');
  const btnExportWa = document.getElementById('btnExportScanWa');
  const btnSpeed = document.getElementById('btnSpeedOnly');
  const termsLink = document.getElementById('linkTermosDiagnostico');

  if (!btnTrigger || !document.getElementById('terminalConsole')) return;

  btnTrigger.addEventListener('click', runDiagnosticAudit);
  if (btnReset) btnReset.addEventListener('click', resetScanner);
  if (btnExportWa) btnExportWa.addEventListener('click', e => { e.preventDefault(); exportScanToWhatsApp(); });
  if (btnSpeed) btnSpeed.addEventListener('click', runSpeedOnly);
  if (termsLink) termsLink.addEventListener('click', () => {
    const terms = document.getElementById('termos-diagnostico');
    if (terms) terms.open = true;
  });

  // Dados locais (sem rede) já preenchidos no carregamento
  populateLocalTelemetry();
}

/* ---------- Helpers de UI ---------- */
function diagSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function diagLog(msg, cls = '') {
  const terminal = document.getElementById('terminalConsole');
  if (!terminal) return;
  const line = document.createElement('div');
  line.className = `log-line ${cls}`;
  line.textContent = msg;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function setRow(key, value, state = '') {
  const row = document.querySelector(`#scanner .diag-row[data-k="${key}"]`);
  if (!row) return;
  row.querySelector('dd').textContent = value;
  row.dataset.state = state;
}

function setCard(card, state, label) {
  const el = document.querySelector(`#scanner .diag-card[data-card="${card}"]`);
  if (!el) return;
  el.dataset.state = state;
  const pill = el.querySelector('.diag-pill');
  if (pill) pill.textContent = label;
}

function setSummary(id, value, state = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.className = `val${state ? ` status-${state}` : ''}`;
}

function setProgress(text) {
  const el = document.getElementById('scanProgress');
  if (el) el.textContent = text;
}

/* ---------- Helpers de rede ---------- */
function timeoutSignal(ms) {
  if (window.AbortSignal && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

async function fetchJson(url, ms = 6000, opts = {}) {
  const res = await fetch(url, { cache: 'no-store', signal: timeoutSignal(ms), ...opts });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchTrace() {
  const res = await fetch(DIAG.trace, { cache: 'no-store', signal: timeoutSignal(6000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const out = {};
  (await res.text()).split('\n').forEach(line => {
    const i = line.indexOf('=');
    if (i > 0) out[line.slice(0, i)] = line.slice(i + 1).trim();
  });
  return out;
}

function isPrivateIp(ip) {
  return /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(ip) ||
    /^(fc|fd|fe80:|::1$)/i.test(ip);
}

// Prefixo /64 para comparar IPv6 (endereços temporários mudam só o final)
function ipKey(ip) {
  if (!ip || ip.indexOf(':') === -1) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const full = [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  return full.slice(0, 4).map(x => parseInt(x || '0', 16).toString(16)).join(':');
}

function orgTokens(name) {
  return new Set(String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !['ltda', 'telecom', 'telecomunicacoes', 'comunicacoes', 'internet', 'servicos', 'network', 'networks', 'limited', 'corporation'].includes(w)));
}

function sameOrg(a, b) {
  const ta = orgTokens(a);
  return [...orgTokens(b)].some(w => ta.has(w));
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function percentile(values, p) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))];
}

function fmtMbps(v) {
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1).replace('.', ',');
}

/* ---------- Telemetria local (sem rede) ---------- */
function describeBrowser(ch) {
  const ua = navigator.userAgent;
  let browser = '';
  let os = '';

  if (ch && ch.fullVersionList) {
    const brands = ch.fullVersionList.filter(b => !/Not.?A.?Brand|Chromium/i.test(b.brand));
    const brand = brands.find(b => !/Google Chrome/i.test(b.brand)) || brands[0];
    if (brand) browser = `${brand.brand.replace(/^Google /, '').replace(/^Microsoft /, '')} ${brand.version.split('.')[0]}`;
  }
  if (!browser) {
    const rules = [[/Edg\/(\d+)/, 'Edge'], [/OPR\/(\d+)/, 'Opera'], [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
      [/Firefox\/(\d+)/, 'Firefox'], [/FxiOS\/(\d+)/, 'Firefox'], [/CriOS\/(\d+)/, 'Chrome'], [/Chrome\/(\d+)/, 'Chrome'],
      [/Version\/(\d+)[\d.]* (Mobile\/\S+ )?Safari/, 'Safari']];
    for (const [re, name] of rules) {
      const m = ua.match(re);
      if (m) { browser = `${name} ${m[1]}`; break; }
    }
  }

  if (ch && ch.platform) {
    const major = parseInt(ch.platformVersion || '0', 10);
    if (ch.platform === 'Windows') os = major >= 13 ? 'Windows 11' : 'Windows 10';
    else if (ch.platform === 'macOS') os = `macOS ${(ch.platformVersion || '').split('.').slice(0, 2).join('.')}`;
    else if (ch.platform === 'Android') os = `Android ${major || ''}`.trim();
    else os = ch.platform;
    if (ch.model) os += ` · ${ch.model}`;
  } else {
    let m;
    if ((m = ua.match(/iPhone OS (\d+)/))) os = `iOS ${m[1]}`;
    else if ((m = ua.match(/iPad.*OS (\d+)/))) os = `iPadOS ${m[1]}`;
    else if ((m = ua.match(/Android (\d+)/))) os = `Android ${m[1]}`;
    else if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if ((m = ua.match(/Mac OS X (\d+)[._](\d+)/))) os = `macOS ${m[1]}.${m[2]}`;
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Linux/.test(ua)) os = 'Linux';
  }
  return `${browser || 'Navegador'} · ${os || 'sistema não informado'}`;
}

function webglInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    const angle = renderer.match(/ANGLE \([^,]+, ([^,(]+)/);
    return (angle ? angle[1] : renderer).trim().slice(0, 60);
  } catch (e) {
    return null;
  }
}

function canvasPrint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('TECHDIM Kether_1 \u{1F6E1} çãé', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('TECHDIM Kether_1 \u{1F6E1} çãé', 4, 17);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255, 0, 255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}

async function audioPrint() {
  try {
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctx) return 'n/d';
    const ctx = new Ctx(1, 5000, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 10000;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -50;
    comp.knee.value = 40;
    comp.ratio.value = 12;
    comp.attack.value = 0;
    comp.release.value = 0.25;
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    const buffer = await Promise.race([ctx.startRendering(), diagSleep(1500).then(() => null)]);
    if (!buffer) return 'n/d';
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
    return sum.toFixed(6);
  } catch (e) {
    return 'n/d';
  }
}

function detectFonts() {
  const fonts = ['Arial', 'Calibri', 'Cambria', 'Consolas', 'Courier New', 'Georgia', 'Helvetica', 'Segoe UI', 'Tahoma',
    'Times New Roman', 'Trebuchet MS', 'Verdana', 'Roboto', 'Ubuntu', 'DejaVu Sans', 'Noto Sans', 'Liberation Sans',
    'Cantarell', 'Menlo', 'Monaco', 'Gill Sans', 'Futura', 'Lucida Grande', 'Comic Sans MS', 'Impact', 'Palatino',
    'Garamond', 'Candara', 'Franklin Gothic Medium', 'Avenir'];
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return [];
  const sample = 'mmmmmmmmmmlli1WQ@#';
  const bases = ['monospace', 'serif', 'sans-serif'];
  const baseWidths = bases.map(b => { ctx.font = `72px ${b}`; return ctx.measureText(sample).width; });
  return fonts.filter(font => bases.some((b, i) => {
    ctx.font = `72px '${font}', ${b}`;
    return ctx.measureText(sample).width !== baseWidths[i];
  }));
}

function connectionInfo() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return null;
  const types = { wifi: 'Wi-Fi', cellular: 'Dados móveis', ethernet: 'Cabo (Ethernet)', bluetooth: 'Bluetooth', none: 'Offline' };
  const parts = [];
  if (c.type && types[c.type]) parts.push(types[c.type]);
  if (c.effectiveType) parts.push(c.effectiveType.toUpperCase());
  if (c.downlink) parts.push(`~${c.downlink} Mbps`);
  if (c.rtt) parts.push(`~${c.rtt} ms`);
  return { label: parts.join(' · '), saveData: !!c.saveData };
}

function populateLocalTelemetry() {
  const nav = navigator;
  setRow('browser', describeBrowser(null));
  setRow('screen', `${screen.width}×${screen.height} · ${window.devicePixelRatio || 1}x · ${screen.colorDepth}-bit`);
  setRow('hw', `${nav.hardwareConcurrency || '?'} núcleos · ${nav.deviceMemory ? `${nav.deviceMemory} GB+` : 'memória oculta'}`);
  setRow('locale', `${Intl.DateTimeFormat().resolvedOptions().timeZone || '—'} · ${(nav.languages || [nav.language]).slice(0, 3).join(', ')}`);

  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const proto = navEntry && navEntry.nextHopProtocol ? ` · ${navEntry.nextHopProtocol.toUpperCase()}` : '';
  const https = location.protocol === 'https:';
  setRow('pageproto', `${https ? 'HTTPS' : 'HTTP sem criptografia'}${proto}`, https ? 'ok' : 'bad');

  const conn = connectionInfo();
  setRow('nettype', conn && conn.label ? conn.label : 'Não informado pelo navegador');
}

/* ---------- Etapas do diagnóstico ---------- */
async function stepIp(result) {
  diagLog('[+] ETAPA 1/6 · IP PÚBLICO, PROVEDOR E BORDA CLOUDFLARE', 'cyan');
  const [v4, v6, trace, geo] = await Promise.allSettled([
    fetchJson(DIAG.ipv4, 5000),
    fetchJson(DIAG.ipv6, 4000),
    fetchTrace(),
    fetchJson(DIAG.geo, 6000).catch(() => fetchJson(DIAG.geoFallback, 6000))
  ]);

  result.trace = trace.status === 'fulfilled' ? trace.value : null;
  result.ipv4 = v4.status === 'fulfilled' ? v4.value.ip : (result.trace && result.trace.ip && result.trace.ip.indexOf(':') === -1 ? result.trace.ip : null);
  result.ipv6 = v6.status === 'fulfilled' && v6.value.ip.indexOf(':') !== -1 ? v6.value.ip : null;

  if (geo.status === 'fulfilled') {
    const g = geo.value;
    const asn = g.asn ? `AS${g.asn}` : (String(g.org || '').match(/^AS\d+/) || [''])[0];
    result.isp = g.organization_name || String(g.org || '').replace(/^AS\d+\s*/, '') || null;
    result.asn = asn;
    result.country = g.country_code || g.country || '';
    result.geo = [g.city, g.region, g.country].filter(Boolean).join(', ');
  }

  setRow('ipv4', result.ipv4 || 'Não detectado (bloqueado por filtro/extensão)', result.ipv4 ? '' : 'warn');
  setRow('ipv6', result.ipv6 || 'Sem IPv6 nesta rede', '');
  setRow('isp', result.isp ? `${result.isp}${result.asn ? ` (${result.asn})` : ''}` : 'Não identificado', result.isp ? '' : 'warn');
  setRow('geo', result.geo || 'Não identificada');
  setRow('colo', result.trace && result.trace.colo ? `${result.trace.colo} · ${result.trace.loc || ''}`.trim() : '—');

  if (result.ipv4) diagLog(`[✓] IPv4 público: ${result.ipv4}${result.isp ? ` · ${result.isp}` : ''}`);
  else diagLog('[!] IPv4 não detectado: serviço bloqueado por filtro ou extensão.', 'warn');
  diagLog(result.ipv6 ? `[✓] IPv6 público: ${result.ipv6}` : '[>] IPv6 indisponível nesta rede.');

  setCard('ip', result.ipv4 || result.ipv6 ? 'ok' : 'warn', result.ipv4 || result.ipv6 ? 'concluído' : 'parcial');
  setSummary('sumIp', result.ipv4 || result.ipv6 || 'Não detectado', result.ipv4 || result.ipv6 ? '' : 'warn');
  setSummary('sumIsp', result.isp ? `${result.isp}${result.asn ? ` · ${result.asn}` : ''}` : 'Não identificado');
}

async function stepDns(result) {
  diagLog('[+] ETAPA 2/6 · SERVIDOR DNS E TESTE DE VAZAMENTO DE DNS', 'cyan');
  let data = null;
  try {
    data = await fetchJson(DIAG.dns, 7000);
  } catch (e) {
    diagLog('[!] Teste de DNS bloqueado (filtro, extensão ou firewall).', 'warn');
  }

  if (!data || !data.dns) {
    ['dnsip', 'dnsorg', 'dnskind', 'dnsecs', 'dnsleak'].forEach(k => setRow(k, 'Não foi possível medir', 'warn'));
    setCard('dns', 'warn', 'indisponível');
    setSummary('sumDns', 'Não medido', 'warn');
    result.dns = null;
    return;
  }

  const [country, ...orgParts] = String(data.dns.geo || '').split(' - ');
  const org = orgParts.join(' - ') || 'Operador desconhecido';
  const known = PUBLIC_RESOLVERS.find(([re]) => re.test(org));
  const kind = known ? known[2] : 'isp';
  const ecs = data.edns && data.edns.ip ? data.edns.ip : null;
  result.dns = { ip: data.dns.ip, org, country, kind, label: known ? known[1] : org, ecs };

  setRow('dnsip', data.dns.ip || '—');
  setRow('dnsorg', `${org}${country ? ` · ${country}` : ''}`);

  if (kind === 'privacy') setRow('dnskind', `${known[1]}: DNS público focado em privacidade`, 'ok');
  else if (kind === 'public') setRow('dnskind', `${known[1]}: DNS público`, 'ok');
  else setRow('dnskind', 'DNS do provedor/rede: consultas visíveis a ele', 'warn');

  setRow('dnsecs', ecs ? `Expõe sua sub-rede (${ecs})` : 'Não expõe sua sub-rede', ecs ? 'warn' : 'ok');

  // Resolvedor de outra rede e de outro país que não é DNS público conhecido = sinal clássico de vazamento de DNS
  let leak = 'ok';
  let leakText = 'Coerente com sua conexão';
  if (kind === 'isp' && result.isp && !sameOrg(org, result.isp)) {
    const otherCountry = !!(result.trace && result.trace.loc && country && countryCode(country).toUpperCase() !== result.trace.loc.toUpperCase());
    leak = otherCountry ? 'bad' : 'warn';
    leakText = otherCountry ? 'Resolvedor de outra rede e outro país: possível vazamento de DNS' : 'Resolvedor de outra rede (VPN, empresa ou roteador)';
  } else if (kind !== 'isp') {
    leakText = 'DNS público anycast: sem vazamento aparente';
  }
  result.dns.leak = leak;
  setRow('dnsleak', leakText, leak);

  diagLog(`[✓] DNS: ${data.dns.ip} · ${org}${country ? ` (${country})` : ''}`);
  if (ecs) diagLog(`[!] EDNS Client Subnet ativo: o DNS repassa ${ecs} aos sites.`, 'warn');
  if (leak !== 'ok') diagLog(`[!] ${leakText}.`, leak === 'bad' ? 'error' : 'warn');

  const cardState = leak === 'bad' ? 'bad' : (kind === 'isp' || ecs ? 'warn' : 'ok');
  setCard('dns', cardState, cardState === 'ok' ? 'protegido' : (cardState === 'bad' ? 'vazamento' : 'atenção'));
  setSummary('sumDns', result.dns.label, cardState === 'ok' ? 'ok' : cardState);
}

// ip-api devolve o nome do país; a Cloudflare, o código ISO
function countryCode(name) {
  const map = { brazil: 'BR', 'united states': 'US', portugal: 'PT', argentina: 'AR', germany: 'DE', netherlands: 'NL', 'united kingdom': 'GB', france: 'FR', canada: 'CA', chile: 'CL', spain: 'ES', japan: 'JP', singapore: 'SG' };
  return map[String(name).toLowerCase()] || name;
}

function stepCrypto(result) {
  diagLog('[+] ETAPA 3/6 · CRIPTOGRAFIA DA CONEXÃO (TLS, HTTP, PÓS-QUÂNTICO, ECH)', 'cyan');
  const t = result.trace;
  if (!t) {
    ['tls', 'http', 'kex', 'ech', 'warp'].forEach(k => setRow(k, 'Não foi possível medir', 'warn'));
    setCard('crypto', 'warn', 'indisponível');
    diagLog('[!] Trace da Cloudflare bloqueado; criptografia não medida.', 'warn');
    return;
  }
  const tls13 = /1\.3/.test(t.tls || '');
  const pq = /MLKEM|Kyber/i.test(t.kex || '');
  const ech = t.sni === 'encrypted';
  result.crypto = { tls: t.tls, http: t.http, kex: t.kex, pq, ech, tls13 };

  setRow('tls', t.tls || '—', tls13 ? 'ok' : 'warn');
  setRow('http', (t.http || '—').toUpperCase(), /http\/[23]/.test(t.http || '') ? 'ok' : 'warn');
  setRow('kex', pq ? `${t.kex}: pós-quântica` : `${t.kex || '—'}: clássica`, pq ? 'ok' : 'warn');
  setRow('ech', ech ? 'Ativo: o site visitado fica oculto na rede' : 'Inativo: o nome do site trafega visível', ech ? 'ok' : 'warn');
  setRow('warp', [t.warp && t.warp !== 'off' ? `WARP ${t.warp}` : 'WARP desligado', t.gateway === 'on' ? 'Gateway ativo' : ''].filter(Boolean).join(' · '));

  diagLog(`[✓] ${t.tls} · ${(t.http || '').toUpperCase()} · troca de chaves ${t.kex}${pq ? ' (pós-quântica)' : ''}`);
  const state = tls13 && pq && ech ? 'ok' : (tls13 ? 'warn' : 'bad');
  setCard('crypto', state, state === 'ok' ? 'excelente' : (state === 'warn' ? 'bom' : 'fraco'));
}

function probeWebRtc(timeoutMs = 3500) {
  return new Promise(resolve => {
    const out = { supported: typeof RTCPeerConnection === 'function', mdns: [], privateIps: [], publicIps: [] };
    if (!out.supported) return resolve(out);
    let pc;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: DIAG.stun }] });
    } catch (e) {
      out.supported = false;
      return resolve(out);
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { pc.close(); } catch (e) { /* já fechado */ }
      resolve(out);
    };
    const add = (list, v) => { if (!list.includes(v)) list.push(v); };
    const timer = setTimeout(finish, timeoutMs);
    pc.onicecandidate = e => {
      if (!e.candidate) { clearTimeout(timer); finish(); return; }
      const parts = String(e.candidate.candidate || '').split(' ');
      const addr = parts[4];
      const type = parts[7];
      if (!addr) return;
      if (addr.endsWith('.local')) add(out.mdns, addr);
      else if (type === 'host') add(isPrivateIp(addr) ? out.privateIps : out.publicIps, addr);
      else if (type === 'srflx' || type === 'prflx') add(out.publicIps, addr);
    };
    pc.createDataChannel('techdim');
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(finish);
  });
}

async function stepWebRtc(result) {
  diagLog('[+] ETAPA 4/6 · TESTE DE VAZAMENTO WEBRTC (STUN)', 'cyan');
  const rtc = await probeWebRtc();
  result.webrtc = rtc;

  if (!rtc.supported) {
    setRow('rtcsup', 'Desativado ou bloqueado', 'ok');
    ['rtclocal', 'rtcpublic'].forEach(k => setRow(k, 'Não exposto', 'ok'));
    setRow('rtcleak', 'Sem risco de vazamento', 'ok');
    setCard('webrtc', 'ok', 'protegido');
    setSummary('sumRtc', 'Sem vazamento', 'ok');
    result.webrtc.status = 'ok';
    diagLog('[✓] WebRTC desativado: sem vazamento possível.');
    return;
  }

  const known = [result.ipv4, result.ipv6, result.trace && result.trace.ip].filter(Boolean).map(ipKey);
  const leaked = rtc.publicIps.filter(ip => !known.includes(ipKey(ip)));

  setRow('rtcsup', 'Ativo', '');
  if (rtc.privateIps.length) setRow('rtclocal', `Exposto: ${rtc.privateIps.join(', ')}`, 'warn');
  else if (rtc.mdns.length) setRow('rtclocal', 'Oculto por mDNS (protegido)', 'ok');
  else setRow('rtclocal', 'Não exposto', 'ok');
  setRow('rtcpublic', rtc.publicIps.length ? rtc.publicIps.join(', ') : 'STUN sem resposta (bloqueado)', rtc.publicIps.length ? '' : 'ok');

  let status = 'ok';
  if (leaked.length && known.length) {
    status = 'bad';
    setRow('rtcleak', `Vazamento: ${leaked.join(', ')} difere do IP visto pelos sites (VPN/proxy contornado)`, 'bad');
    diagLog(`[✗] VAZAMENTO WEBRTC: ${leaked.join(', ')} aparece fora do túnel/proxy.`, 'error');
  } else if (rtc.privateIps.length) {
    status = 'warn';
    setRow('rtcleak', 'IP da rede interna visível para qualquer site', 'warn');
    diagLog(`[!] WebRTC expõe IP interno: ${rtc.privateIps.join(', ')}`, 'warn');
  } else {
    setRow('rtcleak', 'Sem vazamento: IPs coerentes', 'ok');
    diagLog('[✓] WebRTC sem vazamento: IP interno protegido e IP público coerente.');
  }
  result.webrtc.status = status;
  setCard('webrtc', status, status === 'ok' ? 'protegido' : (status === 'bad' ? 'vazamento' : 'atenção'));
  setSummary('sumRtc', status === 'ok' ? 'Sem vazamento' : (status === 'bad' ? 'VAZAMENTO DETECTADO' : 'IP interno exposto'), status);
}

async function stepFingerprint(result) {
  diagLog('[+] ETAPA 5/6 · IMPRESSÃO DIGITAL DO DISPOSITIVO (CANVAS, WEBGL, ÁUDIO, FONTES)', 'cyan');
  const nav = navigator;
  let ch = null;
  if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
    try {
      ch = await nav.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'fullVersionList', 'bitness']);
    } catch (e) { ch = null; }
  }
  let isBrave = false;
  try { isBrave = !!(nav.brave && await nav.brave.isBrave()); } catch (e) { isBrave = false; }

  const browser = isBrave ? describeBrowser(ch).replace(/^\S+ \d+/, 'Brave') : describeBrowser(ch);
  const gpu = webglInfo();
  const canvasA = canvasPrint();
  const canvasB = canvasPrint();
  const audio = await audioPrint();
  const fonts = detectFonts();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const gpc = nav.globalPrivacyControl === true;
  const dnt = nav.doNotTrack === '1' || window.doNotTrack === '1';

  const randomized = canvasA !== canvasB;
  const masked = !gpu || /^(Mozilla|WebKit|Generic)/i.test(gpu);
  const protectedFp = randomized || isBrave || (masked && tz === 'UTC');

  const signals = [nav.userAgent, browser, `${screen.width}x${screen.height}x${screen.colorDepth}@${window.devicePixelRatio}`,
    nav.hardwareConcurrency, nav.deviceMemory, tz, (nav.languages || []).join(','), nav.maxTouchPoints, gpu,
    await sha256Hex(canvasA), audio, fonts.join(',')];
  const id = (await sha256Hex(signals.join('|'))).slice(0, 16);

  result.fp = { id, browser, gpu, protectedFp, gpc, dnt, fonts: fonts.length, signals: signals.filter(s => s !== undefined && s !== null && s !== '').length };

  setRow('fpid', id.replace(/(.{4})/g, '$1 ').trim(), protectedFp ? 'ok' : 'warn');
  setRow('browser', browser);
  setRow('gpu', gpu || 'Oculta', gpu ? '' : 'ok');
  setRow('fpprot', protectedFp
    ? 'Ativa: o navegador embaralha ou mascara o fingerprint'
    : `Não detectada: ${result.fp.signals} sinais + ${fonts.length} fontes identificam este aparelho sem cookies`, protectedFp ? 'ok' : 'warn');

  diagLog(`[✓] Fingerprint ${id} · ${result.fp.signals} sinais · ${fonts.length} fontes · GPU ${gpu || 'oculta'}`);
  diagLog(protectedFp ? '[✓] Proteção anti-fingerprint ativa.' : '[!] Sem proteção anti-fingerprint: rastreável entre sites sem cookies.', protectedFp ? '' : 'warn');
  if (gpc || dnt) diagLog(`[✓] Sinal de privacidade enviado: ${[gpc && 'GPC', dnt && 'Do Not Track'].filter(Boolean).join(' + ')}.`);
  setCard('fp', protectedFp ? 'ok' : 'warn', protectedFp ? 'protegido' : 'rastreável');
}

/* ---------- Teste de velocidade (Cloudflare speed) ---------- */
function serverRttMs(res) {
  const header = res.headers.get('server-timing') || '';
  const m = header.match(/[?&]rtt=(\d+)/);
  return m ? parseInt(m[1], 10) / 1000 : null;
}

async function measureLatency(samples = 9) {
  const durations = [];
  const serverRtts = [];
  for (let i = 0; i < samples; i++) {
    const t0 = performance.now();
    const res = await fetch(`${DIAG.speedDown}?bytes=0&r=${Math.random()}`, { cache: 'no-store', signal: timeoutSignal(5000) });
    await res.arrayBuffer();
    if (i === 0) continue; // primeira requisição abre a conexão
    durations.push(performance.now() - t0);
    const rtt = serverRttMs(res);
    if (rtt) serverRtts.push(rtt);
  }
  const series = serverRtts.length >= 3 ? serverRtts : durations;
  let jitter = 0;
  for (let i = 1; i < series.length; i++) jitter += Math.abs(series[i] - series[i - 1]);
  return { latency: median(series), jitter: series.length > 1 ? jitter / (series.length - 1) : 0 };
}

async function measureDownload(onUpdate) {
  const sizes = [1e5, 1e6, 5e6, 1e7, 1.5e7];
  const results = [];
  let used = 0;
  const started = performance.now();
  for (const size of sizes) {
    if (performance.now() - started > 9000) break;
    if (size === 1.5e7 && !(results.length && results[results.length - 1].ms < 500)) break; // 15 MB só em conexões muito rápidas
    const t0 = performance.now();
    const res = await fetch(`${DIAG.speedDown}?bytes=${size}&r=${Math.random()}`, { cache: 'no-store', signal: timeoutSignal(15000) });
    const t1 = performance.now();
    const buf = await res.arrayBuffer();
    const t2 = performance.now();
    used += buf.byteLength;
    const mbps = buf.byteLength * 8 / Math.max((t2 - t1) / 1000, 0.001) / 1e6;
    results.push({ size, mbps, ms: t2 - t0 });
    if (size >= 1e6) onUpdate(percentile(results.filter(r => r.size >= 1e6).map(r => r.mbps), 0.9));
    if (t2 - t0 > 3000) break; // conexão lenta: não aumenta o tamanho
  }
  const solid = results.filter(r => r.size >= 1e6);
  return { mbps: solid.length ? percentile(solid.map(r => r.mbps), 0.9) : (results[0] ? results[0].mbps : 0), used };
}

async function measureUpload(latencyMs, onUpdate) {
  const sizes = [1e5, 1e6, 2.5e6, 5e6];
  const results = [];
  let used = 0;
  const started = performance.now();
  for (const size of sizes) {
    if (performance.now() - started > 9000) break;
    if (size === 5e6 && !(results.length && results[results.length - 1].ms < 800)) break;
    const body = new Uint8Array(size);
    const t0 = performance.now();
    const res = await fetch(`${DIAG.speedUp}?r=${Math.random()}`, { method: 'POST', body, cache: 'no-store', signal: timeoutSignal(20000) });
    await res.arrayBuffer();
    const t2 = performance.now();
    used += size;
    const mbps = size * 8 / Math.max((t2 - t0 - latencyMs) / 1000, 0.001) / 1e6;
    results.push({ size, mbps, ms: t2 - t0 });
    if (size >= 1e6) onUpdate(percentile(results.filter(r => r.size >= 1e6).map(r => r.mbps), 0.9));
    if (t2 - t0 > 3500) break;
  }
  const solid = results.filter(r => r.size >= 1e6);
  return { mbps: solid.length ? percentile(solid.map(r => r.mbps), 0.9) : (results[0] ? results[0].mbps : 0), used };
}

function speedQuality(down, latency) {
  if (down >= 100 && latency <= 30) return ['Excelente: nuvem, backup e videochamadas 4K', 'ok'];
  if (down >= 30 && latency <= 60) return ['Boa: videochamadas HD e trabalho em nuvem', 'ok'];
  if (down >= 10 && latency <= 120) return ['Regular: pode travar em chamadas e uploads', 'warn'];
  return ['Fraca: gargalo para operação em nuvem', 'bad'];
}

async function stepSpeed(result) {
  diagLog('[+] ETAPA 6/6 · TESTE RÁPIDO DE VELOCIDADE (CLOUDFLARE)', 'cyan');
  setCard('speed', 'running', 'medindo…');
  const downEl = document.getElementById('speedDown');
  const upEl = document.getElementById('speedUp');
  try {
    const lat = await measureLatency();
    setRow('latency', `${Math.round(lat.latency)} ms`, lat.latency <= 60 ? 'ok' : (lat.latency <= 120 ? 'warn' : 'bad'));
    setRow('jitter', `${lat.jitter.toFixed(1).replace('.', ',')} ms`, lat.jitter <= 15 ? 'ok' : 'warn');
    diagLog(`[✓] Latência ${Math.round(lat.latency)} ms · jitter ${lat.jitter.toFixed(1)} ms`);

    const down = await measureDownload(v => { if (downEl) downEl.textContent = fmtMbps(v); });
    if (downEl) downEl.textContent = fmtMbps(down.mbps);
    diagLog(`[✓] Download: ${fmtMbps(down.mbps)} Mbps`);

    const up = await measureUpload(lat.latency, v => { if (upEl) upEl.textContent = fmtMbps(v); });
    if (upEl) upEl.textContent = fmtMbps(up.mbps);
    diagLog(`[✓] Upload: ${fmtMbps(up.mbps)} Mbps`);

    const [qText, qState] = speedQuality(down.mbps, lat.latency);
    setRow('quality', qText, qState);
    setRow('datause', `${((down.used + up.used) / 1e6).toFixed(1).replace('.', ',')} MB`);
    result.speed = { down: down.mbps, up: up.mbps, latency: lat.latency, jitter: lat.jitter, quality: qText };
    setCard('speed', qState, qState === 'ok' ? 'concluído' : 'atenção');
    setSummary('sumSpeed', `↓ ${fmtMbps(down.mbps)} · ↑ ${fmtMbps(up.mbps)} Mbps · ${Math.round(lat.latency)} ms`, qState);
  } catch (e) {
    diagLog('[!] Teste de velocidade bloqueado ou interrompido (firewall, filtro ou rede instável).', 'warn');
    setCard('speed', 'warn', 'indisponível');
    setSummary('sumSpeed', 'Não medido', 'warn');
  }
}

/* ---------- Score, achados e fluxo principal ---------- */
function computeScore(r) {
  let score = 0;
  // Criptografia (25)
  if (r.crypto) {
    score += r.crypto.tls13 ? 12 : 6;
    score += /http\/[23]/.test(r.crypto.http || '') ? 3 : 0;
    score += r.crypto.pq ? 5 : 0;
    score += r.crypto.ech ? 5 : 0;
  } else score += 12;
  // DNS (20)
  if (r.dns) {
    score += r.dns.kind === 'privacy' ? 20 : (r.dns.kind === 'public' ? 14 : 8);
    if (r.dns.ecs) score -= 4;
    if (r.dns.leak === 'bad') score -= 8;
  } else score += 10;
  // WebRTC (25)
  const rtc = r.webrtc ? r.webrtc.status : 'ok';
  score += rtc === 'ok' ? 25 : (rtc === 'warn' ? 12 : 0);
  // Rastreabilidade (30)
  if (r.fp) {
    score += r.fp.protectedFp ? 20 : 4;
    score += r.fp.gpc ? 6 : 0;
    score += r.fp.dnt ? 4 : 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildFindings(r) {
  const f = [];
  if (r.webrtc && r.webrtc.status === 'bad') f.push(['bad', 'Vazamento WebRTC', 'Seu IP real aparece fora da VPN/proxy. Desative o WebRTC sem proxy (extensão ou política do navegador) ou use uma VPN com proteção contra vazamento.']);
  if (r.webrtc && r.webrtc.status === 'warn') f.push(['warn', 'IP interno exposto', 'Sites conseguem ver o IP da sua rede local. Atualize o navegador ou ative a ocultação mDNS / política de WebRTC.']);
  if (r.dns && r.dns.leak === 'bad') f.push(['bad', 'Possível vazamento de DNS', 'As consultas DNS saem por outra rede e outro país. Se você usa VPN, ative a proteção de DNS dela.']);
  if (r.dns && r.dns.kind === 'isp') f.push(['warn', 'DNS sem privacidade', 'Seu provedor vê cada site acessado. Use DNS criptografado (DoH/DoT) com Cloudflare 1.1.1.1, Quad9 ou NextDNS.']);
  if (r.dns && r.dns.ecs) f.push(['warn', 'DNS repassa sua sub-rede', 'O resolvedor envia parte do seu IP aos sites (EDNS Client Subnet). Prefira um DNS que não use ECS.']);
  if (r.crypto && !r.crypto.tls13) f.push(['bad', 'TLS desatualizado', 'Sua conexão não negociou TLS 1.3. Atualize o navegador ou verifique proxies de inspeção TLS na rede.']);
  if (r.crypto && !r.crypto.pq) f.push(['warn', 'Sem criptografia pós-quântica', 'Navegadores atuais (Chrome, Edge, Firefox) já usam ML-KEM. Atualize para proteger o tráfego contra "colete agora, decifre depois".']);
  if (r.crypto && !r.crypto.ech) f.push(['warn', 'Nome dos sites visível na rede', 'Sem ECH, o provedor e o Wi-Fi veem o domínio acessado. Ative DNS seguro (DoH) no navegador para habilitar o ECH.']);
  if (r.fp && !r.fp.protectedFp) f.push(['warn', 'Dispositivo rastreável sem cookies', 'O fingerprint identifica este aparelho entre sites. Navegadores com proteção (Brave, Firefox com resistência a fingerprint, Safari) reduzem isso.']);
  if (r.speed && r.speed.latency > 120) f.push(['warn', 'Latência alta', 'Acima de 120 ms há travamentos em chamadas e sistemas em nuvem. Verifique Wi-Fi, roteador e rota do provedor.']);
  if (!f.length) f.push(['ok', 'Conexão bem protegida', 'Nenhum vazamento encontrado. Para a rede da empresa inteira (servidores, VPN, firewall), solicite a auditoria completa.']);
  return f;
}

function renderFindings(list) {
  const box = document.getElementById('diagFindings');
  const ul = document.getElementById('diagFindingsList');
  if (!box || !ul) return;
  ul.textContent = '';
  list.forEach(([level, title, text]) => {
    const li = document.createElement('li');
    li.className = 'diag-finding';
    li.dataset.level = level;
    const strong = document.createElement('strong');
    strong.textContent = title;
    const span = document.createElement('span');
    span.textContent = text;
    li.append(strong, span);
    ul.appendChild(li);
  });
  box.hidden = false;
}

function animateScore(target) {
  const scoreNum = document.getElementById('scannerScoreVal');
  if (!scoreNum) return;
  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / 900);
    scoreNum.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setRunning(running, label) {
  scanRunning = running;
  const btn = document.getElementById('btnTriggerScan');
  const btnSpeed = document.getElementById('btnSpeedOnly');
  if (btn) {
    btn.disabled = running;
    btn.querySelector('span').textContent = label;
  }
  if (btnSpeed) btnSpeed.disabled = running;
}

async function runDiagnosticAudit() {
  if (scanRunning) return;
  const terminal = document.getElementById('terminalConsole');
  terminal.textContent = '';
  setRunning(true, 'Diagnosticando…');
  ['ip', 'dns', 'crypto', 'webrtc', 'fp', 'speed'].forEach(c => setCard(c, 'running', 'na fila'));

  const result = { timestamp: new Date().toLocaleString('pt-BR') };
  result.termsAcceptedAt = result.timestamp;
  diagLog('[+] INICIANDO THREAT SCANNER // KETHER_1 · DIAGNÓSTICO REAL DE REDE', 'cyan');
  const conn = connectionInfo();

  const steps = [
    ['1/6 IP', () => stepIp(result)],
    ['2/6 DNS', () => stepDns(result)],
    ['3/6 TLS', () => stepCrypto(result)],
    ['4/6 WEBRTC', () => stepWebRtc(result)],
    ['5/6 FINGERPRINT', () => stepFingerprint(result)],
    ['6/6 VELOCIDADE', () => (conn && conn.saveData
      ? (diagLog('[>] Economia de dados ativa: teste de velocidade pulado (use o botão no painel).'), setCard('speed', '', 'pulado'))
      : stepSpeed(result))]
  ];
  for (const [label, run] of steps) {
    setProgress(`ETAPA ${label}`);
    try {
      await run();
    } catch (e) {
      diagLog(`[!] Etapa ${label} falhou: ${e.message || e}`, 'warn');
    }
  }

  const score = computeScore(result);
  result.score = score;
  const grade = score >= 80 ? 'ok' : (score >= 55 ? 'warn' : 'bad');
  const circle = document.getElementById('scoreCircle');
  if (circle) circle.dataset.grade = grade;
  animateScore(score);
  const title = document.getElementById('scoreGradeTitle');
  const text = document.getElementById('scoreGradeText');
  if (title) title.textContent = grade === 'ok' ? 'Conexão bem protegida' : (grade === 'warn' ? 'Exposição moderada' : 'Exposição alta');
  if (text) text.textContent = grade === 'ok'
    ? 'Criptografia forte e sem vazamentos relevantes. Veja os detalhes abaixo.'
    : 'Há pontos que expõem sua navegação ou sua rede. Veja as recomendações abaixo.';

  result.findings = buildFindings(result);
  renderFindings(result.findings);
  lastScanResult = Object.assign(lastScanResult || {}, result);

  diagLog(`[■] DIAGNÓSTICO CONCLUÍDO · SCORE DE PRIVACIDADE ${score}/100`, 'cyan');
  setProgress('CONCLUÍDO');
  setRunning(false, 'Repetir Diagnóstico');
  if (typeof showToast === 'function') showToast('Diagnóstico concluído. Veja os achados e recomendações.');
}

async function runSpeedOnly() {
  if (scanRunning) return;
  setRunning(true, 'Medindo velocidade…');
  setProgress('VELOCIDADE');
  const result = lastScanResult || {};
  result.termsAcceptedAt = result.termsAcceptedAt || new Date().toLocaleString('pt-BR');
  await stepSpeed(result);
  lastScanResult = result;
  setProgress('CONCLUÍDO');
  setRunning(false, lastScanResult.score !== undefined ? 'Repetir Diagnóstico' : 'Iniciar Diagnóstico Completo');
}

/* ---------- Reset e exportação ---------- */
function resetScanner() {
  if (scanRunning) return;
  const terminal = document.getElementById('terminalConsole');
  if (terminal) {
    terminal.textContent = '';
    diagLog('[!] SCANNER PRONTO. AGUARDANDO COMANDO DE DISPARO.', 'cyan');
  }
  document.querySelectorAll('#diagBoard .diag-row').forEach(row => {
    row.querySelector('dd').textContent = '—';
    row.dataset.state = '';
  });
  document.querySelectorAll('#diagBoard .diag-card').forEach(card => {
    card.dataset.state = '';
    card.querySelector('.diag-pill').textContent = 'aguardando';
  });
  ['speedDown', 'speedUp'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });
  ['sumIp', 'sumIsp', 'sumDns', 'sumRtc', 'sumSpeed'].forEach(id => setSummary(id, 'Aguardando'));
  const scoreNum = document.getElementById('scannerScoreVal');
  if (scoreNum) scoreNum.textContent = '--';
  const circle = document.getElementById('scoreCircle');
  if (circle) circle.dataset.grade = '';
  const findings = document.getElementById('diagFindings');
  if (findings) findings.hidden = true;
  setProgress('PRONTO');
  setRunning(false, 'Iniciar Diagnóstico Completo');
  populateLocalTelemetry();
  lastScanResult = null;
  if (typeof showToast === 'function') showToast('Scanner redefinido.');
}

function exportScanToWhatsApp() {
  const r = lastScanResult || {};
  const lines = ['*TECHDIM · Diagnóstico ThreatScanner // Kether_1*', 'Olá, Deivis! Fiz o diagnóstico de rede no site da TECHDIM.'];
  if (r.score !== undefined) lines.push(`• Score de privacidade: ${r.score}/100`);
  if (r.isp) lines.push(`• Provedor: ${r.isp}${r.asn ? ` (${r.asn})` : ''}`);
  if (r.dns) lines.push(`• DNS: ${r.dns.label}${r.dns.leak !== 'ok' ? ' (atenção: possível vazamento)' : ''}`);
  if (r.webrtc) lines.push(`• WebRTC: ${r.webrtc.status === 'ok' ? 'sem vazamento' : (r.webrtc.status === 'bad' ? 'VAZAMENTO detectado' : 'IP interno exposto')}`);
  if (r.crypto) lines.push(`• Criptografia: ${r.crypto.tls}${r.crypto.pq ? ' + pós-quântica' : ''}${r.crypto.ech ? ' + ECH' : ''}`);
  if (r.fp) lines.push(`• Fingerprint: ${r.fp.protectedFp ? 'protegido' : 'rastreável sem cookies'}`);
  if (r.speed) lines.push(`• Velocidade: ↓ ${fmtMbps(r.speed.down)} / ↑ ${fmtMbps(r.speed.up)} Mbps · ${Math.round(r.speed.latency)} ms`);
  if (r.termsAcceptedAt) lines.push(`• Termos de uso do diagnóstico aceitos em ${r.termsAcceptedAt}`);
  if (lines.length === 2) lines.push('Ainda não executei o diagnóstico, mas quero uma análise da rede da minha empresa.');
  lines.push('Gostaria de agendar um diagnóstico aprofundado de cibersegurança para minha empresa.');

  window.open(`https://wa.me/5519996153276?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
}
