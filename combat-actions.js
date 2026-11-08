/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИСХОДОВ БИТВЫ (ИСПРАВЛЕН ПОД ХАБ - v5.7.52)
   ========================================================================== */

function activateHeroSuperpower(heroId) {
    let hero = combatData.squad.find(h => h && h.id === heroId);
    if (!hero || hero.hp <= 0 || hero.sp < hero.maxSP) return;
    
    hero.sp = 0;
    if (typeof playMatch3Sound === 'function') playMatch3Sound(hero.icon);

    const damageLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('damage') : 0;
    const archerLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('archer') : 0;
    const mageLvl = typeof getBuildingLevel === 'function' ? getBuildingLevel('mage') : 0;

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

        if (typeof checkSeasonBountyResolution === 'function') checkSeasonBountyResolution();

        const firstBattleDone = localStorage.getItem('khamach_combat_tutorial_done') === 'true';
        const mDone = localStorage.getItem('khamach_missions_tutorial_done') === 'true';

        if (!firstBattleDone) {
            localStorage.setItem('khamach_combat_tutorial_done', 'true');
            // Выдаем 100 золота и 2 Крови Древних на Шаг 3 Спортзала
            localStorage.setItem('khamach_gold', '100');
            localStorage.setItem('khamach_dragon_essence', '2');
            window.location.href = 'gate.html?t=' + Date.now();
        } else if (!mDone) {
            window.location.href = 'gate.html?t=' + Date.now();
        } else {
            // КОНЕЦ ОБУЧЕНИЯ: Второй бой окончен, открываем Хаб навсегда!
            localStorage.setItem('khamach_full_onboarding_complete', 'true');
            window.location.href = 'hub.html?t=' + Date.now();
        }
    } else if (combatData.squad.every(hero => hero.hp <= 0)) {
        let id = window.setTimeout(function() {}, 0);
        while (id--) { window.clearTimeout(id); }
        alert("ОТРЯД ПАЛ В БИТВЕ! Попробуйте еще раз.");
        window.location.href = 'gate.html?t=' + Date.now();
    }
}
