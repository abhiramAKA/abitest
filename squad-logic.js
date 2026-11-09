/* ==========================================================================
   КХАМАЧ — ВЕРТИКАЛЬНЫЙ СПОРТЗАЛ И ГОТИЧЕСКАЯ ЦИТАДЕЛЬ (ИСПРАВЛЕН - v6.0.0)
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
    
    // СТРОГАЯ UX-СЕТКА: Карточки выстроены в один ровный вертикальный ряд сверху вниз
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "6px";
    container.style.width = "100%";
    
    const heroesData = [{ id: "tank" }, { id: "damage" }, { id: "archer" }, { id: "mage" }];
    const currentCharisma = parseInt(localStorage.getItem('khamach_dragon_essence') || '0');
    
    heroesData.forEach(h => {
        const lore = SQUAD_HERO_LORE[h.id];
        if (!lore) return;
        
        const heroLvl = window.getHeroLevel(h.id);
        const buildLvl = window.getBuildingLevel(h.id);
        
        let actionBtnHTML = '';
        
        const needsBuildingUpgrade = heroLvl >= (buildLvl + 1) && heroLvl >= 2;
        const hasEnoughCharisma = currentCharisma >= 2;
        
        if (heroLvl >= 15) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:10px; font-size:12px; width:140px; height:44px;" disabled>МАКС УР</button>`;
        } else if (needsBuildingUpgrade) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:8px 6px; font-size:10px; width:140px; height:44px; line-height:1.1; color:#ffb3ba;" disabled>Нужно здание ${heroLvl} ур.</button>`;
        } else if (!hasEnoughCharisma) {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:8px 6px; font-size:10px; width:140px; height:44px; line-height:1.1; color:#cca3a3;" disabled>Нет харизмы 👑</button>`;
        } else {
            actionBtnHTML = `<button class="menu-btn" style="padding:10px; font-size:12px; background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; width:140px; height:44px;" onclick="window.triggerHeroLevelUpgrade('${h.id}')">Тренировать</button>`;
        }
        
        let cardInner = `
            <div style="flex:1; text-align:left;">
                <div style="font-weight:bold; color:#e6c280; font-size:13px; letter-spacing:0.5px;">
                    ${lore.title} <span style="color:#ffd700; font-size:11px; margin-left:6px;">Ур. ${heroLvl}</span>
                </div>
                <div style="font-size:11px; color:#2ecc71; margin-top:2px;">Развитие: ${lore.statBonus}</div>
                <div style="font-size:11px; color:#bfae96; font-weight: bold; margin-top:2px;">Цена: 2 👑 Харизмы</div>
            </div>
            <div style="display:flex; align-items:center;">${actionBtnHTML}</div>
        `;
        
        const card = document.createElement('div');
        card.style = "background: rgba(20, 16, 14, 0.95); border: 1px solid #544432; padding: 10px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width:100%; gap:10px;";
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
    
    window.updateSquadHeroesSpecScreenDOM();
};
