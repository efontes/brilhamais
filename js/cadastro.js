/**
 * cadastro.js - Lógica da página de Cadastro de Novo Aluno
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCadastro');
  const btnCancelar = document.getElementById('btnCancelar');

  // Máscara simples de telefone
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

  // Tratamento da submissão do formulário
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

      // Validações
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

      // Monta objeto do novo aluno
      const novoAluno = {
        matricula: matricula || undefined, // Será gerado se vazio
        nome,
        email,
        telefone,
        dataNascimento,
        curso,
        periodo: periodo || '1º Período',
        status: status || 'Ativo'
      };

      try {
        addAluno(novoAluno);
        // Redirecionamento tradicional de aplicação multi-página (MPA)
        window.location.href = 'index.html?msg=cadastrado';
      } catch (err) {
        console.error('Erro ao salvar aluno:', err);
        showToast('Ocorreu um erro ao cadastrar o aluno.', 'error');
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
