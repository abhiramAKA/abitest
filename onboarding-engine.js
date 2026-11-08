/* ==========================================================================
   КХАМАЧ — ВЫЧИСЛИТЕЛЬНЫЙ ДВИЖОК ПОЭТАПНОГО ОБУЧЕНИЯ (ОБНОВЛЕН - v5.7.52)
   ========================================================================== */

window.GAME_VERSION = "v5.7.52";

const ONBOARDING_MISSIONS_LOCAL_POOL = [
    { id: "m_t1", allowedHero: "tank", heroName: "Защитник", heroIcon: "🛡️", rewardText: "🌿 Магическая Трава (3 шт)", title: "Сбор трав в низине" },
    { id: "m_d1", allowedHero: "damage", heroName: "Воин", heroIcon: "🔥", rewardText: "🧪 Руническая Пыль (2 шт)", title: "Экспедиция в пещеры" }
];

function loadGameModulesAndExecute(modeType) {
    const enforceBuster = Date.now() + '_' + Math.floor(Math.random() * 999999);
    const scripts = [
        'game.js', 'background.js', 'audio-engine.js', 'match3-fx.js',
        'match3-input.js', 'match3.js', 'match3-logic.js', 'match3-data.js',
        'campaign.js', 'town-engine.js', 'town-chronicle.js',
        'missions-pool.js', 'missions-engine.js', 'town-dom.js',
        'squad-dom.js', 'combat-popups.js', 'combat-dom.js', 'missions-board.js',
        'squad-logic.js', 'squad-core.js', 'combat-actions.js', 
        'combat.js', 'game-listeners.js', 'season-engine.js'
    ];

    function injectScriptSequentially(index) {
        if (index >= scripts.length) {
            if (typeof initDispatcherModule === 'function') initDispatcherModule();
            if (modeType === 'battle') { launchBattle(); } 
            else if (modeType === 'camp') { launchCamp(); }
            else if (modeType === 'citadel') { launchCitadel(); }
            else if (modeType === 'missions') { launchMissions(); }
            return;
        }
        const script = document.createElement('script');
        script.src = scripts[index] + '?v=' + window.GAME_VERSION + '&t=' + enforceBuster;
        script.async = false; 
        script.onload = function() { injectScriptSequentially(index + 1); };
        document.head.appendChild(script);
    }
    injectScriptSequentially(0);
}

