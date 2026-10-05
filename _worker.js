// Cloudflare Pages advanced-mode Worker. This file runs on the server only.
const PASSWORD = '1003';
const SIGNING_SECRET = 'c3a14b317b0007a8ea2d48f976616310ba2a5d67582ae24d1bd195e661bf665f';
const COOKIE = '__Host-portfolio_assets';
const TTL = 60 * 60 * 12;
const enc = new TextEncoder();
const hex = bytes => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY'
};
function reply(body, status = 200, extra = {}) {
  return new Response(body, {status, headers: {...headers, ...extra}});
}
function targetPath(value, origin) {
  try {
    const url = new URL(value || '/', origin);
    if (url.origin !== origin || !url.pathname.startsWith('/') || url.pathname.startsWith('/__portfolio-')) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}
async function key(env, origin) {
  return crypto.subtle.importKey('raw', enc.encode((env.AUTH_SECRET || SIGNING_SECRET) + ':' + (env.PORTFOLIO_PASSWORD || PASSWORD) + ':' + origin), {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']);
}
async function authenticated(request, env, origin) {
  const token = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!token || token.length > 200) return false;
  const [expiry, nonce, signature, extra] = token.split('.');
  const now = Math.floor(Date.now() / 1000);
  if (extra || !/^\d{10}$/.test(expiry) || Number(expiry) <= now || Number(expiry) > now + TTL || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  return crypto.subtle.verify('HMAC', await key(env, origin), Uint8Array.from(signature.match(/../g), b => parseInt(b, 16)), enc.encode(expiry + '.' + nonce));
}
function loginPage(target, error = '') {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>パスワード入力 | Portfolio</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#182b47;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue","Noto Sans JP",sans-serif;min-height:100svh;display:grid;place-items:center;padding:24px}.card{width:100%;max-width:460px;background:#fff;padding:48px;border:1px solid #e2e7ee;border-radius:16px;box-shadow:0 16px 60px #16305308}.eyebrow{font-size:11px;letter-spacing:.18em;color:#60768d;font-weight:700;margin:0 0 32px}.mark{display:grid;place-items:center;width:42px;height:42px;background:#182f55;color:#fff;border-radius:8px;font-weight:700;margin-bottom:24px}h1{font-size:26px;font-weight:600;letter-spacing:.01em;margin:0 0 16px}p{font-size:14px;line-height:1.9;color:#637084;margin:0 0 28px}label{display:block;font-size:13px;font-weight:600;margin:0 0 10px}input,button{font:inherit;width:100%;border-radius:7px;padding:14px 16px}input{background:#fff;border:1px solid #b7c3d2;color:#182b47;font-size:16px}input:focus{outline:3px solid #d7e6f8;border-color:#3b699f}button{margin-top:16px;border:0;background:#182f55;color:#fff;cursor:pointer;font-size:14px;font-weight:600}button:hover{background:#284c7a}button:focus-visible{outline:3px solid #92b9e7;outline-offset:3px}.error{color:#ae3434;font-size:13px;margin:12px 0 0}.note{font-size:11px;margin:24px 0 0;color:#7a8798}@media(max-width:480px){.card{padding:32px 24px}h1{font-size:20px}}
</style></head><body><main class="card"><p class="eyebrow">EC & CREATIVE PORTFOLIO</p><div class="mark" aria-hidden="true">E</div><h1>ポートフォリオの閲覧</h1><p>ご覧いただくには、パスワードをご入力ください。</p><form action="${escapeHtml(target)}" method="post"><label for="password">パスワード</label><input id="password" name="password" type="password" autocomplete="off" maxlength="128" required ${error ? 'aria-invalid="true" aria-describedby="error"' : ''}>${error ? `<p class="error" id="error" role="alert">${escapeHtml(error)}</p>` : ''}<button type="submit">ポートフォリオを見る</button></form><p class="note">ページを開くたびに、パスワードの入力が必要です。</p></main></body></html>`;
}
// Pages may canonicalize /works.html to /works. Resolve only same-origin redirects internally.
async function assetResponse(request, env) {
  let current = request;
  for (let count = 0; count < 4; count++) {
    const response = await env.ASSETS.fetch(current);
    const location = response.headers.get('Location');
    if (![301,302,303,307,308].includes(response.status) || !location) return response;
    const target = new URL(location, current.url);
    if (target.origin !== new URL(request.url).origin) return reply('Invalid redirect', 502);
    current = new Request(target, {method:request.method,headers:request.headers});
  }
  return reply('Too many redirects', 502);
}
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname).toLowerCase();
      if (pathname.includes('_worker') || pathname.includes('readme') || pathname === '/_routes.json' || pathname.split('/').some(p => p.startsWith('.'))) return reply('Not found', 404);
      if (request.method === 'POST') {
        if (request.headers.get('Origin') !== url.origin) return reply('Forbidden', 403);
        if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return reply('Invalid form', 400);
        if (Number(request.headers.get('Content-Length')) > 4096) return reply('Request too large', 413);
        const raw = await request.text();
        if (raw.length > 4096) return reply('Request too large', 413);
        const form = new URLSearchParams(raw);
        const target = targetPath(url.pathname + url.search, url.origin);
        const entered = await crypto.subtle.digest('SHA-256', enc.encode(form.get('password') || ''));
        const expected = await crypto.subtle.digest('SHA-256', enc.encode(env.PORTFOLIO_PASSWORD || PASSWORD));
        let mismatch = 0;
        const a = new Uint8Array(entered), b = new Uint8Array(expected);
        for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
        if (mismatch) return reply(loginPage(target, 'パスワードが違います。もう一度入力してください。'), 401, {'Content-Type':'text/html; charset=utf-8'});
        const payload = (Math.floor(Date.now()/1000) + TTL) + '.' + hex(crypto.getRandomValues(new Uint8Array(16)));
        const signature = hex(await crypto.subtle.sign('HMAC', await key(env, url.origin), enc.encode(payload)));
        // Serve this one navigation after checking the submitted password.
        // The cookie permits subresources only; it never unlocks another page visit.
        const response = await assetResponse(new Request(new URL(target, url.origin), {method:'GET'}), env);
        const output = new Response(response.body, response);
        for (const [name,value] of Object.entries(headers)) output.headers.set(name,value);
        output.headers.set('Set-Cookie',`${COOKIE}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax`);
        if ((output.headers.get('Content-Type') || '').includes('text/html')) {
          const html = await output.text();
          // Replace the POST history entry, so reload sends GET and requests the password again.
          const reset = '<script>history.replaceState(null,"",location.href);addEventListener("pageshow",function(e){if(e.persisted)location.reload()});</script>';
          output.headers.delete('Content-Length');output.headers.delete('ETag');output.headers.delete('Content-Encoding');
          return new Response(html.replace('</head>',reset+'</head>'), {status:output.status, headers:output.headers});
        }
        return output;
      }
      const extension = url.pathname.split('/').pop().split('.').pop().toLowerCase();
      const isPage = !url.pathname.split('/').pop().includes('.') || ['html','htm'].includes(extension);
      const isNavigation = request.headers.get('Sec-Fetch-Mode') === 'navigate' || request.headers.get('Sec-Fetch-Dest') === 'document' || (request.headers.get('Accept') || '').includes('text/html');
      if (isPage || isNavigation || !(await authenticated(request, env, url.origin))) {
        if (!['GET','HEAD'].includes(request.method)) return reply('Forbidden', 403);
        return reply(request.method === 'HEAD' ? null : loginPage(targetPath(url.pathname + url.search, url.origin)), 401, {
          'Content-Type':'text/html; charset=utf-8',
          'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
        });
      }
      if (!['GET','HEAD'].includes(request.method)) return reply('Method not allowed', 405, {'Allow':'GET, HEAD'});
      const response = await assetResponse(request, env);
      const output = new Response(response.body, response);
      for (const [name,value] of Object.entries(headers)) output.headers.set(name,value);
      return output;
    } catch { return reply('ページを表示できません。時間をおいて再度お試しください。', 503, {'Content-Type':'text/plain; charset=utf-8'}); }
  }
};
