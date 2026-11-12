/* ==========================================================================
   КХАМАЧ — СПОРТЗАЛ: 15 УРОВНЕЙ ПРОКАЧКИ ЗА 5 ЭПОХ РЕСУРСОВ (v6.2.0-STABLE)
   ========================================================================== */

const SQUAD_HERO_LORE = {
    tank:   { title: "🛡️ ЗАЩИТНИК", statName: "Max HP",      increments: [20, 20, 35, 35, 35, 60, 60, 60, 100, 100, 100, 160, 160, 160] },
    damage: { title: "🔥 ВОИН",     statName: "Урон ульты",  increments: [15, 15, 25, 25, 25, 40, 40, 40, 70,  70,  70,  120, 120, 120] },
    archer: { title: "⚡ СТРЕЛОК",  statName: "Урон молнии", increments: [10, 10, 18, 18, 18, 30, 30, 30, 50,  50,  50,  85,  85,  85] },
    mage:   { title: "💚 МАГ",      statName: "Масс-хил",    increments: [5,  5,  10, 10, 10, 18, 18, 18, 30,  30,  30,  50,  50,  50] }
};


// Таблица стоимости перехода НА указанный уровень (с 1->2 до 14->15)
const HERO_TRAINING_COSTS = {
    2:  { key: 'khamach_dragon_ore', icon: '🪨', name: 'Горной руды', cost: 2 },
    3:  { key: 'khamach_dragon_ore', icon: '🪨', name: 'Горной руды', cost: 4 },
    4:  { key: 'khamach_res_coal',   icon: '🔥', name: 'Угля пламени', cost: 2 },
    5:  { key: 'khamach_res_coal',   icon: '🔥', name: 'Угля пламени', cost: 4 },
    6:  { key: 'khamach_res_coal',   icon: '🔥', name: 'Угля пламени', cost: 6 },
    7:  { key: 'khamach_res_ice',    icon: '❄️', name: 'Лед. осколка', cost: 3 },
    8:  { key: 'khamach_res_ice',    icon: '❄️', name: 'Лед. осколка', cost: 5 },
    9:  { key: 'khamach_res_ice',    icon: '❄️', name: 'Лед. осколка', cost: 8 },
    10: { key: 'khamach_res_dark',   icon: '🔮', name: 'Сферы Тьмы', cost: 4 },
    11: { key: 'khamach_res_dark',   icon: '🔮', name: 'Сферы Тьмы', cost: 7 },
    12: { key: 'khamach_res_dark',   icon: '🔮', name: 'Сферы Тьмы', cost: 10 },
    13: { key: 'khamach_res_dust',   icon: '✨', name: 'Звёзд. пыли', cost: 5 },
    14: { key: 'khamach_res_dust',   icon: '✨', name: 'Звёзд. пыли', cost: 10 },
    15: { key: 'khamach_res_dust',   icon: '✨', name: 'Звёзд. пыли', cost: 15 }
};

window.getHeroLevel = function(id) { return parseInt(localStorage.getItem(`khamach_hero_lvl_${id}`) || '1'); };
window.getBuildingLevel = function(id) { return parseInt(localStorage.getItem(`khamach_build_${id}`) || '1'); };

