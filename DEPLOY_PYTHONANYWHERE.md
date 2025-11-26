# Guia de Implantação no PythonAnywhere

Este guia passo a passo ajudará você a colocar o **Sound Equipment Manager** na internet usando o **PythonAnywhere** (plano gratuito).

## 1. Criar Conta
1.  Acesse [www.pythonanywhere.com](https://www.pythonanywhere.com/).
2.  Crie uma conta "Beginner" (Grátis).

## 2. Enviar o Código
Você tem duas opções para enviar o código:

### Opção A: Usando GitHub (Recomendado)
Se você sabe usar Git:
1.  Crie um repositório no GitHub e suba seu código.
2.  No PythonAnywhere, abra um **Bash Console**.
3.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git mysite
    ```

### Opção B: Upload Manual (Mais Simples)
1.  No seu computador, compacte a pasta do projeto em um arquivo `.zip`.
2.  No PythonAnywhere, vá na aba **Files**.
3.  Faça o upload do `.zip`.
4.  Abra um **Bash Console** e descompacte:
    ```bash
    unzip nome-do-arquivo.zip -d mysite
    ```

## 3. Configurar o Ambiente Virtual
No **Bash Console** do PythonAnywhere:

1.  Entre na pasta do projeto:
    ```bash
    cd mysite
    ```
    *(Ajuste o caminho se necessário)*

2.  Crie e ative o ambiente virtual:
    ```bash
    python3.10 -m venv venv
    source venv/bin/activate
    ```

3.  Instale as dependências:
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  Crie o arquivo `.env` de produção:
    ```bash
    nano .env
    ```
    Cole o seguinte conteúdo (ajuste a senha!):
    ```text
    SECRET_KEY=sua-senha-secreta-muito-dificil
    FLASK_ENV=production
    DATABASE_URL=sqlite:////home/SEU_USUARIO/mysite/church.db
    ```
    *(Substitua `SEU_USUARIO` pelo seu nome de usuário no PythonAnywhere)*
    Pressione `Ctrl+X`, depois `Y` e `Enter` para salvar.

## 4. Configurar o Web App
1.  Vá para a aba **Web** no painel do PythonAnywhere.
2.  Clique em **Add a new web app**.
3.  Escolha **Manual configuration** (não escolha Flask automaticamente, pois vamos configurar manualmente para ter mais controle).
4.  Escolha **Python 3.10**.

### Configurar WSGI
1.  Na seção **Code**, clique no link do **WSGI configuration file**.
2.  Apague tudo que está lá e cole o seguinte:

    ```python
    import sys
    import os
    from dotenv import load_dotenv

    # Caminho para o seu projeto
    path = '/home/SEU_USUARIO/mysite'
    if path not in sys.path:
        sys.path.append(path)

    # Carregar variáveis de ambiente
    load_dotenv(os.path.join(path, '.env'))

    # Importar a aplicação Flask
    # O arquivo backend/app.py deve ser importado.
    # Como app.py está dentro de 'backend', precisamos adicionar 'backend' ao path também
    sys.path.append(os.path.join(path, 'backend'))

    from app import app as application
    ```
    *(Lembre-se de substituir `SEU_USUARIO` pelo seu usuário real)*

3.  Clique em **Save**.

### Configurar Virtualenv
1.  Volte para a aba **Web**.
2.  Na seção **Virtualenv**, digite o caminho:
    `/home/SEU_USUARIO/mysite/venv`

## 5. Finalizar
1.  Ainda na aba **Web**, clique no botão verde **Reload**.
2.  Clique no link do seu site (ex: `seu-usuario.pythonanywhere.com`).

Se tudo der certo, seu aplicativo estará no ar!

## Dicas Importantes
- **Banco de Dados**: O arquivo `church.db` será criado automaticamente na primeira execução.
- **HTTPS**: No plano gratuito, o HTTPS já vem ativado por padrão.
- **Recarregar**: Sempre que mudar o código, você precisa clicar em **Reload** na aba Web.
