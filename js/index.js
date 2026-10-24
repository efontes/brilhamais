/**
 * index.js - Lógica da página inicial (Listagem e Gestão de Alunos)
 */

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('alunosTableBody');
  const searchInput = document.getElementById('searchInput');
  const filterCurso = document.getElementById('filterCurso');
  const filterStatus = document.getElementById('filterStatus');
  const btnResetar = document.getElementById('btnResetar');

  // Elementos das Estatísticas
  const statTotal = document.getElementById('statTotal');
  const statAtivos = document.getElementById('statAtivos');
  const statTrancados = document.getElementById('statTrancados');
  const statInativos = document.getElementById('statInativos');

  // Verifica mensagens passadas via query string (redirecionamentos de outras páginas)
  verificarMensagemUrl();

  /**
   * Atualiza os cards de estatísticas
   */
  function atualizarEstatisticas(alunos) {
    const total = alunos.length;
    const ativos = alunos.filter(a => a.status === 'Ativo').length;
    const trancados = alunos.filter(a => a.status === 'Trancado').length;
    const inativos = alunos.filter(a => a.status === 'Inativo').length;

    if (statTotal) statTotal.textContent = total;
    if (statAtivos) statAtivos.textContent = ativos;
    if (statTrancados) statTrancados.textContent = trancados;
    if (statInativos) statInativos.textContent = inativos;
  }

  /**
   * Renderiza a lista de alunos na tabela
   */
  function renderizarTabela() {
    const todosAlunos = getAlunos();
    atualizarEstatisticas(todosAlunos);

    const termoBusca = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cursoFiltro = filterCurso ? filterCurso.value : '';
    const statusFiltro = filterStatus ? filterStatus.value : '';

    const alunosFiltrados = todosAlunos.filter(aluno => {
      const matchBusca = 
        aluno.nome.toLowerCase().includes(termoBusca) ||
        aluno.matricula.toLowerCase().includes(termoBusca) ||
        aluno.email.toLowerCase().includes(termoBusca) ||
        aluno.curso.toLowerCase().includes(termoBusca);

      const matchCurso = cursoFiltro === '' || aluno.curso === cursoFiltro;
      const matchStatus = statusFiltro === '' || aluno.status === statusFiltro;

      return matchBusca && matchCurso && matchStatus;
    });

    if (alunosFiltrados.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3>Nenhum aluno encontrado</h3>
              <p>Não há registros correspondentes aos critérios de busca ou filtros aplicados.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = alunosFiltrados.map(aluno => {
      const statusClass = aluno.status.toLowerCase();
      return `
        <tr>
          <td><strong>#${aluno.matricula}</strong></td>
          <td>
            <div class="student-info">
              <span class="student-name">${escaparHtml(aluno.nome)}</span>
              <span class="student-email">${escaparHtml(aluno.email)}</span>
            </div>
          </td>
          <td>${escaparHtml(aluno.telefone || '-')}</td>
          <td>
            <div>${escaparHtml(aluno.curso)}</div>
            <small style="color: var(--text-muted);">${escaparHtml(aluno.periodo || '')}</small>
          </td>
          <td>
            <span class="status-badge ${statusClass}">${aluno.status}</span>
          </td>
          <td>
            <div class="action-buttons">
              <!-- Navegação tradicional multi-página com parâmetros na URL -->
              <a href="editar.html?id=${aluno.id}" class="btn-icon edit" title="Editar Aluno">
                ✏️ Editar
              </a>
              <button type="button" class="btn-icon delete btn-excluir" data-id="${aluno.id}" data-nome="${escaparHtml(aluno.nome)}" title="Excluir Aluno">
                🗑️ Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Adiciona event listeners aos botões de exclusão recém-renderizados
    vincularEventosExclusao();
  }

  /**
   * Vincula eventos de clique para exclusão
   */
  function vincularEventosExclusao() {
    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const nome = btn.getAttribute('data-nome');

        const confirmou = window.confirm(`Tem certeza que deseja excluir o aluno(a) "${nome}"?`);
        if (confirmou) {
          const sucesso = deleteAluno(id);
          if (sucesso) {
            showToast(`Aluno "${nome}" excluído com sucesso!`, 'success');
            renderizarTabela();
          } else {
            showToast('Erro ao tentar excluir o aluno.', 'error');
          }
        }
      });
    });
  }

  /**
   * Sanitização básica para evitar injeção de HTML
   */
  function escaparHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  /**
   * Trata mensagens na URL (ex: ?msg=cadastrado)
   */
  function verificarMensagemUrl() {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('msg');
    if (msg === 'cadastrado') {
      showToast('Aluno cadastrado com sucesso!', 'success');
    } else if (msg === 'atualizado') {
      showToast('Dados do aluno atualizados com sucesso!', 'success');
    }

    // Limpa a query string da URL sem recarregar a página
    if (msg) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Event Listeners para busca e filtros
  if (searchInput) {
    searchInput.addEventListener('input', renderizarTabela);
  }

  if (filterCurso) {
    filterCurso.addEventListener('change', renderizarTabela);
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', renderizarTabela);
  }

  // Restaurar dados fictícios originais
  if (btnResetar) {
    btnResetar.addEventListener('click', () => {
      const confirmou = window.confirm('Deseja restaurar a base de dados fictícios original? Isso substituirá as alterações.');
      if (confirmou) {
        resetarDadosFicticios();
        showToast('Dados fictícios restaurados com sucesso!', 'success');
        renderizarTabela();
      }
    });
  }

  // Renderização inicial
  renderizarTabela();
});
