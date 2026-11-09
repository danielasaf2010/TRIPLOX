/* ===========================
   DADOS DOS PRODUTOS
   (espelha os data-* do HTML)
=========================== */
function getCards() {
  return Array.from(document.querySelectorAll('.card-cardapio'));
}

/* ===========================
   FILTRO PRINCIPAL
=========================== */
function applyFilters() {
  const cards = getCards();

  // Categoria ativa
  const catAtiva = document.querySelector('.cat-item.active')?.dataset.cat || 'todos';

  // Preferências marcadas
  const prefsMarcadas = Array.from(
    document.querySelectorAll('[data-pref]:checked')
  ).map(el => el.dataset.pref);

  // Faixas de preço marcadas
  const precosMarcados = Array.from(
    document.querySelectorAll('[data-price]:checked')
  ).map(el => el.dataset.price);

  // Busca
  const busca = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';

  let visiveis = 0;

  cards.forEach(card => {
    const cat   = card.dataset.cat   || '';
    const prefs = card.dataset.pref  || '';
    const price = parseFloat(card.dataset.price) || 0;
    const name  = (card.dataset.name || '').toLowerCase();
    const desc  = card.querySelector('.card-cardapio-desc')?.textContent.toLowerCase() || '';

    // Categoria
    const passaCat = catAtiva === 'todos' || cat === catAtiva;

    // Preferências (AND: todas as marcadas devem estar presentes)
    const passaPref = prefsMarcadas.length === 0 ||
      prefsMarcadas.every(p => prefs.includes(p));

    // Preço
    let passaPreco = true;
    if (precosMarcados.length > 0) {
      passaPreco = precosMarcados.some(faixa => {
        if (faixa === 'ate30')   return price <= 30;
        if (faixa === '30a40')   return price > 30 && price <= 40;
        if (faixa === 'acima40') return price > 40;
        return false;
      });
    }

    // Busca
    const passaBusca = busca === '' || name.includes(busca) || desc.includes(busca);

    const visivel = passaCat && passaPref && passaPreco && passaBusca;
    card.style.display = visivel ? '' : 'none';
    if (visivel) visiveis++;
  });

  // Atualiza contagem
  const countEl = document.getElementById('produtosCount');
  if (countEl) {
    const label = catAtiva === 'todos' ? 'Todos os produtos' :
      catAtiva.charAt(0).toUpperCase() + catAtiva.slice(1);
    countEl.textContent = `${visiveis} produto${visiveis !== 1 ? 's' : ''} · ${label}`;
  }

  // Mostra/esconde estado vazio
  const vazioEl = document.getElementById('cardapioVazio');
  if (vazioEl) {
    vazioEl.classList.toggle('show', visiveis === 0);
  }
}

/* ===========================
   INIT FILTROS
=========================== */
function initFiltros() {
  // Categorias
  document.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      applyFilters();
    });
  });

  // Checkboxes preferências e preço
  document.querySelectorAll('[data-pref], [data-price]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  // Busca
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Limpar filtros
  document.getElementById('btnLimpar')?.addEventListener('click', () => {
    document.querySelectorAll('[data-pref], [data-price]').forEach(cb => {
      cb.checked = false;
    });
    document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-cat="todos"]')?.classList.add('active');
    if (searchInput) searchInput.value = '';
    applyFilters();
  });
}

/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  initFiltros();
  applyFilters();
});

/* ===========================
   MODAL PRODUTO
=========================== */
function initModal() {
  const overlay   = document.getElementById('modalOverlay');
  const closeBtn  = document.getElementById('modalClose');
  const qtyMinus  = document.getElementById('modalQtyMinus');
  const qtyPlus   = document.getElementById('modalQtyPlus');
  const qtyVal    = document.getElementById('modalQtyVal');
  const btnAdd    = document.getElementById('modalBtnAdd');
  const btnTotal  = document.getElementById('modalBtnTotal');
  let qtdAtual    = 1;
  let precoAtual  = 0;
  // Abre o modal ao clicar em qualquer card
  document.getElementById('cardapioGrid').addEventListener('click', (e) => {
    const btn  = e.target.closest('.btn-ver-produto');
    const card = e.target.closest('.card-cardapio');
    if (!btn || !card) return;
    // Pega os dados do card
    const name        = card.dataset.name        || '';
    const price       = parseFloat(card.dataset.price) || 0;
    const tag         = card.dataset.tag         || '';
    const desc        = card.dataset.desc        || '';
    const badge       = card.dataset.badge       || '';
    const ingredientes = card.dataset.ingredientes || '';
    const img         = card.querySelector('.card-cardapio-img')?.src || '';
    // Preenche o modal
    document.getElementById('modalImg').src      = img;
    document.getElementById('modalImg').alt      = name;
    document.getElementById('modalTag').textContent  = tag;
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalBadge').textContent = badge;
    // Ingredientes
    const listaEl = document.getElementById('modalIngredientes');
    const wrapEl  = document.getElementById('modalIngredientesWrap');
    listaEl.innerHTML = '';
    if (ingredientes) {
      ingredientes.split(',').forEach(ing => {
        const tag = document.createElement('span');
        tag.className   = 'modal-ingrediente-tag';
        tag.textContent = ing.trim();
        listaEl.appendChild(tag);
      });
      wrapEl.style.display = '';
    } else {
      wrapEl.style.display = 'none';
    }
    // Preço e quantidade
    precoAtual = price;
    qtdAtual   = 1;
    qtyVal.textContent = '1';
    document.getElementById('modalPrice').textContent =
      'R$ ' + price.toFixed(2).replace('.', ',');
    btnTotal.textContent = '· R$ ' + price.toFixed(2).replace('.', ',');
    // Guarda dados no botão
    btnAdd.dataset.name  = name;
    btnAdd.dataset.price = price;
    btnAdd.dataset.img   = img;
    btnAdd.classList.remove('added');
    btnAdd.innerHTML = `Adicionar <span class="modal-btn-total" id="modalBtnTotal">· R$ ${price.toFixed(2).replace('.', ',')}</span>`;
    // Abre
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  // Fecha ao clicar no overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModal();
  });
  // Fecha ao clicar no X
  closeBtn.addEventListener('click', fecharModal);
  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
  });
  // Quantidade −
  qtyMinus.addEventListener('click', () => {
    if (qtdAtual <= 1) return;
    qtdAtual--;
    atualizarQty();
  });
  // Quantidade +
  qtyPlus.addEventListener('click', () => {
    if (qtdAtual >= 20) return;
    qtdAtual++;
    atualizarQty();
  });
  function atualizarQty() {
    const total = precoAtual * qtdAtual;
    qtyVal.textContent = qtdAtual;
    const totalStr = 'R$ ' + total.toFixed(2).replace('.', ',');
    const btnTotalEl = document.getElementById('modalBtnTotal');
    if (btnTotalEl) btnTotalEl.textContent = '· ' + totalStr;
  }
  // Adicionar ao carrinho
  btnAdd.addEventListener('click', () => {
    const name  = btnAdd.dataset.name;
    const price = parseFloat(btnAdd.dataset.price);
    const img   = btnAdd.dataset.img;
    // Adiciona a quantidade escolhida
    for (let i = 0; i < qtdAtual; i++) {
      addToCart(name, price, img);
    }
    // Feedback visual
    btnAdd.innerHTML = 'Adicionado ✓';
    btnAdd.classList.add('added');
    setTimeout(() => {
      fecharModal();
    }, 900);
  });
  function fecharModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
/* Adiciona ao DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  initFiltros();
  applyFilters();
  initModal();
});