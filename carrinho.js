/* ===========================
   CONSTANTES
=========================== */
const TAXA_ENTREGA = 6.00;
const DESCONTO_CUPOM = 10.00;
let cupomAtivo = false;
let etapaAtual = 1; // 1 = carrinho | 2 = entrega | 3 = pagamento

/* ===========================
   STEPS — atualiza visual
=========================== */
function atualizaSteps(etapa) {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`step${n}`);
    const line = document.getElementById(`line${n}`);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (n < etapa) el.classList.add('done');
    if (n === etapa) el.classList.add('active');
    if (line) {
      line.classList.remove('done');
      if (n < etapa) line.classList.add('done');
    }
  });

  // Hero
  const titles = {
    1: 'SUA FOME TÁ QUASE<br>RESOLVIDA.',
    2: 'ONDE ENTREGAMOS?',
    3: 'COMO VOCÊ VAI PAGAR?'
  };
  const descs = {
    1: 'Confira os itens e siga para a entrega e o pagamento.',
    2: 'Informe o endereço de entrega do seu pedido.',
    3: 'Escolha a forma de pagamento que preferir.'
  };
  const breadcrumbs = {
    1: 'Carrinho / Revise seu pedido',
    2: 'Carrinho / Entrega',
    3: 'Carrinho / Pagamento'
  };

  document.getElementById('heroTitle').innerHTML = titles[etapa];
  document.getElementById('heroDesc').textContent = descs[etapa];
  document.getElementById('heroBreadcrumb').textContent = breadcrumbs[etapa];
}

/* ===========================
   MOSTRA ETAPA
=========================== */
function mostraEtapa(etapa) {
  etapaAtual = etapa;
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`etapa${n}`);
    if (el) el.classList.toggle('etapa-hidden', n !== etapa);
  });
  atualizaSteps(etapa);
  atualizaBtnFinalizar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===========================
   BOTÃO FINALIZAR (resumo)
=========================== */
function atualizaBtnFinalizar() {
  const btn = document.getElementById('btnFinalizar');
  if (!btn) return;
  const labels = {
    1: 'Continuar para entrega →',
    2: 'Continuar para pagamento →',
    3: 'Confirmar pedido ✓'
  };
  btn.textContent = labels[etapaAtual];
}

