/* ==========================================================================
   КХАМАЧ — ЦЕНТРАЛЬНАЯ ЭКОНОМИКА ЦИТАДЕЛИ И ХРАНИЛИЩЕ РЕСУРСОВ (v5.7.66-FIX)
   ========================================================================== */

const TOWN_BUILDING_PRICES = {
    1: 100, 2: 300, 3: 900, 4: 2700, 5: 11000, 6: 30000, 7: 75000,
    8: 125000, 9: 200000, 10: 310000, 11: 540000, 12: 850000,
    13: 1385000, 14: 2300000, 15: 3590500
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
    const charismaVal = parseInt(localStorage.getItem('khamach_dragon_essence') || '0');

    document.querySelectorAll('.gold-counter-display').forEach(el => { 
        el.innerText = `🪙 ${goldVal.toLocaleString('ru-RU')}`; 
    });
    
    const storageList = document.getElementById('storage-resources-list');
    if (storageList) {
        storageList.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #4a3f2c; padding-bottom:4px; font-size:14px; color:#ffd700;">
                <span>🪙 Казна Цитадели (Золото):</span>
                <strong>${goldVal.toLocaleString('ru-RU')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#e6c280;">
                <span>👑 Харизма Древних:</span>
                <strong>${charismaVal} шт</strong>
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
        
        // ФИКС: По умолчанию уровень всех зданий равен 1
        const bldLvl = parseInt(localStorage.getItem(`khamach_build_${bldId}`) || '1');
        let loreText = config.lore || "Оборонительное сооружение Цитадели.";

        if (bldLvl >= 15) {
            textEl.innerHTML = `${loreText}<br><br>Максимальный уровень строения достигнут!`;
            if (buyBtn) buyBtn.style.display = 'none';
        } else {
            let nextPrice = TOWN_BUILDING_PRICES[bldLvl + 1];
            textEl.innerHTML = `${loreText}<br><br>Текущий уровень: ${bldLvl}`;
            
            // ФИКС ТЕРМИНА: Кнопка переведена на строгое "УЛУЧШИТЬ ДО УР. X"
            if (buyBtn) { 
                buyBtn.style.display = 'block'; 
                buyBtn.innerText = `⚒️ УЛУЧШИТЬ ДО УР. ${bldLvl + 1} (🪙 ${nextPrice.toLocaleString('ru-RU')})`; 
            }
        }
    }
    showScreen('mode-desc-screen');
};
