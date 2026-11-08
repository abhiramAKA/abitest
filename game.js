/* ==========================================================================
   КХАМАЧ — ЦЕНТРАЛЬНЫЙ ДИСПЕТЧЕР СТЭЙТА И ТАЙМЕРОВ (ИСПРАВЛЕН - v5.7.67-FIX)
   ========================================================================== */

const BOARD_ROWS = 8;
const BOARD_COLS = 8;
const RUNE_TYPES = ['🔥', '🛡️', '⚡', '💚'];

let combatData = {
    dragonHP: 120, 
    dragonMaxHP: 120,
    playerAP: 3, 
    playerMaxAP: 3,
    currentRound: 1,
    tankTaunting: false, 
    dragonBlinded: false, 
    pendingComboTutorial: false, 
    squad: [
        { id: "tank", name: "Защитник", hp: 150, maxHP: 150, sp: 0, maxSP: 100, icon: "🛡️", color: "#4a90e2" },
        { id: "damage", name: "Воин", hp: 90, maxHP: 90, sp: 0, maxSP: 100, icon: "🔥", color: "#ff4500" },
        { id: "archer", name: "Стрелок", hp: 100, maxHP: 100, sp: 0, maxSP: 100, icon: "⚡", color: "#f1c40f" },
        { id: "mage", name: "Маг", hp: 80, maxHP: 80, sp: 0, maxSP: 100, icon: "💚", color: "#2ecc71" }
    ]
};

let match3BoardData = null;
let selectedCell = null;
let selectedDragonLevel = 1;
window.currentOpenedModeKey = null;

function sanitizeAndMigrateStorage() {
    const currentGold = localStorage.getItem('khamach_gold') || '500';
    const currentMaxTier = localStorage.getItem('khamach_max_tier') || '1';
    const currentCharisma = localStorage.getItem('khamach_dragon_essence') || '1'; 

    localStorage.setItem('khamach_gold', currentGold);
    localStorage.setItem('khamach_max_tier', currentMaxTier);
    localStorage.setItem('khamach_dragon_essence', currentCharisma);
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
}

function initDispatcherModule() {
    sanitizeAndMigrateStorage();

    const isHubPage = window.location.pathname.includes('hub.html');

    try { if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM(); } catch(e) { console.error(e); }
    try { if (!isHubPage && typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM(); } catch(e) { console.error(e); }
    try { if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM(); } catch(e) { console.error(e); }
    
    updateMenuOnboardingVisibility();

    if (typeof updateTownGoldDisplay === 'function') updateTownGoldDisplay();

    // Запуск прослушивателей только для gate.html. В Хабе это делает финальный коллбэк hub.html
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
        // ИСПРАВЛЕНО: Убран преждевременный сброс слушателей, ломавший кнопки в Хабе
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
