/* ===========================
   LOAD / SAVE USUÁRIO
=========================== */
function loadUsuario() {
    try {
        return JSON.parse(localStorage.getItem('triplox_usuario')) || null;
    } catch { return null; }
}

function saveUsuario(usuario) {
    localStorage.setItem('triplox_usuario', JSON.stringify(usuario));
}

/* ===========================
   MÁSCARAS
=========================== */
function mascaraTel(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) {
            v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (v.length > 6) {
            v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        } else {
            v = v.replace(/^(\d*)$/, '($1');
        }
        input.value = v;
    });
}

function mascaraData(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 4) {
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4})$/, '$1/$2/$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,2})$/, '$1/$2');
        }
        input.value = v;
    });
}

/* ===========================
   PREENCHE SIDEBAR E CARD
=========================== */
function preencheUsuarioNaTela(usuario) {
    const iniciais = usuario.nome.trim().split(' ')
        .filter(p => p.length > 0)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('');

    const primeiro = usuario.nome.trim().split(' ')[0].toUpperCase();

    // Sidebar
    const avatarSide = document.getElementById('perfilAvatar');
    if (avatarSide) avatarSide.textContent = iniciais;

    const nomeSide = document.getElementById('perfilNome');
    if (nomeSide) nomeSide.textContent = usuario.nome.toUpperCase();

    const desdeSide = document.getElementById('perfilDesde');
    if (desdeSide && usuario.desde) {
        const data = new Date(usuario.desde);
        const mes = data.toLocaleString('pt-BR', { month: 'long' });
        const ano = data.getFullYear();
        desdeSide.textContent = `De casa desde ${mes} de ${ano}`;
    }

    // Card usuário (topo do conteúdo)
    const avatarCard = document.getElementById('perfilAvatarCard');
    if (avatarCard) avatarCard.textContent = iniciais;

    const nomeCard = document.getElementById('perfilNomeCard');
    if (nomeCard) nomeCard.textContent = usuario.nome.toUpperCase();

    const desdeCard = document.getElementById('perfilDesdeCard');
    if (desdeCard && usuario.desde) {
        const data = new Date(usuario.desde);
        const mes = data.toLocaleString('pt-BR', { month: 'long' });
        const ano = data.getFullYear();
        desdeCard.textContent = `De casa desde ${mes} de ${ano}`;
    }

    // Formulário
    const inputNome = document.getElementById('inputNome');
    const inputEmail = document.getElementById('inputEmail');
    const inputTel = document.getElementById('inputTel');
    const inputNasc = document.getElementById('inputNasc');

    if (inputNome) inputNome.value = usuario.nome || '';
    if (inputEmail) inputEmail.value = usuario.email || '';
    if (inputTel) inputTel.value = usuario.tel || '';
    if (inputNasc) inputNasc.value = usuario.nasc || '';
}

/* ===========================
   INIT PERFIL USUÁRIO
=========================== */
function initPerfilUsuario() {
    const usuario = loadUsuario();

    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    preencheUsuarioNaTela(usuario);

    // Aplica máscaras
    const inputTel = document.getElementById('inputTel');
    const inputNasc = document.getElementById('inputNasc');
    if (inputTel) mascaraTel(inputTel);
    if (inputNasc) mascaraData(inputNasc);
}

/* ===========================
   SALVAR DADOS
=========================== */
function initSalvarDados() {
    const btn = document.getElementById('btnSalvarDados');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const usuario = loadUsuario() || {};

        const nome = document.getElementById('inputNome')?.value.trim();
        const email = document.getElementById('inputEmail')?.value.trim();
        const tel = document.getElementById('inputTel')?.value.trim();
        const nasc = document.getElementById('inputNasc')?.value.trim();

        // Validações básicas
        if (!nome) { alert('Informe seu nome completo.'); return; }
        if (!email || !email.includes('@')) { alert('Informe um e-mail válido.'); return; }

        // Atualiza objeto
        usuario.nome = nome;
        usuario.email = email;
        usuario.tel = tel;
        usuario.nasc = nasc;

        saveUsuario(usuario);
        preencheUsuarioNaTela(usuario); // atualiza sidebar e card em tempo real

        // Toast
        if (typeof showToast === 'function') {
            showToast('Alterações salvas com sucesso!');
        } else {
            const toast = document.getElementById('toast');
            const msg = document.getElementById('toastMsg');
            if (toast && msg) {
                msg.textContent = 'Alterações salvas!';
                toast.classList.add('toast-show');
                setTimeout(() => toast.classList.remove('toast-show'), 3000);
            }
        }
    });
}

/* ===========================
   SAIR DA CONTA
=========================== */
function initSairConta() {
    document.querySelector('.perfil-sair')?.addEventListener('click', () => {
        localStorage.removeItem('triplox_usuario');
        window.location.href = 'index.html';
    });
}

