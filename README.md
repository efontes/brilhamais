# 🎓 Portal do Aluno - Sistema Multi-Páginas (MPA)

Sistema completo de cadastro e gerenciamento de alunos, estruturado como uma **aplicação web multi-páginas tradicional (não SPA)**, com separação estrita de arquivos **HTML**, **CSS** e **JavaScript**, e já pré-alimentado com **dados fictícios**.

---

## 📁 Estrutura de Arquivos

```text
Antigravity/
├── index.html          # Página principal: Listagem de alunos, estatísticas e filtros
├── cadastro.html       # Página de cadastro de novos alunos
├── editar.html         # Página de edição de dados cadastrais
├── css/
│   └── style.css       # Folha de estilo global, responsiva e moderna
├── js/
│   ├── storage.js      # Camada de persistência (localStorage) e dados fictícios (Mock)
│   ├── index.js        # Lógica da listagem, busca, contadores e exclusão
│   ├── cadastro.js     # Validações e envio do novo cadastro
│   └── editar.js       # Carregamento por query string (?id=) e atualização
└── README.md
```

---

## 🚀 Funcionalidades

1. **Multi-Páginas (Não SPA):**
   - Transição real de páginas via hiperlinks nativos (`<a>`) e navegação do browser.
   - Parâmetros passados por query string (ex: `editar.html?id=2` e `index.html?msg=cadastrado`).
   - Cada página HTML inclui sua própria estrutura de scripts e tags sem frameworks SPA.

2. **Dados Fictícios Pré-carregados:**
   - 6 alunos fictícios pré-cadastrados com nomes, matrículas, e-mails, telefones, cursos e status.
   - Botão **"Restaurar Fictícios"** na listagem para resetar os dados ao estado inicial quando desejar.

3. **Operações Completas de Alunos:**
   - **Listagem e Dashboard:** Contadores de total, ativos, trancados e inativos.
   - **Busca e Filtros:** Pesquisa em tempo real por nome, matrícula, e-mail ou curso, com filtros adicionais por status e graduação.
   - **Cadastro:** Formulário com validações de campos obrigatórios, formatação de telefone e geração automática de matrícula.
   - **Edição:** Edição de dados existentes com bloqueio de chave identificadora.
   - **Exclusão:** Confirmação antes de remover qualquer registro.

---

## 💻 Como Executar

Basta abrir o arquivo `index.html` em qualquer navegador web moderno:
- Duplo clique direto no arquivo `index.html`, ou
- Utilizando qualquer servidor estático local (como Live Server no VS Code, `npx serve`, Python `python -m http.server`, etc.).
