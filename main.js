/* ===========================
   UTILITÁRIOS
=========================== */
function formatPrice(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ===========================
   TOAST
=========================== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ===========================
   CARRINHO — localStorage
=========================== */
function saveCart(cart) {
  localStorage.setItem('triplox_cart', JSON.stringify(cart));
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('triplox_cart')) || [];
  } catch {
    return [];
  }
}

/* ===========================
   CARRINHO — CONTADOR
=========================== */
function updateCartCount() {
  const cart = loadCart();
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = totalQty;
  });
}

/* ===========================
   CARRINHO — ADICIONAR
=========================== */
function addToCart(name, price, img = '', id = 0) {
  const cart = loadCart();
  const found = cart.find(i => i.name === name);
  if (found) {
    found.qty++;
  } else {
    cart.push({ id, name, price, qty: 1, img }); // ← id aqui!
  }
  saveCart(cart);
  updateCartCount();
  showToast(`${name} adicionado ao carrinho!`);
}


/* ===========================
   BOTÕES "ADICIONAR"
=========================== */
function initAddButtons() {
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.onclick = (e) => {
      const target = e.target.closest('.btn-add');
      if (!target) return;
      const id    = parseInt(target.dataset.id) || 0; // ← novo
      const name  = target.dataset.name;
      const price = parseFloat(target.dataset.price);
      const img   = target.dataset.img || '';
      addToCart(name, price, img, id); // ← passa o id

      const original = target.innerHTML;
      target.textContent = 'Adicionado ✓';
      target.classList.add('added');
      setTimeout(() => {
        target.innerHTML = original;
        target.classList.remove('added');
      }, 1800);
    };
  });
}


/* ===========================
   ÍCONE DO CARRINHO → carrinho.html
=========================== */
function initCartIcon() {
  document.querySelectorAll('#cartBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'carrinho.html';
    });
  });
}

/* ===========================
   FAQ — ACCORDION
=========================== */
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ===========================
   CEP — MÁSCARA E CONSULTA VIACEP
=========================== */
function initCep() {
  const input = document.getElementById('cepInput');
  const btn = document.getElementById('btnCep');
  const result = document.getElementById('cepResult');

  if (!input || !btn || !result) return;

  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
    input.value = v;
    if (v.replace(/\D/g, '').length === 8) buscarCep();
  });

  btn.addEventListener('click', buscarCep);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') buscarCep();
  });

  async function buscarCep() {
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      result.className = 'cep-result err';
      result.textContent = '⚠️ Digite um CEP válido com 8 dígitos.';
      return;
    }

    result.className = 'cep-result';
    result.textContent = 'Buscando...';

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        result.className = 'cep-result err';
        result.textContent = '❌ CEP não encontrado. Verifique e tente novamente.';
        return;
      }

      result.className = 'cep-result ok';
      result.textContent =
        `✅ ${data.logradouro}, ${data.bairro} · ${data.localidade}/${data.uf} — Entregamos aí! Prazo: 35–50 min.`;

    } catch {
      result.className = 'cep-result err';
      result.textContent = '⚠️ Erro ao buscar o CEP. Verifique sua conexão.';
    }
  }
}

/* ===========================
   ENDEREÇO — salvar e carregar
=========================== */
function saveEndereco(dados) {
  localStorage.setItem('triplox_endereco', JSON.stringify(dados));
}

function loadEndereco() {
  try {
    return JSON.parse(localStorage.getItem('triplox_endereco')) || null;
  } catch {
    return null;
  }
}

/* ===========================
   ENDEREÇO — renderiza na barra
=========================== */
function initEnderecoBar() {
  const endBar = document.querySelector('.cardapio-endereco');
  const endInfo = document.querySelector('.endereco-info');
  const btnAlt = document.querySelector('.btn-alterar');

  if (!endBar || !endInfo) return;

  const end = loadEndereco();

  if (end && end.rua) {
    endInfo.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span>Entregar em: <strong>${end.rua}, ${end.numero}${end.bairro ? ' · ' + end.bairro : ''}</strong></span>
      <span class="endereco-sep">|</span>
      <span>35–50 min</span>
      <span class="endereco-sep">|</span>
      <span>Taxa R$ 6,00</span>
    `;
  } else {
    endInfo.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span>Informe seu endereço de entrega</span>
    `;
  }

  if (btnAlt) {
    btnAlt.addEventListener('click', () => {
      window.location.href = 'carrinho.html?etapa=2';
    });
  }
}

/* ===========================
   TEMA CLARO / ESCURO
=========================== */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('triplox_theme');
  if (saved === 'dark') document.body.classList.add('dark');

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('triplox_theme', isDark ? 'dark' : 'light');
  });
}

/* ===========================
   INTEGRAÇÃO COM A API C# / MYSQL
=========================== */
const API_URL = "https://localhost:7259/api/produtos";

const imagensPadrao = {
  "Burgers": "Fotografia gastronômica (2).png",
  "Combos": "Fotografia gastronômica (5).png",
  "Acompanhamentos": "Fotografia gastronômica (3).png",
  "Sobremesas": "Fotografia gastronômica (4).png",
  "Bebidas": "Fotografia gastronômica (1).png"
};

