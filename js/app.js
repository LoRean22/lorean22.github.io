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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tg_id: user.id,
      }),
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    alert("Пробная подписка активирована на 2 дня 🚀");

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
        <h1>MRKTPARS</h1>
        <div class="card">
          <div>
            <strong>Авито Парсер</strong>
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
    <div class="page">
      <h1>Подписки</h1>

      <div class="no-subscriptions">
        У вас нет активных подписок
      </div>

      <div class="card subscription-card action-card" id="buySubBtn">
        <div class="subscription-content">
          <div class="subscription-name">
            Купить подписку
          </div>
        </div>
      </div>

      <div class="card subscription-card action-card" id="trialBtn">
        <div class="subscription-content">
          <div class="subscription-name">
            Получить пробную подписку
          </div>
        </div>
      </div>

    </div>
  `;

  const trialBtn = document.getElementById("trialBtn");
  if (trialBtn) {
    trialBtn.addEventListener("click", activateTrial);
  }
} else {
      container.innerHTML = `
        <div class="page">
          <h1>Подписки</h1>

          <div class="card subscription-card">
            <div class="subscription-content">
              <div class="subscription-name">
                ${subscriptionData.subscription_type.toUpperCase()}
              </div>
              <div class="subscription-date">
                Действует до: ${new Date(
                  subscriptionData.subscription_expires
                ).toLocaleDateString()}
              </div>
            </div>

            <div class="subscription-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              </svg>
            </div>
          </div>
        </div>
      `;
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

              <div class="profile-top">
                <div class="username">
                  @${user.username || "без username"}
                </div>
                <div class="tg-id">
                  Telegram ID: ${user.id}
                </div>
              </div>

              <div class="profile-divider"></div>

              <div class="profile-subscription">
                <div class="subscription-title">
                  Статус подписки
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
                      Нет активной подписки
                    </div>
                    `
                }

              </div>

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

    const page = btn.dataset.page;
    renderPage(page);
  });
});

// --------------------
// SECURE LOADER
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
