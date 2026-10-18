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
      diagnostico: ''   // diagnóstico de rede concluído
    }
  },

  // Google Analytics 4 (opcional): G-XXXXXXXXXX
  ga4: { id: 'G-VEF3PZHXEM' },

  // Meta (Facebook/Instagram) Pixel: ID numérico do pixel
  metaPixel: { id: '' }
};
