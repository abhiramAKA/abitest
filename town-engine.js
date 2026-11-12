/* ==========================================================================
   КХАМАЧ — ЭКОНОМИКА ЦИТАДЕЛИ, СКЛАД 5 РЕСУРСОВ И ЗАМОК КЛАНОВ (v6.2.0)
   ========================================================================== */

const TOWN_BUILDING_PRICES = {
    2: 100, 3: 300, 4: 900, 5: 2700, 6: 11000, 7: 30000, 8: 75000,
    9: 125000, 10: 200000, 11: 310000, 12: 540000, 13: 850000,
    14: 1385000, 15: 2300000
};

const INLINE_TOWN_TEXTS = {
    mainInfo: `<p><strong>«КХАМАЧ: Восхождение Рейдов»</strong></p><p>В недрах древних подземелий Абхирамбурга пробудился великий закон змея. Развивайте постройки Цитадели, повышайте Мощность Отряда (МО), добывайте редкие ископаемые в рейдах и покоряйте новые эпохи!</p>`
};

const INLINE_MODE_DESCRIPTIONS = {
    clans: { title: "🛡️ ОРДЕН КХАМАЧА (КЛАНЫ)", reqText: "⚠️ Доступ заблокирован. Вход в Орден открывается при достижении Мощности Отряда <strong>МО: 4</strong> (улучшите здания Цитадели в среднем до 4 уровня).", isLocked: true },
    tank: { title: "🛡️ ГАРНИЗОН", isLocked: false, heroId: "tank", lore: "Оплот Защитников. Повышение уровня открывает новые ранги тренировок Танка (+20..+160 Max HP)." },
    damage: { title: "🔥 КАЗАРМЫ", isLocked: false, heroId: "damage", lore: "Тренировочный плац Воинов. Повышение уровня увеличивает разрушительную мощь ультимейта." },
    archer: { title: "⚡ СТРЕЛЬБИЩЕ", isLocked: false, heroId: "archer", lore: "Полигон Стрелков. Усиливает урон стихийных молний и ослепление врага." },
    mage: { title: "💚 ОБИТЕЛЬ", isLocked: false, heroId: "mage", lore: "Святилище Магов. Увеличивает силу группового исцеления всего отряда." }
};

window.getTownText = function(key) { return INLINE_TOWN_TEXTS[key] || ''; };
window.getPlayerGold = function() { return parseInt(localStorage.getItem('khamach_gold') || '0'); };
window.addPlayerGold = function(amount) { localStorage.setItem('khamach_gold', window.getPlayerGold() + amount); window.updateTownGoldDisplay(); };

window.updateTownGoldDisplay = function() {
    const goldVal = window.getPlayerGold();
    const oreVal = parseInt(localStorage.getItem('khamach_dragon_ore') || '0');
    const coalVal = parseInt(localStorage.getItem('khamach_res_coal') || '0');
    const iceVal = parseInt(localStorage.getItem('khamach_res_ice') || '0');
    const darkVal = parseInt(localStorage.getItem('khamach_res_dark') || '0');
    const dustVal = parseInt(localStorage.getItem('khamach_res_dust') || '0');

    document.querySelectorAll('.gold-counter-display').forEach(el => {
        el.innerText = `🪙 ${goldVal.toLocaleString('ru-RU')}`;
    });

    const moBtn = document.getElementById('indicator-level-btn');
    if (moBtn && typeof window.getSquadPower === 'function') {
        moBtn.innerText = `👑 МО: ${window.getSquadPower()}`;
    }
    
    const storageList = document.getElementById('storage-resources-list');
    if (storageList) {
        storageList.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #4a3f2c; padding-bottom:6px; font-size:14px; color:#ffd700;">
                <span>🪙 Казна Цитадели (Монеты):</span><strong>${goldVal.toLocaleString('ru-RU')}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#cdb38c;">
                <span>🪨 Горная руда:</span><strong>${oreVal} шт</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#ff8c8c;">
                <span>🔥 Уголь пламени:</span><strong>${coalVal} шт</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#8cd1ff;">
                <span>❄️ Ледяной осколок:</span><strong>${iceVal} шт</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#e58cff;">
                <span>🔮 Сфера Тьмы:</span><strong>${darkVal} шт</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:#ffe88c;">
                <span>✨ Звёздная пыль:</span><strong>${dustVal} шт</strong>
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
        if (id === 'clans') {
            const currentMO = typeof window.getSquadPower === 'function' ? window.getSquadPower() : 1;
            if (currentMO < 4) {
                textEl.innerHTML = `${config.reqText}<br><br>Ваша текущая Мощность Отряда: <strong>МО ${currentMO}</strong>.`;
            } else {
                textEl.innerHTML = `✅ Доступ к Ордену открыт (Ваша МО: <strong>${currentMO}</strong>).<br><br>Зал Гильдий, Купеческая лавка и Синхронные Блиц-Рейды готовятся к открытию в следующем обновлении!`;
            }
            if (buyBtn) buyBtn.style.display = 'none';
            showScreen('mode-desc-screen');
            return;
        }

        const bldId = config.heroId || id;
        const bldLvl = parseInt(localStorage.getItem(`khamach_build_${bldId}`) || '1');
        let loreText = config.lore || "Оборонительное сооружение Цитадели.";

        if (bldLvl >= 15) {
            textEl.innerHTML = `${loreText}<br><br>Максимальный 15-й уровень строения достигнут!`;
            if (buyBtn) buyBtn.style.display = 'none';
        } else {
            const nextLvl = bldLvl + 1;
            let nextPrice = TOWN_BUILDING_PRICES[nextLvl] || 999999;
            textEl.innerHTML = `${loreText}<br><br>Текущий уровень: <strong>${bldLvl}</strong>`;
            if (buyBtn) {
                buyBtn.style.display = 'block';
                buyBtn.innerText = `⚒️ УЛУЧШИТЬ ДО УР. ${nextLvl} (🪙 ${nextPrice.toLocaleString('ru-RU')})`;
            }
        }
    }
    showScreen('mode-desc-screen');
};
