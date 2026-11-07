/**
 * index.js - Lógica da página inicial integrada com o Supabase
 */

document.addEventListener('DOMContentLoaded', async () => {
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

  let alunosCache = [];

  // Exibe mensagem da query string (ex: ?msg=cadastrado)
  verificarMensagemUrl();

  // 1. Carrega opções de cursos no filtro a partir do Supabase
  await carregarFiltroCursos();

  // 2. Carrega lista de alunos do Supabase
  await recarregarTabela();

  /**
   * Preenche o dropdown de filtro com os cursos reais do Supabase
   */
  async function carregarFiltroCursos() {
    if (!filterCurso) return;
    try {
      const cursos = await listarCursos();
      filterCurso.innerHTML = '<option value="">Todos os Cursos</option>';
      cursos.forEach(curso => {
        const opt = document.createElement('option');
        opt.value = curso.id;
        opt.textContent = `${curso.nome} (${curso.codigo})`;
        filterCurso.appendChild(opt);
      });
    } catch (e) {
      console.error('Falha ao preencher filtro de cursos:', e);
    }
  }

  /**
   * Busca alunos do Supabase e renderiza
   */
  async function recarregarTabela() {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            🔄 Conectando ao Supabase e carregando estudantes...
          </td>
        </tr>
      `;
    }

    try {
      alunosCache = await listarAlunosComMatriculas();
      renderizarTabela();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">
              ⚠️ Não foi possível carregar os dados do Supabase. Verifique a conexão.
            </td>
          </tr>
        `;
      }
    }
  }

  /**
   * Atualiza os cards de estatísticas (baseado nos vínculos de matrícula)
   */
  function atualizarEstatisticas(alunos) {
    const totalAlunos = alunos.length;

    let ativos = 0;
    let trancados = 0;
    let inativos = 0;

    alunos.forEach(aluno => {
      const mat = (aluno.matriculas && aluno.matriculas[0]) ? aluno.matriculas[0] : null;
      if (mat) {
        if (mat.status === 'Ativo') ativos++;
        else if (mat.status === 'Trancado') trancados++;
        else inativos++;
      }
    });

    if (statTotal) statTotal.textContent = totalAlunos;
    if (statAtivos) statAtivos.textContent = ativos;
    if (statTrancados) statTrancados.textContent = trancados;
    if (statInativos) statInativos.textContent = inativos;
  }

  /**
   * Renderiza a lista de alunos e suas matrículas
   */
  function renderizarTabela() {
    atualizarEstatisticas(alunosCache);

    const termoBusca = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cursoFiltro = filterCurso ? filterCurso.value : '';
    const statusFiltro = filterStatus ? filterStatus.value : '';

    const alunosFiltrados = alunosCache.filter(aluno => {
      const mat = (aluno.matriculas && aluno.matriculas.length > 0) ? aluno.matriculas[0] : null;
      const nomeCurso = mat && mat.cursos ? mat.cursos.nome : '';
      const codigoMat = mat ? mat.codigo_matricula : '';
      const statusMat = mat ? mat.status : 'Ativo';

      const matchBusca = 
        aluno.nome.toLowerCase().includes(termoBusca) ||
        aluno.email.toLowerCase().includes(termoBusca) ||
        codigoMat.toLowerCase().includes(termoBusca) ||
        nomeCurso.toLowerCase().includes(termoBusca);

      const matchCurso = cursoFiltro === '' || (mat && mat.curso_id === cursoFiltro);
      const matchStatus = statusFiltro === '' || statusMat === statusFiltro;

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
              <h3>Nenhum registro encontrado</h3>
              <p>Nenhum aluno cadastrado no Supabase atende aos filtros atuais.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = alunosFiltrados.map(aluno => {
      // Exibe os cursos do aluno (suporta N cursos)
      const listaMatriculas = aluno.matriculas || [];
      const matPrincipal = listaMatriculas[0] || {};
      const statusClass = (matPrincipal.status || 'ativo').toLowerCase();

      // Renderiza múltiplos cursos caso o aluno esteja em mais de um
      const cursosHtml = listaMatriculas.length > 0 
        ? listaMatriculas.map(m => `
            <div>
              <strong>${escaparHtml(m.cursos ? m.cursos.nome : 'Curso')}</strong>
              <small style="display:block; color: var(--text-muted);">${escaparHtml(m.periodo || '')}</small>
            </div>
          `).join('<hr style="border:none; border-top:1px dashed var(--border); margin:4px 0;">')
        : '<span style="color:var(--text-muted);">Sem matrícula</span>';

      const matriculaExibida = matPrincipal.codigo_matricula ? `#${matPrincipal.codigo_matricula}` : '-';

      return `
        <tr>
          <td><strong>${escaparHtml(matriculaExibida)}</strong></td>
          <td>
            <div class="student-info">
              <span class="student-name">${escaparHtml(aluno.nome)}</span>
              <span class="student-email">${escaparHtml(aluno.email)}</span>
            </div>
          </td>
          <td>${escaparHtml(aluno.telefone || '-')}</td>
          <td>${cursosHtml}</td>
          <td>
            <span class="status-badge ${statusClass}">${escaparHtml(matPrincipal.status || 'Ativo')}</span>
          </td>
          <td>
            <div class="action-buttons">
              <a href="editar.html?id=${aluno.id}" class="btn-icon edit" title="Editar no Supabase">
                ✏️ Editar
              </a>
              <button type="button" class="btn-icon delete btn-excluir" data-id="${aluno.id}" data-nome="${escaparHtml(aluno.nome)}" title="Excluir do Supabase">
                🗑️ Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    vincularEventosExclusao();
  }

  /**
   * Eventos de exclusão integrada com o Supabase
   */
  function vincularEventosExclusao() {
    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const nome = btn.getAttribute('data-nome');

        const confirmou = window.confirm(`Tem certeza que deseja excluir "${nome}" do Supabase?`);
        if (confirmou) {
          try {
            btn.disabled = true;
            btn.textContent = '⏳ Excluindo...';
            await excluirAluno(id);
            showToast(`Aluno "${nome}" removido com sucesso do banco!`, 'success');
            await recarregarTabela();
          } catch (e) {
            showToast('Erro ao excluir aluno no Supabase.', 'error');
            btn.disabled = false;
            btn.textContent = '🗑️ Excluir';
          }
        }
      });
    });
  }

  function escaparHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function verificarMensagemUrl() {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('msg');
    if (msg === 'cadastrado') {
      showToast('Aluno e matrícula cadastrados no Supabase com sucesso!', 'success');
    } else if (msg === 'atualizado') {
      showToast('Registro atualizado com sucesso no Supabase!', 'success');
    }

    if (msg) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Eventos de busca e filtros
  if (searchInput) searchInput.addEventListener('input', renderizarTabela);
  if (filterCurso) filterCurso.addEventListener('change', renderizarTabela);
  if (filterStatus) filterStatus.addEventListener('change', renderizarTabela);

  // Botão para popular dados fictícios no Supabase caso a tabela esteja vazia
  if (btnResetar) {
    btnResetar.addEventListener('click', async () => {
      const confirmou = window.confirm('Deseja popular os dados fictícios iniciais no seu banco de dados Supabase?');
      if (confirmou) {
        try {
          btnResetar.disabled = true;
          btnResetar.textContent = '⏳ Gravando...';
          await popularDadosFicticiosSupabase();
          showToast('Dados fictícios inseridos no Supabase com sucesso!', 'success');
          await recarregarTabela();
        } catch (e) {
          showToast('Erro ao popular dados no Supabase.', 'error');
        } finally {
          btnResetar.disabled = false;
          btnResetar.textContent = '🔄 Carga Fictícia';
        }
      }
    });
  }
});