/* ===========================
   SCROLL PARA ÂNCORA
=========================== */
function initScrollAncora() {
    const hash = window.location.hash;
    if (hash) {
        setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

/* ===========================
   LOAD / SAVE ENDEREÇO
=========================== */
function loadEndereco() {
    try {
        return JSON.parse(localStorage.getItem('triplox_endereco')) || null;
    } catch { return null; }
}

function saveEndereco(end) {
    localStorage.setItem('triplox_endereco', JSON.stringify(end));
}

/* ===========================
   ATUALIZA CARD DE ENDEREÇO NA TELA
=========================== */
function atualizaCardEndereco() {
    const end = loadEndereco();
    const ruaEl = document.getElementById('enderecoRua');
    const cidadeEl = document.getElementById('enderecoCidade');

    if (!end || !end.rua) return;

    if (ruaEl) {
        ruaEl.textContent = `${end.rua}, ${end.numero}${end.complemento ? ' · ' + end.complemento : ''}`;
    }
    if (cidadeEl) {
        cidadeEl.textContent = `${end.bairro} · ${end.cidade}, ${end.uf}${end.cep ? ' · CEP ' + end.cep : ''}`;
    }

    // Atualiza apelido/tag se existir
    const tagCasa = document.querySelector('.tag-casa');
    if (tagCasa && end.apelido) tagCasa.textContent = end.apelido;
}

/* ===========================
   MODAL ENDEREÇO
=========================== */
function initModalEndereco() {
    const overlay = document.getElementById('modalEnderecoOverlay');
    const titulo = document.getElementById('modalEnderecoTitulo');
    const btnFechar = document.getElementById('modalEnderecoFechar');
    const btnCancelar = document.getElementById('btnCancelarModal');
    const btnSalvar = document.getElementById('btnSalvarEndereco');
    const btnEditar = document.querySelector('.btn-editar-end');
    const btnNovo = document.querySelector('.btn-novo-endereco');

    if (!overlay) return;

    // Abre modal — Editar
    btnEditar?.addEventListener('click', () => {
        titulo.textContent = 'EDITAR ENDEREÇO';
        preencheModalComEndereco(loadEndereco());
        abreModal();
    });

    // Abre modal — Novo
    btnNovo?.addEventListener('click', () => {
        titulo.textContent = 'NOVO ENDEREÇO';
        limpaModal();
        abreModal();
    });

    // Fecha modal
    btnFechar?.addEventListener('click', fechaModal);
    btnCancelar?.addEventListener('click', fechaModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fechaModal();
    });

    // Busca CEP
    const inputCep = document.getElementById('endCep');
    const btnCep = document.getElementById('btnBuscarCepModal');
    const hint = document.getElementById('cepHintModal');

    // Máscara CEP
    inputCep?.addEventListener('input', () => {
        let v = inputCep.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        inputCep.value = v;
    });

    btnCep?.addEventListener('click', async () => {
        const cep = inputCep.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            hint.textContent = 'CEP inválido.';
            hint.style.color = '#dc2626';
            return;
        }
        hint.textContent = 'Buscando...';
        hint.style.color = '#888';
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) {
                hint.textContent = 'CEP não encontrado.';
                hint.style.color = '#dc2626';
                return;
            }
            document.getElementById('endRua').value = data.logradouro || '';
            document.getElementById('endBairro').value = data.bairro || '';
            document.getElementById('endCidade').value = data.localidade || '';
            document.getElementById('endUf').value = data.uf || '';
            hint.textContent = '✓ Endereço encontrado!';
            hint.style.color = '#16a34a';
            document.getElementById('endNum').focus();
        } catch {
            hint.textContent = 'Erro ao buscar CEP.';
            hint.style.color = '#dc2626';
        }
    });

    // Salvar endereço
    btnSalvar?.addEventListener('click', () => {
        const rua = document.getElementById('endRua')?.value.trim();
        const num = document.getElementById('endNum')?.value.trim();
        const comp = document.getElementById('endComp')?.value.trim();
        const bairro = document.getElementById('endBairro')?.value.trim();
        const cidade = document.getElementById('endCidade')?.value.trim();
        const uf = document.getElementById('endUf')?.value.trim();
        const cep = document.getElementById('endCep')?.value.trim();
        const apelido = document.getElementById('endApelido')?.value.trim() || 'Casa';

        if (!rua || !num || !bairro || !cidade || !uf) {
            const hint = document.getElementById('cepHintModal');
            hint.textContent = '⚠️ Preencha todos os campos obrigatórios.';
            hint.style.color = '#dc2626';
            return;
        }

        const end = { rua, numero: num, complemento: comp, bairro, cidade, uf, cep, apelido };
        saveEndereco(end);
        atualizaCardEndereco();
        fechaModal();
        showToastPerfil('✅ Endereço salvo com sucesso!');
    });

    // Carrega endereço salvo ao abrir a página
    atualizaCardEndereco();
}

function abreModal() {
    document.getElementById('modalEnderecoOverlay').classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function fechaModal() {
    document.getElementById('modalEnderecoOverlay').classList.remove('modal-open');
    document.body.style.overflow = '';
}

function limpaModal() {
    ['endCep', 'endRua', 'endNum', 'endComp', 'endBairro', 'endCidade', 'endUf', 'endApelido'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const hint = document.getElementById('cepHintModal');
    if (hint) { hint.textContent = ''; }
}

function preencheModalComEndereco(end) {
    limpaModal();
    if (!end) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('endCep', end.cep);
    set('endRua', end.rua);
    set('endNum', end.numero);
    set('endComp', end.complemento);
    set('endBairro', end.bairro);
    set('endCidade', end.cidade);
    set('endUf', end.uf);
    set('endApelido', end.apelido);
}


/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    initPerfilUsuario();
    initSalvarDados();
    initSairConta();
    initScrollAncora();
    initModalEndereco();
});