function launchBattle() {
    document.getElementById('onboarding-gothic-window').style.display = 'none';
    const isSecondBattlePhase = localStorage.getItem('khamach_missions_tutorial_done') === 'true';
    
    if (!isSecondBattlePhase) {
        if (typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM();
        if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
        if (typeof showScreen === 'function') showScreen('combat-screen');
        if (typeof startCombatSession === 'function') startCombatSession(1); 
    } else {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        if (typeof showScreen === 'function') showScreen('dragon-select-screen');
        if (typeof renderDragonSelectionGrid === 'function') renderDragonSelectionGrid();
    }
}

function launchCamp() {
    document.getElementById('onboarding-gothic-window').style.display = 'none';
    if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
    if (typeof updateSquadHeroesSpecScreenDOM === 'function') updateSquadHeroesSpecScreenDOM();
    document.getElementById('squad-heroes-spec-screen').style.display = 'flex';
}

function launchCitadel() {
    document.getElementById('onboarding-gothic-window').style.display = 'none';
    if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM();
    
    // Переопределяем кнопку закрытия Цитадели, чтобы не ломала цепочку
    const closeBtn = document.getElementById('close-squad-btn');
    if (closeBtn) closeBtn.style.display = 'none';

    document.getElementById('squad-screen').style.display = 'flex';

    // Взламываем функцию покупки здания на Шаге 4, чтобы она переключала на Шаг 5 Ратуши
    window.executeUnifiedBuildingTransaction = function() {
        localStorage.setItem('khamach_gold', '0'); // Списываем 100 золота
        localStorage.setItem('khamach_build_tank', '1');
        localStorage.setItem('khamach_squad_build_tank', 'true');
        localStorage.setItem('khamach_citadel_tutorial_done', 'true');

        // Мгновенно возвращаем в gate.html для активации Шага 5
        document.getElementById('squad-screen').style.display = 'none';
        window.location.href = 'gate.html?t=' + Date.now();
    };
}

function launchMissions() {
    document.getElementById('onboarding-gothic-window').style.display = 'none';
    if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
    
    const container = document.getElementById('missions-list-container');
    if (container) {
        container.innerHTML = '';
        ONBOARDING_MISSIONS_LOCAL_POOL.forEach(mission => {
            const card = document.createElement('div');
            card.style = "background: rgba(25, 20, 18, 0.9); border: 1px solid #544432; padding: 8px 10px; border-radius: 3px; display: flex; flex-direction: column; gap: 4px;";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e6c280; font-size: 12px;">
                    <span>${mission.title}</span>
                    <span style="color: #2ecc71;">${mission.rewardText}</span>
                </div>
                <div style="font-size: 11px; color: #bfae96; line-height: 1.2;">Направить бойца в экспедицию.</div>
                <button class="menu-btn" style="padding:4px; font-size:13px; background:#1d3a1e; height:28px;" onclick="executeOnboardingMission('${mission.id}', '${mission.allowedHero}')">Отправить ${mission.heroIcon}</button>
            `;
            container.appendChild(card);
        });
    }
    document.getElementById('missions-screen').style.display = 'flex';
}

function executeOnboardingMission(missionId, heroId) {
    localStorage.setItem(`khamach_hero_busy_${heroId}`, 'true');
    localStorage.setItem(`khamach_mission_active_${missionId}`, 'true');
    localStorage.setItem(`khamach_mission_start_${missionId}`, Date.now().toString());
    
    localStorage.setItem('khamach_missions_tutorial_done', 'true');
    document.getElementById('missions-screen').style.display = 'none';
    window.location.href = 'gate.html?t=' + Date.now();
}

document.addEventListener("DOMContentLoaded", function() {
    const isVictory = localStorage.getItem('khamach_combat_tutorial_done') === 'true';
    const isTrained = localStorage.getItem('khamach_training_tutorial_done') === 'true';
    const isCitadelBuilt = localStorage.getItem('khamach_citadel_tutorial_done') === 'true';
    const isMissionsDone = localStorage.getItem('khamach_missions_tutorial_done') === 'true';
    const btnZone = document.getElementById('onboarding-buttons-zone');
    
    if (!isVictory) {
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" onclick="loadGameModulesAndExecute('battle')">🌋</button>`;
    } else if (!isTrained) {
        document.getElementById('onboarding-title').innerText = "ЦИТАДЕЛЬ";
        document.getElementById('onboarding-subtitle').innerText = "Управление Прогрессом";
        document.getElementById('onboarding-description').innerText = "Дракон повержен! На склад доставлена Кровь Древних. Отправляйтесь в Спортзал, чтобы развить навыки и поднять уровень кого-то из героев.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Спортзал" onclick="loadGameModulesAndExecute('camp')">🏋️</button>`;
    } else if (!isCitadelBuilt) {
        document.getElementById('onboarding-title').innerText = "АРХИТЕКТУРА";
        document.getElementById('onboarding-subtitle').innerText = "Строительство построек";
        document.getElementById('onboarding-description').innerText = "Чтобы тренировать героев дальше, нужно улучшать здания Цитадели. Откройте инженерное меню Замка и постройте первое оборонительное сооружение за 100 золотых монет.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Замок" onclick="loadGameModulesAndExecute('citadel')">🏰</button>`;
    } else if (!isMissionsDone) {
        document.getElementById('onboarding-title').innerText = "РАТУША";
        document.getElementById('onboarding-subtitle').innerText = "Алхимические Экспедиции";
        document.getElementById('onboarding-description').innerText = "Отлично! Теперь лимит тренировок повышен. Чтобы строить другие здания, нужно золото, а оно добывается в поручениях Ратуши. Отправьте свободного бойца в экспедицию.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Поручения" onclick="loadGameModulesAndExecute('missions')">💰</button>`;
    } else {
        document.getElementById('onboarding-title').innerText = "В ПУТИ";
        document.getElementById('onboarding-subtitle').innerText = "Выбор Бестиария";
        document.getElementById('onboarding-description').innerText = "Твой герой ушёл выполнять поручение. Пока он в пути, ты можешь отправить оставшуюся команду в новый рейд. Открой карту Кампании и выбери главу и тир дракона — после этой битвы Цитадель откроется полностью!";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Открыть карту" onclick="loadGameModulesAndExecute('battle')">🌋</button>`;
    }
});
