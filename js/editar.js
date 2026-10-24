/**
 * editar.js - Lógica da página de Edição de Aluno
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditar');
  const btnCancelar = document.getElementById('btnCancelar');

  // Obtém o ID do aluno via URL Query Parameters (ex: editar.html?id=2)
  const urlParams = new URLSearchParams(window.location.search);
  const alunoId = urlParams.get('id');

  if (!alunoId) {
    alert('Nenhum aluno especificado para edição.');
    window.location.href = 'index.html';
    return;
  }

  // Busca dados do aluno no storage
  const aluno = getAlunoById(alunoId);
  if (!aluno) {
    alert('Aluno não encontrado na base de dados.');
    window.location.href = 'index.html';
    return;
  }

  // Preenche os campos do formulário com os dados existentes
  preencherFormulario(aluno);

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

  // Cancelar e voltar para a listagem
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Submissão da edição
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      limparErros();

      const nome = document.getElementById('nome').value.trim();
      const matricula = document.getElementById('matricula').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const dataNascimento = document.getElementById('dataNascimento').value;
      const curso = document.getElementById('curso').value;
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

      if (!curso) {
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

      const dadosAtualizados = {
        matricula: matricula || aluno.matricula,
        nome,
        email,
        telefone,
        dataNascimento,
        curso,
        periodo,
        status
      };

      const sucesso = updateAluno(alunoId, dadosAtualizados);
      if (sucesso) {
        // Redirecionamento MPA tradicional
        window.location.href = 'index.html?msg=atualizado';
      } else {
        showToast('Erro ao atualizar os dados do aluno.', 'error');
      }
    });
  }

  function preencherFormulario(dados) {
    document.getElementById('alunoId').value = dados.id;
    document.getElementById('matricula').value = dados.matricula || '';
    document.getElementById('nome').value = dados.nome || '';
    document.getElementById('email').value = dados.email || '';
    document.getElementById('telefone').value = dados.telefone || '';
    document.getElementById('dataNascimento').value = dados.dataNascimento || '';
    document.getElementById('curso').value = dados.curso || '';
    document.getElementById('periodo').value = dados.periodo || '1º Período';
    document.getElementById('status').value = dados.status || 'Ativo';

    // Atualiza subtítulo com o nome do aluno
    const subtitle = document.getElementById('editSubtitle');
    if (subtitle) {
      subtitle.textContent = `Atualizando registro de ${dados.nome} (Matrícula #${dados.matricula})`;
    }
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
