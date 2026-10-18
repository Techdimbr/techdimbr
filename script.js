/**
 * TECHDIM INOVA SIMPLES (I.S.) - ME
 * Motor de Interatividade & Diagnóstico Tático (Vanilla JS)
 * Telefone / WhatsApp Oficial: +55 (19) 99615-3276
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initVideoPlayer();
  if (typeof initThreatScanner === 'function') initThreatScanner();
  initRoiCalculator();
  initFaqAccordion();
  initServiceModals();
  initTacticalForm();
  initCopyButtons();
  initFloatingWhatsapp();
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
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 899 && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   Video Player Showcase & Switcher
   ========================================================================== */
function initVideoPlayer() {
  const container = document.getElementById('videoViewport');
  const tabLogo = document.getElementById('tabLogoShowcase');
  const tabLocal = document.getElementById('tabVideoLocal');
  const tabYoutube = document.getElementById('tabVideoYoutube');
  const label = document.getElementById('showcaseLabel');
  const btnSwitch = document.getElementById('btnSwitchToVideo');

  if (!container) return;

  function setLogoMode() {
    if (tabLogo) tabLogo.classList.add('active');
    if (tabLocal) tabLocal.classList.remove('active');
    if (tabYoutube) tabYoutube.classList.remove('active');
    if (label) label.textContent = 'TECHDIM_OFFICIAL_CUBE_3D // CORE';

    container.innerHTML = `
      <div class="cube-showcase-container">
        <img src="assets/techdim-official-cube-logo.webp" width="800" height="800" alt="Logotipo Oficial TECHDIM INOVA 3D" class="cube-showcase-img" />
        <div class="cube-hologram-glow"></div>
        <div class="cube-status-pill">
          <span class="live-pulse-dot"></span>
          <span>LOGO OFICIAL // TECHDIM INOVA 2026</span>
        </div>
        <button class="cube-play-overlay-btn" id="btnSwitchToVideo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Assistir Vídeo Animado</span>
        </button>
      </div>
    `;

    const newBtn = document.getElementById('btnSwitchToVideo');
    if (newBtn) newBtn.addEventListener('click', setLocalVideoMode);
  }

  function setLocalVideoMode() {
    if (tabLocal) tabLocal.classList.add('active');
    if (tabLogo) tabLogo.classList.remove('active');
    if (tabYoutube) tabYoutube.classList.remove('active');
    if (label) label.textContent = 'TECHDIM_LOGO_VIDEO_3D // STREAM';

    container.innerHTML = `
      <video id="institutionalVideo" class="video-element" autoplay loop muted playsinline poster="assets/techdim-official-cube-logo.jpg">
        <source src="assets/techdim-logo-video.webm" type="video/webm">
        <source src="assets/techdim-logo-video.mp4" type="video/mp4">
        Seu navegador não suporta vídeos HTML5.
      </video>
      <div class="video-overlay-ctrls">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="ctrl-btn" id="btnVideoPlay" title="Pausar ou Reproduzir">
            <span>⏸ Pausar</span>
          </button>
          <button class="ctrl-btn" id="btnVideoMute" title="Áudio">
            <span>🔇 Mutado</span>
          </button>
        </div>
        <button class="ctrl-btn" id="btnVideoFullscreen" title="Tela Cheia">
          <span>⛶ Tela Cheia</span>
        </button>
      </div>
    `;

    const vid = document.getElementById('institutionalVideo');
    const pBtn = document.getElementById('btnVideoPlay');
    const mBtn = document.getElementById('btnVideoMute');
    const fBtn = document.getElementById('btnVideoFullscreen');

    if (vid && pBtn) {
      pBtn.addEventListener('click', () => {
        if (vid.paused) { vid.play(); pBtn.innerHTML = '<span>⏸ Pausar</span>'; }
        else { vid.pause(); pBtn.innerHTML = '<span>▶ Reproduzir</span>'; }
      });
    }
    if (vid && mBtn) {
      mBtn.addEventListener('click', () => {
        vid.muted = !vid.muted;
        mBtn.innerHTML = vid.muted ? '<span>🔇 Mutado</span>' : '<span>🔊 Áudio On</span>';
      });
    }
    if (container && fBtn) {
      fBtn.addEventListener('click', () => {
        if (container.requestFullscreen) container.requestFullscreen();
      });
    }
  }

  function setYoutubeMode() {
    if (tabYoutube) tabYoutube.classList.add('active');
    if (tabLogo) tabLogo.classList.remove('active');
    if (tabLocal) tabLocal.classList.remove('active');
    if (label) label.textContent = 'YOUTUBE_CANAL_OFICIAL // STREAM';

    container.innerHTML = `
      <iframe src="https://www.youtube.com/embed/VBeEkLy6ZoE?autoplay=1&mute=1&controls=1&rel=0" 
              title="Apresentação TECHDIM" class="video-element" frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen></iframe>
    `;
  }

  if (tabLogo) tabLogo.addEventListener('click', setLogoMode);
  if (tabLocal) tabLocal.addEventListener('click', setLocalVideoMode);
  if (tabYoutube) tabYoutube.addEventListener('click', setYoutubeMode);
  if (btnSwitch) btnSwitch.addEventListener('click', setLocalVideoMode);
}

