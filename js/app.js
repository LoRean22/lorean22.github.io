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

    // Обновляем данные подписки
    await initUser();
    renderPage("profile");

  } catch (err) {
    console.error("Ошибка trial:", err);
  }
}

// --------------------
// РЕНДЕР СТРАНИЦ
// --------------------

function renderPage(page) {
  if (page === "info") {
    container.innerHTML = `
      <h1>MRKTPARS</h1>
      <div class="card">
        <div>
          <strong>Авито Парсер</strong>
          <span>Следи за выгодными объявлениями</span>
        </div>
      </div>
    `;
  }

  if (page === "subscriptions") {

    const hasSubscription =
      subscriptionData &&
      subscriptionData.subscription_type &&
      subscriptionData.subscription_expires &&
      new Date(subscriptionData.subscription_expires) > new Date();

    if (!hasSubscription) {
      container.innerHTML = `
        <h1>Подписки</h1>

        <div style="text-align:center; margin-top:60px; color: var(--muted); font-size:15px;">
          У вас нет активных подписок
        </div>

        <button class="primary-btn" style="margin-top:40px;">
          Купить подписку
        </button>
      `;
    } else {
      container.innerHTML = `
        <h1>Подписки</h1>

        <div class="card profile-card">
          <div>
            <strong>${subscriptionData.subscription_type.toUpperCase()}</strong>
            <div class="hint">
              Действует до: ${new Date(
                subscriptionData.subscription_expires
              ).toLocaleDateString()}
            </div>
          </div>
          <button class="secondary-btn" style="width:auto; margin:0;">
            Настроить
          </button>
        </div>
      `;
    }
  }


  if (page === "profile") {
    const user = window.tgUser;

    container.innerHTML = `
      <h1>Профиль</h1>
      ${
        user
          ? `
          <div class="card profile-card">
            <div class="username">
              @${user.username || "без username"}
            </div>
            <div class="tg-id">
              Telegram ID: ${user.id}
            </div>
          </div>

          <div class="card profile-card">
            <div class="subscription-title">
              Текущая подписка
            </div>
            <div class="subscription-value">
              ${
                subscriptionData && subscriptionData.subscription_type
                  ? subscriptionData.subscription_type.toUpperCase()
                  : "Нет активной подписки"
              }
            </div>
              ${
                subscriptionData && subscriptionData.subscription_expires
                  ? `<div class="hint">
                      Действует до: ${new Date(
                        subscriptionData.subscription_expires
                      ).toLocaleDateString()}
                    </div>`
                  : ""
              }
          </div>

          ${
            !subscriptionData ||
            !subscriptionData.subscription_type
              ? `
              <button class="primary-btn" id="trialBtn">
                Получить пробную подписку (2 дня)
              </button>
              `
              : ""
          }
          `
          : `
          <div class="card">
            <strong>Нет данных пользователя</strong>
          </div>
          `
      }
    `;

    // Навешиваем обработчик на кнопку trial
    const trialBtn = document.getElementById("trialBtn");
    if (trialBtn) {
      trialBtn.addEventListener("click", activateTrial);
    }
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
// ЗАПУСК
// --------------------

(async () => {
  await initUser();
  renderPage("info");
})();