/* ===========================
   RENDERIZA ITENS
=========================== */
function renderItens() {
  const cart = loadCart();
  const container = document.getElementById('carrinhoItens');
  const countEl = document.getElementById('carrinhoCount');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="carrinho-vazio">
        <span>🛒</span>
        <p>Seu carrinho está vazio.</p>
        <a href="cardapio.html" class="btn-add-mais" style="margin-top:12px">Ver cardápio →</a>
      </div>`;
    if (countEl) countEl.textContent = '0 itens no seu carrinho';
    atualizaTotais();
    return;
  }

  const totalItens = cart.reduce((acc, i) => acc + i.qty, 0);
  if (countEl) countEl.textContent =
    `${totalItens} ite${totalItens !== 1 ? 'ns' : 'm'} no seu carrinho`;

  container.innerHTML = cart.map(item => `
    <div class="carrinho-item" data-name="${item.name}" data-price="${item.price}">
      ${item.img
      ? `<img src="${item.img}" alt="${item.name}" class="carrinho-item-img"/>`
      : `<div class="carrinho-item-img carrinho-item-img--placeholder"></div>`}
      <div class="carrinho-item-info">
        <h3 class="carrinho-item-name">${item.name}</h3>
        <p class="carrinho-item-unit">R$ ${item.price.toFixed(2).replace('.', ',')} / unidade</p>
      </div>
      <div class="carrinho-item-right">
        <p class="carrinho-item-total">
          R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}
        </p>
        <div class="qty-control">
          <button class="qty-btn qty-minus" data-name="${item.name}">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn qty-plus" data-name="${item.name}">+</button>
        </div>
        <button class="carrinho-item-remove" data-name="${item.name}">Remover</button>
      </div>
    </div>
  `).join('');

  bindItemEvents();
  atualizaTotais();
}

/* ===========================
   BIND EVENTOS DOS ITENS
=========================== */
function bindItemEvents() {
  document.querySelectorAll('.qty-plus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.name, 1)));

  document.querySelectorAll('.qty-minus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(btn.dataset.name, -1)));

  document.querySelectorAll('.carrinho-item-remove').forEach(btn =>
    btn.addEventListener('click', () => removeItem(btn.dataset.name)));
}

/* ===========================
   ALTERAR QUANTIDADE
=========================== */
function changeQty(name, delta) {
  const cart = loadCart();
  const found = cart.find(i => i.name === name);
  if (!found) return;
  found.qty += delta;
  if (found.qty <= 0) { removeItem(name); return; }
  saveCart(cart);
  updateCartCount();
  renderItens();
}

/* ===========================
   REMOVER ITEM
=========================== */
function removeItem(name) {
  let cart = loadCart().filter(i => i.name !== name);
  saveCart(cart);
  updateCartCount();
  renderItens();
}

/* ===========================
   ATUALIZA TOTAIS
=========================== */
function atualizaTotais() {
  const cart = loadCart();
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const desconto = cupomAtivo ? DESCONTO_CUPOM : 0;

  // Taxa: 0 se retirada
  const tipoRetirada = document.querySelector('input[name="tipoEntrega"]:checked');
  const taxa = (tipoRetirada && tipoRetirada.value === 'retirada') ? 0 : TAXA_ENTREGA;
  const total = subtotal + taxa - desconto;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('resumoSubtotal', `R$ ${subtotal.toFixed(2).replace('.', ',')}`);
  set('resumoTaxaEntrega', taxa === 0 ? 'Grátis' : `R$ ${taxa.toFixed(2).replace('.', ',')}`);
  set('resumoDesconto', cupomAtivo ? `− R$ ${desconto.toFixed(2).replace('.', ',')}` : '−');
  set('resumoTotal', `R$ ${total.toFixed(2).replace('.', ',')}`);
}

/* ===========================
   CUPOM
=========================== */
function initCupom() {
  const btn = document.getElementById('btnCupom');
  const input = document.getElementById('cupomInput');
  const ok = document.getElementById('cupomOk');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const val = input.value.trim().toUpperCase();
    if (val === 'PRIMEIROX') {
      cupomAtivo = true;
      ok.textContent = '✓ Cupom aplicado · R$ 10,00 de desconto';
      ok.style.color = '#16a34a';
    } else {
      cupomAtivo = false;
      ok.textContent = '✗ Cupom inválido.';
      ok.style.color = '#dc2626';
    }
    atualizaTotais();
  });
}

/* ===========================
   OBSERVAÇÃO
=========================== */
function initObs() {
  const obs = document.getElementById('obsInput');
  const count = document.getElementById('obsCount');
  if (!obs || !count) return;
  obs.addEventListener('input', () => { count.textContent = obs.value.length; });
}

/* ===========================
   CEP
=========================== */
function initCepEntrega() {
  const input = document.getElementById('cepInput');
  const btn = document.getElementById('btnBuscarCep');
  const hint = document.getElementById('cepHint');
  if (!input || !btn) return;

  const endSalvo = loadEndereco();
  if (endSalvo && endSalvo.rua) {
    document.getElementById('ruaInput').value = endSalvo.rua || '';
    document.getElementById('numInput').value = endSalvo.numero || '';
    document.getElementById('compInput').value = endSalvo.complemento || '';
    document.getElementById('bairroInput').value = endSalvo.bairro || '';
    document.getElementById('cidadeInput').value = endSalvo.cidade || '';
    document.getElementById('ufInput').value = endSalvo.uf || '';
    if (hint) {
      hint.textContent = '✓ Endereço carregado do seu último pedido.';
      hint.style.color = '#16a34a';
    }
  }

  // Máscara
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
    input.value = v;
  });

  btn.addEventListener('click', async () => {
    const cep = input.value.replace(/\D/g, '');
    if (cep.length !== 8) { hint.textContent = 'CEP inválido.'; hint.style.color = '#dc2626'; return; }
    hint.textContent = 'Buscando...';
    hint.style.color = '#888';
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { hint.textContent = 'CEP não encontrado.'; hint.style.color = '#dc2626'; return; }
      document.getElementById('ruaInput').value = data.logradouro || '';
      document.getElementById('bairroInput').value = data.bairro || '';
      document.getElementById('cidadeInput').value = data.localidade || '';
      document.getElementById('ufInput').value = data.uf || '';
      hint.textContent = '✓ Endereço encontrado!';
      hint.style.color = '#16a34a';
      document.getElementById('numInput').focus();
    } catch {
      hint.textContent = 'Erro ao buscar CEP.';
      hint.style.color = '#dc2626';
    }
  });
}

/* ===========================
   TIPO DE ENTREGA
=========================== */
function initTipoEntrega() {
  document.querySelectorAll('input[name="tipoEntrega"]').forEach(radio => {
    radio.addEventListener('change', () => {
      // Destaca card selecionado
      document.querySelectorAll('.entrega-tipo-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.entrega-tipo-card').classList.add('selected');
      atualizaTotais();
    });
  });
  // Marca o padrão
  const checked = document.querySelector('input[name="tipoEntrega"]:checked');
  if (checked) checked.closest('.entrega-tipo-card').classList.add('selected');
}

/* ===========================
   PAGAMENTO — lógica dos cards
=========================== */
function initPagamento() {
  document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
    radio.addEventListener('change', () => {
      // Destaca card
      document.querySelectorAll('.pgto-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.pgto-card').classList.add('selected');

      const val = radio.value;

      // Troco
      const troco = document.getElementById('pgtoTroco');
      if (troco) troco.classList.toggle('pgto-show', val === 'dinheiro');

      // Dados do cartão
      const cartao = document.getElementById('pgtoCartao');
      if (cartao) {
        const isOnline = val === 'debito-online' || val === 'credito-online';
        cartao.classList.toggle('pgto-show', isOnline);
        // Parcelas só no crédito
        const parcelasWrap = document.getElementById('parcelasWrap');
        if (parcelasWrap) parcelasWrap.style.display = val === 'credito-online' ? '' : 'none';
      }
    });
  });
}

/* ===========================
   VALIDAÇÃO ENTREGA
=========================== */
function validaEntrega() {
  const rua = document.getElementById('ruaInput')?.value.trim();
  const num = document.getElementById('numInput')?.value.trim();
  const bairro = document.getElementById('bairroInput')?.value.trim();
  const cidade = document.getElementById('cidadeInput')?.value.trim();
  const cep = document.getElementById('cepInput')?.value.trim();

  const tipo = document.querySelector('input[name="tipoEntrega"]:checked')?.value;
  if (tipo === 'retirada') return true; // retirada não precisa de endereço

  if (!cep || !rua || !num || !bairro || !cidade) {
    alert('Preencha todos os campos de endereço antes de continuar.');
    return false;
  }
  return true;
}

/* ===========================
   ATUALIZA RESUMO ENDEREÇO
=========================== */
function atualizaResumoEndereco() {
  const rua = document.getElementById('ruaInput')?.value.trim();
  const num = document.getElementById('numInput')?.value.trim();
  const comp = document.getElementById('compInput')?.value.trim();
  const bairro = document.getElementById('bairroInput')?.value.trim();
  const cidade = document.getElementById('cidadeInput')?.value.trim();
  const uf = document.getElementById('ufInput')?.value.trim();
  const tipo = document.querySelector('input[name="tipoEntrega"]:checked')?.value;

  const el = document.getElementById('resumoEnderecoTexto');
  if (!el) return;

  if (tipo === 'retirada') {
    el.innerHTML = 'Retirada no local<br>Rua dos Pinheiros, 870 · Pinheiros';
  } else if (rua) {
    el.innerHTML = `${rua}, ${num}${comp ? ' · ' + comp : ''}<br>${bairro} · ${cidade}, ${uf}`;
    saveEndereco({ tipo: 'entrega', rua, numero: num, complemento: comp, bairro, cidade, uf });
  }
}

/* ===========================
   NAVEGAÇÃO ENTRE ETAPAS
=========================== */
function initNavegacao() {
  // Botão do resumo (direita)
  document.getElementById('btnFinalizar')?.addEventListener('click', () => {
    if (etapaAtual === 1) {
      const cart = loadCart();
      if (cart.length === 0) { alert('Adicione itens ao carrinho antes de continuar.'); return; }
      mostraEtapa(2);
    } else if (etapaAtual === 2) {
      if (!validaEntrega()) return;
      atualizaResumoEndereco();
      atualizaTotais();
      mostraEtapa(3);
    } else if (etapaAtual === 3) {
      confirmarPedido();
    }
  });

  // Voltar: carrinho ← entrega
  document.getElementById('btnVoltarEntrega')?.addEventListener('click', () => mostraEtapa(1));

  // Avançar: entrega → pagamento
  document.getElementById('btnAvancarPagamento')?.addEventListener('click', () => {
    if (!validaEntrega()) return;
    atualizaResumoEndereco();
    atualizaTotais();
    mostraEtapa(3);
  });

  // Voltar: entrega ← pagamento
  document.getElementById('btnVoltarPagamento')?.addEventListener('click', () => mostraEtapa(2));

  // Confirmar pedido (botão dentro da etapa 3)
  document.getElementById('btnConfirmarPedido').addEventListener('click', () => {
    verificarLoginEFinalizar();
  });

  // Alterar endereço no resumo
  document.getElementById('resumoAlterarEnd')?.addEventListener('click', () => mostraEtapa(2));
}

/* ===========================
   CONFIRMAR PEDIDO
=========================== */
function confirmarPedido() {
  const pgto = document.querySelector('input[name="pagamento"]:checked');
  if (!pgto) { alert('Selecione uma forma de pagamento.'); return; }

  const cart     = loadCart();
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const desconto = cupomAtivo ? DESCONTO_CUPOM : 0;
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked');
  const taxa     = (tipoEntrega && tipoEntrega.value === 'retirada') ? 0 : TAXA_ENTREGA;
  const total    = subtotal + taxa - desconto;

  // Monta endereço
  const tipo = tipoEntrega?.value;
  let enderecoTexto = '';
  if (tipo === 'retirada') {
    enderecoTexto = 'Retirada no local · Rua dos Pinheiros, 870 · Pinheiros';
  } else {
    const rua  = document.getElementById('ruaInput')?.value.trim();
    const num  = document.getElementById('numInput')?.value.trim();
    const comp = document.getElementById('compInput')?.value.trim();
    const bairro = document.getElementById('bairroInput')?.value.trim();
    const cidade = document.getElementById('cidadeInput')?.value.trim();
    const uf   = document.getElementById('ufInput')?.value.trim();
    enderecoTexto = `${rua}, ${num}${comp ? ' · ' + comp : ''} · ${bairro} · ${cidade}, ${uf}`;
  }

  // Monta objeto do pedido
  const pedido = {
    id:        'MX-' + Date.now(),
    data:      new Date().toISOString(),
    status:    'andamento',
    itens:     cart,
    subtotal,
    desconto,
    entrega:   taxa,
    total,
    pagamento: pgto.value,
    endereco:  enderecoTexto,
  };

  // Salva no histórico
  const pedidos = JSON.parse(localStorage.getItem('triplox_pedidos') || '[]');
  pedidos.unshift(pedido);
  localStorage.setItem('triplox_pedidos', JSON.stringify(pedidos));

  // Limpa carrinho e redireciona
  saveCart([]);
  updateCartCount();
  window.location.href = 'meus-pedidos.html';
}


/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  renderItens();
  initCupom();
  initObs();
  initCepEntrega();
  initTipoEntrega();
  initPagamento();
  initNavegacao();
  const params = new URLSearchParams(window.location.search);
  const etapaParam = parseInt(params.get('etapa'));
  if (etapaParam === 2 || etapaParam === 3) {
    mostraEtapa(etapaParam);
  } else {
    mostraEtapa(1);
  }
});