async function carregarProdutosDoBanco() {
  const grid = document.getElementById("produtosGrid");
  if (!grid) return;

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro na requisição da API");

    const produtos = await resposta.json();
    grid.innerHTML = "";

    produtos.slice(0, 3).forEach(produto => {
      const precoFormatado = Number(produto.preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      const imagemSrc = produto.imagem || imagensPadrao[produto.categoria] || "Fotografia gastronômica (2).png";


      grid.innerHTML += `
        <div class="card-produto">
          <img src="${imagemSrc}" alt="${produto.nome}" class="card-img" />
          <div class="card-body">
            <p class="card-tag">${produto.categoria}</p>
            <h3 class="card-name">${produto.nome}</h3>
            <p class="card-desc">Feito na chapa na hora com ingredientes selecionados.</p>
            <div class="card-footer">
              <span class="card-price">${precoFormatado}</span>
              <button class="btn-add"
                 data-id="${produto.id}"
                 data-name="${produto.nome}"
                 data-price="${produto.preco}"
                 data-img="${imagemSrc}">
                 Adicionar +
              </button>
            </div>
          </div>
        </div>
      `;
    });

    initAddButtons();

  } catch (erro) {
    console.error("Erro ao carregar produtos do banco:", erro);
  }
}

/* ===========================
   GERENCIAMENTO DE SESSÃO NA NAVBAR
=========================== */
function carregarSessaoUsuario() {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions) return;

  try {
    const usuario = JSON.parse(localStorage.getItem('triplox_usuario'));

    if (usuario && usuario.logado) {
      const botoesAuth = navActions.querySelectorAll("a[href='login.html'], a[href='cadastro.html']");
      botoesAuth.forEach(el => el.style.display = "none");

      const userDiv = document.createElement("div");
      userDiv.className = "user-session";
      userDiv.style.display = "flex";
      userDiv.style.alignItems = "center";
      userDiv.style.gap = "12px";

      const primeiroNome = usuario.nome.split(" ")[0];

      userDiv.innerHTML = `
        <span style="color: #fff; font-weight: 600;">Olá, ${primeiroNome}!</span>
        <button id="btnSair" class="btn-outline" style="padding: 6px 12px; font-size: 0.85rem;">Sair</button>
      `;

      navActions.insertBefore(userDiv, navActions.firstChild);

      document.getElementById("btnSair")?.addEventListener("click", () => {
        fazerLogout();
      });
    }
  } catch (e) {
    console.error("Erro ao carregar sessão:", e);
  }
}

/* ===========================
   CONFIRMAR PEDIDO — chamada pela carrinho.js
=========================== */
async function confirmarPedidoCompleto() {
  const usuarioString = localStorage.getItem('triplox_usuario');
  if (!usuarioString || usuarioString === 'null') {
    alert("Você precisa estar logado para fazer um pedido!");
    window.location.href = 'login.html';
    return;
  }

  const usuario = JSON.parse(usuarioString);
  const carrinho = loadCart();

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  // Pega endereço salvo
  const endObj = loadEndereco();
  const enderecoFmt = endObj
    ? `${endObj.rua}, ${endObj.numero}${endObj.bairro ? ' - ' + endObj.bairro : ''}`
    : 'Endereço não informado';

  const totalItens = carrinho.reduce((acc, item) => acc + item.qty, 0);
  const totalValor = carrinho.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const dadosEnviar = {
    nomeCliente: usuario.nome,
    emailCliente: usuario.email,
    endereco: enderecoFmt,
    quantidadeTotalProdutos: totalItens,
    valorTotal: totalValor,
    produtos: carrinho.map(item => ({
      produtoId: item.id || 0,
      nomeProduto: item.name,
      quantidade: item.qty,
      precoUnitario: item.price
    }))
  };

  try {
    const resposta = await fetch("https://localhost:7259/api/Pedidos", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosEnviar)
    });

    if (resposta.ok) {
      const resultado = await resposta.json();
      alert('Pedido realizado com sucesso! Id: ' + resultado.idPedido);
      localStorage.removeItem('triplox_cart');
      window.location.href = 'meus-pedidos.html';
    } else {
      const erroMsg = await resposta.text();
      alert('Erro ao salvar o pedido: ' + erroMsg);
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('Não foi possível conectar ao servidor C#.');
  }
}


/* ===========================
   VERIFICAR LOGIN ANTES DE FINALIZAR
   — chamada pelo botão "Confirmar pedido" no carrinho.js
=========================== */
function verificarLoginEFinalizar() {
  const usuarioLogado = localStorage.getItem('triplox_usuario');

  if (!usuarioLogado || usuarioLogado === 'null') {
    alert("Você precisa estar logado para realizar um pedido!");
    window.location.href = 'login.html';
    return;
  }

  confirmarPedidoCompleto();
}

/* ===========================
   LOGOUT
   — chamada pelo botão "Sair" na navbar ou sidebar
=========================== */
function fazerLogout() {
  localStorage.removeItem('triplox_usuario');
  localStorage.removeItem('triplox_cart');
  window.location.href = 'login.html';
}

/* ===========================
   SALVAR LOGIN NO STORAGE
   — chamada pela página de login após autenticação
=========================== */
function salvarLoginNoStorage(dadosUsuario) {
  localStorage.removeItem('triplox_cart');
  localStorage.setItem('triplox_usuario', JSON.stringify(dadosUsuario));
  window.location.href = 'index.html';
}

/* ===========================
   INICIALIZAÇÃO GERAL DA APLICAÇÃO
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initCartIcon();
  initAddButtons();
  initFaq();
  initCep();
  initEnderecoBar();
  initTheme();
  carregarProdutosDoBanco();
  carregarSessaoUsuario();
});