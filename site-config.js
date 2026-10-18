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
  // Equipamentos vão para o Google Merchant Center (merchant-feed.xml, refeito sozinho
  // a cada alteração deste arquivo) quando têm os três campos abaixo preenchidos:
  //   link:   página do produto na plataforma de venda ou link de pagamento (https://...)
  //   preco:  valor final no formato 'R$ 1.234,56' (o mesmo exibido na loja)
  //   imagem: foto real do produto, ex.: 'assets/loja/pixel-11-pro.jpg' (mín. 500x500, sem texto)
  //   gtin:   opcional, código de barras (EAN) do fabricante, só se tiver certeza
  // Serviços não entram no Merchant (política do Google), mas aparecem com preço na loja.
  //   unidade: opcional, aparece ao lado do preço (ex.: 'por chamado')
  // Com preço e sem link, o botão vira "Contratar/Comprar pelo WhatsApp" com o valor na mensagem.
  loja: {
    'workstation-ia-ryzen9':     { link: '', preco: '', imagem: '' },
    'suporte-ti-especializado':  { link: '', preco: 'R$ 500,00', unidade: 'por chamado', imagem: 'assets/loja/suporte-ti-especializado.jpg' },
    'kit-unifi-ubiquiti':        { link: '', preco: '', imagem: '', gtin: '' },
    'pixel-11-pro-hardening':    { link: '', preco: '', imagem: '', gtin: '' },
    'thinkpad-l14-hardening':    { link: '', preco: '', imagem: '', gtin: '' },
    'midia-usb-debian-13':       { link: '', preco: '', imagem: '' },
    'hardening-servidor-debian': { link: '', preco: '' },
    'ia-local-on-premise':       { link: '', preco: '' },
    'backup-seguro-3-2-1':       { link: '', preco: '' },
    'adequacao-lgpd-essencial':  { link: '', preco: '' }
  }
};