window.updateSquadHeroesSpecScreenDOM = function() {
    const container = document.getElementById('heroes-upgrade-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "6px";
    container.style.width = "100%";
    
    const heroesData = [{ id: "tank" }, { id: "damage" }, { id: "archer" }, { id: "mage" }];
    
    heroesData.forEach(h => {
        const lore = SQUAD_HERO_LORE[h.id];
        if (!lore) return;
        
        const heroLvl = window.getHeroLevel(h.id);
        const buildLvl = window.getBuildingLevel(h.id);
        const nextLvl = heroLvl + 1;
        
        let actionBtnHTML = '';
        let bonusText = "МАКС";
        let priceText = "Достигнут предел";

        if (heroLvl < 15) {
            const req = HERO_TRAINING_COSTS[nextLvl];
            const currentResAmount = parseInt(localStorage.getItem(req.key) || '0');
            const incVal = lore.increments[heroLvl - 1] || 10;
            
            bonusText = `+${incVal} ${lore.statName}`;
            priceText = `Цена: ${req.cost} ${req.icon} ${req.name}`;

            const needsBuildingUpgrade = (heroLvl >= 2) && (heroLvl >= buildLvl);
            const hasEnoughRes = currentResAmount >= req.cost;

            if (needsBuildingUpgrade) {
                actionBtnHTML = `<button class="menu-btn disabled" style="padding:8px 6px; font-size:10px; width:140px; height:44px; line-height:1.1; color:#ffb3ba;" disabled>Нужно здание ${nextLvl} ур.</button>`;
            } else if (!hasEnoughRes) {
                actionBtnHTML = `<button class="menu-btn disabled" style="padding:8px 6px; font-size:10px; width:140px; height:44px; line-height:1.1; color:#cca3a3;" disabled>Не хватает ${req.icon}</button>`;
            } else {
                actionBtnHTML = `<button class="menu-btn" style="padding:10px; font-size:12px; background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; width:140px; height:44px;" onclick="window.triggerHeroLevelUpgrade('${h.id}')">Тренировать</button>`;
            }
        } else {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:10px; font-size:12px; width:140px; height:44px;" disabled>МАКС УР</button>`;
        }
        
        const card = document.createElement('div');
        card.style = "background: rgba(20, 16, 14, 0.95); border: 1px solid #544432; padding: 10px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width:100%; gap:10px;";
        card.innerHTML = `
            <div style="flex:1; text-align:left;">
                <div style="font-weight:bold; color:#e6c280; font-size:13px; letter-spacing:0.5px;">
                    ${lore.title} <span style="color:#ffd700; font-size:11px; margin-left:6px;">Ур. ${heroLvl}</span>
                </div>
                <div style="font-size:11px; color:#2ecc71; margin-top:2px;">Развитие: ${bonusText}</div>
                <div style="font-size:11px; color:#bfae96; font-weight: bold; margin-top:2px;">${priceText}</div>
            </div>
            <div style="display:flex; align-items:center;">${actionBtnHTML}</div>
        `;
        container.appendChild(card);
    });
};

window.triggerHeroLevelUpgrade = function(heroId) {
    const heroLvl = window.getHeroLevel(heroId);
    if (heroLvl >= 15) return;

    const buildLvl = window.getBuildingLevel(heroId);
    const nextLvl = heroLvl + 1;
    const req = HERO_TRAINING_COSTS[nextLvl];
    const currentRes = parseInt(localStorage.getItem(req.key) || '0');

    if ((heroLvl >= 2) && (heroLvl >= buildLvl)) return;
    if (currentRes < req.cost) return;

    localStorage.setItem(req.key, (currentRes - req.cost).toString());
    localStorage.setItem(`khamach_hero_lvl_${heroId}`, nextLvl.toString());
    
    window.updateSquadHeroesSpecScreenDOM();
};

function injectSquadInterfaceDOM() {
    const screen = document.getElementById('squad-screen'); 
    if(!screen) return;
    
    const tBld = window.getBuildingLevel('tank');
    const dBld = window.getBuildingLevel('damage');
    const aBld = window.getBuildingLevel('archer');
    const mBld = window.getBuildingLevel('mage');
    
    screen.innerHTML = `
        <h2>Цитадель</h2>
        <span class="subtitle">Инфраструктура строений Замка</span>
        <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; gap: 8px;">
            <div class="menu-row"><button id="upgrade-tank-btn" class="menu-btn" style="background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; color:#fff; letter-spacing:1px; font-weight:900;">🛡️ ГАРНИЗОН [УР. ${tBld}]</button></div>
            <div class="menu-row"><button id="upgrade-damage-btn" class="menu-btn" style="background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; color:#fff; letter-spacing:1px; font-weight:900;">🔥 КАЗАРМЫ [УР. ${dBld}]</button></div>
            <div class="menu-row"><button id="upgrade-archer-btn" class="menu-btn" style="background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; color:#fff; letter-spacing:1px; font-weight:900;">⚡ СТРЕЛЬБИЩЕ [УР. ${aBld}]</button></div>
            <div class="menu-row"><button id="upgrade-mage-btn" class="menu-btn" style="background:linear-gradient(to bottom, #1d3a1e, #0f2110); border-color:#316e34; color:#fff; letter-spacing:1px; font-weight:900;">💚 ОБИТЕЛЬ [УР. ${mBld}]</button></div>
        </div>
        <button id="close-squad-btn" class="menu-btn back-btn" style="width: 100%; margin-top: 15px;">Назад в меню</button>
    `;
    
    if (typeof setupSquadInterfaceListeners === 'function') setupSquadInterfaceListeners();
}
