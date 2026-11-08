/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИНТЕРФЕЙСА ДОСКИ ПОРУЧЕНИЙ (DOM) (ИСПРАВЛЕН - v5.8.5-BETA)
   ========================================================================== */

let missionsTimerIntervalInstance = null;

function renderMissionsDOM() {
    const container = document.getElementById('missions-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    // ПРОВЕРКА НА ОБУЧАЮЩИЙ КВЕСТ: Смотрим, не занят ли герой на обучении
    const isTankOnboardingActive = localStorage.getItem('khamach_mission_active_m_t1') === 'true';
    const isDamageOnboardingActive = localStorage.getItem('khamach_mission_active_m_d1') === 'true';
    
    let currentTriad = [];
    let isCurrentlyInOnboardingQuest = false;

    if (isTankOnboardingActive || isDamageOnboardingActive) {
        // Если активен онбординг-квест, принудительно выводим на доску только его
        currentTriad = [isTankOnboardingActive ? 'm_t1' : 'm_d1'];
        isCurrentlyInOnboardingQuest = true;
    } else {
        // Иначе работаем со стандартным глобальным пулом Хаба
        let activeMissionsJSON = localStorage.getItem('khamach_active_triad_ids');
        if (activeMissionsJSON) {
            try { currentTriad = JSON.parse(activeMissionsJSON); } catch(e) { currentTriad = []; }
        }
        
        if (!currentTriad || currentTriad.length !== 2) {
            currentTriad = [];
            let tempPool = [...CITY_MISSIONS_POOL];
            for (let i = 0; i < 2; i++) {
                if (tempPool.length === 0) tempPool = [...CITY_MISSIONS_POOL];
                const randIdx = Math.floor(Math.random() * tempPool.length);
                currentTriad.push(tempPool[randIdx].id);
                tempPool.splice(randIdx, 1);
            }
            localStorage.setItem('khamach_active_triad_ids', JSON.stringify(currentTriad));
        }
    }
    
    let globalMissionActive = isCurrentlyInOnboardingQuest || currentTriad.some(mId => localStorage.getItem(`khamach_mission_active_${mId}`) === 'true');
    const costData = getCurrentResetResourceCost();
    
    // Отрисовка кнопки сброса (если идет квест обучения, сброс заблокирован намертво)
    const resetBlock = document.createElement('div');
    resetBlock.style.padding = "4px";
    if (isCurrentlyInOnboardingQuest) {
        resetBlock.innerHTML = `
            <button class="menu-btn disabled" style="width:100%; font-size:11px; padding:6px; background:#0f0d0b; border-color:#26211c; color:#4a453f;" disabled>
                🔄 Сброс невозможен (Выполняется спец-контракт)
            </button>
        `;
    } else {
        resetBlock.innerHTML = `
            <button class="menu-btn" style="width:100%; font-size:11px; padding:6px; background:linear-gradient(to bottom, #3a2214, #1a0f08); border-color:#8a7350;" onclick="triggerBoardRerollByLoot()">
                🔄 Сбросить доску (Цена: 1 шт ${costData.icon} ${costData.name})
            </button>
        `;
    }
    container.appendChild(resetBlock);
    
    currentTriad.forEach(mId => {
        // Ищем миссию либо в глобальном пуле, либо в локальном пуле обучения
        let mission = CITY_MISSIONS_POOL.find(m => m.id === mId);
        if (!mission && typeof ONBOARDING_MISSIONS_LOCAL_POOL !== 'undefined') {
            mission = ONBOARDING_MISSIONS_LOCAL_POOL.find(m => m.id === mId);
        }
        if (!mission) return;
        
        const isThisMissionActive = localStorage.getItem(`khamach_mission_active_${mission.id}`) === 'true';
        const isHeroBusy = localStorage.getItem(`khamach_hero_busy_${mission.allowedHero}`) === 'true';
        const currentFatigue = Math.round(getHeroFatigue(mission.allowedHero));
        const reductionMultiplier = 1 - (currentFatigue / 100);
        
        // У обучающих миссий фиксированная базовая награда, у обычных — динамическая
        let baseReward = mission.rewardGold || mission.reward || 133;
        const calculatedReward = isCurrentlyInOnboardingQuest ? baseReward : Math.max(0, Math.round(baseReward * reductionMultiplier));
        
        // Обучающий квест длится 1 час (3600000 мс) по умолчанию, если не задано
        const durationMs = mission.durationMs || 3600000;
        
        const card = document.createElement('div');
        card.style = "background: rgba(25, 20, 18, 0.9); border: 1px solid #544432; padding: 8px 10px; border-radius: 3px; display: flex; flex-direction: column; gap: 4px; box-sizing: border-box; width:100%; text-align: left;";
        
        let actionHTML = '';
        if (isThisMissionActive) {
            const startTimestamp = parseInt(localStorage.getItem(`khamach_mission_start_${mission.id}`) || '0');
            const remaining = Math.max(0, durationMs - (Date.now() - startTimestamp));
            const minStr = Math.floor(remaining / 60000).toString().padStart(2,'0');
            const secStr = Math.floor((remaining % 60000) / 1000).toString().padStart(2,'0');
            actionHTML = `<div class="mission-countdown-ticker" data-start="${startTimestamp}" data-duration="${durationMs}" style="color:#ff4500; font-weight:bold; font-size:11px; text-align:center; padding:4px; border:1px dashed #ff4500;">⏱️ В пути: ${minStr}:${secStr}</div>`;
        } else if (globalMissionActive) {
            actionHTML = `<button class="menu-btn disabled" style="padding:4px; font-size:11px; width:100%; height:26px;" disabled>Очередь занята</button>`;
        } else if (isHeroBusy) {
            actionHTML = `<button class="menu-btn disabled" style="padding:4px; font-size:11px; width:100%; height:26px;" disabled>Боец занят на задании</button>`;
        } else {
            actionHTML = `<button class="menu-btn" style="padding:4px; font-size:12px; background:#1d3a1e; height:28px; width:100%; font-weight:bold;" onclick="startMission('${mission.id}', '${mission.allowedHero}', ${calculatedReward})">Отправить ${mission.heroIcon}</button>`;
        }
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e6c280; font-size: 12px;">
                <span>${mission.title} ${isCurrentlyInOnboardingQuest ? '[ОБУЧЕНИЕ]' : ''}</span>
                <span style="color: #ffd700;">🪙 ${calculatedReward}</span>
            </div>
            <div style="font-size: 11px; color: #bfae96; line-height: 1.2; margin: 2px 0;">${mission.text}</div>
            <div style="font-size: 10px; color: #ffb3ba; margin-bottom: 4px;">Усталость исполнителя: ${currentFatigue}%</div>
            <div>${actionHTML}</div>
        `;
        container.appendChild(card);
    });

    if (missionsTimerIntervalInstance) clearInterval(missionsTimerIntervalInstance);
    missionsTimerIntervalInstance = setInterval(() => {
        const tickers = document.querySelectorAll('.mission-countdown-ticker');
        if (tickers.length === 0) {
            clearInterval(missionsTimerIntervalInstance);
            return;
        }
        tickers.forEach(t => {
            const start = parseInt(t.dataset.start);
            const duration = parseInt(t.dataset.duration);
            const rem = Math.max(0, duration - (Date.now() - start));
            if (rem <= 0) {
                t.innerText = "⏱️ Возвращение...";
                
                // Чистим онбординг-ключи, если завершился обучающий квест
                localStorage.removeItem('khamach_mission_active_m_t1');
                localStorage.removeItem('khamach_mission_active_m_d1');
                
                if (typeof checkAndProcessMissionsBackground === 'function') checkAndProcessMissionsBackground();
                if (typeof renderMissionsDOM === 'function') renderMissionsDOM();
            } else {
                const m = Math.floor(rem / 60000).toString().padStart(2,'0');
                const s = Math.floor((rem % 60000) / 1000).toString().padStart(2,'0');
                t.innerText = `⏱️ В пути: ${m}:${s}`;
            }
        });
    }, 1000);
}

function triggerBoardRerollByLoot() {
    let activeMissionsJSON = localStorage.getItem('khamach_active_triad_ids');
    if (activeMissionsJSON) {
        try {
            let triad = JSON.parse(activeMissionsJSON);
            if (triad.some(mId => localStorage.getItem(`khamach_mission_active_${mId}`) === 'true')) {
                alert("Нельзя сбросить доску, пока идет выполнение контракта!"); return;
            }
        } catch(e) {}
    }
    if (confirm("Сменить список поручений Ратуши?")) {
        localStorage.removeItem('khamach_active_triad_ids');
        renderMissionsDOM();
    }
}
