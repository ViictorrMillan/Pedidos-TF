function abrirMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('active');
}

// pedidos 
fetch('produtos.json')
  .then(response => {
    if (!response.ok) throw new Error('Erro ao carregar JSON');
    return response.json();
  })
  .then(produtos => {
    const listaItens = document.getElementById('lista-itens');
    const filtroInput = document.getElementById('filtro-itens');

    function renderizarItens(filtro = "") {
      listaItens.innerHTML = "";

      const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(filtro.toLowerCase())
      );

      filtrados.forEach(produto => {
        const item = document.createElement('div');
        item.classList.add('item-pedido');

        item.innerHTML = `
          <div class="info-produto">
            ${produto.nome} <br>
            Código: ${produto.codigo}
          </div>
          <div class="imagem-produto">
            ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}" />` : `<span>Sem imagem</span>`}
          </div>
        `;

        listaItens.appendChild(item);
      });
    }

    filtroInput.addEventListener('input', e => {
      renderizarItens(e.target.value);
    });

    renderizarItens();
  })
  .catch(error => {
    console.error('Erro:', error);
  });