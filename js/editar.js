/**
 * editar.js - Lógica de edição integrada ao Supabase
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formEditar');
  const btnCancelar = document.getElementById('btnCancelar');
  const selectCurso = document.getElementById('curso');
  const btnSubmit = form ? form.querySelector('button[type="submit"]') : null;

  const urlParams = new URLSearchParams(window.location.search);
  const alunoId = urlParams.get('id');

  if (!alunoId) {
    alert('Nenhum aluno especificado para edição.');
    window.location.href = 'index.html';
    return;
  }

  let matriculaIdAtual = null;

  // 1. Carrega opções de cursos do Supabase
  await carregarCursos();

  // 2. Busca dados completos do aluno e sua matrícula
  await carregarDadosAluno();

  async function carregarCursos() {
    if (!selectCurso) return;
    try {
      const cursos = await listarCursos();
      selectCurso.innerHTML = '<option value="">Selecione um curso...</option>';
      cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id;
        option.textContent = `${curso.nome} (${curso.codigo})`;
        selectCurso.appendChild(option);
      });
    } catch (err) {
      console.error('Erro ao listar cursos:', err);
    }
  }

  async function carregarDadosAluno() {
    try {
      const aluno = await obterAlunoPorId(alunoId);
      if (!aluno) {
        alert('Aluno não encontrado no Supabase.');
        window.location.href = 'index.html';
        return;
      }

      const mat = (aluno.matriculas && aluno.matriculas.length > 0) ? aluno.matriculas[0] : null;
      if (mat) {
        matriculaIdAtual = mat.id;
        document.getElementById('matricula').value = mat.codigo_matricula || '';
        document.getElementById('curso').value = mat.curso_id || '';
        document.getElementById('periodo').value = mat.periodo || '1º Período';
        document.getElementById('status').value = mat.status || 'Ativo';
      }

      document.getElementById('alunoId').value = aluno.id;
      document.getElementById('nome').value = aluno.nome || '';
      document.getElementById('email').value = aluno.email || '';
      document.getElementById('telefone').value = aluno.telefone || '';
      document.getElementById('dataNascimento').value = aluno.data_nascimento || '';

      const subtitle = document.getElementById('editSubtitle');
      if (subtitle) {
        subtitle.textContent = `Atualizando registro de ${aluno.nome}`;
      }
    } catch (e) {
      console.error('Erro ao obter aluno:', e);
      alert('Erro de conexão ao carregar dados do aluno.');
    }
  }

  // Máscara de telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      let valor = e.target.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      }
      e.target.value = valor;
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Submissão da atualização no Supabase
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparErros();

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const dataNascimento = document.getElementById('dataNascimento').value;
      const cursoId = document.getElementById('curso').value;
      const periodo = document.getElementById('periodo').value;
      const status = document.getElementById('status').value;

      let formValido = true;

      if (!nome || nome.length < 3) {
        mostrarErro('nome', 'Informe o nome completo (mínimo 3 caracteres).');
        formValido = false;
      }

      if (!email || !validarEmail(email)) {
        mostrarErro('email', 'Informe um endereço de e-mail válido.');
        formValido = false;
      }

      if (!cursoId) {
        mostrarErro('curso', 'Selecione um curso.');
        formValido = false;
      }

      if (!dataNascimento) {
        mostrarErro('dataNascimento', 'Informe a data de nascimento.');
        formValido = false;
      }

      if (!formValido) {
        showToast('Por favor, corrija os erros apontados no formulário.', 'error');
        return;
      }

      const dadosAluno = {
        nome,
        email,
        telefone: telefone || null,
        data_nascimento: dataNascimento
      };

      const dadosMatricula = {
        curso_id: cursoId,
        periodo,
        status
      };

      try {
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Salvando no Supabase...';
        }

        await atualizarAlunoComMatricula(alunoId, dadosAluno, matriculaIdAtual, dadosMatricula);
        window.location.href = 'index.html?msg=atualizado';
      } catch (err) {
        console.error('Erro ao atualizar no Supabase:', err);
        showToast('Erro ao atualizar os dados no Supabase.', 'error');
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Salvar Alterações';
        }
      }
    });
  }

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+$/;
    return re.test(email);
  }

  function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;

    campo.classList.add('is-invalid');
    const erroSpan = document.createElement('span');
    erroSpan.className = 'error-text';
    erroSpan.textContent = mensagem;

    campo.parentElement.appendChild(erroSpan);
  }

  function limparErros() {
    const erros = document.querySelectorAll('.error-text');
    erros.forEach(el => el.remove());

    const invalidos = document.querySelectorAll('.is-invalid');
    invalidos.forEach(el => el.classList.remove('is-invalid'));
  }
});
