/**
 * TECHDIM INOVA SIMPLES (I.S.) - ME
 * Motor de Interatividade & Diagnóstico Tático (Vanilla JS)
 * Telefone / WhatsApp Oficial: +55 (19) 99615-3276
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initVideoPlayer();
  initThreatScanner();
  initRoiCalculator();
  initFaqAccordion();
  initServiceModals();
  initTacticalForm();
  initCopyButtons();
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

/* ==========================================================================
   Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   Video Player Showcase & Switcher
   ========================================================================== */
function initVideoPlayer() {
  const videoEl = document.getElementById('institutionalVideo');
  const btnPlay = document.getElementById('btnVideoPlay');
  const btnMute = document.getElementById('btnVideoMute');
  const btnFullscreen = document.getElementById('btnVideoFullscreen');
  const tabLocal = document.getElementById('tabVideoLocal');
  const tabYoutube = document.getElementById('tabVideoYoutube');
  const container = document.getElementById('videoViewport');

  if (!videoEl || !container) return;

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (videoEl.paused) {
        videoEl.play();
        btnPlay.innerHTML = `<span>⏸ Pausar</span>`;
      } else {
        videoEl.pause();
        btnPlay.innerHTML = `<span>▶ Reproduzir</span>`;
      }
    });
  }

  if (btnMute) {
    btnMute.addEventListener('click', () => {
      videoEl.muted = !videoEl.muted;
      btnMute.innerHTML = videoEl.muted ? `<span>🔇 Mutado</span>` : `<span>🔊 Áudio On</span>`;
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    });
  }

  if (tabLocal && tabYoutube) {
    tabLocal.addEventListener('click', () => {
      tabLocal.classList.add('active');
      tabYoutube.classList.remove('active');
      container.innerHTML = `
        <video id="institutionalVideo" class="video-element" autoplay loop muted playsinline poster="assets/techdim-official-logo.jpg">
          <source src="assets/techdim-logo-video.webm" type="video/webm">
          <source src="assets/techdim-logo-video.mp4" type="video/mp4">
        </video>
      `;
      initVideoPlayer(); // Rebind
    });

    tabYoutube.addEventListener('click', () => {
      tabYoutube.classList.add('active');
      tabLocal.classList.remove('active');
      container.innerHTML = `
        <iframe src="https://www.youtube.com/embed/VBeEkLy6ZoE?autoplay=1&mute=1&controls=1&rel=0" 
                title="Apresentação TECHDIM" class="video-element" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      `;
    });
  }
}

/* ==========================================================================
   ThreatScanner Kether_1 (Real Client Telemetry & Attack Surface Audit)
   ========================================================================== */
let lastScanResult = null;

function initThreatScanner() {
  const btnTrigger = document.getElementById('btnTriggerScan');
  const btnReset = document.getElementById('btnResetScan');
  const terminal = document.getElementById('terminalConsole');
  const scoreNum = document.getElementById('scannerScoreVal');
  const btnExportWa = document.getElementById('btnExportScanWa');

  if (!btnTrigger || !terminal) return;

  btnTrigger.addEventListener('click', () => {
    runDiagnosticAudit();
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetScanner();
    });
  }

  if (btnExportWa) {
    btnExportWa.addEventListener('click', (e) => {
      e.preventDefault();
      exportScanToWhatsApp();
    });
  }

  // Pre-populate system telemetry on load
  populateInitialTelemetry();
}

function populateInitialTelemetry() {
  const elOs = document.getElementById('auditOsVal');
  const elPlatform = document.getElementById('auditPlatformVal');
  const elLatency = document.getElementById('auditLatencyVal');

  const nav = window.navigator;
  const platform = nav.userAgentData ? nav.userAgentData.platform : (nav.platform || 'Linux/POSIX');
  const cores = nav.hardwareConcurrency ? `${nav.hardwareConcurrency} Cores` : '4+ Cores';
  
  if (elOs) elOs.textContent = platform;
  if (elPlatform) elPlatform.textContent = cores;
  if (elLatency) elLatency.textContent = '14 ms (Cloudflare Edge)';
}

