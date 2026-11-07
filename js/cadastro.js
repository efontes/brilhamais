/**
 * cadastro.js - Lógica de cadastro no Supabase (Alunos e Matrículas)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('formCadastro');
  const btnCancelar = document.getElementById('btnCancelar');
  const selectCurso = document.getElementById('curso');
  const btnSubmit = form ? form.querySelector('button[type="submit"]') : null;

  // 1. Carrega os cursos ativos diretamente do banco Supabase
  await carregarCursos();

  async function carregarCursos() {
    if (!selectCurso) return;
    try {
      selectCurso.innerHTML = '<option value="">Carregando cursos do Supabase...</option>';
      const cursos = await listarCursos();

      if (cursos.length === 0) {
        selectCurso.innerHTML = '<option value="">Nenhum curso disponível no momento</option>';
        return;
      }

      selectCurso.innerHTML = '<option value="">Selecione um curso...</option>';
      cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id;
        option.textContent = `${curso.nome} (${curso.codigo})`;
        selectCurso.appendChild(option);
      });
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
      selectCurso.innerHTML = '<option value="">Erro ao carregar cursos</option>';
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

  // Submissão do cadastro no Supabase
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      limparErros();

      const nome = document.getElementById('nome').value.trim();
      const matricula = document.getElementById('matricula').value.trim();
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
        mostrarErro('curso', 'Selecione um curso válido.');
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
        codigo_matricula: matricula || undefined,
        periodo: periodo || '1º Período',
        status: status || 'Ativo'
      };

      try {
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Salvando no Supabase...';
        }

        await cadastrarAlunoComMatricula(dadosAluno, dadosMatricula);
        window.location.href = 'index.html?msg=cadastrado';
      } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
        const mensagemErro = err.message && err.message.includes('unique') 
          ? 'Já existe um cadastro com este e-mail ou matrícula.'
          : 'Ocorreu um erro ao salvar o aluno no banco de dados.';
        showToast(mensagemErro, 'error');

        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Salvar e Concluir Cadastro';
        }
      }
    });
  }

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
