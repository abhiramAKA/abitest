/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ДИНАМИЧЕСКОГО БОЕВОГО ИНТЕРФЕЙСА (v6.1.3-STABLE)
   ========================================================================== */

function injectCombatInterfaceBaseDOM() {
    const container = document.getElementById('dynamic-combat-screen');
    if (!container || container.innerHTML.trim() !== '') return;

    container.innerHTML = `
        <div id="combat-screen" class="game-window" style="display: flex; max-width: 460px; padding: 8px 12px;">
            <div id="dragon-raid-zone" style="position: relative;"></div>

            <div id="boss-panel" style="margin-bottom: 4px; padding: 4px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <div id="boss-name" style="font-size: 12px; margin: 0;">ЗАГРУЗКА БЕСТИАРИЯ...</div>
                    <div style="display: flex; gap: 4px;">
                        <button id="combat-help-btn" class="info-btn" style="width: 26px; height: 26px; font-size: 12px; padding: 0;">❓</button>
                        <button id="combat-escape-top-btn" class="info-btn back-btn" style="width: 26px; height: 26px; font-size: 11px; padding: 0;" title="Отступить в Цитадель">❌</button>
                    </div>
                </div>
                <div class="hp-bar-container" style="height: 10px;">
                    <div id="boss-hp-bar" class="hp-bar" style="width: 100%;"></div>
                    <div id="boss-hp-text" style="font-size: 9px; line-height: 10px;">120 / 120</div>
                </div>
            </div>

            <div id="battle-status-panel" style="margin-bottom: 4px; padding: 4px; font-size: 11px; flex-direction: column; align-items: stretch; gap: 2px;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <div id="combat-round-display">Раунд: 1</div>
                    <div id="combat-ap-display" style="color: #ffd700; font-weight: bold;">Сделайте ход на поле!</div>
                </div>
                <div id="combat-shield-display" style="display: none; text-align: center; color: #4a90e2; font-weight: bold; font-size: 11px; border-top: 1px dashed #3a3025; padding-top: 2px;">🛡️ Танк спровоцировал врага!</div>
            </div>

            <div id="squad-matrix" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 4px;"></div>
            <div id="match3-board-container" class="match3-board"></div>
        </div>
        <div id="dynamic-combat-popups"></div>
    `;

    if (typeof injectCombatPopupsDOM === 'function') injectCombatPopupsDOM();

    document.getElementById('combat-escape-top-btn').onclick = function() {
        if (confirm("Вы уверены, что хотите трусливо сбежать с поля боя?")) {
            window.location.href = 'hub.html?t=' + Date.now();
        }
    };
}

function buildDragonDOM() {
    const raidZone = document.getElementById('dragon-raid-zone');
    if (!raidZone || !window.ADVENTURE_CHAPTERS) return;
    raidZone.innerHTML = '';
    
    // ДИНАМИЧЕСКИЙ АВАТАР: Ищем иконку босса по активному уровню сессии в базе
    let bossIcon = '🐉';
    for (let ch of window.ADVENTURE_CHAPTERS) {
        let found = ch.bosses.find(b => b.tier === activeSessionLevel);
        if (found) { bossIcon = found.icon; break; }
    }

    const container = document.createElement('div'); container.className = 'dragon-container';
    const model = document.createElement('div'); model.id = 'dragon-model'; model.className = 'dragon-idle';
    model.innerText = bossIcon; // Отрисовываем честный эмодзи босса
    model.style.fontSize = '70px'; model.style.display = 'flex'; model.style.alignItems = 'center'; model.style.justifyContent = 'center';
    
    container.appendChild(model); raidZone.appendChild(container);
}

function updateCombatInterfaceDOM() {
    const hpBar = document.getElementById('boss-hp-bar'); const hpText = document.getElementById('boss-hp-text');
    if (hpBar && hpText && combatData) {
        let pct = (combatData.dragonHP / combatData.dragonMaxHP) * 100;
        hpBar.style.width = pct + '%'; hpText.innerText = `${combatData.dragonHP} / ${combatData.dragonMaxHP}`;
    }
    const roundDisp = document.getElementById('combat-round-display'); if (roundDisp && combatData) roundDisp.innerText = `Раунд: ${combatData.currentRound}`;
    const shieldDisp = document.getElementById('combat-shield-display'); if (shieldDisp && combatData) shieldDisp.style.display = combatData.tankTaunting ? 'block' : 'none';
    const squadMatrix = document.getElementById('squad-matrix'); if (!squadMatrix || !combatData || !combatData.squad) return;
    
    squadMatrix.innerHTML = '';
    combatData.squad.forEach(hero => {
        const card = document.createElement('div'); card.className = 'hero-gothic-card';
        if (hero.sp >= hero.maxSP && hero.hp > 0) card.classList.add('ready-glow');
        if (hero.hp <= 0) { card.style.opacity = '0.3'; card.style.filter = 'grayscale(1)'; }
        let hpPct = (hero.hp / hero.maxHP) * 100; let spPct = (hero.sp / hero.maxSP) * 100;
        const heroLvl = typeof getHeroLevel === 'function' ? getHeroLevel(hero.id) : 1;
        const currentFatigue = Math.min(100, Math.max(0, parseInt(localStorage.getItem(`khamach_fatigue_${hero.id}`) || '0')));
        
        card.innerHTML = `
            <div class="hero-card-avatar" style="color: ${hero.color};">${hero.icon}</div>
            <div class="hero-card-name" style="font-size: 8px; line-height: 1.1;">
                ${hero.name}<br><span style="color: #ffd700;">Ур. ${heroLvl}</span><br>
                <span style="color: #ffb3ba; font-weight: normal;">🥱 ${currentFatigue}%</span>
            </div>
            <div class="hero-bar-container" style="height: 11px;"><div class="hero-bar-fill hp-fill" style="width: ${hpPct}%;"></div><div class="hero-bar-text">${hero.hp}/${hero.maxHP}</div></div>
            <div class="hero-bar-container" style="border-color: #5c4314; background: #0f0a02; height: 11px;"><div class="hero-bar-fill sp-fill" style="width: ${spPct}%;"></div><div class="hero-bar-text" style="color: #ffd700;">SP ${Math.round(spPct)}%</div></div>
        `;
        card.addEventListener('click', () => { if (hero.hp > 0 && hero.sp >= hero.maxSP && typeof activateHeroSuperpower === 'function') activateHeroSuperpower(hero.id); });
        squadMatrix.appendChild(card);
    });
}
