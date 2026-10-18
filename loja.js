/* ==========================================================================
   Loja (loja.html): quando o item tem link em site-config.js (TECHDIM_CONFIG.loja),
   o botão "Pedir orçamento" (WhatsApp) vira "Comprar" e leva à plataforma de
   venda; o preço aparece se estiver preenchido. Também filtra por categoria.
   ========================================================================== */
(function () {
  const itens = (window.TECHDIM_CONFIG && window.TECHDIM_CONFIG.loja) || {};

  document.querySelectorAll('[data-produto]').forEach(card => {
    const dados = itens[card.dataset.produto] || {};
    const botao = card.querySelector('.loja-botao');
    const preco = card.querySelector('.loja-preco');
    if (dados.preco && preco) preco.textContent = dados.preco;
    if (botao && /^https:\/\//.test(dados.link || '')) {
      botao.href = dados.link;
      botao.textContent = 'Comprar';
      botao.dataset.compra = card.dataset.produto;
    }
  });

  // Conversão "compra" (o clique no WhatsApp já é contado pelo tracking.js)
  document.addEventListener('click', e => {
    const botao = e.target.closest && e.target.closest('[data-compra]');
    if (botao && window.techdimTrack) window.techdimTrack('compra', { item: botao.dataset.compra });
  });

  const filtros = document.querySelectorAll('.loja-filtro');
  filtros.forEach(filtro => filtro.addEventListener('click', () => {
    const alvo = filtro.dataset.filtro;
    filtros.forEach(f => f.setAttribute('aria-pressed', String(f === filtro)));
    document.querySelectorAll('[data-produto]').forEach(card => {
      card.hidden = alvo !== 'todos' && card.dataset.categoria !== alvo;
    });
  }));
})();
