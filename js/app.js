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
      subscriptionData && subscriptionData.subscription_type;

    if (!hasSubscription) {
      container.innerHTML = `
        <h1>Подписки</h1>

        <div class="no-subscriptions">
          У вас нет активных подписок
        </div>

        <div class="card subscription-card buy-card">
          <div class="subscription-content">
            <div class="subscription-name">
              Купить подписку
            </div>
          </div>

          <div class="subscription-icon">
            <!-- твоя новая иконка -->
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.954 16.92c-.442-.86-.97-1.673-1.576-2.426a3.87 3.87 0 0 0-1.706-1.147a1.54 1.54 0 0 0-.928.07c-.49.15-1.078.449-1.597.638c-.29.11-.539.23-.698.12a2.2 2.2 0 0 1-.49-.519c-.398-.549-.728-1.237-1.077-1.706a5.4 5.4 0 0 0-1.507-1.457a1.656 1.656 0 0 0-2.504.888a2.35 2.35 0 0 0 .11 1.647q.293.677.738 1.267q1.001 1.16 1.866 2.425c.17.279.359.568.509.858"/>
            </svg>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
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
            <!-- шестеренка -->
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>
            </svg>
          </div>
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
