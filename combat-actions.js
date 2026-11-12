/* ==========================================================================
   КХАМАЧ — ИСХОДЫ БИТВЫ, УСТАЛОСТЬ РЕЙДА И КОЭФФИЦИЕНТ СВЕЖЕСТИ (v6.2.3-STABLE)
   ========================================================================== */

const HERO_POWER_TABLE = {
    tank:   new Array(0, 20, 40, 75, 110, 145, 205, 265, 325, 425, 525, 625, 785, 945, 1105),
    damage: new Array(0, 15, 30, 55, 80, 105, 145, 185, 225, 295, 365, 435, 555, 675, 795),
    archer: new Array(0, 10, 20, 38, 56, 74, 104, 134, 164, 214, 264, 314, 399, 484, 569),
    mage:   new Array(0, 5, 10, 20, 30, 40, 58, 76, 94, 124, 154, 184, 234, 284, 334)
};

function activateHeroSuperpower(heroId) {
    let hero = combatData.squad.find(h => h && h.id === heroId);
    if (!hero || hero.hp <= 0 || hero.sp < hero.maxSP) return;
    
    hero.sp = 0;
    if (typeof playMatch3Sound === 'function') playMatch3Sound(hero.icon);

    const dmgLvl = typeof getHeroLevel === 'function' ? Math.min(15, getHeroLevel('damage')) : 1;
    const arcLvl = typeof getHeroLevel === 'function' ? Math.min(15, getHeroLevel('archer')) : 1;
    const magLvl = typeof getHeroLevel === 'function' ? Math.min(15, getHeroLevel('mage')) : 1;

    let dmgUnyielding = 120 + (HERO_POWER_TABLE.damage[dmgLvl - 1] || 0);
    let archerUnyielding = 25 + (HERO_POWER_TABLE.archer[arcLvl - 1] || 0);
    let mageHealAmount = 25 + (HERO_POWER_TABLE.mage[magLvl - 1] || 0);
    
    switch(heroId) {
        case "tank": combatData.tankTaunting = true; combatData.dragonHP = Math.max(0, combatData.dragonHP - 25); break;
        case "damage": combatData.dragonHP = Math.max(0, combatData.dragonHP - dmgUnyielding); break;
        case "archer": combatData.dragonBlinded = true; combatData.dragonHP = Math.max(0, combatData.dragonHP - archerUnyielding); break;
        case "mage":
            combatData.squad.forEach(h => { if (h && h.hp > 0) h.hp = Math.min(h.maxHP, h.hp + mageHealAmount); });
            combatData.dragonHP = Math.max(0, combatData.dragonHP - 25);
            break;
    }
    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    checkBattleResolution();
}

// Вычисляем среднюю усталость ТОЛЬКО тех бойцов, которые реально вышли на бой
function getActiveRaidAverageFatigue() {
    if (!combatData || !combatData.squad) return 0;
    let sum = 0;
    let activeCount = 0;
    combatData.squad.forEach(h => {
        if (localStorage.getItem(`khamach_hero_busy_${h.id}`) !== 'true') {
            sum += parseFloat(localStorage.getItem(`khamach_fatigue_${h.id}`) || '0');
            activeCount++;
        }
    });
    return activeCount > 0 ? (sum / activeCount) : 0;
}

// Начисляем +3% усталости активным участникам строго за победу
function applyVictoryFatigue() {
    if (!combatData || !combatData.squad) return;
    combatData.squad.forEach(h => {
        if (localStorage.getItem(`khamach_hero_busy_${h.id}`) !== 'true') {
            const cur = parseFloat(localStorage.getItem(`khamach_fatigue_${h.id}`) || '0');
            localStorage.setItem(`khamach_fatigue_${h.id}`, Math.min(100, cur + 3).toString());
        }
    });
}

function rollBattleLootByTier(tier, freshnessFactor) {
    const RARE_POOL = new Array(
        { key: 'khamach_res_coal', icon: '🔥', name: 'Уголь пламени' },
        { key: 'khamach_res_ice',  icon: '❄️', name: 'Ледяной осколок' },
        { key: 'khamach_res_dark', icon: '🔮', name: 'Сфера Тьмы' },
        { key: 'khamach_res_dust', icon: '✨', name: 'Звёздная пыль' }
    );
    const COMMON_RES = { key: 'khamach_dragon_ore', icon: '🪨', name: 'Горная руда' };

    // Качество породы зависит ТОЛЬКО от тира босса (без штрафа усталости)
    function rollSingleSlot() {
        if (tier <= 6) return COMMON_RES;
        const rareChance = 15 + (tier - 7) * 3.5;
        if (Math.random() * 100 < rareChance) {
            return RARE_POOL[Math.floor(Math.random() * RARE_POOL.length)];
        }
        return COMMON_RES;
    }

    const droppedItems = new Array();
    
    // 1-й слот: 100% * Коэффициент Свежести (минимум 10%)
    if (Math.random() < freshnessFactor) {
        droppedItems.push(rollSingleSlot());
    }

    // 2-й слот: ((Тир - 1) * 2.5%) * Коэффициент Свежести
    const baseDoubleChance = ((tier - 1) * 2.5) / 100;
    if (Math.random() < (baseDoubleChance * freshnessFactor)) {
        droppedItems.push(rollSingleSlot());
    }

    const summaryMap = {};
    droppedItems.forEach(item => {
        const cur = parseInt(localStorage.getItem(item.key) || '0');
        localStorage.setItem(item.key, (cur + 1).toString());

        if (!summaryMap[item.key]) {
            summaryMap[item.key] = { icon: item.icon, name: item.name, count: 0 };
        }
        summaryMap[item.key].count++;
    });

    return Object.values(summaryMap);
}

