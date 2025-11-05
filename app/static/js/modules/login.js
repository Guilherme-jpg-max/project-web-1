export function initLogin() {
  const loginForm = document.querySelector("form#loginForm");
  if (!loginForm) return;
  loginForm.addEventListener("submit", (e) => {
    const btn = loginForm.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
  });
}
