function abrirMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('active');
}

// Estado dos filtros e dados
const carrinho = {};
let produtos = [];
let categoriaAtiva = '';
let filtroPromocaoAtivo = false;

const lista = document.getElementById('lista-itens');
const filtroInput = document.getElementById('filtro-itens');
const filtrosBox = document.getElementById('filtros-categorias');

function renderFiltros() {
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  filtrosBox.innerHTML = '';

  // Botão Promoção
  const btnPromo = document.createElement('button');
  btnPromo.textContent = 'Em Promoção';
  btnPromo.onclick = () => {
    filtroPromocaoAtivo = !filtroPromocaoAtivo;
    btnPromo.classList.toggle('ativo', filtroPromocaoAtivo);
    renderizarItens(filtroInput.value);
  };
  filtrosBox.appendChild(btnPromo);

  // Botões categorias
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => {
      categoriaAtiva = categoriaAtiva === cat ? '' : cat;

      // Atualiza classes para categoria (sem mexer no botão promo)
      document.querySelectorAll('.filtros-categorias button').forEach(b => {
        if (b !== btnPromo) b.classList.remove('ativo');
      });
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
    const matchPromocao = !filtroPromocaoAtivo || p.promocao === true;
    return matchTexto && matchCategoria && matchPromocao;
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
  atualizarResumoCarrinho();
}

function alterarQtd(codigo, delta) {
  carrinho[codigo] = (carrinho[codigo] || 0) + delta;
  if (carrinho[codigo] < 0) carrinho[codigo] = 0;
  renderizarItens(filtroInput.value);
}

function atualizarResumoCarrinho() {
  const listaCarrinho = document.getElementById('lista-carrinho');
  listaCarrinho.innerHTML = '';

  let total = 0;

  for (const codigo in carrinho) {
    const qtd = carrinho[codigo];
    if (qtd > 0) {
      const produto = produtos.find(p => p.codigo === codigo);
      if (!produto) continue;

      const subtotal = qtd * produto.preco;
      total += subtotal;

      const itemCarrinho = document.createElement('div');
      itemCarrinho.className = 'item-carrinho';
      itemCarrinho.innerHTML = `
        <span>${produto.nome} x ${qtd}</span>
        <span>R$ ${subtotal.toFixed(2)}</span>
      `;

      listaCarrinho.appendChild(itemCarrinho);
    }
  }

  const totalPedido = document.getElementById('total-pedido');
  totalPedido.textContent = `R$ ${total.toFixed(2)}`;
}

// Busca os produtos do JSON e inicializa o app
fetch('produtos.json')
  .then(r => r.json())
  .then(dados => {
    produtos = dados.sort((a, b) => a.nome.localeCompare(b.nome));
    renderFiltros();
    renderizarItens();
  });

// Evento para finalizar pedido e enviar pelo WhatsApp
document.getElementById('finalizarPedido').addEventListener('click', () => {
  const nome = document.getElementById('nome').value.trim();
  const pizzaria = document.getElementById('pizzaria').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const numero = document.getElementById('numero').value.trim();
  const cep = document.getElementById('cep').value.trim();
  const pagamento = document.getElementById('pagamento').value;

  if (!nome || !pizzaria || !telefone || !endereco || !numero || !cep || !pagamento) {
    alert('Por favor, preencha todos os dados pessoais corretamente!');
    return;
  }

  let mensagem = `* Novo Pedido Realizado!*\n\n`;
  mensagem += ` *Nome:* ${nome}\n🏪 *Pizzaria:* ${pizzaria}\n📱 *Telefone:* ${telefone}\n📍 *Endereço:* ${endereco}, ${numero}\n📮 *CEP:* ${cep}\n💳 *Forma de Pagamento:* ${pagamento}\n\n`;
  mensagem += ` *Itens do Pedido:*\n`;

  let total = 0;
  for (const codigo in carrinho) {
    const qtd = carrinho[codigo];
    if (qtd > 0) {
      const produto = produtos.find(p => p.codigo === codigo);
      if (!produto) continue;

      const subtotal = qtd * produto.preco;
      total += subtotal;
      mensagem += `- ${produto.nome} x${qtd} (R$ ${subtotal.toFixed(2)})\n`;
    }
  }

  mensagem += `\n💰 *Total:* R$ ${total.toFixed(2)}\n\n`;
  mensagem += `✅ *Pedido enviado via sistema!*`;

  const numeroWhatsApp = '11982688488'; // Coloque seu número no formato internacional, ex: '5511999999999'
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
});
