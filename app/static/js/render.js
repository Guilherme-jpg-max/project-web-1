// Este módulo manipula apenas o DOM; ações (API) são disparadas via eventos e tratadas em app.js

const searchResultsDiv = document.getElementById("searchResults");
const favoritesListDiv = document.getElementById("favoritesList");
const searchStatusDiv = document.getElementById("searchStatus");

export function criarCartaoItem(
  item,
  adicionarFavoritoHandler,
  isFavorito = false
) {
  const itemElement = document.createElement("div");
  itemElement.className =
    "bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col justify-between card-min";

  // Mock de Preços
  const precoNovo = (Math.random() * 8 + 4).toFixed(2);
  const precoAntigo = (parseFloat(precoNovo) + 5).toFixed(2);

  // usa imagem de fallback se necessario
  const imgSrc =
    item.imagem_url && item.imagem_url !== ""
      ? item.imagem_url
      : "/static/img/icons/default.png";

  itemElement.innerHTML = `
          <div class="flex justify-center items-center p-3 bg-gray-50" style="min-height: 100px;">
              <img src="${imgSrc}" alt="${item.nome}" 
                   class="card-image max-h-20 object-contain">
          </div>
        <div class="p-3 flex-grow flex flex-col justify-between">
            <div>
                <p class="text-xs text-gray-500 mb-1">${item.categoria}</p>
                <p class="font-medium text-gray-800 line-clamp-2">${item.nome
    }</p>
            </div>
            <div class="mt-2">
                <p class="text-xs text-red-500 line-through">R$ ${precoAntigo}</p>
                <p class="text-lg font-bold text-red-600">R$ ${precoNovo}</p>
                <p class="text-xs text-gray-500 mt-1">unidade</p>
            </div>
        </div>
    <button data-item-id="${item.id}"
        data-nome="${(item.nome || "").replace(/\"/g, "&quot;")}"
        data-imagem="${item.imagem_url}"
        data-categoria="${item.categoria}"
        ${isFavorito && item.lista_id ? `data-lista-id="${item.lista_id}"` : ""}
        class="add-to-list-btn w-full py-2 ${isFavorito ? "bg-green-600" : "bg-secondary-at"
    } text-white font-semibold text-sm tracking-wider hover:bg-orange-700 transition duration-150 flex items-center justify-center gap-2"
            title="Adicionar à Lista">
          <span class="text-lg font-bold">+</span>
          <span class="hidden sm:inline">Adicionar</span>
        </button>
    `;

  itemElement
    .querySelector(".add-to-list-btn")
    .addEventListener("click", adicionarFavoritoHandler);

  return itemElement;
}

