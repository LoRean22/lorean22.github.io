const container = document.getElementById("page-container");
const buttons = document.querySelectorAll(".bottom-nav button");

const API_BASE = "https://api.mrktpars.ru";

let subscriptionData = null;

// --------------------
// ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ
// --------------------

async function initUser() {
  const user = window.tgUser;

  if (!user) {
    console.log("Нет tgUser");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tg_id: user.id,
        username: user.username,
      }),
    });

    if (!response.ok) {
      console.error("Ошибка backend:", response.status);
      return;
    }

    subscriptionData = await response.json();
    console.log("Данные подписки:", subscriptionData);

  } catch (err) {
    console.error("Ошибка соединения:", err);
  }
}

// --------------------
// АКТИВАЦИЯ TRIAL
// --------------------

async function activateTrial() {
  const user = window.tgUser;
  if (!user) return;

  try {
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

    alert("Пробная подписка активирована 🚀");

    await initUser();
    renderPage("subscriptions");

  } catch (err) {
    console.error("Ошибка trial:", err);
  }
}

// --------------------
// РЕНДЕР СТРАНИЦ
// --------------------

function renderPage(page) {

  // INFO
  if (page === "info") {
    container.innerHTML = `
      <div class="page">
        <h1>Информация</h1>
        <div class="card">
          <div>
            <strong>MRKTPARS</strong>
            <span>Следи за выгодными объявлениями</span>
          </div>
        </div>
      </div>
    `;
  }

  // SUBSCRIPTIONS
  if (page === "subscriptions") {

    const hasSubscription =
      subscriptionData && subscriptionData.subscription_type;

    if (!hasSubscription) {

      container.innerHTML = `
        <div class="page subscriptions-page">
          <h1>Подписки</h1>

          <div class="card profile-unified">
            <div class="subscription-title">Статус:</div>
            <div class="subscription-badge inactive">
              Подписка отсутствует
            </div>
            <div class="hint">
              Для доступа к функциям необходимо активировать подписку
            </div>
          </div>

          <div class="subscription-actions">
            <div class="card action-card" id="buySubBtn">
              <div class="subscription-name">
                Купить подписку
              </div>
            </div>

            <div class="card action-card" id="trialBtn">
              <div class="subscription-name">
                Получить пробную подписку
              </div>
            </div>

            <div class="card action-card" id="activateKeyBtn">
              <div class="subscription-name">
                Ввести ключ активации
              </div>
            </div>
          </div>
        </div>
      `;

      const trialBtn = document.getElementById("trialBtn");
      if (trialBtn) trialBtn.addEventListener("click", activateTrial);

      const activateKeyBtn = document.getElementById("activateKeyBtn");
      if (activateKeyBtn) {
        activateKeyBtn.addEventListener("click", () => {
          alert("Функция активации ключа скоро будет доступна 🔐");
        });
      }

    } else {

      container.innerHTML = `
        <div class="page">
          <h1>Подписки</h1>

          <div class="card action-card" id="openParserSettings">
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

      const openParserSettings =
        document.getElementById("openParserSettings");

      if (openParserSettings) {
        openParserSettings.addEventListener("click", () => {
          renderPage("parserSettings");
        });
      }
    }
  }

  // PARSER SETTINGS
  if (page === "parserSettings") {

    container.innerHTML = `
      <div class="page">

        <button id="backBtn" style="
          margin: 20px 16px 0;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
        ">
          ← Назад
        </button>

        <h1>Настройка парсера</h1>

        <div class="card">
          <div style="width:100%">
            <label class="subscription-title">
              Ссылка на поиск
            </label>

            <input 
              type="text" 
              placeholder="Вставьте ссылку Avito..."
              style="
                width:100%;
                margin-top:8px;
                padding:14px;
                background:#0f1622;
                border:1px solid rgba(44,53,72,0.6);
                border-radius:12px;
                color:#e6f1ff;
                outline:none;
              "
            >
          </div>
        </div>

        <div class="subscription-actions">
          <div class="card action-card">
            <div class="subscription-name">
              Запустить парсер
            </div>
          </div>
        </div>

      </div>
    `;

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        renderPage("subscriptions");
      });
    }
  }

  // PROFILE
  if (page === "profile") {
    const user = window.tgUser;

    container.innerHTML = `
      <div class="page">
        <h1>Профиль</h1>

        ${
          user
            ? `
            <div class="card profile-unified">

              <div class="username">
                @${user.username || "без username"}
              </div>

              <div class="tg-id">
                Telegram ID: ${user.id}
              </div>

              <div class="profile-divider"></div>

              <div class="subscription-title">
                Статус:
              </div>

              ${
                subscriptionData && subscriptionData.subscription_type
                  ? `
                  <div class="subscription-badge active">
                    ${subscriptionData.subscription_type.toUpperCase()}
                  </div>
                  <div class="hint">
                    Действует до: ${new Date(
                      subscriptionData.subscription_expires
                    ).toLocaleDateString()}
                  </div>
                  `
                  : `
                  <div class="subscription-badge inactive">
                    Подписка отсутствует
                  </div>
                  `
              }

            </div>
            `
            : `
            <div class="card">
              <strong>Нет данных пользователя</strong>
            </div>
            `
        }
      </div>
    `;
  }
}

// --------------------
// НАВИГАЦИЯ
// --------------------

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderPage(btn.dataset.page);
  });
});

// --------------------
// LOADER
// --------------------

window.addEventListener("load", () => {
  const loader = document.getElementById("secure-loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 700);
  }
});

// --------------------
// ЗАПУСК
// --------------------

(async () => {
  await initUser();
  renderPage("info");
})();
