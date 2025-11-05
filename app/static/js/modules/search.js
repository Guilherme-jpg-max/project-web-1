import * as api from "../api.js";
import * as render from "../render.js";

function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function setupSearch(state) {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchStatusDiv = document.getElementById("searchStatus");

  async function buscarItens() {
    const termo = (searchInput && searchInput.value.trim()) || "";
    if (searchStatusDiv)
      searchStatusDiv.textContent = "Buscando itens no catálogo...";
    try {
      const itensAgrupados = await api.fetchItens(termo);
      render.renderizarResultados(
        itensAgrupados,
        state.cartMap,
        adicionarFavorito
      );
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      if (searchStatusDiv)
        searchStatusDiv.textContent = `Erro ao carregar o catálogo: ${error.message}`;
    }
  }

  async function adicionarFavorito(e) {
    const button = e.target.closest("[data-item-id]") || e.target;
    const itemId = button.dataset.itemId;
    const quantidade = 1;

    button.disabled = true;
    const prevHtml = button.innerHTML;
    button.innerHTML = '<span class="text-sm">ADICIONANDO...</span>';
    button.classList.remove("bg-secondary-at");
    button.classList.add("bg-gray-500");

    try {
      const data = await api.postAdicionarFavorito(itemId, quantidade);

      const card = button.closest("div") || button;
      const nome = button.dataset.nome || card.datasetNome || "";
      const imagem = button.dataset.imagem || card.datasetImagem || "";

      const lista_id =
        data.id || data.ID || data.Id || data.lista_id || data.id;
      const qtd = data.quantidade || data.qtd || 1;

      state.cartMap[itemId] = {
        lista_id: lista_id,
        quantidade: qtd,
        item: { nome, imagem_url: imagem },
      };
      state.listaIdToItemId[lista_id] = itemId;

      render.addFavoriteDOM({
        lista_id,
        id: itemId,
        nome,
        imagem_url: imagem,
        quantidade: qtd,
      });
      render.updateCardState(itemId, { lista_id, quantidade: qtd });

      button.innerHTML = '<span class="text-sm">ADICIONADO</span>';
      button.classList.remove("bg-gray-500");
      button.classList.add("bg-green-600");
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML =
          prevHtml ||
          '<span class="text-lg font-bold">+</span><span class="hidden sm:inline">Adicionar</span>';
      }, 700);
    } catch (error) {
      alert(error.message);
      button.disabled = false;
      button.innerHTML = prevHtml || "Adicionar";
      button.classList.remove("bg-gray-500");
      button.classList.add("bg-secondary-at");
    }
  }

  if (searchButton) searchButton.addEventListener("click", buscarItens);
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarItens();
      }
    });
    const deb = debounce(() => buscarItens(), 250);
    searchInput.addEventListener("input", deb);
  }
  return { buscarItens, adicionarFavorito };
}