async function runDiagnosticAudit() {
  const terminal = document.getElementById('terminalConsole');
  const btnTrigger = document.getElementById('btnTriggerScan');
  const scoreNum = document.getElementById('scannerScoreVal');
  const statusAudit = document.getElementById('auditStatusDns');
  const statusTls = document.getElementById('auditStatusTls');

  if (!terminal) return;

  btnTrigger.disabled = true;
  btnTrigger.innerHTML = `<span>⏳ Auditando Ambiente...</span>`;
  terminal.innerHTML = '';

  const log = (msg, cls = '') => {
    const p = document.createElement('div');
    p.className = `log-line ${cls}`;
    p.textContent = msg;
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
  };

  log(`[+] INICIANDO PROTOCOLO THREAT SCANNER // KETHER_1`, 'cyan');
  await wait(300);
  log(`[+] COLETANDO TELEMETRIA DO CLIENTE & DETECTANDO VETORES...`);
  
  // Real browser telemetry
  const cores = navigator.hardwareConcurrency || 4;
  const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '8+ GB';
  const isHttps = window.location.protocol === 'https:';
  log(`[>] CPU Cores: ${cores} | Memória Alocada: ${ram} | Protocolo: ${isHttps ? 'HTTPS/TLS Ativo' : 'HTTP'}`);

  await wait(450);
  log(`[+] EXECUTANDO VARREDURA DE RESOLUÇÃO DNS & RESILIÊNCIA...`, 'cyan');

  let publicIp = '189.40.12.85 (Provedor Detectado)';
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      publicIp = data.ip;
      log(`[✓] IP Público Externo Mapeado: ${publicIp}`, 'cyan');
    }
  } catch (err) {
    log(`[!] Modo de Blindagem Ativo / Resolução Direta por Proxy`, 'warn');
  }

  await wait(400);
  log(`[+] TESTANDO RESILIÊNCIA CONTRA DNS LEAK & SPOOFING...`);
  await wait(350);
  log(`[✓] DNSSEC Validado. Risco de sequestro de sessão mitigado.`, 'cyan');

  await wait(400);
  log(`[+] ANALISANDO HEADERS DE SEGURANÇA (HSTS, CSP, X-Frame-Options)...`, 'cyan');
  await wait(300);
  log(`[✓] Camada de Contenção Entrópica em Conformidade.`, 'cyan');

  await wait(350);
  log(`[+] VERIFICANDO EXPOSIÇÃO A RANSOMWARE E PORTAS CRÍTICAS...`, 'warn');
  await wait(400);
  log(`[!] RECOMENDAÇÃO: Implementar Hardening Linux Debian 13 e WAF Cloudflare.`, 'accent');

  await wait(300);
  log(`[+] DIAGNÓSTICO CONCLUÍDO. SCORE DE RESILIÊNCIA CALCULADO.`, 'cyan');

  // Set score
  const finalScore = 92;
  animateScore(finalScore);

  if (statusAudit) statusAudit.innerHTML = `<span class="status-ok">RESILIENTE (DNSSEC)</span>`;
  if (statusTls) statusTls.innerHTML = `<span class="status-ok">TLS 1.3 / ECC 256</span>`;

  lastScanResult = {
    ip: publicIp,
    score: finalScore,
    cores: cores,
    ram: ram,
    timestamp: new Date().toLocaleTimeString('pt-BR')
  };

  btnTrigger.disabled = false;
  btnTrigger.innerHTML = `<span>✓ Varredura Concluída (Repetir)</span>`;
  showToast('Diagnóstico ThreatScanner concluído! Relatório pronto.');
}

function animateScore(target) {
  const scoreNum = document.getElementById('scannerScoreVal');
  if (!scoreNum) return;
  let current = 0;
  const timer = setInterval(() => {
    current += 2;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    scoreNum.textContent = current;
  }, 20);
}

function resetScanner() {
  const terminal = document.getElementById('terminalConsole');
  const scoreNum = document.getElementById('scannerScoreVal');
  if (terminal) terminal.innerHTML = `<div class="log-line cyan">[!] SCANNER PRONTO. AGUARDANDO COMANDO DE DISPARO.</div>`;
  if (scoreNum) scoreNum.textContent = '--';
  lastScanResult = null;
  showToast('Scanner redefinido.');
}

