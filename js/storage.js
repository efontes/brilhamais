/**
 * storage.js - Camada de persistência e dados fictícios (Mock Data)
 * Utiliza o localStorage do navegador para persistência entre as páginas HTML.
 */

const STORAGE_KEY = 'SISTEMA_ALUNOS_DB';

// Dados fictícios iniciais para alimentar o sistema
const DADOS_INICIAIS = [
  {
    id: '1',
    matricula: '20230101',
    nome: 'Ana Beatriz Silveira',
    email: 'ana.silveira@exemplo.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '2002-03-15',
    curso: 'Engenharia de Software',
    periodo: '5º Período',
    status: 'Ativo'
  },
  {
    id: '2',
    matricula: '20220215',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@exemplo.com',
    telefone: '(21) 97654-3210',
    dataNascimento: '2001-07-22',
    curso: 'Ciência da Computação',
    periodo: '7º Período',
    status: 'Ativo'
  },
  {
    id: '3',
    matricula: '20240033',
    nome: 'Fernanda Lima Rocha',
    email: 'fernanda.rocha@exemplo.com',
    telefone: '(31) 99123-4567',
    dataNascimento: '2003-11-10',
    curso: 'Sistemas de Informação',
    periodo: '2º Período',
    status: 'Ativo'
  },
  {
    id: '4',
    matricula: '20210408',
    nome: 'Lucas Gabriel Santos',
    email: 'lucas.santos@exemplo.com',
    telefone: '(41) 98888-7777',
    dataNascimento: '2000-01-05',
    curso: 'Design Digital',
    periodo: '8º Período',
    status: 'Trancado'
  },
  {
    id: '5',
    matricula: '20230290',
    nome: 'Mariana Costa Ribeiro',
    email: 'mariana.costa@exemplo.com',
    telefone: '(51) 99345-6789',
    dataNascimento: '2002-09-30',
    curso: 'Engenharia de Software',
    periodo: '4º Período',
    status: 'Ativo'
  },
  {
    id: '6',
    matricula: '20220144',
    nome: 'Rafael Dias Oliveira',
    email: 'rafael.dias@exemplo.com',
    telefone: '(61) 98456-1234',
    dataNascimento: '1999-04-18',
    curso: 'Análise e Desenvolvimento de Sistemas',
    periodo: 'Concluinte',
    status: 'Inativo'
  }
];

/**
 * Inicializa os dados fictícios no localStorage caso ainda não existam.
 */
function initStorage() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS));
  }
}

/**
 * Retorna todos os alunos cadastrados.
 * @returns {Array} Lista de alunos
 */
function getAlunos() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    console.error('Erro ao ler alunos do localStorage:', e);
    return [];
  }
}

/**
 * Obtém um aluno específico por ID.
 * @param {string} id 
 * @returns {Object|null}
 */
function getAlunoById(id) {
  const alunos = getAlunos();
  return alunos.find(aluno => String(aluno.id) === String(id)) || null;
}

/**
 * Adiciona um novo aluno ao banco.
 * @param {Object} novoAluno 
 */
function addAluno(novoAluno) {
  const alunos = getAlunos();
  // Cria ID único incremental e matrícula caso não venha preenchida
  const novoId = Date.now().toString();
  const alunoComId = {
    ...novoAluno,
    id: novoId,
    matricula: novoAluno.matricula || `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
  };
  alunos.unshift(alunoComId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
  return alunoComId;
}

/**
 * Atualiza os dados de um aluno existente.
 * @param {string} id 
 * @param {Object} dadosAtualizados 
 * @returns {boolean}
 */
function updateAluno(id, dadosAtualizados) {
  const alunos = getAlunos();
  const index = alunos.findIndex(aluno => String(aluno.id) === String(id));
  if (index !== -1) {
    alunos[index] = { ...alunos[index], ...dadosAtualizados };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
    return true;
  }
  return false;
}

/**
 * Remove um aluno por ID.
 * @param {string} id 
 * @returns {boolean}
 */
function deleteAluno(id) {
  let alunos = getAlunos();
  const tamanhoAnterior = alunos.length;
  alunos = alunos.filter(aluno => String(aluno.id) !== String(id));
  if (alunos.length !== tamanhoAnterior) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
    return true;
  }
  return false;
}

/**
 * Restaura os dados fictícios padrão
 */
function resetarDadosFicticios() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS));
}

/**
 * Exibe notificação temporária na interface (Toast)
 * @param {string} mensagem 
 * @param {'success'|'error'|'warning'} tipo 
 */
function showToast(mensagem, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  const icon = tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<strong>${icon}</strong><span>${mensagem}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Inicializa automaticamente ao carregar
initStorage();
