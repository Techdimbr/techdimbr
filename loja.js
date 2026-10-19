/* ==========================================================================
   Loja (loja.html): lê TECHDIM_CONFIG.loja (site-config.js) e ajusta cada item.
   - Com link: o botão vira "Comprar" e leva à plataforma de venda.
   - Com preço e sem link: o botão vira "Contratar/Comprar pelo WhatsApp", com o
     item e o valor na mensagem (o preço fixo não combina com "Pedir orçamento").
   - Sem preço: fica "Preço sob consulta" e "Pedir orçamento".
   Também filtra por categoria.
   ========================================================================== */
(function () {
  const itens = (window.TECHDIM_CONFIG && window.TECHDIM_CONFIG.loja) || {};

  document.querySelectorAll('[data-produto]').forEach(card => {
    const dados = itens[card.dataset.produto] || {};
    const botao = card.querySelector('.loja-botao');
    const preco = card.querySelector('.loja-preco');
    if (dados.preco && preco) {
      preco.textContent = dados.preco;
      if (dados.unidade) {
        const unidade = document.createElement('span');
        unidade.className = 'loja-preco-unidade';
        unidade.textContent = dados.unidade;
        preco.append(' ', unidade);
      }
    }
    if (botao && /^https:\/\//.test(dados.link || '')) {
      botao.href = dados.link;
      botao.textContent = 'Comprar';
      botao.dataset.compra = card.dataset.produto;
    } else if (botao && dados.preco) {
      const servico = card.dataset.categoria === 'servico';
      const nome = card.querySelector('h2').textContent.trim();
      const valor = dados.unidade ? `${dados.preco} ${dados.unidade}` : dados.preco;
      const msg = `Olá, TECHDIM! Quero ${servico ? 'contratar' : 'comprar'}: ${nome} (${valor}) pela loja do site. ${servico ? 'Como agendamos?' : 'Qual o prazo de entrega?'}`;
      botao.href = `https://wa.me/5519996153276?text=${encodeURIComponent(msg)}`;
      botao.textContent = servico ? 'Contratar pelo WhatsApp' : 'Comprar pelo WhatsApp';
      // Sem data-compra: o clique já conta como contato no WhatsApp (tracking.js)
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
