/* ==========================================================================
   КХАМАЧ — ДВИЖОК ШАГОВ ОБУЧЕНИЯ (ГОТИЧЕСКИЕ КВАДРАТНЫЕ КНОПКИ - v1.0.5)
   ========================================================================== */

window.reloadOnboardingCoreState = function() {
    const gothicWin = document.getElementById('onboarding-gothic-window');
    if (gothicWin) gothicWin.style.display = 'flex';
    if (typeof window.checkAndRenderOnboardingMainButton === 'function') {
        window.checkAndRenderOnboardingMainButton();
    }
};

window.executeOnboardingCitadelBuild = function() {
    localStorage.setItem('khamach_gold', '0'); 
    localStorage.setItem('khamach_build_tank', '2'); 
    localStorage.setItem('khamach_citadel_tutorial_done', 'true');
    document.getElementById('squad-screen').style.display = 'none';
    
    // МЕШОЧЕК С ДЕНЬГАМИ: Окно зеркально повторяет дизайн стартового Вулкана
    let goldPopup = document.createElement('div');
    goldPopup.className = 'combat-help-popup'; 
    goldPopup.style.zIndex = '25000';
    
    goldPopup.innerHTML = `
        <div class="combat-help-content" style="max-width: 380px; text-align: center;">
            <h2>КАЗНА СТРОИТЕЛЬСТВА</h2>
            <span class="subtitle">Экономика Цитадели</span>
            <p style="font-size: 13px; color: #cdb38c; text-align: left; line-height: 1.5; background:rgba(0,0,0,0.4); padding:12px; border:1px solid #544432; margin-bottom: 20px;">
                Гарнизон успешно возведен! Лимит развития Защитника повышен. Однако золото в казне Абхирамбурга иссякло. Чтобы продолжить обеспечение армии, откройте Ратушу и отправьте Защитника на городские контракты.
            </p>
            <!-- КВАДРАТНАЯ КНОПКА С МЕШОЧКОМ ДЕНЕГ С ЭФФЕКТОМ СИЯНИЯ -->
            <div style="display: flex; justify-content: center; width: 100%;">
                <button id="confirm-to-missions-btn" class="emoji-grid-btn" style="width: 100px; height: 100px; font-size: 54px; margin: 0 auto;">💰</button>
            </div>
        </div>
    `;
    document.body.appendChild(goldPopup);
    
    document.getElementById('confirm-to-missions-btn').onclick = function() {
        goldPopup.remove();
        window.launchOnboardingStep('missions');
    };
};

window.launchOnboardingStep = function(modeType) {
    const gothicWin = document.getElementById('onboarding-gothic-window');
    if (gothicWin) gothicWin.style.display = 'none';

    if (modeType === 'battle') {
        const isSecondBattlePhase = localStorage.getItem('khamach_missions_tutorial_done') === 'true';
        if (!isSecondBattlePhase) {
            if (typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM();
            if (typeof startCombatSession === 'function') startCombatSession(1); 
        } else {
            if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
            if (typeof showScreen === 'function') showScreen('dragon-select-screen');
            if (typeof renderDragonSelectionGrid === 'function') renderDragonSelectionGrid();
        }
    } 
    else if (modeType === 'camp') {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        const specScr = document.getElementById('squad-heroes-spec-screen');
        if (specScr) {
            if (typeof updateSquadHeroesSpecScreenDOM === 'function') updateSquadHeroesSpecScreenDOM();
            specScr.style.display = 'flex';
        }
    } 
    else if (modeType === 'citadel') {
        localStorage.setItem('khamach_gold', '100');
        if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM();
        document.getElementById('squad-screen').style.display = 'flex';
    } 
    else if (modeType === 'missions') {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        const container = document.getElementById('missions-list-container');
        if (container && window.ONBOARDING_MISSIONS_LOCAL_POOL) {
            container.innerHTML = '';
            window.ONBOARDING_MISSIONS_LOCAL_POOL.forEach(mission => {
                const card = document.createElement('div');
                card.style = "background: rgba(25, 20, 18, 0.9); border: 1px solid #544432; padding: 8px 10px; border-radius: 3px; display: flex; flex-direction: column; gap: 4px; width:100%; box-sizing:border-box;";
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e6c280; font-size: 12px;">
                        <span>${mission.title}</span>
                        <span style="color: #ffd700;">🪙 133</span>
                    </div>
                    <div style="font-size: 11px; color: #bfae96; line-height: 1.3; text-align: left;">${mission.text}</div>
                    <button class="menu-btn" style="padding:10px; font-size:13px; background:#1d3a1e; height:38px; margin-top: 4px; font-weight:bold;" onclick="window.triggerFinalOnboardingTransfer()">Отправить 🛡️</button>
                `;
                container.appendChild(card);
            });
        }
        document.getElementById('missions-screen').style.display = 'flex';
    }
};

window.triggerFinalOnboardingTransfer = function() {
    localStorage.setItem('khamach_gold', '133');                 
    localStorage.setItem('khamach_dragon_essence', '2');         
    localStorage.setItem('khamach_build_tank', '2');             
    localStorage.setItem('khamach_hero_lvl_tank', '2');          
    localStorage.setItem('khamach_max_tier', '1');               
    
    localStorage.setItem('khamach_combat_tutorial_done', 'true');
    localStorage.setItem('khamach_training_tutorial_done', 'true');
    localStorage.setItem('khamach_citadel_tutorial_done', 'true');
    localStorage.setItem('khamach_missions_tutorial_done', 'true');
    localStorage.setItem('khamach_full_onboarding_complete', 'true');

    const misScr = document.getElementById('missions-screen');
    if (misScr) misScr.style.display = 'none';

    // ФИНАЛЬНЫЙ ВУЛКАН: Окно с квадратной сияющей кнопкой Вулкана
    let finishPopup = document.createElement('div');
    finishPopup.className = 'combat-help-popup'; 
    finishPopup.style.zIndex = '25000';
    
    finishPopup.innerHTML = `
        <div class="combat-help-content" style="max-width: 390px; padding: 20px; text-align: center;">
            <h2>🌋 СИЛЫ БЕСТИАРИЯ</h2>
            <span class="subtitle">Карта Великих Глав</span>
            <p style="font-size: 13px; color: #cdb38c; text-align: left; line-height: 1.5; background:rgba(0,0,0,0.4); padding:12px; border:1px solid #544432; margin-bottom: 20px;">
                Ваш верный Защитник успешно выдвинулся на охрану южных рубежей Ратуши и временно покинул отряд. Пока он находится в пути, оставшееся воинство готово продолжить тактические рейды в Горниле. Нажмите на Вулкан ниже, чтобы открыть врата полноценного Бестиария Цитадели!
            </p>
            <div style="display: flex; justify-content: center; width: 100%;">
                <button id="onboarding-ultimate-redirect-btn" class="emoji-grid-btn" style="width: 100px; height: 100px; font-size: 50px; margin: 0 auto;">🌋</button>
            </div>
        </div>
    `;
    document.body.appendChild(finishPopup);
    
    document.getElementById('onboarding-ultimate-redirect-btn').onclick = function() {
        finishPopup.remove();
        // ВНИМАНИЕ: Здесь будет переход к полноценному Хабу взрослой игры
        window.location.href = 'https://ТВОЙ_АККАУНТ.github.io/khamach-game/hub.html';
    };
};
