export async function fetchItens(termo = "") {
  const response = await fetch(`/api/itens?q=${termo}`);
  if (!response.ok) {
    throw new Error("Falha na busca dos itens.");
  }
  return response.json();
}
export async function fetchLista() {
  const response = await fetch("/api/lista");
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function postAdicionarFavorito(itemId, quantidade = 1.0) {
  const response = await fetch("/api/lista", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId, quantidade }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || data.mensagem || "Erro ao adicionar item.");
  }
  return data;
}

export async function deleteRemoverFavorito(listaId) {
  const response = await fetch(`/api/lista/${listaId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || data.mensagem || "Erro ao remover item.");
  }
  return data;
}

export async function putAtualizarQuantidade(listaId, quantidade) {
  const response = await fetch(`/api/lista/${listaId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantidade }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.erro || data.mensagem || "Erro ao atualizar quantidade."
    );
  }
  return data;
}
