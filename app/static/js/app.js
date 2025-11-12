import * as api from "./api.js";
import * as render from "./render.js";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchStatusDiv = document.getElementById("searchStatus");

function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

let favoritosIds = new Set();
let cartMap = {};
let listaIdToItemId = {};

async function buscarItens() {
  const termo = searchInput.value.trim();
  searchStatusDiv.textContent = "Buscando itens no catálogo...";

  try {
    const itensAgrupados = await api.fetchItens(termo);

    render.renderizarResultados(itensAgrupados, cartMap, adicionarFavorito);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    searchStatusDiv.textContent = `Erro ao carregar o catálogo: ${error.message}`;
  }
}

async function adicionarFavorito(e) {
  const button = e.target.closest("[data-item-id]") || e.target;
  const itemId = button.dataset.itemId;
  const quantidade = 1;

  button.disabled = true;
  const prevText = button.textContent;
  button.textContent = "ADICIONANDO...";
  button.classList.remove("bg-secondary-at");
  button.classList.add("bg-gray-500");

  try {
    const data = await api.postAdicionarFavorito(itemId, quantidade);

    const card = button.closest("div") || button;
    const nome = button.dataset.nome || card.datasetNome || "";
    const imagem = button.dataset.imagem || card.datasetImagem || "";

    const lista_id = data.id || data.ID || data.Id || data.id;
    const qtd = data.quantidade || data.qtd || 1;

    cartMap[itemId] = {
      lista_id: lista_id,
      quantidade: qtd,
      item: { nome, imagem_url: imagem },
    };
    listaIdToItemId[lista_id] = itemId;

    render.addFavoriteDOM({
      lista_id,
      id: itemId,
      nome,
      imagem_url: imagem,
      quantidade: qtd,
    });
    render.updateCardState(itemId, { lista_id, quantidade: qtd });

    button.textContent = "ADICIONADO!";
    button.classList.remove("bg-gray-500");
    button.classList.add("bg-green-600");
    setTimeout(() => {
      button.disabled = false;
      button.textContent = prevText || "ADICIONAR";
    }, 800);
  } catch (error) {
    alert(error.message);
    button.disabled = false;
    button.textContent = prevText || "ADICIONAR";
    button.classList.remove("bg-gray-500");
    button.classList.add("bg-secondary-at");
  }
}

async function carregarLista() {
  try {
    const favoritos = await api.fetchLista();
    cartMap = {};
    listaIdToItemId = {};
    favoritos.forEach((f) => {
      cartMap[f.id] = {
        lista_id: f.lista_id,
        quantidade: f.quantidade,
        item: f,
      };
      listaIdToItemId[f.lista_id] = f.id;
    });
    render.renderizarLista(favoritos, carregarLista);
    await buscarItens();
  } catch (error) {
    console.error("Erro ao carregar lista:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarLista();
  searchButton.addEventListener("click", buscarItens);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarItens();
    }
  });

  const debounced = debounce(() => buscarItens(), 250);
  searchInput.addEventListener("input", debounced);

  const finalizarBtn = document.getElementById("finalizarBtn");
  const finalModal = document.getElementById("finalModal");
  const closeFinalModal = document.getElementById("closeFinalModal");
  const finalListContent = document.getElementById("finalListContent");

  if (finalizarBtn) {
    finalizarBtn.addEventListener("click", async () => {
      const lista = await api.fetchLista();
      finalListContent.innerHTML = "";
      if (!lista || lista.length === 0) {
        finalListContent.innerHTML =
          '<p class="text-gray-600">Nenhum item adicionado.</p>';
      } else {
        lista.forEach((i) => {
          const div = document.createElement("div");
          div.className = "flex items-center justify-between p-2 border-b";
          div.innerHTML = `<div class="flex items-center gap-3"><img src="${i.imagem_url}" class="w-10 h-10 object-contain"/><div><div class=\"font-medium\">${i.nome}</div><div class=\"text-xs text-gray-500\">Qtd: ${i.quantidade}</div></div></div>`;
          finalListContent.appendChild(div);
        });
      }
      finalModal.classList.remove("hidden");
    });

    closeFinalModal.addEventListener("click", () =>
      finalModal.classList.add("hidden")
    );
    finalModal.addEventListener("click", (e) => {
      if (e.target === finalModal) finalModal.classList.add("hidden");
    });
  }


  // final do itens favoritos


  window.addEventListener("fav-remove", async (e) => {
    const lista_id = e.detail.lista_id;
    try {
      await api.deleteRemoverFavorito(lista_id);
      const itemId = listaIdToItemId[lista_id];
      if (itemId) {
        delete cartMap[itemId];
      }
      delete listaIdToItemId[lista_id];
      render.removeFavoriteDOM(lista_id);
      if (itemId) render.updateCardState(itemId, null);
    } catch (err) {
      console.error("Erro ao remover favorito", err);
    }
  });

  window.addEventListener("fav-increment", async (e) => {
    const lista_id = e.detail.lista_id;
    const itemId = listaIdToItemId[lista_id];
    if (!itemId) return;
    try {
      const current = parseFloat(cartMap[itemId].quantidade || 1);
      const nova = current + 1;
      await api.putAtualizarQuantidade(lista_id, nova);
      cartMap[itemId].quantidade = nova;
      render.updateFavoriteQuantityDOM(lista_id, nova);
      render.updateCardState(itemId, { lista_id, quantidade: nova });
    } catch (err) {
      console.error("Erro ao incrementar quantidade", err);
    }
  });

  window.addEventListener("fav-decrement", async (e) => {
    const lista_id = e.detail.lista_id;
    const itemId = listaIdToItemId[lista_id];
    if (!itemId) return;
    try {
      const current = parseFloat(cartMap[itemId].quantidade || 1);
      const nova = Math.max(0, current - 1);
      if (nova <= 0) {
        await api.deleteRemoverFavorito(lista_id);
        delete cartMap[itemId];
        delete listaIdToItemId[lista_id];
        render.removeFavoriteDOM(lista_id);
        render.updateCardState(itemId, null);
        return;
      }
      await api.putAtualizarQuantidade(lista_id, nova);
      cartMap[itemId].quantidade = nova;
      render.updateFavoriteQuantityDOM(lista_id, nova);
      render.updateCardState(itemId, { lista_id, quantidade: nova });
    } catch (err) {
      console.error("Erro ao decrementar quantidade", err);
    }
  });
});
