/* ==========================================================================
   КХАМАЧ — ВЫЧИСЛИТЕЛЬНЫЙ МОДУЛЬ ТРЕНИРОВОК (ИСПРАВЛЕН - v5.8.1-BETA)
   ========================================================================== */

const SQUAD_HERO_LORE = {
    tank: { name: "🛡️ Гарнизон", title: "🛡️ ЗАЩИТНИК", statBonus: "+20 Max HP" },
    damage: { name: "🔥 Казармы", title: "🔥 ВОИН", statBonus: "+15 урон ульты" },
    archer: { name: "⚡ Стрельбище", title: "⚡ СТРЕЛОК", statBonus: "+10 урон молнии" },
    mage: { name: "💚 Обитель", title: "💚 МАГ", statBonus: "+5 к масс-хилу" }
};

window.getHeroLevel = function(id) { return parseInt(localStorage.getItem(`khamach_hero_lvl_${id}`) || '1'); };
window.getBuildingLevel = function(id) { return parseInt(localStorage.getItem(`khamach_build_${id}`) || '0'); };

window.updateSquadHeroesSpecScreenDOM = function() {
    const container = document.getElementById('heroes-upgrade-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr";
    container.style.gap = "6px";
    
    const heroesData = [{ id: "tank" }, { id: "damage" }, { id: "archer" }, { id: "mage" }];
    const isTrainingPhase = localStorage.getItem('khamach_training_tutorial_done') !== 'true';
    
    const closeBtn = document.getElementById('close-heroes-spec-btn');
    if (closeBtn) closeBtn.style.display = isTrainingPhase ? 'none' : 'block';
    
    const currentCharisma = parseInt(localStorage.getItem('khamach_dragon_essence') || '0');
    
    heroesData.forEach(h => {
        const lore = SQUAD_HERO_LORE[h.id === 'mage' ? 'damage_mage' : h.id];
        if (!lore) return;
        
        const heroLvl = window.getHeroLevel(h.id);
        const buildLvl = window.getBuildingLevel(h.id);
        
        let actionBtnHTML = '';
        
        const needsBuildingUpgrade = heroLvl >= (buildLvl + 1) && heroLvl >= 2;
        const hasEnoughCharisma = currentCharisma >= 2;
        
        if (isTrainingPhase && h.id !== 'tank') {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:2px; font-size:10px; background:#221a1a; border-color:#3a2525; color:#665555; cursor:not-allowed;" disabled>Тренировать</button>`;
        } else if (heroLvl >= 15) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:2px; font-size:10px;" disabled>МАКС УР</button>`;
        } else if (needsBuildingUpgrade) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:2px; font-size:9px; background:#421e1e; border-color:#6e3131; line-height:1.1; color:#ffb3ba;" disabled>Нужно здание ${heroLvl} ур.</button>`;
        } else if (!hasEnoughCharisma) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:2px; font-size:9px; background:#2d2621; border-color:#544432; line-height:1.1; color:#cca3a3;" disabled>Не хватает харизмы 👑</button>`;
        } else {
            actionBtnHTML = `<button class="menu-btn" style="padding:2px; font-size:10px; background:#1d3a1e; height:22px; line-height:1;" onclick="window.triggerHeroLevelUpgrade('${h.id}')">Тренировать</button>`;
        }
        
        let cardInner = `
            <div style="display:flex; justify-content:space-between; font-weight:bold; color:#e6c280; font-size:11px;">
                <span>${lore.title}</span>
                <span style="color:#ffd700;">Ур. ${heroLvl}</span>
            </div>
            <div style="font-size:10px; color:#2ecc71; line-height:1.1; margin-top:2px;">Бонус: ${lore.statBonus}</div>
            <div style="font-size:10px; color:#e6c280; margin: 6px 0 4px 0; font-weight: bold;">Цена: 2 👑 Харизмы</div>
            <div style="margin-top:auto;">${actionBtnHTML}</div>
        `;
        
        const card = document.createElement('div');
        card.style = "background: rgba(25, 20, 18, 0.95); border: 1px solid #544432; padding: 6px 8px; border-radius: 3px; display: flex; flex-direction: column; justify-content: space-between; gap: 2px; box-sizing: border-box;";
        card.innerHTML = cardInner;
        container.appendChild(card);
    });
};

window.triggerHeroLevelUpgrade = function(heroId) {
    const heroLvl = window.getHeroLevel(heroId);
    const buildLvl = window.getBuildingLevel(heroId);
    const currentCharisma = parseInt(localStorage.getItem('khamach_dragon_essence') || '0');

    if (currentCharisma < 2) {
        alert("Недостаточно Харизмы! Требуется 2 👑.");
        return;
    }
    
    if (heroLvl >= (buildLvl + 1) && heroLvl >= 2) {
        alert(`Для прокачки выше требуется улучшить соответствующее здание до ${heroLvl} уровня!`);
        return;
    }

    localStorage.setItem('khamach_dragon_essence', (currentCharisma - 2).toString());
    localStorage.setItem(`khamach_hero_lvl_${heroId}`, heroLvl + 1);
    
    const isTrainingPhase = localStorage.getItem('khamach_training_tutorial_done') !== 'true';
    if (isTrainingPhase) {
        localStorage.setItem('khamach_training_tutorial_done', 'true');
        document.getElementById('squad-heroes-spec-screen').style.display = 'none';
        window.location.href = 'gate.html?t=' + Date.now();
        return;
    }

    window.updateSquadHeroesSpecScreenDOM();
};
