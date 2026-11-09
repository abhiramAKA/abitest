/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИСХОДОВ БИТВЫ (НАЧИСЛЕНИЕ ГОРНОЙ РУДЫ - v6.0.2-STABLE)
   ========================================================================== */

function activateHeroSuperpower(heroId) {
    let hero = combatData.squad.find(h => h && h.id === heroId);
    if (!hero || hero.hp <= 0 || hero.sp < hero.maxSP) return;
    
    hero.sp = 0;
    if (typeof playMatch3Sound === 'function') playMatch3Sound(hero.icon);

    const damageLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('damage') : 1;
    const archerLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('archer') : 1;
    const mageLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('mage') : 1;

    let dmgUnyielding = 120 + damageLvl * 15;
    let archerUnyielding = 25 + archerLvl * 10;
    let mageHealAmount = 25 + mageLvl * 5;
    
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

function checkBattleResolution() {
    if (combatData.dragonHP <= 0) {
        let id = window.setTimeout(function() {}, 0);
        while (id--) { window.clearTimeout(id); }

        // ЭКОНОМИКА РУДЫ: Начисляем +1 Горную руду на склад Цитадели за победу!
        const currentOre = parseInt(localStorage.getItem('khamach_dragon_ore') || '0');
        localStorage.setItem('khamach_dragon_ore', (currentOre + 1).toString());

        if (typeof checkSeasonBountyResolution === 'function') checkSeasonBountyResolution();

        // Бесшовно возвращаемся в Хаб после триумфа
        window.location.href = 'hub.html?t=' + Date.now();
    } else if (combatData.squad.every(hero => hero.hp <= 0)) {
        let id = window.setTimeout(function() {}, 0);
        while (id--) { window.clearTimeout(id); }
        alert("ОТРЯД ПАЛ В БИТВЕ! Соберитесь с силами в Хабе.");
        window.location.href = 'hub.html?t=' + Date.now();
    }
}
