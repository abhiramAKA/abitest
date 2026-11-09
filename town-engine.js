/* ==========================================================================
   КХАМАЧ — ЦЕНТРАЛЬНАЯ ЭКОНОМИКА ЦИТАДЕЛИ И ХРАНИЛИЩЕ РЕСУРСОВ (v6.1.0)
   ========================================================================== */

const TOWN_BUILDING_PRICES = {
    2: 100,     
    3: 300,     
    4: 900,     
    5: 2700,    
    6: 11000,   
    7: 30000,   
    8: 75000,
    9: 125000, 
    10: 200000, 
    11: 310000, 
    12: 540000, 
    13: 850000,
    14: 1385000, 
    15: 2300000, 
    16: 3590500  
};

const INLINE_TOWN_TEXTS = {
    mainInfo: `<p><strong>«КХАМАЧ: Восхождение Рейдов»</strong></p><p>В недрах древних подземелий Абхирамбурга пробудился великий закон змея. Соберите свой верный отряд, заряжайте шкалы суперсил через камни стихий и сокрушите огнедышащих тварей в пошаговых тактических битвах Горнила!</p>`
};

const INLINE_MODE_DESCRIPTIONS = {
    clans: { title: "🛡️ ОРДЕН КХАМАЧА (КЛАНЫ)", reqText: "⚠️ Доступ заблокирован. Клановый шлюз открывается на 12-м уровне развития отряда!", isLocked: true },
    tank: { title: "🛡️ ГАРНИЗОН", isLocked: false, isHero: true, heroId: "tank", lore: "Здесь тренируются ваши верные Защитники. Модернизация увеличивает здоровье танка." },
    damage: { title: "🔥 КАЗАРМЫ", isLocked: false, isHero: true, heroId: "damage", lore: "Казармы свирепых Воинов. Увеличивают чистый урон ультимейта." },
    archer: { title: "⚡ СТРУКТУРА СТРЕЛЬБИЩА", isLocked: false, isHero: true, heroId: "archer", lore: "Полигон Стрелков. Повышает урон от стихийных молний." },
    mage: { title: "💚 ОБИТЕЛЬ", isLocked: false, isHero: true, heroId: "mage", lore: "Священное место Магов. Увеличивают силу группового исцеления." }
};

window.getTownText = function(key) { return INLINE_TOWN_TEXTS[key] || ''; };
window.getPlayerGold = function() { return parseInt(localStorage.getItem('khamach_gold') || '0'); };
window.addPlayerGold = function(amount) { localStorage.setItem('khamach_gold', window.getPlayerGold() + amount); window.updateTownGoldDisplay(); };

window.updateTownGoldDisplay = function() {
    const goldVal = window.getPlayerGold();
    const oreVal = parseInt(localStorage.getItem('khamach_dragon_ore') || '0');

    document.querySelectorAll('.gold-counter-display').forEach(el => { 
        el.innerText = `🪙 ${goldVal.toLocaleString('ru-RU')}`; 
    });
    
    // ЛИНГВИСТИЧЕСКИЙ РЕБРЕНДИНГ ХРАНИЛИЩА
    const storageList = document.getElementById('storage-resources-list');
    if (storageList) {
        storageList.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #4a3f2c; padding-bottom:4px; font-size:14px; color:#ffd700;">
                <span>🪙 Казна Цитадели (Монеты):</span>
                <strong>${goldVal.toLocaleString('ru-RU')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#cdb38c;">
                <span>🪨 Запасы Горной руды:</span>
                <strong>${oreVal} шт</strong>
            </div>
        `;
    }

    const tFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_tank') || '0'));
    const dFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_damage') || '0'));
    const aFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_archer') || '0'));
    const mFat = Math.round(parseFloat(localStorage.getItem('khamach_fatigue_mage') || '0'));
    
    const fatigueContainer = document.getElementById('team-fatigue-display');
    if (fatigueContainer) {
        const averageFatigue = Math.round((tFat + dFat + aFat + mFat) / 4);
        fatigueContainer.innerHTML = `🥱 ${averageFatigue}%`;
    }
};

window.openModeDescription = function(id) {
    window.currentOpenedModeKey = id;
    const config = INLINE_MODE_DESCRIPTIONS[id];
    if (!config) return;

    const titleEl = document.getElementById('mode-desc-title');
    const textEl = document.getElementById('mode-desc-text');
    const buyBtn = document.getElementById('mode-buy-btn');

    if (titleEl) titleEl.innerText = config.title;
    if (textEl) {
        if (config.isLocked) {
            textEl.innerHTML = config.reqText;
            if (buyBtn) buyBtn.style.display = 'none';
            showScreen('mode-desc-screen');
            return;
        }
        const bldId = config.heroId || id;
        const bldLvl = parseInt(localStorage.getItem(`khamach_build_${bldId}`) || '1');
        let loreText = config.lore || "Оборонительное сооружение Цитадели.";

        if (bldLvl >= 15) {
            textEl.innerHTML = `${loreText}<br><br>Максимальный уровень строения достигнут!`;
            if (buyBtn) buyBtn.style.display = 'none';
        } else {
            const nextLvl = bldLvl + 1;
            let nextPrice = TOWN_BUILDING_PRICES[nextLvl] || 999999;
            
            textEl.innerHTML = `${loreText}<br><br>Текущий уровень: ${bldLvl}`;
            
            if (buyBtn) { 
                buyBtn.style.display = 'block'; 
                // ТЕКСТ ПОДПИСИ МОНЕТ
                buyBtn.innerText = `⚒️ УЛУЧШИТЬ ДО УР. ${nextLvl} (🪙 ${nextPrice.toLocaleString('ru-RU')} монет)`; 
            }
        }
    }
    showScreen('mode-desc-screen');
};
