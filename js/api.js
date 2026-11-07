/**
 * api.js - Camada de serviços assíncronos com o Supabase (Relacionamento N:N)
 * Entidades: alunos <-> matriculas <-> cursos
 */

/**
 * Obtém a lista de cursos cadastrados e ativos
 */
async function listarCursos() {
  try {
    const { data, error } = await supabaseClient
      .from('cursos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cursos:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Falha de conexão em listarCursos:', err);
    return [];
  }
}

/**
 * Lista todos os alunos com suas respectivas matrículas e cursos (JOIN relacional)
 */
async function listarAlunosComMatriculas() {
  try {
    const { data, error } = await supabaseClient
      .from('alunos')
      .select(`
        id,
        nome,
        email,
        telefone,
        data_nascimento,
        created_at,
        matriculas (
          id,
          codigo_matricula,
          periodo,
          status,
          data_matricula,
          curso_id,
          cursos (
            id,
            nome,
            codigo
          )
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar alunos com matrículas:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Falha de conexão em listarAlunosComMatriculas:', err);
    throw err;
  }
}

/**
 * Obtém um aluno específico e suas matrículas por ID
 * @param {string} alunoId 
 */
async function obterAlunoPorId(alunoId) {
  try {
    const { data, error } = await supabaseClient
      .from('alunos')
      .select(`
        id,
        nome,
        email,
        telefone,
        data_nascimento,
        matriculas (
          id,
          codigo_matricula,
          periodo,
          status,
          curso_id,
          cursos (
            id,
            nome,
            codigo
          )
        )
      `)
      .eq('id', alunoId)
      .single();

    if (error) {
      console.error('Erro ao obter aluno por ID:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Falha de conexão em obterAlunoPorId:', err);
    return null;
  }
}

/**
 * Cadastra um novo aluno e insere sua matrícula inicial em um curso
 * @param {Object} dadosAluno { nome, email, telefone, data_nascimento }
 * @param {Object} dadosMatricula { curso_id, codigo_matricula, periodo, status }
 */
async function cadastrarAlunoComMatricula(dadosAluno, dadosMatricula) {
  try {
    // 1. Insere o aluno
    const { data: novoAluno, error: erroAluno } = await supabaseClient
      .from('alunos')
      .insert([dadosAluno])
      .select()
      .single();

    if (erroAluno) {
      console.error('Erro ao criar aluno:', erroAluno);
      throw erroAluno;
    }

    // 2. Gera matrícula automática caso não fornecida
    const codigoMatricula = dadosMatricula.codigo_matricula || 
      `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Insere a matrícula vinculando aluno_id e curso_id
    const { data: novaMatricula, error: erroMatricula } = await supabaseClient
      .from('matriculas')
      .insert([{
        aluno_id: novoAluno.id,
        curso_id: dadosMatricula.curso_id,
        codigo_matricula: codigoMatricula,
        periodo: dadosMatricula.periodo || '1º Período',
        status: dadosMatricula.status || 'Ativo'
      }])
      .select()
      .single();

    if (erroMatricula) {
      console.error('Erro ao criar matrícula do aluno:', erroMatricula);
      throw erroMatricula;
    }

    return { aluno: novoAluno, matricula: novaMatricula };
  } catch (err) {
    console.error('Falha em cadastrarAlunoComMatricula:', err);
    throw err;
  }
}

/**
 * Atualiza os dados pessoais do aluno e as informações da sua matrícula ativa
 */
async function atualizarAlunoComMatricula(alunoId, dadosAluno, matriculaId, dadosMatricula) {
  try {
    // 1. Atualiza dados pessoais na tabela alunos
    const { error: erroAluno } = await supabaseClient
      .from('alunos')
      .update(dadosAluno)
      .eq('id', alunoId);

    if (erroAluno) {
      console.error('Erro ao atualizar aluno:', erroAluno);
      throw erroAluno;
    }

    // 2. Se houver matrícula vinculada, atualiza curso, período e status
    if (matriculaId) {
      const { error: erroMatricula } = await supabaseClient
        .from('matriculas')
        .update({
          curso_id: dadosMatricula.curso_id,
          periodo: dadosMatricula.periodo,
          status: dadosMatricula.status
        })
        .eq('id', matriculaId);

      if (erroMatricula) {
        console.error('Erro ao atualizar matrícula:', erroMatricula);
        throw erroMatricula;
      }
    }

    return true;
  } catch (err) {
    console.error('Falha em atualizarAlunoComMatricula:', err);
    throw err;
  }
}

/**
 * Exclui um aluno (a exclusão das matrículas ocorre em cascata pelo ON DELETE CASCADE)
 * @param {string} alunoId 
 */
async function excluirAluno(alunoId) {
  try {
    const { error } = await supabaseClient
      .from('alunos')
      .delete()
      .eq('id', alunoId);

    if (error) {
      console.error('Erro ao excluir aluno:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Falha em excluirAluno:', err);
    throw err;
  }
}

/**
 * Popula dados fictícios de demonstração diretamente no Supabase
 */
async function popularDadosFicticiosSupabase() {
  const cursos = await listarCursos();
  if (cursos.length === 0) {
    throw new Error('Nenhum curso disponível para vincular alunos.');
  }

  // Mapa de cursos por código ou nome
  const getCursoId = (nome) => {
    const c = cursos.find(item => item.nome.toLowerCase().includes(nome.toLowerCase()));
    return c ? c.id : cursos[0].id;
  };

  const alunosFicticios = [
    {
      nome: 'Ana Beatriz Silveira',
      email: 'ana.silveira@exemplo.com',
      telefone: '(11) 98765-4321',
      data_nascimento: '2002-03-15',
      curso_id: getCursoId('Engenharia de Software'),
      codigo_matricula: '20230101',
      periodo: '5º Período',
      status: 'Ativo'
    },
    {
      nome: 'Carlos Eduardo Mendes',
      email: 'carlos.mendes@exemplo.com',
      telefone: '(21) 97654-3210',
      data_nascimento: '2001-07-22',
      curso_id: getCursoId('Ciência da Computação'),
      codigo_matricula: '20220215',
      periodo: '7º Período',
      status: 'Ativo'
    },
    {
      nome: 'Fernanda Lima Rocha',
      email: 'fernanda.rocha@exemplo.com',
      telefone: '(31) 99123-4567',
      data_nascimento: '2003-11-10',
      curso_id: getCursoId('Sistemas de Informação'),
      codigo_matricula: '20240033',
      periodo: '2º Período',
      status: 'Ativo'
    },
    {
      nome: 'Lucas Gabriel Santos',
      email: 'lucas.santos@exemplo.com',
      telefone: '(41) 98888-7777',
      data_nascimento: '2000-01-05',
      curso_id: getCursoId('Design Digital'),
      codigo_matricula: '20210408',
      periodo: '8º Período',
      status: 'Trancado'
    },
    {
      nome: 'Mariana Costa Ribeiro',
      email: 'mariana.costa@exemplo.com',
      telefone: '(51) 99345-6789',
      data_nascimento: '2002-09-30',
      curso_id: getCursoId('Engenharia de Software'),
      codigo_matricula: '20230290',
      periodo: '4º Período',
      status: 'Ativo'
    },
    {
      nome: 'Rafael Dias Oliveira',
      email: 'rafael.dias@exemplo.com',
      telefone: '(61) 98456-1234',
      data_nascimento: '1999-04-18',
      curso_id: getCursoId('Análise e Desenvolvimento de Sistemas'),
      codigo_matricula: '20220144',
      periodo: 'Concluinte',
      status: 'Inativo'
    }
  ];

  for (const item of alunosFicticios) {
    await cadastrarAlunoComMatricula(
      {
        nome: item.nome,
        email: item.email,
        telefone: item.telefone,
        data_nascimento: item.data_nascimento
      },
      {
        curso_id: item.curso_id,
        codigo_matricula: item.codigo_matricula,
        periodo: item.periodo,
        status: item.status
      }
    );
  }
}
