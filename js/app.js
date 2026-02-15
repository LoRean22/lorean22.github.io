const container = document.getElementById("page-container");
const buttons = document.querySelectorAll(".bottom-nav button");

const API_BASE = "https://api.mrktpars.ru";

let subscriptionData = null;
let currentParserLink = null;

// --------------------
// INIT USER
// --------------------

async function initUser() {
  const user = window.tgUser;
  if (!user) return;

  try {
    const response = await fetch(`${API_BASE}/users/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tg_id: user.id,
        username: user.username,
      }),
    });

    if (!response.ok) return;

    subscriptionData = await response.json();

    // Проверяем есть ли закрепленная ссылка
    await loadParserLink();

  } catch (err) {
    console.error(err);
  }
}

// --------------------
// LOAD PARSER LINK
// --------------------

async function loadParserLink() {
  const user = window.tgUser;
  if (!user) return;

  try {
    const res = await fetch(`${API_BASE}/parser/get-link?tg_id=${user.id}`);
    if (!res.ok) return;

    const data = await res.json();
    currentParserLink = data.link || null;

  } catch (err) {
    console.error(err);
  }
}

// --------------------
// SAVE PARSER LINK
// --------------------

async function saveParserLink(link) {
  const user = window.tgUser;
  if (!user) return;

  await fetch(`${API_BASE}/parser/set-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tg_id: user.id,
      link: link,
    }),
  });

  currentParserLink = link;
}

// --------------------
// REMOVE PARSER LINK
// --------------------

async function removeParserLink() {
  const user = window.tgUser;
  if (!user) return;

  await fetch(`${API_BASE}/parser/remove-link`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tg_id: user.id,
    }),
  });

  currentParserLink = null;
}

// --------------------
// ACTIVATE TRIAL
// --------------------

async function activateTrial() {
  const user = window.tgUser;
  if (!user) return;

  const response = await fetch(`${API_BASE}/users/trial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tg_id: user.id }),
  });

  const data = await response.json();
  if (data.error) {
    alert(data.error);
    return;
  }

  await initUser();
  renderPage("subscriptions");
}

// --------------------
// RENDER
// --------------------

function renderPage(page) {

  // ---------------- SUBSCRIPTIONS ----------------

  if (page === "subscriptions") {

    const hasSubscription =
      subscriptionData && subscriptionData.subscription_type;

    if (!hasSubscription) {
      container.innerHTML = `
        <div class="page">
          <h1>Подписки</h1>
          <div class="card">
            <div class="subscription-title">Статус:</div>
            <div class="subscription-badge inactive">
              Подписка отсутствует
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="page">
        <h1>Подписки</h1>

        <div class="card action-card" id="openParser">
          <div>
            <div class="subscription-name">
              ${subscriptionData.subscription_type.toUpperCase()}
            </div>
            <div class="hint">
              Действует до: ${new Date(
                subscriptionData.subscription_expires
              ).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("openParser")
      .addEventListener("click", () => {
        renderPage("parserSettings");
      });
  }

  // ---------------- PARSER SETTINGS ----------------

  if (page === "parserSettings") {

    container.innerHTML = `
      <div class="page">

        <button id="backBtn" style="margin:20px 16px 0;background:none;border:none;color:#6b7280;cursor:pointer;">
          ← Назад
        </button>

        <h1>Настройка парсера</h1>

        <div class="card">
          <input 
            id="parserInput"
            type="text" 
            placeholder="Вставьте ссылку Avito..."
            value="${currentParserLink || ""}"
            style="width:100%;padding:14px;background:#0f1622;border:1px solid rgba(44,53,72,0.6);border-radius:12px;color:#e6f1ff;"
          >
        </div>

        <div class="subscription-actions">

          ${
            currentParserLink
              ? `
                <div class="card action-card" id="removeLinkBtn">
                  <div class="subscription-name">
                    Отключить ссылку
                  </div>
                </div>
              `
              : `
                <div class="card action-card" id="startParserBtn">
                  <div class="subscription-name">
                    Запустить парсер
                  </div>
                </div>
              `
          }

        </div>

      </div>
    `;

    document
      .getElementById("backBtn")
      .addEventListener("click", () => {
        renderPage("subscriptions");
      });

    // Если ссылки нет — запускаем
    const startBtn = document.getElementById("startParserBtn");
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        const link = document.getElementById("parserInput").value.trim();
        if (!link) {
          alert("Введите ссылку");
          return;
        }

        await saveParserLink(link);
        alert("Ссылка сохранена ✅");

        renderPage("parserSettings");
      });
    }

    // Если ссылка есть — отключаем
    const removeBtn = document.getElementById("removeLinkBtn");
    if (removeBtn) {
      removeBtn.addEventListener("click", async () => {
        await removeParserLink();
        alert("Ссылка отключена ❌");

        renderPage("parserSettings");
      });
    }
  }

  // ---------------- PROFILE ----------------

  if (page === "profile") {
    const user = window.tgUser;

    container.innerHTML = `
      <div class="page">
        <h1>Профиль</h1>
        <div class="card">
          <div class="username">@${user.username}</div>
          <div class="tg-id">Telegram ID: ${user.id}</div>
        </div>
      </div>
    `;
  }
}

// --------------------
// NAVIGATION
// --------------------

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderPage(btn.dataset.page);
  });
});

// --------------------
// START
// --------------------

(async () => {
  await initUser();
  renderPage("subscriptions");
})();