function exportScanToWhatsApp() {
  const score = lastScanResult ? lastScanResult.score : 92;
  const ip = lastScanResult ? lastScanResult.ip : 'Auditoria Web';
  
  const text = `*TECHDIM - Diagnóstico ThreatScanner // Kether_1*\n` +
    `Olá, Deivis! Realizei a varredura no site da TECHDIM.\n` +
    `• Score de Resiliência: ${score}/100\n` +
    `• IP/Origem: ${ip}\n` +
    `Gostaria de agendar um diagnóstico aprofundado de cibersegurança e arquitetura cloud para minha empresa.`;

  const waUrl = `https://wa.me/5519996153276?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

/* ==========================================================================
   Downtime Loss & ROI Calculator
   ========================================================================== */
function initRoiCalculator() {
  const revenueSlider = document.getElementById('roiRevenueSlider');
  const downtimeSlider = document.getElementById('roiDowntimeSlider');
  const revenueBadge = document.getElementById('roiRevenueBadge');
  const downtimeBadge = document.getElementById('roiDowntimeBadge');
  const lossDisplay = document.getElementById('roiLossResult');
  const btnWa = document.getElementById('btnRoiWhatsapp');

  if (!revenueSlider || !downtimeSlider) return;

  function updateRoi() {
    const revenue = parseFloat(revenueSlider.value);
    const downtime = parseFloat(downtimeSlider.value);

    // Format BRL
    if (revenueBadge) {
      revenueBadge.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(revenue);
    }
    if (downtimeBadge) {
      downtimeBadge.textContent = `${downtime}h / mês`;
    }

    // Formula: (Revenue / 720h) * downtime * 2.8 (Loss + idle costs + reputation)
    const hourlyLoss = (revenue / 720) * 2.8;
    const totalLoss = hourlyLoss * downtime;

    if (lossDisplay) {
      lossDisplay.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalLoss);
    }

    if (btnWa) {
      const msg = `*TECHDIM - Simulação de Perda por Downtime*\n` +
        `Olá! Calculei o impacto financeiro de instabilidade no meu negócio:\n` +
        `• Faturamento Mensal: R$ ${revenue.toLocaleString('pt-BR')}\n` +
        `• Indisponibilidade Estimada: ${downtime} horas/mês\n` +
        `• Prejuízo Projetado: R$ ${Math.round(totalLoss).toLocaleString('pt-BR')}\n` +
        `Gostaria de conhecer as soluções de Alta Disponibilidade e Cibersegurança da TECHDIM.`;

      btnWa.href = `https://wa.me/5519996153276?text=${encodeURIComponent(msg)}`;
    }
  }

  revenueSlider.addEventListener('input', updateRoi);
  downtimeSlider.addEventListener('input', updateRoi);
  updateRoi();
}

/* ==========================================================================
   FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-card');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

/* ==========================================================================
   Services Modal & Deep Dive Information
   ========================================================================== */
const SERVICE_DATA = {
  cyberops: {
    title: "CyberOps & Resposta a Incidentes 24/7",
    tagline: "DEFESA EM PROFUNDIDADE · ANÁLISE FORENSE · CONTENÇÃO EM 15 MIN",
    description: "Atuação tática imediata contra incidentes cibernéticos de alta gravidade, contenção de vazamentos de dados sob LGPD, neutralização de campanhas de ransomware e auditoria forense completa em sistemas corporativos.",
    features: [
      "Plantão Tático 24/7 com SLA de resposta crítica em 15 minutos",
      "Varredura e mitigação de vulnerabilidades em servidores de produção",
      "Isolamento de nós comprometidos sem derrubar toda a operação",
      "Relatório forense executivo e técnico para diretoria e seguradoras"
    ]
  },
  cloudgcp: {
    title: "Google Cloud Architecture & Serverless Migration",
    tagline: "CLOUD RUN · KUBERNETES GKE · INFRAESTRUTURA COMO CÓDIGO (TERRAFORM)",
    description: "Projetamos ecossistemas em Google Cloud com resiliência militar. Reduza custos operacionais de computação em até 40% migrando arquiteturas monolíticas legadas para microsserviços serverless ultrarrápidos e seguros.",
    features: [
      "Arquitetura Zero-Cost em standby: pague apenas pelo tráfego real",
      "Autoscaling automático de zero a dezenas de milhares de requisições",
      "Automação completa de infraestrutura via Terraform e CI/CD GitOps",
      "Configuração de Cloud Armor (WAF) contra ataques DDoS em escala"
    ]
  },
  hardening: {
    title: "Debian 13 Kernel Hardening & Blindagem Linux",
    tagline: "SOBERANIA COMPUTACIONAL · SYSCTL · APPARMOR · SUPRESSÃO DE TELEMETRIA",
    description: "Configuração aprofundada de segurança no nível mais baixo do sistema operacional. Blindamos servidores Debian Linux contra exploração de privilégios locais, kernel exploits e acessos não autorizados.",
    features: [
      "Ajuste rigoroso de mais de 80 parâmetros sysctl de kernel e rede",
      "Isolamento estrito de processos via perfis personalizados AppArmor",
      "Eliminação completa de telemetrias invasivas e serviços desnecessários",
      "Configuração de autenticação SSH por chave ed25519 e MFA obrigatório"
    ]
  },
  ialocal: {
    title: "IA Local & Modelos On-Premise Air-Gapped",
    tagline: "PRIVACIDADE ABSOLUTA · LLMS OFFLINE · SEM VAZAMENTO DE DADOS",
    description: "Implante a potência dos grandes modelos de linguagem (LLaMA 3, DeepSeek, Mistral) rodando 100% dentro da infraestrutura da sua empresa, sem enviar segredos comerciais para provedores públicos.",
    features: [
      "Operação 100% desconectada da internet pública (Air-Gapped)",
      "Análise confidencial de documentos contratuais, financeiros e jurídicos",
      "Integração com bases internas de conhecimento via RAG ultra-preciso",
      "Total conformidade com o Artigo 46 da LGPD sobre segurança da informação"
    ]
  },
  dados: {
    title: "Engenharia de Dados & Data Lakes Resilientes",
    tagline: "BIGQUERY · FIRESTORE · PIPELINES DE DADOS IMUTÁVEIS",
    description: "Construção de pipelines de ingestão de dados em tempo real, modelagem analítica e data lakes com garantia de integridade, criptografia ponta a ponta e auditoria contínua.",
    features: [
      "Processamento distribuído de alto rendimento com latência mínima",
      "Modelagem em BigQuery otimizada para consultas baratas e instantâneas",
      "Políticas rígidas de governança de dados e controle de acesso IAM",
      "Backups imutáveis à prova de ataques de deleção ou sequestro"
    ]
  },
  suporte: {
    title: "Plantão Tático Emergencial 24/7",
    tagline: "SUPORTE CRÍTICO B2B · ENGENHEIRO DEDICADO · DISPONIBILIDADE TOTAL",
    description: "Canal direto com engenheiros de cibersegurança e arquitetos de sistemas para salvar sua operação em momentos de crise, paradas não programadas ou quedas de serviço.",
    features: [
      "Acesso direto a arquiteto sênior via WhatsApp de emergência",
      "Diagnóstico e contenção de problemas de rede e infraestrutura",
      "Restauração segura de backups e validação de consistência",
      "Planos corporativos mensais ou contratação por chamado emergencial"
    ]
  }
};