function checkBattleResolution() {
    if (combatData.dragonHP <= 0) {
        let id = window.setTimeout(function() {}, 0); while (id--) { window.clearTimeout(id); }

        const tier = typeof activeSessionLevel !== 'undefined' ? activeSessionLevel : 1;
        
        // Фиксируем усталость рейда ДО начисления +3% за текущий бой
        const avgFatigue = getActiveRaidAverageFatigue();
        const freshnessFactor = Math.max(0.10, 1 - (avgFatigue / 100));
        const freshnessPct = Math.round(freshnessFactor * 100);

        applyVictoryFatigue();
        if (typeof saveCompletedTier === 'function') saveCompletedTier(tier);
        if (typeof checkSeasonBountyResolution === 'function') checkSeasonBountyResolution();

        const lootList = rollBattleLootByTier(tier, freshnessFactor);
        const totalDropped = lootList.reduce((acc, item) => acc + item.count, 0);
        
        let lootHTML = '';
        let mainIcon = '🪨';
        let subTitleText = 'Трофеи Горнила Рун';

        if (totalDropped === 0) {
            mainIcon = '🥱';
            subTitleText = 'УТОМЛЁННЫЙ ОТРЯД';
            lootHTML = `<div style="font-size:13px; color:#ffb3ba; line-height:1.4;">Из-за высокой усталости (Свежесть: ${freshnessPct}%) бойцы не смогли унести добычу из шахты. Дайте героям отдохнуть!</div>`;
        } else {
            const firstItem = lootList.at(0);
            mainIcon = firstItem ? firstItem.icon : '🪨';
            if (totalDropped > 1) subTitleText = '✨ ДВОЙНАЯ ДОБЫЧА! ✨';
            lootHTML = `<div style="font-size:12px; color:#cdb38c; margin-bottom:6px;">На склады Цитадели доставлено:</div>` +
                lootList.map(l => `<div style="font-size:15px; color:#ffd700; font-weight:bold; margin:4px 0;">+ ${l.count} ${l.icon} ${l.name}</div>`).join('');
        }

        const fatigueNote = avgFatigue > 0 
            ? `<div style="font-size:11px; color:#8a7350; margin-top:8px;">Свежесть отряда в бою: ${freshnessPct}% (+3% усталости за победу)</div>` 
            : `<div style="font-size:11px; color:#2ecc71; margin-top:8px;">Свежесть отряда: 100% (+3% усталости за победу)</div>`;

        let rewardsPopup = document.createElement('div');
        rewardsPopup.className = 'combat-help-popup';
        rewardsPopup.style.zIndex = '35000';
        rewardsPopup.innerHTML = `
            <div class="combat-help-content" style="max-width:380px; text-align:center;">
                <div style="font-size:50px; line-height:1; margin-bottom:8px;">${mainIcon}</div>
                <h2 style="color:#2ecc71;">ВЕЛИКАЯ ПОБЕДА!</h2>
                <span class="subtitle">${subTitleText}</span>
                <div style="background:rgba(0,0,0,0.5); padding:12px; border:1px solid #544432; border-radius:4px; margin-bottom:15px;">
                    ${lootHTML}
                    ${fatigueNote}
                </div>
                <button id="close-rewards-battle-btn" class="menu-btn" style="width:100%; background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; padding:12px; font-weight:bold;">ВЕРНУТЬСЯ В МЕНЮ ↩️</button>
            </div>
        `;
        document.body.appendChild(rewardsPopup);
        document.getElementById('close-rewards-battle-btn').onclick = function() {
            rewardsPopup.remove();
            window.location.href = 'hub.html?t=' + Date.now();
        };
    } else if (combatData.squad.every(hero => hero.hp <= 0)) {
        // При поражении усталость НЕ начисляется
        let id = window.setTimeout(function() {}, 0); while (id--) { window.clearTimeout(id); }
        alert("ОТРЯД ПАЛ В БИТВЕ! Силы не потрачены — соберитесь с духом в меню.");
        window.location.href = 'hub.html?t=' + Date.now();
    }
}
