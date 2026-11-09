/* ===========================
   CONFIGURAÇÃO DA API C#
=========================== */
const API_CLIENTES_URL = "https://localhost:7259/api/clientes";
const API_LOGIN_URL    = "https://localhost:7259/api/clientes/login";

/* ===========================
   UTILITÁRIOS
=========================== */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

function maskPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    v = v.replace(/^(\d*)/, '($1');
  }
  input.value = v;
}

function maskDate(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 4) {
    v = v.slice(0,2) + '/' + v.slice(2,4) + '/' + v.slice(4,8);
  } else if (v.length > 2) {
    v = v.slice(0,2) + '/' + v.slice(2,4);
  }
  input.value = v;
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) el.textContent = msg;
}

/* ===========================
   STORAGE
=========================== */
function saveUsuario(dados) {
  localStorage.setItem('triplox_usuario', JSON.stringify(dados));
}

function loadUsuario() {
  try {
    return JSON.parse(localStorage.getItem('triplox_usuario')) || null;
  } catch {
    return null;
  }
}

/* ===========================
   LOGIN (INTEGRADO À API)
=========================== */
function initLogin() {
  const form      = document.getElementById('loginForm');
  const toggleBtn = document.getElementById('toggleLoginPwd');

  if (!form) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      togglePassword('loginPwd', toggleBtn);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const pwd   = document.getElementById('loginPwd').value;

    if (!email || !pwd) {
      alert('Preencha e-mail e senha!');
      return;
    }

    try {
      // Faz a consulta real no MySQL via API C#
      const resposta = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: pwd })
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        // Salva os dados devolvidos pelo banco de dados MySQL no localStorage
        saveUsuario({
          nome: resultado.usuario.nome,
          email: resultado.usuario.email,
          tel: resultado.usuario.telefone,
          logado: true,
          desde: new Date().toISOString()
        });

        // Redireciona para a tela inicial já com o usuário autenticado
        window.location.href = 'index.html';
      } else {
        alert(`⚠️ ${resultado.mensagem || 'E-mail ou senha incorretos.'}`);
      }
    } catch (erro) {
      console.error('Erro de conexão com a API:', erro);
      alert('⚠️ Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    }
  });

  document.getElementById('btnGoogle')?.addEventListener('click', () => {
    const usuario = loadUsuario();
    if (!usuario) {
      saveUsuario({
        nome: 'Usuário Google',
        email: 'usuario@gmail.com',
        logado: true,
        desde: new Date().toISOString()
      });
    } else {
      usuario.logado = true;
      saveUsuario(usuario);
    }
    window.location.href = 'index.html';
  });
}

/* ===========================
   CADASTRO (INTEGRADO À API)
=========================== */
function initCadastro() {
  const form       = document.getElementById('cadastroForm');
  const togglePwd  = document.getElementById('toggleCadPwd');
  const togglePwdC = document.getElementById('toggleCadPwdConf');
  const telInput   = document.getElementById('cadTel');
  const nascInput  = document.getElementById('cadNasc');

  if (!form) return;

  if (togglePwd) {
    togglePwd.addEventListener('click', () => {
      togglePassword('cadPwd', togglePwd);
    });
  }
  if (togglePwdC) {
    togglePwdC.addEventListener('click', () => {
      togglePassword('cadPwdConf', togglePwdC);
    });
  }

  if (telInput)  telInput.addEventListener('input',  () => maskPhone(telInput));
  if (nascInput) nascInput.addEventListener('input', () => maskDate(nascInput));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('cadError', '');

    const nome    = document.getElementById('cadNome').value.trim();
    const email   = document.getElementById('cadEmail').value.trim();
    const tel     = document.getElementById('cadTel')?.value.trim()  || '';
    const nasc    = document.getElementById('cadNasc')?.value.trim() || '';
    const pwd     = document.getElementById('cadPwd').value;
    const pwdConf = document.getElementById('cadPwdConf').value;
    const termos  = document.getElementById('aceitaTermos').checked;

    // 1. Validações Locais
    if (!nome) {
      showError('cadError', '⚠️ Informe seu nome completo.');
      return;
    }
    if (!email) {
      showError('cadError', '⚠️ Informe seu e-mail.');
      return;
    }
    if (pwd.length < 8) {
      showError('cadError', '⚠️ A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      showError('cadError', '⚠️ A senha deve ter pelo menos uma letra e um número.');
      return;
    }
    if (pwd !== pwdConf) {
      showError('cadError', '⚠️ As senhas não coincidem.');
      document.getElementById('cadPwdConf')?.classList.add('error');
      return;
    }
    if (!termos) {
      showError('cadError', '⚠️ Aceite os Termos de uso para continuar.');
      return;
    }

    // 2. Envio de dados para a API C# / MySQL
    const payloadCliente = {
      nome: nome,
      email: email,
      senha: pwd,
      telefone: tel
    };

    try {
      const resposta = await fetch(API_CLIENTES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadCliente)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        // Salva os dados de sessão localmente para manter o cliente logado no site
        saveUsuario({
          nome,
          email,
          tel,
          nasc,
          logado: true,
          desde: new Date().toISOString()
        });

        window.location.href = 'index.html';
      } else {
        // Exibe mensagem devolvida pelo C# (ex: "Este e-mail já está cadastrado!")
        showError('cadError', `⚠️ ${resultado.mensagem || 'Erro ao realizar o cadastro.'}`);
      }
    } catch (erro) {
      console.error('Erro de conexão com a API:', erro);
      showError('cadError', '⚠️ Não foi possível conectar ao servidor. Verifique se a API está ativa.');
    }
  });
}

/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initCadastro();
});