/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИНЪЕКЦИЙ ГОРОДСКИХ ИНТЕРФЕЙСОВ И НАСТРОЕК (v5.7.65-FIX)
   ========================================================================== */

function injectTownScreensDOM() {
    const infoScr = document.getElementById('info-screen');
    if (infoScr) {
        infoScr.innerHTML = `
            <h2>Справка Мира</h2>
            <div id="info-screen-text" style="text-align: left; font-size: 13px; max-height: 50vh; overflow-y: auto; margin-bottom: 15px;"></div>
            <button id="from-info-to-menu-btn" class="menu-btn back-btn" style="width: 100%;">Закрыть</button>
        `;
    }

    const selectScr = document.getElementById('dragon-select-screen');
    if (selectScr) {
        selectScr.innerHTML = `
            <h2 id="adventure-screen-title">Выбор Рейда</h2>
            <span id="adventure-screen-subtitle" class="subtitle">Выберите тир дракона</span>
            <div id="dragon-levels-grid" style="display: flex; flex-direction: column; width: 100%; max-height: 50vh; overflow-y: auto; gap: 4px;"></div>
            <button id="from-select-to-menu-btn" class="menu-btn back-btn" style="width: 100%;">Назад в меню</button>
        `;
    }

    const modeScr = document.getElementById('mode-desc-screen');
    if (modeScr) {
        modeScr.innerHTML = `
            <h2 id="mode-desc-title">Строение</h2>
            <div id="mode-desc-text" style="text-align: left; font-size: 13px; margin-bottom: 15px; color: #bfae96;"></div>
            <button id="mode-buy-btn" class="menu-btn" style="width: 100%; background: linear-gradient(to bottom, #1d3a1e, #0f2110); border-color: #316e34; margin-bottom: 8px; display: none;">Действие</button>
            <button class="menu-btn back-btn" style="width: 100%; margin-top: 0;" onclick="window.closeModeDescriptionUnified()">Назад</button>
        `;
    }

    const storageScr = document.getElementById('storage-screen');
    if (storageScr) {
        storageScr.innerHTML = `
            <h2>Склад Цитадели</h2>
            <span class="subtitle">Ваши накопленные богатства</span>
            <div id="storage-resources-list" style="text-align: left; margin-bottom: 15px; background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid #544432; display: flex; flex-direction: column; gap: 8px;">
                <!-- Динамически заполняется через updateTownGoldDisplay -->
            </div>
            <button id="close-storage-btn" class="menu-btn back-btn" style="width: 100%;">Назад в меню</button>
        `;
    }

    const settingsScr = document.getElementById('settings-screen');
    if (settingsScr) {
        settingsScr.innerHTML = `
            <h2>⚙️ Звуковой Пульт</h2>
            <span class="subtitle">Настройка частот и громкости движка</span>
            <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; color: #cdb38c; font-size: 13px; margin-bottom: 20px;">
                <div>
                    <label>Громкость Эмбиента:</label>
                    <input type="range" id="volume-music-slider" min="0" max="100" style="width: 100%; accent-color: #e6c280;">
                </div>
                <div>
                    <label>Громкость Эффектов Рун:</label>
                    <input type="range" id="volume-fx-slider" min="0" max="100" style="width: 100%; accent-color: #e6c280;">
                </div>
            </div>
            <button id="close-settings-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 0;">Сохранить настройки</button>
        `;
    }

    const specScr = document.getElementById('squad-heroes-spec-screen');
    if (specScr) {
        specScr.innerHTML = `
            <h2>Военный Лагерь</h2>
            <span class="subtitle">Тренировка и развитие характеристик отряда</span>
            <div id="heroes-upgrade-list-container" style="margin-bottom: 15px;"></div>
            <button id="close-heroes-spec-btn" class="menu-btn back-btn" style="width: 100%;">Назад в меню</button>
        `;
    }
}
