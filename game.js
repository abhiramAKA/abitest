/* ==========================================================================
   КХАМАЧ — ЦЕНТРАЛЬНЫЙ ДИСПЕТЧЕР СТЭЙТА И ТАЙМЕРОВ (СТАБИЛЬНЫЙ - v6.0.0-STABLE)
   ========================================================================== */

const BOARD_ROWS = 8;
const BOARD_COLS = 8;
const RUNE_TYPES = ['🔥', '🛡️', '⚡', '💚'];

let combatData = {
    dragonHP: 180, 
    dragonMaxHP: 180,
    playerAP: 3, 
    playerMaxAP: 3,
    currentRound: 1,
    tankTaunting: false, 
    dragonBlinded: false, 
    squad: [
        { id: "tank", name: "Защитник", hp: 150, maxHP: 150, sp: 0, maxSP: 100, icon: "🛡️", color: "#4a90e2" },
        { id: "damage", name: "Воин", hp: 90, maxHP: 90, sp: 0, maxSP: 100, icon: "🔥", color: "#ff4500" },
        { id: "archer", name: "Стрелок", hp: 100, maxHP: 100, sp: 0, maxSP: 100, icon: "⚡", color: "#f1c40f" },
        { id: "mage", name: "Маг", hp: 80, maxHP: 80, sp: 0, maxSP: 100, icon: "💚", color: "#2ecc71" }
    ]
};

let match3BoardData = null;
let selectedCell = null;
let selectedDragonLevel = 2; // По умолчанию выбран Тир 2
window.currentOpenedModeKey = null;

function sanitizeAndMigrateStorage() {
    // ЕСЛИ ПЕРВЫЙ ЗАПУСК ХАБА ВЗРОСЛОЙ ИГРЫ — ИНИЦИАЛИЗИРУЕМ СТАРТОВЫЙ СУПЕР-СТЕЙТ ВЫПУСКНИКА
    if (!localStorage.getItem('khamach_hub_initialized')) {
        localStorage.setItem('khamach_hub_initialized', 'true');
        
        localStorage.setItem('khamach_gold', '133');                 // 133 монеты на счету
        localStorage.setItem('khamach_dragon_essence', '2');         // 2 Харизмы
        localStorage.setItem('khamach_max_tier', '2');               // Открыт и выбран Тир 2 драконов
        
        localStorage.setItem('khamach_build_tank', '2');             // Построен Гарнизон 2 уровня
        localStorage.setItem('khamach_hero_lvl_tank', '2');          // Танк прокачан до 2 уровня
        
        // АВТОМАТИЧЕСКИЙ СТАРТ КОНТРАКТА РАТУШИ НА 60 МИНУТ ПРИ СТАРТЕ ИГРЫ
        localStorage.setItem('khamach_hero_busy_tank', 'true');       // Танк уходит на задание
        localStorage.setItem('khamach_mission_active_m_t1', 'true');  // Миссия m_t1 активирована
        localStorage.setItem('khamach_mission_start_m_t1', Date.now().toString()); // Запуск счетчика времени
        localStorage.setItem('khamach_mission_reward_frozen_m_t1', '133');
        localStorage.setItem('khamach_fatigue_tank', '15');           // Начисляем стартовую усталость за поход
        
        // Все остальные постройки сброшены на 0 уровень по умолчанию
        localStorage.setItem('khamach_build_damage', '0');
        localStorage.setItem('khamach_build_archer', '0');
        localStorage.setItem('khamach_build_mage', '0');
        
        if (typeof addChronicleLog === 'function') {
            addChronicleLog("ЦИТАДЕЛЬ ВОЗВЕДЕНА: Выпускник онбординга прибыл в Хаб. Защитник отправлен на часовое поручение Ратуши.");
        }
    }
}

function updateMenuOnboardingVisibility() {
    const gridContainer = document.getElementById('main-menu-grid');
    if (!gridContainer) return;

    gridContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    gridContainer.innerHTML = `
        <button id="to-combat-btn" class="emoji-grid-btn">🌋</button>
        <button id="to-missions-btn" class="emoji-grid-btn">💰</button>
        <button id="to-squad-btn" class="emoji-grid-btn">🏰</button>
        <button id="to-storage-btn" class="emoji-grid-btn">🏋️</button>
        <button id="to-chronicle-btn" class="emoji-grid-btn">📜</button>
        <button id="to-clans-btn" class="emoji-grid-btn">👥</button>
    `;
    
    if (typeof setupAllGameListeners === 'function') {
        setupAllGameListeners();
    }
}

