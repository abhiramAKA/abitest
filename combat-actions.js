/* ==========================================================================
   КХАМАЧ — ИСХОДЫ БИТВЫ И ВЕРОЯТНОСТНЫЙ ГЕНЕРАТОР ДРОПА (v6.2.1-STABLE)
   ========================================================================== */

const HERO_POWER_TABLE = {
    tank:,
    damage:,
    archer:,
    mage:  
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

function rollBattleLootByTier(tier) {
    const RARE_POOL = [
        { key: 'khamach_res_coal', icon: '🔥', name: 'Уголь пламени' },
        { key: 'khamach_res_ice',  icon: '❄️', name: 'Ледяной осколок' },
        { key: 'khamach_res_dark', icon: '🔮', name: 'Сфера Тьмы' },
        { key: 'khamach_res_dust', icon: '✨', name: 'Звёздная пыль' }
    ];
    const COMMON_RES = { key: 'khamach_dragon_ore', icon: '🪨', name: 'Горная руда' };

    function rollSingleSlot() {
        if (tier <= 6) return COMMON_RES;
        const rareChance = 15 + (tier - 7) * 3.5;
        if (Math.random() * 100 < rareChance) {
            return RARE_POOL[Math.floor(Math.random() * RARE_POOL.length)];
        }
        return COMMON_RES;
    }

    const droppedItems = [];
    droppedItems.push(rollSingleSlot());

    const doubleChance = (tier - 1) * 2.5;
    if (Math.random() * 100 < doubleChance) {
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
        if (typeof saveCompletedTier === 'function') saveCompletedTier(tier);
        if (typeof checkSeasonBountyResolution === 'function') checkSeasonBountyResolution();

        const lootList = rollBattleLootByTier(tier);
        const lootHTML = lootList.map(l => `<div style="font-size:15px; color:#ffd700; font-weight:bold; margin:4px 0;">+ ${l.count} ${l.icon} ${l.name}</div>`).join('');
        const isDouble = lootList.reduce((acc, item) => acc + item.count, 0) > 1;
        const firstItem = lootList.at(0);
        const mainIcon = firstItem ? firstItem.icon : '🪨';

        let rewardsPopup = document.createElement('div');
        rewardsPopup.className = 'combat-help-popup';
        rewardsPopup.style.zIndex = '35000';
        rewardsPopup.innerHTML = `
            <div class="combat-help-content" style="max-width:380px; text-align:center;">
                <div style="font-size:50px; line-height:1; margin-bottom:8px;">${mainIcon}</div>
                <h2 style="color:#2ecc71;">ВЕЛИКАЯ ПОБЕДА!</h2>
                <span class="subtitle">${isDouble ? '✨ ДВОЙНАЯ ДОБЫЧА! ✨' : 'Трофеи Горнила Рун'}</span>
                <div style="background:rgba(0,0,0,0.5); padding:12px; border:1px solid #544432; border-radius:4px; margin-bottom:15px;">
                    <div style="font-size:12px; color:#cdb38c; margin-bottom:6px;">На склады Цитадели доставлено:</div>
                    ${lootHTML}
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
        let id = window.setTimeout(function() {}, 0); while (id--) { window.clearTimeout(id); }
        alert("ОТРЯД ПАЛ В БИТВЕ! Соберитесь с силами в меню.");
        window.location.href = 'hub.html?t=' + Date.now();
    }
}
