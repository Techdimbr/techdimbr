/* ==========================================================================
   Configuração das integrações do site TECHDIM
   --------------------------------------------------------------------------
   Preencha os IDs e publique. Campo vazio = integração desligada: nada é
   carregado nem enviado. Nenhum valor aqui é senha (o site é público).
   ========================================================================== */
window.TECHDIM_CONFIG = {
  // n8n: URLs de PRODUÇÃO dos dois Webhooks (workflow "TECHDIM Site")
  n8n: {
    visitUrl: '',       // ex.: https://n8n.seudominio.com.br/webhook/techdim-visita
    diagnosticUrl: '',  // ex.: https://n8n.seudominio.com.br/webhook/techdim-diagnostico
    siteKey: ''         // mesmo valor de SITE_KEY no nó "Validar" do n8n (filtro anti-ruído)
  },

  // Google Ads: ID da tag (AW-XXXXXXXXX) e rótulos das ações de conversão
  googleAds: {
    id: '',
    labels: {
      whatsapp: '',     // clique em qualquer botão de WhatsApp
      lead: '',         // envio do formulário "Solicitar Diagnóstico Tático"
      diagnostico: '',  // diagnóstico de rede concluído
      compra: ''        // clique em "Comprar" na loja
    }
  },

  // Google Analytics 4 (opcional): G-XXXXXXXXXX
  ga4: { id: 'G-VEF3PZHXEM' },

  // Meta (Facebook/Instagram) Pixel: ID numérico do pixel
  metaPixel: { id: '' },

  // Loja (loja.html): link do produto na plataforma de venda e, se quiser, o preço exibido.
  // Sem link, o botão vira "Pedir orçamento" no WhatsApp com a mensagem pronta.
  loja: {
    'workstation-ia-ryzen9':     { link: '', preco: '' },
    'suporte-ti-especializado':  { link: '', preco: '' },
    'kit-unifi-ubiquiti':        { link: '', preco: '' },
    'pixel-11-pro-hardening':    { link: '', preco: '' },
    'thinkpad-l14-hardening':    { link: '', preco: '' },
    'midia-usb-debian-13':       { link: '', preco: '' },
    'hardening-servidor-debian': { link: '', preco: '' },
    'ia-local-on-premise':       { link: '', preco: '' },
    'backup-seguro-3-2-1':       { link: '', preco: '' },
    'adequacao-lgpd-essencial':  { link: '', preco: '' }
  }
};
