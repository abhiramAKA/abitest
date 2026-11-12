/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИНЪЕКЦИЙ ГОРОДСКИХ ИНТЕРФЕЙСОВ И ОКНА УРОВНЯ (v6.2.1)
   ========================================================================== */

function injectTownScreensDOM() {
    const infoScr = document.getElementById('info-screen');
    if (infoScr) {
        infoScr.innerHTML = `
            <h2>Справка Мира</h2>
            <div id="info-screen-text" style="text-align: left; font-size: 13px; max-height: 50vh; overflow-y: auto; margin-bottom: 15px;"></div>
            <button id="from-info-to-menu-btn" class="menu-btn back-btn" style="width: 100%;">Вернуться в меню</button>
        `;
    }

    const selectScr = document.getElementById('dragon-select-screen');
    if (selectScr) {
        selectScr.innerHTML = `
            <h2 id="adventure-screen-title">Выбор Рейда</h2>
            <span id="adventure-screen-subtitle" class="subtitle">Выберите пространство</span>
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
            <div id="storage-resources-list" style="text-align: left; margin-bottom: 15px; background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid #544432; display: flex; flex-direction: column; gap: 8px;"></div>
            <button id="close-storage-btn" class="menu-btn back-btn" style="width: 100%;">Назад в меню</button>
        `;
    }

    const settingsScr = document.getElementById('settings-screen');
    if (settingsScr) {
        settingsScr.innerHTML = `
            <h2>⚙️ Настройки Звука</h2>
            <span class="subtitle">Управление громкостью игры</span>
            <div style="display: flex; flex-direction: column; gap: 14px; text-align: left; color: #cdb38c; font-size: 13px; margin-bottom: 20px; width: 100%;">
                <div>
                    <label style="display:block; margin-bottom:4px;">Громкость фоновой музыки:</label>
                    <input type="range" id="volume-music-slider" min="0" max="100" style="width: 100%; accent-color: #e6c280;">
                </div>
                <div>
                    <label style="display:block; margin-bottom:4px;">Громкость звуковых эффектов:</label>
                    <input type="range" id="volume-fx-slider" min="0" max="100" style="width: 100%; accent-color: #e6c280;">
                </div>
            </div>
            <button id="close-settings-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 0;">Сохранить и вернуться</button>
        `;
    }

    const specScr = document.getElementById('squad-heroes-spec-screen');
    if (specScr) {
        specScr.innerHTML = `
            <h2>Спортзал</h2>
            <span class="subtitle">Развитие характеристик отряда</span>
            <div id="heroes-upgrade-list-container" style="margin-bottom: 15px; width: 100%;"></div>
            <button id="close-heroes-spec-btn" class="menu-btn back-btn" style="width: 100%;">Назад в меню</button>
        `;
    }

    const fatigueScr = document.getElementById('squad-fatigue-screen');
    if (fatigueScr) {
        const tFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_tank') || '0'));
        const dFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_damage') || '0'));
        const aFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_archer') || '0'));
        const mFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_mage') || '0'));
        
        fatigueScr.innerHTML = `
            <div class="combat-help-content" style="max-width: 380px; padding: 20px;">
                <h2>Уровень усталости героев</h2>
                <span class="subtitle">Свежесть боевого отряда</span>
                <div style="display:flex; flex-direction:column; gap:10px; text-align:left; background:rgba(0,0,0,0.5); padding:12px; border:1px solid #544432; border-radius:4px; font-size:13px; color:#cdb38c;">
                    <div style="display:flex; justify-content:space-between;"><span>🛡️ Защитник:</span><strong>${tFat}% Усталости</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>🔥 Воин:</span><strong>${dFat}% Усталости</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>⚡ Стрелок:</span><strong>${aFat}% Усталости</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>💚 Маг:</span><strong>${mFat}% Усталости</strong></div>
                </div>
                <p style="font-size:11px; color:#8a7350; margin-top:10px; line-height:1.35; text-align:justify;">
                    *Каждое поручение Ратуши увеличивает усталость бойца на +15%. Находясь в резерве, воины пассивно восстанавливают силы со скоростью 10% в час. Усталость снижает награду монетами.
                </p>
                <button id="close-fatigue-screen-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 10px; padding: 8px;">Вернуться в меню</button>
            </div>
        `;
    }

    const lvlInfoScr = document.getElementById('squad-level-info-screen');
    if (lvlInfoScr) {
        const tBld = parseInt(localStorage.getItem('khamach_build_tank') || '1');
        const dBld = parseInt(localStorage.getItem('khamach_build_damage') || '1');
        const aBld = parseInt(localStorage.getItem('khamach_build_archer') || '1');
        const mBld = parseInt(localStorage.getItem('khamach_build_mage') || '1');
        const curLvl = typeof window.getSquadPower === 'function' ? window.getSquadPower() : 1;

        lvlInfoScr.innerHTML = `
            <div class="combat-help-content" style="max-width: 380px; padding: 20px;">
                <h2>👑 Уровень Отряда: ${curLvl}</h2>
                <span class="subtitle">Как рассчитывается показатель</span>
                <p style="font-size:12px; color:#cdb38c; line-height:1.45; text-align:left; margin-bottom:10px;">
                    Уровень отряда — это среднее значение уровней всех четырёх построек вашей Цитадели (округлённое в меньшую сторону). Чтобы повысить общий уровень, равномерно улучшайте все здания.
                </p>
                <div style="display:flex; flex-direction:column; gap:6px; text-align:left; background:rgba(0,0,0,0.5); padding:10px; border:1px solid #544432; border-radius:4px; font-size:12px; color:#e6c280;">
                    <div style="display:flex; justify-content:space-between;"><span>🛡️ Гарнизон:</span><strong>Ур. ${tBld}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>🔥 Казармы:</span><strong>Ур. ${dBld}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>⚡ Стрельбище:</span><strong>Ур. ${aBld}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>💚 Обитель:</span><strong>Ур. ${mBld}</strong></div>
                    <div style="border-top:1px dashed #544432; padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; color:#ffd700;">
                        <span>Формула: (${tBld}+${dBld}+${aBld}+${mBld}) ÷ 4</span><strong>Уровень ${curLvl}</strong>
                    </div>
                </div>
                <button id="close-level-info-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 12px; padding: 8px;">Понятно</button>
            </div>
        `;
    }
}
