/* ==========================================================================
   КХАМАЧ — ВЕРТИКАЛЬНЫЙ СПОРТЗАЛ И ГОТИЧЕСКАЯ ЦИТАДЕЛЬ (ИСПРАВЛЕН - v1.0.5)
   ========================================================================== */

const ONBOARDING_HERO_LORE = {
    tank: { title: "🛡️ ЗАЩИТНИК", statBonus: "+20 Max HP" },
    damage: { title: "🔥 ВОИН", statBonus: "+15 урон ульты" },
    archer: { title: "⚡ СТРЕЛОК", statBonus: "+10 урон молнии" },
    mage: { title: "💚 МАГ", statBonus: "+5 к масс-хилу" }
};

function updateSquadHeroesSpecScreenDOM() {
    const container = document.getElementById('heroes-upgrade-list-container');
    if (!container) return; container.innerHTML = '';
    
    container.style.display = "flex"; 
    container.style.flexDirection = "column"; 
    container.style.gap = "6px";
    container.style.width = "100%";
    
    const heroesData = [{ id: "tank" }, { id: "damage" }, { id: "archer" }, { id: "mage" }];
    
    heroesData.forEach(h => {
        const lore = ONBOARDING_HERO_LORE[h.id];
        let actionBtnHTML = '';
        
        // КНОПКИ СПОРТЗАЛА: Полное соответствие оригинальному взрослому base.css
        if (h.id === 'tank') {
            actionBtnHTML = `<button class="menu-btn" style="padding:12px; font-size:13px; width:130px; height:44px;" onclick="executeOnboardingCampUpgrade()">Тренировать</button>`;
        } else {
            actionBtnHTML = `<button class="menu-btn disabled" style="padding:12px; font-size:13px; width:130px; height:44px;" disabled>Заблокирован</button>`;
        }
        
        let cardInner = `
            <div style="flex:1; text-align:left;">
                <div style="font-weight:bold; color:#e6c280; font-size:13px; letter-spacing:0.5px;">${lore.title} <span style="color:#ffd700; font-size:11px; margin-left:6px;">Ур. 1</span></div>
                <div style="font-size:11px; color:#2ecc71; margin-top:2px;">Развитие: ${lore.statBonus}</div>
                <div style="font-size:11px; color:#bfae96; font-weight: bold; margin-top:2px;">Цена: 1 👑 Харизма</div>
            </div>
            <div style="display:flex; align-items:center;">${actionBtnHTML}</div>
        `;
        
        const card = document.createElement('div');
        card.style = "background: rgba(20, 16, 14, 0.95); border: 1px solid #544432; padding: 10px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width:100%; gap:10px;";
        card.innerHTML = cardInner;
        container.appendChild(card);
    });
}

function executeOnboardingCampUpgrade() {
    localStorage.setItem('khamach_training_tutorial_done', 'true');
    localStorage.setItem('khamach_dragon_essence', '0');
    document.getElementById('squad-heroes-spec-screen').style.display = 'none';
    window.reloadOnboardingCoreState();
}

function injectSquadInterfaceDOM() {
    const screen = document.getElementById('squad-screen'); 
    if(!screen) return;
    
    // КНОПКИ ЦИТАДЕЛИ: Каноничный дизайн из base.css взрослой игры
    screen.innerHTML = `
        <h2>Цитадель</h2>
        <span class="subtitle">Инфраструктура строений</span>
        <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; gap: 8px;">
            <div class="menu-row"><button id="upgrade-tank-btn" class="menu-btn" style="width:100%;">⚒️ Построить Гарнизон Защитника (Цена: 🪙 100)</button></div>
            <div class="menu-row"><button class="menu-btn disabled" disabled>⚒️ Построить Казармы Воинов (Заблокировано)</button></div>
            <div class="menu-row"><button class="menu-btn disabled" disabled>⚒️ Построить Стрельбище Лучника (Заблокировано)</button></div>
            <div class="menu-row"><button class="menu-btn disabled" disabled>⚒️ Построить Обитель Магов (Заблокировано)</button></div>
        </div>
    `;
    
    const btn = document.getElementById('upgrade-tank-btn');
    if (btn && typeof window.executeOnboardingCitadelBuild === 'function') {
        btn.onclick = window.executeOnboardingCitadelBuild;
    }
}
