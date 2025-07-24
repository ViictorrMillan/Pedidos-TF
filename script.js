function abrirMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('active');
}

// pedidos 
const carrinho = {};
  let produtos = [];
  let categoriaAtiva = '';

  fetch('produtos.json')
    .then(r => r.json())
    .then(dados => {
      produtos = dados.sort((a, b) => a.nome.localeCompare(b.nome));
      renderFiltros();
      renderizarItens();
    });

  const lista = document.getElementById('lista-itens');
  const filtroInput = document.getElementById('filtro-itens');
  const filtrosBox = document.getElementById('filtros-categorias');

  function renderFiltros() {
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    filtrosBox.innerHTML = '';
    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.onclick = () => {
        categoriaAtiva = categoriaAtiva === cat ? '' : cat;
        document.querySelectorAll('.filtros-categorias button').forEach(b => b.classList.remove('ativo'));
        if (categoriaAtiva) btn.classList.add('ativo');
        renderizarItens(filtroInput.value);
      };
      filtrosBox.appendChild(btn);
    });
  }

  filtroInput.addEventListener('input', e => {
    renderizarItens(e.target.value);
  });

  function renderizarItens(filtro = '') {
    lista.innerHTML = '';
    const filtrados = produtos.filter(p => {
      const matchTexto = p.nome.toLowerCase().includes(filtro.toLowerCase());
      const matchCategoria = !categoriaAtiva || p.categoria === categoriaAtiva;
      return matchTexto && matchCategoria;
    });

    filtrados.forEach(produto => {
      const qtd = carrinho[produto.codigo] || 0;
      const subtotal = (qtd * produto.preco).toFixed(2);
      const card = document.createElement('div');
      card.className = 'item-pedido' + (filtro ? ' destacado' : '');
      card.innerHTML = `
        <div class="imagem-produto">
          ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}">` : '<div></div>'}
        </div>
        <div class="info-produto">${produto.nome}</div>
        <div class="preco">Preço: R$ ${produto.preco.toFixed(2)}</div>
        <div class="controle-quantidade">
          <button onclick="alterarQtd('${produto.codigo}', -1)"><i class="fas fa-minus"></i></button>
          <span class="quantidade" id="qtd-${produto.codigo}">${qtd}</span>
          <button onclick="alterarQtd('${produto.codigo}', 1)"><i class="fas fa-plus"></i></button>
        </div>
        <div class="subtotal">Subtotal: R$ ${subtotal}</div>
      `;
      lista.appendChild(card);
    });
  }

  function alterarQtd(codigo, delta) {
    carrinho[codigo] = (carrinho[codigo] || 0) + delta;
    if (carrinho[codigo] < 0) carrinho[codigo] = 0;
    renderizarItens(filtroInput.value);
  }