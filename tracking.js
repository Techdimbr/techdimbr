/* ==========================================================================
   Integrações TECHDIM: consentimento (LGPD), Google Ads/GA4, Meta Pixel e n8n
   --------------------------------------------------------------------------
   Configuração em site-config.js; campo vazio = integração desligada.
   - Visitas: contagem anônima no n8n, sem cookies e sem identificador. Não
     envia se o navegador pedir privacidade (GPC ou Do Not Track).
   - Google Analytics: a tag oficial fica no <head> de cada página e mede
     todas as visitas (legítimo interesse); "Recusar" desliga a medição.
   - Google Ads e Meta: só depois de "Aceitar" (ANPD: publicidade exige
     consentimento). O Ads entra na MESMA tag do Google via gtag('config'),
     como o Google pede (uma tag por página). A escolha fica no localStorage
     e pode ser revista em "Cookies" no rodapé.
   - Diagnósticos: o scanner chama techdimSaveDiagnostic() depois do clique
     que aceita os termos.
   O n8n recebe formulário simples (x-www-form-urlencoded): não há preflight
   CORS e a resposta não é lida, então o Webhook funciona sem ajuste de CORS.
   ========================================================================== */
(function () {
  const cfg = window.TECHDIM_CONFIG || {};
  const ads = cfg.googleAds || {};
  const labels = ads.labels || {};
  const ga4 = cfg.ga4 || {};
  const meta = cfg.metaPixel || {};
  const n8n = cfg.n8n || {};
  const CONSENT_KEY = 'techdim_consent_v1';
  const hasTags = !!(ads.id || ga4.id || meta.id);
  const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  const GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
  let tagsLoaded = false;
  let banner = null;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* modo privado: vale só nesta página */ }
  }

  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }

  function loadScript(src) {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  /* ---------- n8n ---------- */
  function postToN8n(url, data) {
    if (!url) return false;
    const body = new URLSearchParams({ payload: JSON.stringify(Object.assign({}, data, { siteKey: n8n.siteKey || '' })) });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return true;
    } catch (e) { /* segue para o fetch */ }
    fetch(url, { method: 'POST', body, mode: 'no-cors', keepalive: true }).catch(() => {});
    return true;
  }

  function sendVisit() {
    if (!n8n.visitUrl || privacySignal()) return;
    let newSession = false;
    try {
      newSession = !sessionStorage.getItem('techdim_sessao');
      sessionStorage.setItem('techdim_sessao', '1');
    } catch (e) { newSession = true; }

    const params = new URLSearchParams(location.search);
    const visit = {
      type: 'visita',
      ts: new Date().toISOString(),
      page: location.pathname,
      referrer: '',
      newSession,
      device: window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop',
      lang: navigator.language || '',
      gclid: params.has('gclid'),   // só indica se veio de anúncio, sem guardar o ID do clique
      fbclid: params.has('fbclid')
    };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
      if (params.get(k)) visit[k] = params.get(k).slice(0, 100);
    });
    try {
      if (document.referrer) visit.referrer = new URL(document.referrer).hostname;
    } catch (e) { /* referrer inválido */ }
    postToN8n(n8n.visitUrl, visit);
  }

  /* ---------- Google Ads / GA4 / Meta Pixel ---------- */
  function grantTags() {
    if (tagsLoaded || !hasTags) return;
    tagsLoaded = true;

    if (ads.id || ga4.id) {
      if (typeof window.gtag !== 'function') {
        // Página sem a tag no <head>: carrega a tag do Google aqui (uma só por página)
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', DENIED);
        window.gtag('js', new Date());
        if (ga4.id) window.gtag('config', ga4.id);
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4.id || ads.id)}`);
      }
      window.gtag('consent', 'update', GRANTED);
      if (ads.id) window.gtag('config', ads.id);
    }

    if (meta.id) {
      if (!window.fbq) {
        // Equivalente ao snippet oficial do Meta Pixel
        const fbq = window.fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        if (!window._fbq) window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
        loadScript('https://connect.facebook.net/en_US/fbevents.js');
      }
      window.fbq('consent', 'grant');
      window.fbq('init', meta.id);
      window.fbq('track', 'PageView');
    }
  }

  // Eventos de conversão: whatsapp, lead (formulário), diagnostico e compra (loja)
  function track(name, data) {
    const map = {
      whatsapp: { ga: 'whatsapp_click', meta: ['track', 'Contact'], label: labels.whatsapp },
      lead: { ga: 'generate_lead', meta: ['track', 'Lead'], label: labels.lead },
      diagnostico: { ga: 'diagnostico_concluido', meta: ['trackCustom', 'DiagnosticoConcluido'], label: labels.diagnostico },
      compra: { ga: 'begin_checkout', meta: ['track', 'InitiateCheckout'], label: labels.compra }
    };
    const ev = map[name];
    if (!ev) return;
    // Analytics: sempre (o modo de consentimento da tag respeita quem recusou)
    if (window.gtag && ga4.id) window.gtag('event', ev.ga, data || {});
    if (!tagsLoaded) return;
    if (window.gtag && ads.id && ev.label) window.gtag('event', 'conversion', { send_to: `${ads.id}/${ev.label}` });
    if (window.fbq && meta.id) window.fbq(ev.meta[0], ev.meta[1], data || {});
  }

  /* ---------- Aviso de cookies ---------- */
  function buildBanner() {
    const el = document.createElement('div');
    el.className = 'consent-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Preferências de cookies');
    el.hidden = true;

    // O texto cita só o que está ligado em site-config.js
    const partes = [];
    if (ga4.id) partes.push('Medimos as visitas com o Google Analytics para melhorar o site; você pode recusar.');
    const anunciantes = [ads.id && 'do Google', meta.id && 'da Meta'].filter(Boolean).join(' e ');
    if (anunciantes) partes.push(`Cookies de anúncios ${anunciantes} só com a sua permissão.`);
    const text = document.createElement('p');
    text.append(`${partes.join(' ')} `);
    const link = document.createElement('a');
    link.href = 'privacidade.html';
    link.textContent = 'Política de privacidade';
    text.append(link);

    const actions = document.createElement('div');
    actions.className = 'consent-actions';
    [['denied', 'Recusar'], ['granted', 'Aceitar']].forEach(([value, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `consent-btn${value === 'granted' ? ' consent-btn-primary' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => setChoice(value));
      actions.appendChild(btn);
    });

    el.append(text, actions);
    document.body.appendChild(el);
    return el;
  }

  function showBanner(focus) {
    if (!banner) banner = buildBanner();
    banner.hidden = false;
    document.body.classList.add('consent-open');
    if (focus === true) banner.querySelector('button').focus();
  }

  function setChoice(value) {
    storageSet(CONSENT_KEY, value);
    storageSet(`${CONSENT_KEY}_em`, new Date().toISOString());
    if (banner) banner.hidden = true;
    document.body.classList.remove('consent-open');

    if (value === 'granted') {
      grantTags();
    } else {
      // Recusa ou revogação: a tag do Google para de gravar cookies na hora
      if (window.gtag) window.gtag('consent', 'update', DENIED);
      if (window.fbq) {
        window.fbq('consent', 'revoke');
        location.reload(); // o Pixel não descarrega sozinho
      }
    }
  }

  /* ---------- Inicialização ---------- */
  sendVisit();

  if (hasTags) {
    document.querySelectorAll('[data-open-consent]').forEach(btn => {
      btn.hidden = false;
      btn.addEventListener('click', () => showBanner(true));
    });
    const choice = storageGet(CONSENT_KEY);
    if (choice === 'granted') grantTags();
    else if (choice !== 'denied') showBanner(false);
  }

  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('a[href*="wa.me/"], #btnExportScanWa')) track('whatsapp');
  }, true);

  const leadForm = document.getElementById('tacticalContactForm');
  if (leadForm) leadForm.addEventListener('submit', () => track('lead'));

  window.techdimTrack = track;
  window.techdimSaveDiagnostic = payload => postToN8n(n8n.diagnosticUrl, payload);
  window.techdimOpenConsent = () => showBanner(true);
})();
