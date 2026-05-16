import json, os

ARQUIVO = "livros.json"

def limparTela():
    os.system('cls' if os.name == 'nt' else 'clear')

def carregar_livros():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar_livros(livros):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(livros, f, indent=4, ensure_ascii=False)


def cadastrar_livro(livros):
    """
    Deve pedir título e autor.
    Deve gerar um novo id.
    Deve adicionar o livro com disponivel = True.
    Deve salvar no JSON
    """
    pass


def listar_livros(livros):
    """
    Deve listar todos os livros cadastrados.
    Mostrar ID, título, autor e status.
    """
    print("lista de livros:")
    
    for livro in livros:

        print(f"{livro["id"]} - {livro["autor"]} - {livro["titulo"]} - {"\033[0;32mDisponivel\033[m " if livro["disponivel"]  else "\033[0;31mIndisponivel\033[m"} ")
    input("\nPressione ENTER para continuar")
    pass


def emprestar_livro(livros):
    limparTela()
    id = int(input("digite o ID do livro que deseja:"))

    achei = False
    for livro in livros:
        if livro["id"] == id:
            if livro["disponivel"] == True:
                livro["disponivel"] = False
                print(f"você pegou emprestado o livro {livro["titulo"]} - {livro["autor"]} ")
                achei = True
                salvar_livros(livros)
                break
            else:
                print("o livro esta indisponivel.")
                input("pressione ENTER para continuar")


    if achei == False:
        print("não foi localizado um livro com esse ID")

    input("pressione ENTER para continuar")





    

    
    
    """
    Deve pedir o ID do livro.
    Se existir e estiver disponível, marcar como indisponível.
    Se não existir ou já estiver emprestado, avisar.
    Deve salvar no JSON quando emprestar
    """
    pass


def devolver_livro(livros):
    limparTela()
    id = int(input("Informe o ID do livro: "))
    achei = False
    for livro in livros:
        if livro["id"] == id:
            if livro["disponivel"] == False:
                livro["disponivel"] = True
                print(f"Você devolveu o livro {livro} com sucesso! ")
                achei = True
            elif livro["disponivel"] == True:
                print(f"O livro {livro} já existe e não precisa de devolução")
                achei = True
    if achei == False:
        print("O livro não existe em nosso sistema!")
        
    input("Deseja continuar S/N: ")
    
        
        
            
                
                
            
            
            
       
            

        
    
    

def destruir_livro(livros):
    """
    Deve pedir o ID do livro.
    Se existir o livro, deve excluir
    Se não existir avisar.
    Deve salvar no JSON
    """
    pass

livros = carregar_livros()

while True:
    limparTela()

    print("\n=== BIBLIOTECA BRILHA MAIS ===")
    print("1 - Cadastrar livro")
    print("2 - Listar livros")
    print("3 - Emprestar livro")
    print("4 - Devolver livro")
    print("5 - Excluir livro (destruir)")
    print("0 - Sair")

    opcao = input("Escolha: ")

    match opcao:
        case "1":
            cadastrar_livro(livros)
        case "2":
            listar_livros(livros)
        case "3":
            emprestar_livro(livros)
        case "4":
            devolver_livro(livros)
        case "5":
            destruir_livro(livros)
        case "0":
            print("Encerrando...")
            break
        case _:
            print("Opção inválida.")