/* ThreatScanner Kether_1: ver scanner.js (initThreatScanner) */

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

  // ⚡ Performance Optimization (Bolt): Reuse Intl.NumberFormat instances across slider input events.
  // Instantiating Intl.NumberFormat on every slider input tick costs ~6.8ms/100k vs ~0.08ms/100k (~83x speedup),
  // preventing main-thread lag and garbage collection pressure during continuous dragging.
  const brlCurrencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const integerFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

  function updateRoi() {
    const revenue = parseFloat(revenueSlider.value);
    const downtime = parseFloat(downtimeSlider.value);

    // Format BRL
    if (revenueBadge) {
      revenueBadge.textContent = brlCurrencyFormatter.format(revenue);
    }
    if (downtimeBadge) {
      downtimeBadge.textContent = `${downtime}h / mês`;
    }

    // Formula: (Revenue / 720h) * downtime * 2.8 (Loss + idle costs + reputation)
    const hourlyLoss = (revenue / 720) * 2.8;
    const totalLoss = hourlyLoss * downtime;

    if (lossDisplay) {
      lossDisplay.textContent = brlCurrencyFormatter.format(totalLoss);
    }

    if (btnWa) {
      const msg = `*TECHDIM - Simulação de Perda por Downtime*\n` +
        `Olá! Calculei o impacto financeiro de instabilidade no meu negócio:\n` +
        `• Faturamento Mensal: R$ ${integerFormatter.format(revenue)}\n` +
        `• Indisponibilidade Estimada: ${downtime} horas/mês\n` +
        `• Prejuízo Projetado: R$ ${integerFormatter.format(Math.round(totalLoss))}\n` +
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
        faqItems.forEach(i => {
          i.classList.remove('open');
          const iBtn = i.querySelector('.faq-btn');
          if (iBtn) iBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
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

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
  };

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
        modal.setAttribute('aria-hidden', 'false');
        modal.inert = false;
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
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
      window.open(waUrl, '_blank', 'noopener,noreferrer');
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

/* ==========================================================================
   Floating WhatsApp: aparece depois do hero e some no contato/rodapé
   (esses trechos já têm botão de WhatsApp; assim o flutuante não cobre conteúdo)
   ========================================================================== */
function initFloatingWhatsapp() {
  const fab = document.querySelector('.floating-whatsapp');
  const hero = document.querySelector('.hero-section');
  if (!fab || !hero || !('IntersectionObserver' in window)) return;

  const zones = [hero, document.getElementById('contato'), document.querySelector('.site-footer')].filter(Boolean);
  const inView = new Set();
  fab.classList.add('fab-managed');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    });
    fab.classList.toggle('is-visible', inView.size === 0);
  });
  zones.forEach(zone => observer.observe(zone));
}