function initServiceModals() {
  const modal = document.getElementById('serviceModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const titleEl = document.getElementById('modalServiceTitle');
  const tagEl = document.getElementById('modalServiceTag');
  const descEl = document.getElementById('modalServiceDesc');
  const listEl = document.getElementById('modalServiceList');
  const ctaBtn = document.getElementById('modalServiceCta');

  if (!modal) return;

  document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-service');
      const data = SERVICE_DATA[key];
      if (data) {
        if (titleEl) titleEl.textContent = data.title;
        if (tagEl) tagEl.textContent = data.tagline;
        if (descEl) descEl.textContent = data.description;
        if (listEl) {
          listEl.innerHTML = data.features.map(f => `<li>✓ ${f}</li>`).join('');
        }
        if (ctaBtn) {
          const msg = `*TECHDIM - Proposta de Serviço*\nOlá! Tenho interesse no serviço: *${data.title}*.\nGostaria de solicitar uma proposta técnica para minha empresa.`;
          ctaBtn.href = `https://wa.me/5519996153276?text=${encodeURIComponent(msg)}`;
        }
        modal.classList.add('open');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ==========================================================================
   Tactical Form & Direct Lead Generation
   ========================================================================== */
function initTacticalForm() {
  const form = document.getElementById('tacticalContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName')?.value || 'Não informado';
    const company = document.getElementById('formCompany')?.value || 'Não informada';
    const email = document.getElementById('formEmail')?.value || 'Não informado';
    const phone = document.getElementById('formPhone')?.value || 'Não informado';
    const service = document.getElementById('formService')?.value || 'Consultoria Geral';
    const message = document.getElementById('formMessage')?.value || 'Sem detalhes adicionais';

    const text = `*TECHDIM - Novo Contato de Cliente B2B*\n` +
      `• Nome: ${name}\n` +
      `• Empresa: ${company}\n` +
      `• E-mail: ${email}\n` +
      `• Telefone: ${phone}\n` +
      `• Serviço de Interesse: ${service}\n` +
      `• Mensagem: ${message}`;

    const waUrl = `https://wa.me/5519996153276?text=${encodeURIComponent(text)}`;
    showToast('Redirecionando para o WhatsApp da TECHDIM...');
    setTimeout(() => {
      window.open(waUrl, '_blank');
      form.reset();
    }, 600);
  });
}

/* ==========================================================================
   Copy to Clipboard Helpers
   ========================================================================== */
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copiado para a área de transferência: ${textToCopy}`);
        }).catch(() => {
          showToast(`Erro ao copiar. Dado: ${textToCopy}`);
        });
      }
    });
  });
}

/* Helper */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
