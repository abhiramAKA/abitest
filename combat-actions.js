/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ИСХОДОВ БИТВЫ И ПОП-АПА НАГРАД (v6.1.3-STABLE)
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
        let id = window.setTimeout(function() {}, 0); while (id--) { window.clearTimeout(id); }

        // Добавляем трофей на склад
        const currentOre = parseInt(localStorage.getItem('khamach_dragon_ore') || '0');
        localStorage.setItem('khamach_dragon_ore', (currentOre + 1).toString());

        if (typeof checkSeasonBountyResolution === 'function') checkSeasonBountyResolution();

        // ГОТИЧЕСКИЙ ПОП-АП НАГРАД ВМЕСТО АЛЕРТОВ
        let rewardsPopup = document.createElement('div');
        rewardsPopup.className = 'combat-help-popup'; rewardsPopup.style.zIndex = '35000';
        rewardsPopup.innerHTML = `
            <div class="combat-help-content" style="max-width:380px; text-align:center;">
                <div style="font-size:54px; line-height:1; margin-bottom:8px;">🪨</div>
                <h2 style="color:#2ecc71;">ВЕЛИКАЯ ПОБЕДА!</h2>
                <span class="subtitle">Трофеи Горнила Рун</span>
                <p style="font-size:13px; color:#cdb38c; text-align:left; line-height:1.5; background:rgba(0,0,0,0.4); padding:12px; border:1px solid #544432; margin-bottom:15px;">
                    Древний змей пал! Ваши доблестные воины собрали уцелевшие материалы из черева чудовища. На склады Цитадели успешно доставлена **1 единица Горной руды**.
                </p>
                <button id="close-rewards-battle-btn" class="menu-btn" style="width:100%; background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; padding:10px; font-weight:bold;">ВЕРНУТЬСЯ В ЦИТАДЕЛЬ ↩️</button>
            </div>
        `;
        document.body.appendChild(rewardsPopup);
        document.getElementById('close-rewards-battle-btn').onclick = function() {
            rewardsPopup.remove(); window.location.href = 'hub.html?t=' + Date.now();
        };
    } else if (combatData.squad.every(hero => hero.hp <= 0)) {
        let id = window.setTimeout(function() {}, 0); while (id--) { window.clearTimeout(id); }
        alert("ОТРЯД ПАЛ В БИТВЕ! Соберитесь с силами в меню.");
        window.location.href = 'hub.html?t=' + Date.now();
    }
}