function initDispatcherModule() {
    sanitizeAndMigrateStorage();

    const isHubPage = window.location.pathname.includes('hub.html');

    if (isHubPage) {
        const mScreen = document.getElementById('missions-screen');
        if (mScreen && mScreen.innerHTML.trim() === '') {
            mScreen.innerHTML = `<h2>Доска Поручений</h2><span class="subtitle">Городские Контракты</span><div id="missions-list-container" style="display:flex; flex-direction:column; gap:8px; max-height:55vh; overflow-y:auto; margin-bottom:10px; width:100%;"></div><button id="close-missions-btn" class="menu-btn back-btn" style="width:100%;">Назад</button>`;
        }
        const cScreen = document.getElementById('chronicle-screen');
        if (cScreen && cScreen.innerHTML.trim() === '') {
            cScreen.innerHTML = `<h2>Летопись Цитадели</h2><span class="subtitle">История великих побед</span><div id="chronicle-list-container" style="text-align:left; max-height:50vh; overflow-y:auto; margin-bottom:15px; font-size:12px; font-family:monospace; line-height:1.4; color:#cdb38c; width:100%;"></div><div style="display:flex; gap:8px; width:100%"><button id="clear-chronicle-btn" class="menu-btn" style="font-size:12px; padding:6px; background:#3a1414; border-color:#6e3131;">Очистить</button><button id="close-chronicle-btn" class="menu-btn back-btn" style="width:100%; margin-top:0;">Назад</button></div>`;
        }
    }

    try { if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM(); } catch(e) { console.error(e); }
    try { if (!isHubPage && typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM(); } catch(e) { console.error(e); }
    try { if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM(); } catch(e) { console.error(e); }
    
    updateMenuOnboardingVisibility();

    if (typeof updateTownGoldDisplay === 'function') updateTownGoldDisplay();

    if (!isHubPage && typeof setupAllGameListeners === 'function') {
        try { setupAllGameListeners(); } catch (e) { console.error(e); }
    }

    document.addEventListener('click', function unlockAudio() {
        if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
        document.removeEventListener('click', unlockAudio);
    }, { once: true });

    setInterval(() => {
        if (typeof checkAndProcessMissionsBackground === 'function') {
            checkAndProcessMissionsBackground();
        }
    }, 1000);
}

function showScreen(screenId) {
    const screens = ['main-menu', 'dragon-select-screen', 'info-screen', 'mode-desc-screen', 'squad-screen', 'combat-screen', 'storage-screen', 'missions-screen', 'chronicle-screen', 'squad-heroes-spec-screen'];
    screens.forEach(id => {
        const screenEl = document.getElementById(id);
        if (screenEl) screenEl.style.display = (id === screenId) ? 'flex' : 'none';
    });
    
    if (screenId === 'main-menu') {
        updateMenuOnboardingVisibility();
    }
    if (screenId === 'dragon-select-screen' && typeof renderDragonSelectionGrid === 'function') {
        renderDragonSelectionGrid();
    }
    if (screenId === 'squad-screen') {
        if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM();
        if (typeof setupSquadInterfaceListeners === 'function') setupSquadInterfaceListeners();
        if (typeof updateSquadVisualStyles === 'function') updateSquadVisualStyles();
    }
    if (screenId === 'storage-screen' && typeof updateStorageScreenDOM === 'function') {
        updateStorageScreenDOM();
    }
    if (screenId === 'squad-heroes-spec-screen' && typeof updateSquadHeroesSpecScreenDOM === 'function') {
        updateSquadHeroesSpecScreenDOM();
    }
    if (screenId === 'missions-screen' && typeof renderMissionsDOM === 'function') {
        renderMissionsDOM();
    }
    if (screenId === 'chronicle-screen' && typeof renderChronicleDOM === 'function') {
        renderChronicleDOM();
    }
    if (screenId === 'main-menu' || screenId === 'squad-screen' || screenId === 'mode-desc-screen' || screenId === 'storage-screen') {
        if (typeof updateTownGoldDisplay === 'function') updateTownGoldDisplay();
    }
}
