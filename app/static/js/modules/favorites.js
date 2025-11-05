import * as api from "../api.js";
import * as render from "../render.js";

export async function carregarLista(state) {
  try {
    const favoritos = await api.fetchLista();
    state.cartMap = {};
    state.listaIdToItemId = {};
    favoritos.forEach((f) => {
      state.cartMap[f.id] = {
        lista_id: f.lista_id,
        quantidade: f.quantidade,
        item: f,
      };
      state.listaIdToItemId[f.lista_id] = f.id;
    });
    render.renderizarLista(favoritos);
    return favoritos;
  } catch (err) {
    console.error("Erro ao carregar lista:", err);
    return [];
  }
}

export function setupFavoritesEvents(state) {
  window.addEventListener("fav-remove", async (e) => {
    const lista_id = e.detail.lista_id;
    try {
      await api.deleteRemoverFavorito(lista_id);
      const itemId = state.listaIdToItemId[lista_id];
      if (itemId) delete state.cartMap[itemId];
      delete state.listaIdToItemId[lista_id];
      render.removeFavoriteDOM(lista_id);
      if (itemId) render.updateCardState(itemId, null);
    } catch (err) {
      console.error("Erro ao remover favorito", err);
    }
  });

  window.addEventListener("fav-increment", async (e) => {
    const lista_id = e.detail.lista_id;
    const itemId = state.listaIdToItemId[lista_id];
    if (!itemId) return;
    try {
      const current = parseFloat(state.cartMap[itemId].quantidade || 1);
      const nova = current + 1;
      await api.putAtualizarQuantidade(lista_id, nova);
      state.cartMap[itemId].quantidade = nova;
      render.updateFavoriteQuantityDOM(lista_id, nova);
      render.updateCardState(itemId, { lista_id, quantidade: nova });
    } catch (err) {
      console.error("Erro ao incrementar quantidade", err);
    }
  });

  window.addEventListener("fav-decrement", async (e) => {
    const lista_id = e.detail.lista_id;
    const itemId = state.listaIdToItemId[lista_id];
    if (!itemId) return;
    try {
      const current = parseFloat(state.cartMap[itemId].quantidade || 1);
      const nova = Math.max(0, current - 1);
      if (nova <= 0) {
        await api.deleteRemoverFavorito(lista_id);
        delete state.cartMap[itemId];
        delete state.listaIdToItemId[lista_id];
        render.removeFavoriteDOM(lista_id);
        render.updateCardState(itemId, null);
        return;
      }
      await api.putAtualizarQuantidade(lista_id, nova);
      state.cartMap[itemId].quantidade = nova;
      render.updateFavoriteQuantityDOM(lista_id, nova);
      render.updateCardState(itemId, { lista_id, quantidade: nova });
    } catch (err) {
      console.error("Erro ao decrementar quantidade", err);
    }
  });
}
