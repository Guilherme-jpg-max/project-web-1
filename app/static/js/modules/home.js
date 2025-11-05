import { setupSearch } from "./search.js";
import { carregarLista, setupFavoritesEvents } from "./favorites.js";
import { initLogin } from "./login.js";

document.addEventListener("DOMContentLoaded", async () => {
  const state = { cartMap: {}, listaIdToItemId: {} };

  await carregarLista(state);

  setupFavoritesEvents(state);

  const searchApi = setupSearch(state);
  try {
    if (searchApi && typeof searchApi.buscarItens === "function") {
      await searchApi.buscarItens();
    }
  } catch (err) {
    console.error("Erro no carregamento inicial dos itens:", err);
  }

  const finalizarBtn = document.getElementById("finalizarBtn");
  const finalModal = document.getElementById("finalModal");
  const closeFinalModal = document.getElementById("closeFinalModal");
  const finalListContent = document.getElementById("finalListContent");

  if (finalizarBtn) {
    finalizarBtn.addEventListener("click", async () => {
      const api = await import("../api.js");
      finalListContent.innerHTML = "";
      try {
        const lista = await api.fetchLista();
        if (!lista || lista.length === 0) {
          finalListContent.innerHTML =
            '<p class="text-gray-600">Nenhum item adicionado.</p>';
        } else {
          let totalItens = 0;
          const categorias = {};

          lista.forEach((item) => {
            if (!categorias[item.categoria]) {
              categorias[item.categoria] = [];
            }
            categorias[item.categoria].push(item);
            totalItens += item.quantidade;
          });

          const header = document.createElement("div");
          header.className = "mb-6 pb-4 border-b border-gray-200";
          header.innerHTML = `
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-lg font-semibold text-gray-800">Lista de Compras</h4>
              <span class="text-sm text-gray-500">${totalItens} ${totalItens === 1 ? "item" : "itens"
            }</span>
            </div>
          `;
          finalListContent.appendChild(header);

          Object.entries(categorias).forEach(([categoria, itens]) => {
            const categoriaDiv = document.createElement("div");
            categoriaDiv.className = "mb-6";

            // Cabeçalho da categoria
            const categoriaHeader = document.createElement("div");
            categoriaHeader.className = "flex items-center gap-2 mb-3";
            categoriaHeader.innerHTML = `
              <img src="/static/img/icons/${categoria
                .toLowerCase()
                .replace(" ", "-")}-icon.png" 
                   class="w-6 h-6 object-contain" />
              <h5 class="font-medium text-gray-700">${categoria}</h5>
            `;
            categoriaDiv.appendChild(categoriaHeader);

            itens.forEach((item) => {
              const itemDiv = document.createElement("div");
              itemDiv.className =
                "flex items-center justify-between p-2 mb-2 bg-gray-50 rounded-lg";
              itemDiv.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="bg-white rounded-lg p-1.5 w-12 h-12 flex items-center justify-center">
                    <img src="${item.imagem_url}" class="max-w-full max-h-full object-contain"/>
                  </div>
                  <div>
                    <div class="font-medium text-gray-800">${item.nome}</div>
                    <div class="text-sm text-gray-500">
                      Quantidade: <span class="font-medium">${item.quantidade}</span>
                    </div>
                  </div>
                </div>
              `;
              categoriaDiv.appendChild(itemDiv);
            });

            finalListContent.appendChild(categoriaDiv);
          });
        }
        finalModal.classList.remove("hidden");
      } catch (err) {
        finalListContent.innerHTML = `<p class="text-red-600">Erro ao carregar lista: ${err.message}</p>`;
        finalModal.classList.remove("hidden");
      }
    });

    closeFinalModal.addEventListener("click", () =>
      finalModal.classList.add("hidden")
    );
    finalModal.addEventListener("click", (e) => {
      if (e.target === finalModal) finalModal.classList.add("hidden");
    });
  }
  const toggleFavBtn = document.getElementById("toggleFavoritesBtn");
  const favoritesAside = document.getElementById("favoritesAside");
  if (toggleFavBtn && favoritesAside) {
    toggleFavBtn.addEventListener("click", () => {
      if (favoritesAside.classList.contains("hidden")) {
        favoritesAside.classList.remove("hidden");
        favoritesAside.classList.add(
          "fixed",
          "inset-0",
          "bg-white",
          "p-4",
          "z-50",
          "overflow-auto"
        );
        const close = document.createElement("button");
        close.id = "closeFavPanel";
        close.className =
          "absolute top-4 right-4 text-gray-600 bg-gray-100 px-3 py-1 rounded";
        close.textContent = "Fechar";
        favoritesAside.appendChild(close);
        close.addEventListener("click", () => {
          favoritesAside.classList.add("hidden");
          favoritesAside.classList.remove(
            "fixed",
            "inset-0",
            "bg-white",
            "p-4",
            "z-50",
            "overflow-auto"
          );
          close.remove();
        });
      } else {
        favoritesAside.classList.add("hidden");
      }
    });
  }
});