export function renderizarResultados(
  itensAgrupados,
  cartMap = {},
  adicionarFavoritoHandler
) {
  searchResultsDiv.innerHTML = "";
  const categorias = Object.keys(itensAgrupados);

  if (categorias.length === 0) {
    searchStatusDiv.textContent = "Nenhum item encontrado.";
    searchResultsDiv.innerHTML =
      '<p class="col-span-4 text-gray-500 p-4">Nenhum item encontrado.</p>';
    return;
  }

  searchStatusDiv.textContent = "";
  categorias.forEach((categoria) => {
    const itensDaCategoria = itensAgrupados[categoria];

    const section = document.createElement("section");
    section.className = "mb-8";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-2";
    // Mapa de ícones por categoria
    const categoriaParaIcone = {
      Laticínios: "/static/img/icons/laticionios-icon.png",
      Padaria: "/static/img/icons/padaria-icon.png",
      Hortifruti: "/static/img/icons/hortfrut-icon.png",
      Carnes: "/static/img/icons/carnes-icon.png",
      Bebidas: "/static/img/icons/Bebidas-icon.png",
      Limpeza: "/static/img/icons/limpeza-icon.png",
      Higiene: "/static/img/icons/higienene-icon.png",
      Mercearia: "/static/img/icons/mercearia-icon.png",
      Congelados: "/static/img/icons/congelados-icon.png",
      "Pet Shop": "/static/img/icons/pet-shop-icon.png",
      Eletrônicos: "/static/img/icons/eletronicos-icon.png",
      Bazar: "/static/img/icons/bazar-icon.png",
    };
    const iconeUrl =
      categoriaParaIcone[categoria] || "/static/img/icons/default.png";
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${iconeUrl}" alt="${categoria}" class="w-8 h-8 object-contain" />
        <h3 class="text-xl font-bold text-gray-800">${categoria}</h3>
      </div>`;
    section.appendChild(header);

    const navWrap = document.createElement("div");
    navWrap.className = "relative px-8";

    const leftBtn = document.createElement("button");
    leftBtn.className = `
  absolute -left-4 top-1/2 -translate-y-1/2
  w-5 h-12 flex items-center justify-center
  rounded-full shadow text-lg font-bold
  bg-secondary-at hover:bg-orange-700 transition
`;
    leftBtn.innerHTML = "‹";

    const rightBtn = document.createElement("button");
    rightBtn.className = `
  absolute -right-4 top-1/2 -translate-y-1/2
  w-5 h-12 flex items-center justify-center
  rounded-full shadow text-lg font-bold
  bg-secondary-at hover:bg-orange-700 transition
`;
    rightBtn.innerHTML = "›";

    const row = document.createElement("div");
    row.className = `flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide scroll-smooth scroll-p-4pr-8`;
    row.style.scrollBehavior = "smooth";

    itensDaCategoria.forEach((item) => {
      const favData = cartMap[item.id] || null;
      if (favData) {
        item.lista_id = favData.lista_id;
        item.quantidade = favData.quantidade;
      }
      const isFav = !!favData;
      const card = criarCartaoItem(item, adicionarFavoritoHandler, isFav);
      // flex-none evita que o card encolha no carrossel horizontal; adiciona card-min para estilos custom
      card.classList.add("flex-none", "w-[150px]", "sm:w-[180px]", "card-min");
      row.appendChild(card);
    });

    leftBtn.addEventListener("click", () => {
      row.scrollBy({
        left: -Math.round(row.clientWidth * 0.7),
        behavior: "smooth",
      });
    });
    rightBtn.addEventListener("click", () => {
      row.scrollBy({
        left: Math.round(row.clientWidth * 0.7),
        behavior: "smooth",
      });
    });

    navWrap.appendChild(leftBtn);
    navWrap.appendChild(row);
    navWrap.appendChild(rightBtn);

    section.appendChild(navWrap);
    searchResultsDiv.appendChild(section);
  });
}
export function renderizarLista(favoritos, carregarListaCallback) {
  favoritesListDiv.innerHTML = "";

  if (favoritos.length === 0) {
    favoritesListDiv.innerHTML =
      '<p class="text-gray-500">Sua lista está vazia. Adicione itens!</p>';
    return;
  }

  favoritos.forEach((item) => {
    const favImgSrc =
      item.imagem_url && item.imagem_url !== ""
        ? item.imagem_url
        : "/static/img/icons/default.png";
    const itemElement = document.createElement("div");
    itemElement.id = `fav-${item.lista_id}`;
    itemElement.className =
      "flex items-center p-3 mb-3 bg-white rounded-xl shadow hover:shadow-md transition-all border border-gray-100";

    itemElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${favImgSrc}" alt="${item.nome
      }" class="w-12 h-12 object-contain card-image">
                <div>
                    <span class="font-medium text-gray-800">${item.nome}</span>
                    <div class="flex items-center mt-1">
                        <button class="qty-btn minus bg-gray-200 px-2 py-1 rounded-l" data-lista-id="${item.lista_id
      }">-</button>
                        <span class="quantidade px-3 py-1 bg-gray-100">${item.quantidade || 1
      }</span>
                        <button class="qty-btn plus bg-gray-200 px-2 py-1 rounded-r" data-lista-id="${item.lista_id
      }">+</button>
                    </div>
                </div>
            </div>
            <button data-lista-id="${item.lista_id}"
                    class="remove-btn text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
    favoritesListDiv.appendChild(itemElement);

    itemElement.querySelector(".remove-btn").addEventListener("click", (e) => {
      const button = e.target.closest(".remove-btn");
      const listaId = button.dataset.listaId;
      window.dispatchEvent(
        new CustomEvent("fav-remove", { detail: { lista_id: listaId } })
      );
    });

    const btnPlus = itemElement.querySelector(".qty-btn.plus");
    const btnMinus = itemElement.querySelector(".qty-btn.minus");

    if (btnPlus) {
      btnPlus.addEventListener("click", () => {
        const listaId = btnPlus.dataset.listaId;
        window.dispatchEvent(
          new CustomEvent("fav-increment", { detail: { lista_id: listaId } })
        );
      });
    }

    if (btnMinus) {
      btnMinus.addEventListener("click", () => {
        const listaId = btnMinus.dataset.listaId;
        window.dispatchEvent(
          new CustomEvent("fav-decrement", { detail: { lista_id: listaId } })
        );
      });
    }
  });
}

export function addFavoriteDOM(fav) {
  const item = fav;
  const itemElement = document.createElement("div");
  itemElement.id = `fav-${item.lista_id}`;
  itemElement.className =
    "flex items-center justify-between p-3 mb-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all";

  itemElement.innerHTML = `
    <div class="flex items-center space-x-3">
      <img src="${item.imagem_url}" alt="${item.nome
    }" class="w-12 h-12 object-contain">
      <div>
        <span class="font-medium text-gray-800">${item.nome}</span>
        <div class="flex items-center mt-1">
          <button class="qty-btn minus bg-gray-200 px-2 py-1 rounded-l" data-lista-id="${item.lista_id
    }">-</button>
          <span class="quantidade px-3 py-1 bg-gray-100">${item.quantidade || 1
    }</span>
          <button class="qty-btn plus bg-gray-200 px-2 py-1 rounded-r" data-lista-id="${item.lista_id
    }">+</button>
        </div>
      </div>
    </div>
    <button data-lista-id="${item.lista_id
    }" class="remove-btn text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-all">X</button>
  `;

  favoritesListDiv.appendChild(itemElement);
  const removeBtn = itemElement.querySelector(".remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      const listaId = removeBtn.dataset.listaId;
      window.dispatchEvent(
        new CustomEvent("fav-remove", { detail: { lista_id: listaId } })
      );
    });
  }

  const btnPlus = itemElement.querySelector(".qty-btn.plus");
  const btnMinus = itemElement.querySelector(".qty-btn.minus");
  if (btnPlus) {
    btnPlus.addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("fav-increment", {
          detail: { lista_id: btnPlus.dataset.listaId },
        })
      );
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("fav-decrement", {
          detail: { lista_id: btnMinus.dataset.listaId },
        })
      );
    });
  }
}

export function removeFavoriteDOM(lista_id) {
  const el = document.getElementById(`fav-${lista_id}`);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

export function updateFavoriteQuantityDOM(lista_id, quantidade) {
  const el = document.getElementById(`fav-${lista_id}`);
  if (!el) return;
  const span = el.querySelector(".quantidade");
  if (span) span.textContent = quantidade;
}

export function updateCardState(itemId, favData) {
  const cardBtn = document.querySelector(`[data-item-id=\"${itemId}\"]`);
  if (!cardBtn) return;
  if (favData) {
    cardBtn.classList.remove("bg-secondary-at");
    cardBtn.classList.add("bg-green-600");
    cardBtn.setAttribute("data-lista-id", favData.lista_id);
  } else {
    cardBtn.classList.remove("bg-green-600");
    cardBtn.classList.add("bg-secondary-at");
    cardBtn.removeAttribute("data-lista-id");
  }
}