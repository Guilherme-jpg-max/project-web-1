# Projeto Lista de Mercado — Estrutura e Mapeamento

Este documento descreve a organização do projeto, onde cada requisito foi implementado, e como os módulos JavaScript, Flask e Tailwind se integram.

## Resumo

- Framework backend: Flask + Flask-SQLAlchemy (SQLite).
- Frontend: HTML/Jinja2 + Tailwind CSS (CDN) + JavaScript modular (ES Modules).
- Objetivo principal: permitir adicionar itens com quantidade, editar quantidades, remover sem confirmação e atualizar apenas os elementos afetados no DOM.

## Estrutura de arquivos (relevante)

```
app/
  __init__.py         # create_app() e init_db() (seeding, criação do DB)
  models.py           # Modelos SQLAlchemy: Item, ListaMercado (campo quantidade)
  routes.py           # Rotas Flask e API endpoints (/api/itens, /api/lista, /api/lista/<id>)
  templates/
    home.html         # Página principal (carrega módulos JS em static/js/modules/home.js)
    login.html
static/
  js/
    api.js            # Helpers HTTP (fetch) para comunicar com as rotas Flask
    render.js         # Módulo DOM-only: cria cartões, lista lateral, e dispatch de eventos
    modules/
      home.js         # tailwindcss da página: inicializa busca, favoritos e modal
      search.js       # Busca, debounce e handler de "Adicionar" (usa api.js e render.js)
      favorites.js    # Carrega a lista, administra eventos fav-remove/fav-increment/fav-decrement
      login.js        # Comportamento opcional do formulário de login
templates/
  home.html           # — carrega o módulo principal: /static/js/modules/home.js
```

## Mapeamento de requisitos para arquivos

- TemplateNotFound (erro inicial)

  - Solução: os templates foram movidos para `app/templates/` (padrão Flask). Arquivos: `app/templates/login.html`, `app/templates/home.html`.

- Servir arquivos estáticos (404 em app.js)

  - Solução: `static/` está dentro do pacote `app/` como `app/static/`. Arquivos JS estão em `app/static/js/`.

- Permitir múltiplas quantidades e persistência

  - Model: `app/models.py` — `ListaMercado.quantidade` (float).
  - API: `app/routes.py` —
    - `GET /api/lista` retorna entradas com `lista_id`, `id` (item id), `quantidade`, `nome`, `imagem_url`.
    - `POST /api/lista` agora incrementa `quantidade` caso o item já exista na lista.
    - `PUT /api/lista/<lista_id>` permite definir a quantidade explicitamente.

- Comunicação com backend via fetch (centralizada)

  - `app/static/js/api.js` — contém `fetchItens`, `fetchLista`, `postAdicionarFavorito`, `deleteRemoverFavorito`, `putAtualizarQuantidade`.
  - Todos os módulos JS usam estas funções para comunicar com Flask.

- Separação de responsabilidades no frontend (modularização JS)

  - `app/static/js/modules/home.js` — tailwindcss da página; injeta modal e inicializa recursos.
  - `app/static/js/modules/search.js` — lógica de busca, debounce e ação de adicionar item (chama `api.postAdicionarFavorito` e atualiza DOM via `render.js`).
  - `app/static/js/modules/favorites.js` — carregamento inicial da lista (`api.fetchLista`) e listeners globais para `fav-remove`, `fav-increment`, `fav-decrement` (realizam `api.putAtualizarQuantidade` / `api.deleteRemoverFavorito` e atualizam DOM via `render.js`).
  - `app/static/js/modules/login.js` — pequeno utilitário para o formulário de login (evita double-submit).
  - `app/static/js/render.js` — módulo DOM-only que cria os cartões e a lista lateral e dispara eventos globais quando o usuário interage (remoção, +, -). Também expõe helpers que os controladores utilizam para alterar apenas os nós afetados (`addFavoriteDOM`, `removeFavoriteDOM`, `updateFavoriteQuantityDOM`, `updateCardState`).

- UI: categorias verticais com carrossel horizontal e setas

  - Implementado em `app/static/js/render.js` (renderizarResultados): cada categoria é uma seção vertical contendo uma linha horizontal com `overflow-x-auto`, `whitespace-nowrap` e botões "‹ / ›" para rolar.
  - Tailwind classes de responsividade e utilitários aplicadas diretamente nos templates e nos elementos gerados pelo JS.

- Atualizações incrementais do DOM
  - `render.js` é estritamente responsável por criar/remover/atualizar nós DOM e por emitir eventos quando o usuário age.
  - `modules/*` (especialmente `search.js` e `favorites.js`) chamam a API e em seguida usam os helpers exportados por `render.js` para atualizar apenas os elementos afetados.

## Como rodar localmente

1. (Recomendado) Crie e ative um venv Python 3.8+.
2. Instale dependências:

```powershell
pip install -r requirements.txt
```

3. Se houve alteração de modelo (ex.: campo `quantidade`) remova o DB antigo para que `init_db()` haga o seed corretamente:

```powershell
Remove-Item .\instance\mercado.db -ErrorAction SilentlyContinue
python run.py
```

4. Abra http://127.0.0.1:5000/ no navegador e teste a busca, adicionar, +/-, remoção e o modal "Finalizar Lista".

## Notas de desenvolvimento

- A modularização mantém `app/static/js/api.js` e `app/static/js/render.js` como peças reutilizáveis; os módulos na pasta `modules/` orquestram comportamento específico da página.
- Eventos globais (`fav-remove`, `fav-increment`, `fav-decrement`) desacoplam a camada de render (DOM) da camada de controle (API + estado local).
- Ao modificar nomes de IDs/classes no template, verifique se os módulos JS referenciam os mesmos IDs: `searchInput`, `searchButton`, `searchStatus`, `searchResults`, `favoritesList`, `finalizarBtn`, `finalModal`, `closeFinalModal`, `finalListContent`.

## Próximos passos sugeridos

- Migrar `api.js` e `render.js` para a pasta `modules/` e ajustar imports para manter tudo agrupado.
- Adicionar testes unitários simples para as funções pure JS (ex.: helpers de formatação) e testes de integração para as rotas Flask.
- Criar um pequeno script de migração (Alembic) se quiser preservar dados entre mudanças de modelo.

---

Se quiser, posso: (A) mover `api.js` e `render.js` para `modules/` (bateria de renames + atualizar imports), (B) rodar o processo de recriação do DB aqui (se autorizar), ou (C) adicionar um pequeno teste que valida a API `POST /api/lista`/`PUT /api/lista/<id>`.
