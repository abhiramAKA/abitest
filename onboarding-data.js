/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ДАННЫХ И ИНИЦИАЛИЗАЦИИ ОБУЧЕНИЯ (ОБНОВЛЕН - v5.7.65-FIX)
   ========================================================================== */

window.ONBOARDING_MISSIONS_LOCAL_POOL = [
    { id: "m_t1", allowedHero: "tank", heroName: "Защитник", heroIcon: "🛡️", rewardGold: 100, title: "Охрана южных рубежей", text: "Местные фермеры жалуются на набеги диких кабанов из болот. Защитнику предстоит встать живым заслоном у частокола." },
    { id: "m_d1", allowedHero: "damage", heroName: "Воин", heroIcon: "🔥", rewardGold: 100, title: "Зачистка старой шахты", text: "В заброшенных выработках Абхирамбурга расплодились огромные пауки. Сила Воина поможет очистить штольни для рудокопов." }
];

document.addEventListener("DOMContentLoaded", function() {
    const isVictory = localStorage.getItem('khamach_combat_tutorial_done') === 'true';
    const isTrained = localStorage.getItem('khamach_training_tutorial_done') === 'true';
    const isCitadelBuilt = localStorage.getItem('khamach_citadel_tutorial_done') === 'true';
    const isMissionsDone = localStorage.getItem('khamach_missions_tutorial_done') === 'true';
    const btnZone = document.getElementById('onboarding-buttons-zone');
    if (!btnZone) return;
    
    if (!isVictory) {
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" onclick="loadGameModulesAndExecute('battle')">🌋</button>`;
    } else if (!isTrained) {
        const titleEl = document.getElementById('onboarding-title');
        const subEl = document.getElementById('onboarding-subtitle');
        const descEl = document.getElementById('onboarding-description');
        if (titleEl) titleEl.innerText = "ЦИТАДЕЛЬ";
        if (subEl) subEl.innerText = "Управление Прогрессом";
        if (descEl) descEl.innerText = "Дракон повержен! На склад доставлена Харизма Древних. Отправляйтесь в Спортзал, чтобы развить навыки и поднять уровень кого-то из героев.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Спортзал" onclick="loadGameModulesAndExecute('camp')">🏋️</button>`;
    } else if (!isCitadelBuilt) {
        const titleEl = document.getElementById('onboarding-title');
        const subEl = document.getElementById('onboarding-subtitle');
        const descEl = document.getElementById('onboarding-description');
        if (titleEl) titleEl.innerText = "АРХИТЕКТУРА";
        if (subEl) subEl.innerText = "Строительство построек";
        if (descEl) descEl.innerText = "Чтобы тренировать героев дальше, нужно улучшать здания Цитадели. Откройте инженерное меню Замка и постройте первое оборонительное сооружение за 100 золотых монет.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Замок" onclick="loadGameModulesAndExecute('citadel')">🏰</button>`;
    } else if (!isMissionsDone) {
        const titleEl = document.getElementById('onboarding-title');
        const subEl = document.getElementById('onboarding-subtitle');
        const descEl = document.getElementById('onboarding-description');
        if (titleEl) titleEl.innerText = "РАТУША";
        if (subEl) subEl.innerText = "Алхимические Экспедиции";
        if (descEl) descEl.innerText = "Отлично! Теперь лимит тренировок повышен. Чтобы строить другие здания, нужно золото, а оно добывается в поручениях Ратуши. Отправьте свободного бойца в экспедицию.";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Поручения" onclick="loadGameModulesAndExecute('missions')">💰</button>`;
    } else {
        const titleEl = document.getElementById('onboarding-title');
        const subEl = document.getElementById('onboarding-subtitle');
        const descEl = document.getElementById('onboarding-description');
        if (titleEl) titleEl.innerText = "В ПУТИ";
        if (subEl) subEl.innerText = "Выбор Бестиария";
        if (descEl) descEl.innerText = "Твой герой ушёл выполнять поручение. Пока он в пути, ты можете отправить оставшуюся команду в новый рейд. Открой карту Кампании и выбери главу и тир дракона — после этой битвы Цитадель откроется полностью!";
        btnZone.innerHTML = `<button class="emoji-grid-btn" style="width: 110px; height: 110px; font-size: 54px; border-radius: 4px;" title="Открыть карту" onclick="loadGameModulesAndExecute('battle')">🌋</button>`;
    }
});
