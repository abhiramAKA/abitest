/* ==========================================================================
   КХАМАЧ — ГЕНЕРАТОР ИНТЕРФЕЙСА ВНУТРИ ЦИТАДЕЛИ (ОБНОВЛЕН - v5.7.61-FIX)
   ========================================================================== */

function injectSquadInterfaceDOM() {
    const screen = document.getElementById('squad-screen');
    if (!screen) return;

    screen.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 4px;">
            <h1>Цитадель</h1>
            <button id="squad-help-btn" class="info-btn" style="width: 28px; height: 28px; font-size: 13px; border-radius: 4px; padding: 0; margin: 0;">❓</button>
        </div>
        <span class="subtitle" style="margin-bottom: 15px; padding-bottom: 8px;">Инфраструктура строений</span>
        
        <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; gap: 2px;">
            <div class="menu-row"><button id="upgrade-tank-btn" class="menu-btn">🛡️ Гарнизон</button></div>
            <div class="menu-row"><button id="upgrade-damage-btn" class="menu-btn">🔥 Казармы</button></div>
            <div class="menu-row"><button id="upgrade-archer-btn" class="menu-btn">⚡ Стрельбище</button></div>
            <div class="menu-row"><button id="upgrade-mage-btn" class="menu-btn">💚 Обитель</button></div>
        </div>
        
        <button id="close-squad-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 15px;">Назад в меню</button>

        <!-- ВСПЛЫВАЮЩЕЕ ОКНО СЦЕНЫ ЦИТАДЕЛИ -->
        <div id="squad-help-popup-screen" class="game-window combat-help-popup" style="display: none;">
            <div class="combat-help-content" style="max-width: 380px; padding: 20px;">
                <h2 style="font-size: 18px; margin-bottom: 10px;">ТАРИФЫ СТРОИТЕЛЬСТВА</h2>
                <div id="squad-help-popup-text" style="font-size: 11px; color: #cdb38c; max-height: 55vh; overflow-y: auto; text-align: left; background: rgba(0,0,0,0.5); padding: 10px; border: 1px solid #544432; border-radius: 4px;"></div>
                <button id="close-squad-help-popup-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 12px; padding: 8px;">Закрыть</button>
            </div>
        </div>
    `;
    if (typeof setupSquadInterfaceListeners === 'function') setupSquadInterfaceListeners();
}
