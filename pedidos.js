/* ===========================
   NOME DO USUÁRIO
=========================== */
function initNomeUsuario() {
  const el = document.getElementById('sidebarGreeting');
  if (!el) return;
  const usuario = JSON.parse(localStorage.getItem('triplox_usuario') || 'null');
  if (usuario && usuario.nome) {
    const primeiro = usuario.nome.trim().split(' ')[0].toUpperCase();
    el.textContent = `OI, ${primeiro}.`;
  } else {
    el.textContent = 'OI, VISITANTE.';
  }
}

/* ===========================
   PEDIDOS — carrega do localStorage
=========================== */
async function initPedidos() {
  const content = document.querySelector('.pedidos-content');
  if (!content) return;

  const usuario = JSON.parse(localStorage.getItem('triplox_usuario') || 'null');
  if (!usuario || !usuario.email) {
    content.innerHTML = `<div class="pedidos-vazio"><p>Faça login para ver seus pedidos.</p></div>`;
    return;
  }

  const imagensPadrao = {
    "Burgers":         "Fotografia gastronômica (2).png",
    "Combos":          "Fotografia gastronômica (5).png",
    "Acompanhamentos": "Fotografia gastronômica (3).png",
    "Sobremesas":      "Fotografia gastronômica (4).png",
    "Bebidas":         "Fotografia gastronômica (1).png"
  };

  try {
    const emailEncoded = encodeURIComponent(usuario.email);
    const resposta = await fetch(`https://localhost:7259/api/Pedidos/${emailEncoded}`);
    const pedidos = await resposta.json();

    if (pedidos.length === 0) {
      content.innerHTML = `
        <div class="pedidos-vazio">
          <span>🍔</span>
          <p>Você ainda não fez nenhum pedido.</p>
          <a href="cardapio.html" class="btn-add-mais" style="margin-top:12px">Ver cardápio →</a>
        </div>`;
      return;
    }

    const badgeMap = {
      andamento: `<span class="pedido-badge pedido-badge--preparo">Em preparo</span>`,
      entregue:  `<span class="pedido-badge pedido-badge--entregue">Entregue</span>`,
      cancelado: `<span class="pedido-badge pedido-badge--cancelado">Cancelado</span>`,
    };

    let html = '';

    pedidos.forEach(pedido => {
      const dataFmt = new Date(pedido.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
      const horaFmt = new Date(pedido.data).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
      const badge   = badgeMap[pedido.status] || badgeMap['andamento'];

      const itensHtml = pedido.itens.map(item => {
        const imagensPorNome = {
          "Sprite":               "sprite.png",
          "Fanta Uva":            "fanta-uva.png",
          "Coca Cola":            "coca.png",
          "Coca Cola Zero":       "coca0.png",
          "Batata da Casa":       "Fotografia gastronômica (9).png",
          "COM-BOM":              "combo.png",
          "Combo Duplo":          "Fotografia gastronômica (5).png",
          "Triplo X":             "Fotografia gastronômica (2).png",
          "Duplo Smash":          "Fotografia gastronômica (4).png",
          "Triplo Smash Cheddar": "cheddar.png",
          "Bacon na Brasa":       "Fotografia gastronômica (7).png",
          "X da Horta (Vegetariano)": "Fotografia gastronômica (8).png",
          "X Oreo":               "x-oreo.png",
          "X Plosion":            "x-plo.png",
          "X de Cebola":          "x-acom.png",
        };
        
        const img = item.imagem || imagensPorNome[item.nomeProduto] || "Fotografia gastronômica (2).png";
        
        const subtotal = (item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',');
        return `
          <li class="pedido-item-linha">
            <img src="${img}" alt="${item.nomeProduto}" class="pedido-item-img" />
            <div class="pedido-item-info">
              <span class="pedido-item-nome">${item.quantidade}× ${item.nomeProduto}</span>
              <span class="pedido-item-preco">R$ ${subtotal}</span>
            </div>
          </li>`;
      }).join('');

      html += `
        <div class="pedido-card">
          <div class="pedido-card-header">
            <div>
              <h2 class="pedido-num">#${pedido.id}</h2>
              <p class="pedido-data">${dataFmt} · ${horaFmt}</p>
            </div>
            ${badge}
          </div>

          <ul class="pedido-itens-list">${itensHtml}</ul>

          <div class="pedido-rodape">
            <div class="pedido-endereco-bloco">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${pedido.endereco || 'Endereço não informado'}</span>
            </div>
            <p class="pedido-total-pago">
              Total: <strong>R$ ${Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</strong>
            </p>
          </div>
        </div>`;
    });

    content.innerHTML = html;

  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="pedidos-vazio"><p>Erro ao carregar pedidos.</p></div>`;
  }
}



/* ===========================
   TABS
=========================== */
function initTabs() {
  const tabs = document.querySelectorAll('.pedidos-tab');
  if (!tabs.length) return;

  function aplicaTab(tabAtiva) {
    document.querySelectorAll('[data-tab-content]').forEach(el => {
      const permitidos = el.dataset.tabContent.split(' ');
      el.style.display = permitidos.includes(tabAtiva) ? '' : 'none';
    });
    atualizaVazio(tabAtiva);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      aplicaTab(tab.dataset.tab);
    });
  });

  // Dispara aba inicial
  const inicial = document.querySelector('.pedidos-tab.active');
  if (inicial) aplicaTab(inicial.dataset.tab);
}

/* ===========================
   ESTADO VAZIO POR ABA
=========================== */
function atualizaVazio(tabAtiva) {
  const content = document.querySelector('.pedidos-content');
  if (!content) return;

  const visiveis = Array.from(
    content.querySelectorAll('.pedido-card, .pedido-row')
  ).filter(el => el.style.display !== 'none');

  const avisoExistente = content.querySelector('.pedidos-vazio-tab');
  if (avisoExistente) avisoExistente.remove();

  if (visiveis.length === 0) {
    const vazio = document.createElement('div');
    vazio.className = 'pedidos-vazio pedidos-vazio-tab';
    vazio.innerHTML = `
      <span>🍔</span>
      <p>Nenhum pedido ${tabAtiva === 'andamento' ? 'em andamento' : 'finalizado'} por aqui.</p>
      <a href="cardapio.html" class="btn-add-mais" style="margin-top:12px">
        Ver cardápio →
      </a>`;
    content.appendChild(vazio);
  }
}

/* ===========================
   SIDEBAR — navegação das abas
   Meus dados / Endereços / Segurança
   → redireciona para perfil.html#ancora
=========================== */
function initSidebarNav() {
  const mapa = {
    'Meus dados': 'perfil.html#meus-dados',
    'Endereços': 'perfil.html#enderecos',
    'Segurança': 'perfil.html#seguranca',
  };

  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    const texto = item.textContent.trim();
    if (mapa[texto]) {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = mapa[texto];
      });
    }
  });

  // Sair da conta
  document.querySelector('.sidebar-sair').addEventListener('click', () => {
    fazerLogout();
  });
}
/* ===========================
   TRACKER — animação
=========================== */
function initTracker() {
  const steps = document.querySelectorAll('.tracker-step');
  steps.forEach((step, i) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(8px)';
    step.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => {
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
    }, i * 120);
  });
}

/* ===========================
   PEDIR NOVAMENTE
=========================== */
function initPedirNovamente() {
  document.querySelectorAll('.btn-add-hist').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (typeof addToCart === 'function') {
        addToCart(name, price);
      }
    });
  });
}

/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  initNomeUsuario();
  initPedidos();
  initTabs();
  initSidebarNav();
  initTracker();
  initPedirNovamente();
});

/* ===========================
   JSON
=========================== */

async function confirmarPedido() {
  const usuarioString = localStorage.getItem('triplox_usuario');
  if (!usuarioString || usuarioString === 'null') {
    alert("Você precia estar logado para fazer um pedido!");
    window.location.href = 'login.html';
    return;
  }

  const usuario = JSON.parse(usuarioString);
  const clienteNome = usuarioString

  let carrinho = JSON.parse(localStorage.getItem('triplox_cart')) || [];

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  const dadosEnviar = {
    nomeCliente: clienteNome,
    produtos: carrinho.map(item => ({
      produtoId: item,
      nomeProduto: item.name,
      precoUnit: item.preco
    }))
  };

  try {

    const enviar = await fetch("https://localhost:7259/api/pedidos", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosEnviar)
    });

    if (resposta.ok) {
      const resultado = await resposta.json();
      alert('Pedido realizado com sucesso! Id:' + resultado.idPedido);

      localStorage.removeItem('triplox_cart');

      window.location.href = 'meus-pedido.html';
    } else {
      const erroMsg = await resposta.text();
      alert('Erro ao salvar o pedido:' + erroMsg);
    }
  } catch(error){
    console.error('Erro de conexão:', error);
    alert('Não foi possível conectar ao servidor C#.');
  }

}