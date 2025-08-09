// Lista de gostos
const gostos = ['Doce', 'Salgado', 'Umami', 'Ácido', 'Amargo'];

// Variáveis de controle
let respostas = [];
let gostoIndex = 0;
let amostraIndex = 0;
let inicio;
let nome = '';
let email = '';

// Alternar seções da tela
function mostrarSecao(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Início da avaliação
window.iniciarTeste = function () {
  nome = document.getElementById('nome').value.trim();
  email = document.getElementById('email').value.trim();

  if (nome.length < 3) {
    alert("O nome deve conter pelo menos 3 letras.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Por favor, insira um e-mail válido.");
    return;
  }

  inicio = new Date().toISOString();
  gostoIndex = 0;
  amostraIndex = 0;
  respostas = [];

  carregarAmostra();
  mostrarSecao('avaliacao');
};

// Atualiza valor do slider
window.atualizarSlider = function () {
  const valor = parseFloat(document.getElementById('slider').value).toFixed(2);
  document.getElementById('valorSlider').textContent = valor;
};

// Carrega nova amostra
function carregarAmostra() {
  document.getElementById('gostoAtual').textContent = `Gosto: ${gostos[gostoIndex]} (${amostraIndex + 1}/3)`;
  document.getElementById('codigoAmostra').value = '';
  document.getElementById('slider').value = 5;
  window.atualizarSlider();
}

// Validação do código da amostra
function validarCodigoAmostra(codigo) {
  const regex = /^\d{3}$/;
  return regex.test(codigo);
}

// Avança para a próxima amostra ou gosto
window.proximaAmostra = function () {
  const codigo = document.getElementById('codigoAmostra').value.trim();
  const intensidade = parseFloat(document.getElementById('slider').value).toFixed(2);

  if (!codigo) {
    alert("Insira o código da amostra.");
    return;
  }

  if (!validarCodigoAmostra(codigo)) {
    alert("O código da amostra deve conter exatamente 3 dígitos numéricos (ex: 123).");
    return;
  }

  respostas.push({
    gosto: gostos[gostoIndex],
    codigo: codigo,
    intensidade: intensidade
  });

  amostraIndex++;

  if (amostraIndex < 3) {
    carregarAmostra();
  } else if (gostoIndex < gostos.length - 1) {
    gostoIndex++;
    amostraIndex = 0;
    mostrarSecao('descanso');
    iniciarContagem(() => {
      carregarAmostra();
      mostrarSecao('avaliacao');
    });
  } else {
    enviarDados();
    mostrarSecao('fim');
  }
};

// Temporizador de descanso
function iniciarContagem(callback) {
  let segundos = 10;
  document.getElementById('timer').textContent = segundos;
  let intervalo = setInterval(() => {
    segundos--;
    document.getElementById('timer').textContent = segundos;
    if (segundos <= 0) {
      clearInterval(intervalo);
      callback();
    }
  }, 1000);
}

// Envia os dados para a Google Sheets via Apps Script Web App
function enviarDados() {
  const url = "SUA_URL_DO_WEBAPP"; // 🔹 Coloque aqui a URL publicada do Apps Script

  // Monta o FormData para evitar problema de CORS
  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("email", email);
  formData.append("data", inicio);
  formData.append("respostas", JSON.stringify(respostas));

  fetch(url, {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(resposta => {
      console.log("✅ Dados enviados:", resposta);
    })
    .catch(err => {
      console.error("❌ Erro ao enviar dados:", err);
      alert("Erro ao enviar dados. Verifique sua conexão.");
    });
}


