/* ==========================================================================
   КХАМАЧ — ДВИЖОК ШАГОВ ОБУЧЕНИЯ И ЭКСПЕДИЦИЙ (ИСПРАВЛЕН - v5.7.65-FIX)
   ========================================================================== */

window.launchOnboardingStep = function(modeType) {
    const gothicWin = document.getElementById('onboarding-gothic-window');
    if (gothicWin) gothicWin.style.display = 'none';

    if (modeType === 'battle') {
        const isSecondBattlePhase = localStorage.getItem('khamach_missions_tutorial_done') === 'true';
        
        setTimeout(() => {
            if (!isSecondBattlePhase) {
                if (typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM();
                if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
                if (typeof showScreen === 'function') showScreen('combat-screen');
                if (typeof startCombatSession === 'function') startCombatSession(1); 
            } else {
                if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
                if (typeof showScreen === 'function') showScreen('dragon-select-screen');
                if (typeof renderDragonSelectionGrid === 'function') renderDragonSelectionGrid();
            }
        }, 50);
    } 
    else if (modeType === 'camp') {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        if (typeof updateSquadHeroesSpecScreenDOM === 'function') updateSquadHeroesSpecScreenDOM();
        const specScr = document.getElementById('squad-heroes-spec-screen');
        if (specScr) specScr.style.display = 'flex';
    } 
    else if (modeType === 'citadel') {
        if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM();
        
        const closeBtn = document.getElementById('close-squad-btn');
        if (closeBtn) closeBtn.style.display = 'none';
        
        const squadScr = document.getElementById('squad-screen');
        if (squadScr) squadScr.style.display = 'flex';

        ['damage', 'archer', 'mage'].forEach(id => {
            const btn = document.getElementById(`upgrade-${id}-btn`);
            if (btn) {
                btn.classList.add('disabled');
                btn.style.opacity = "0.3";
                btn.style.cursor = "not-allowed";
                btn.onclick = function(e) { e.preventDefault(); return false; };
            }
        });

        const tankBtn = document.getElementById('upgrade-tank-btn');
        if (tankBtn) {
            tankBtn.onclick = function() {
                let existingPopup = document.getElementById('onboarding-tank-popup');
                if (existingPopup) existingPopup.remove();

                const popup = document.createElement('div');
                popup.id = 'onboarding-tank-popup';
                popup.className = 'game-window combat-help-popup';
                popup.style.display = 'flex';
                popup.style.zIndex = '20000';
                
                popup.innerHTML = `
                    <div class="combat-help-content" style="max-width: 380px; padding: 20px;">
                        <h2>🛡️ ГАРНИЗОН ЗАЩИТНИКА</h2>
                        <span class="subtitle">Оборонительное сооружение</span>
                        <p style="font-size: 13px; color: #cdb38c; text-align: left; line-height: 1.5; background:rgba(0,0,0,0.4); padding:10px; border:1px solid #544432;">
                            Здесь тренируются ваши тяжелые Защитники. Строительство этого здания увеличит максимальный запас здоровья Танка и поднимет лимит его прокачки.
                        </p>
                        <div style="font-size: 14px; color: #ffd700; font-weight: bold; margin-bottom: 15px;">Стоимость: 🪙 100 золотых</div>
                        <button id="onboarding-build-tank-confirm" class="menu-btn" style="width: 100%; background: linear-gradient(to bottom, #1d3a1e, #0f2110); border-color: #316e34; padding: 12px;">⚒️ ПОСТРОИТЬ</button>
                    </div>
                `;
                
                document.body.appendChild(popup);

                document.getElementById('onboarding-build-tank-confirm').onclick = function() {
                    localStorage.setItem('khamach_gold', '0'); 
                    localStorage.setItem('khamach_build_tank', '1');
                    localStorage.setItem('khamach_squad_build_tank', 'true');
                    localStorage.setItem('khamach_citadel_tutorial_done', 'true');

                    alert("Здание успешно возведено! Отправляемся в Ратушу за новыми контрактами.");
                    popup.remove();
                    if (squadScr) squadScr.style.display = 'none';
                    
                    window.location.href = 'gate.html?t=' + Date.now();
                };
            };
        }
    } 
    else if (modeType === 'missions') {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        
        const container = document.getElementById('missions-list-container');
        if (container) {
            container.innerHTML = '';
            if (window.ONBOARDING_MISSIONS_LOCAL_POOL) {
                window.ONBOARDING_MISSIONS_LOCAL_POOL.forEach(mission => {
                    const card = document.createElement('div');
                    card.style = "background: rgba(25, 20, 18, 0.9); border: 1px solid #544432; padding: 8px 10px; border-radius: 3px; display: flex; flex-direction: column; gap: 4px;";
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e6c280; font-size: 12px;">
                            <span>${mission.title}</span>
                            <span style="color: #ffd700;">🪙 ${mission.rewardGold}</span>
                        </div>
                        <div style="font-size: 11px; color: #bfae96; line-height: 1.3; margin: 2px 0; text-align: left;">${mission.text}</div>
                        <button class="menu-btn" style="padding:4px; font-size:13px; background:#1d3a1e; height:28px; margin-top: 4px;" onclick="executeOnboardingMission('${mission.id}', '${mission.allowedHero}', ${mission.rewardGold})">Отправить ${mission.heroIcon}</button>
                    `;
                    container.appendChild(card);
                });
            }
        }
        const misScr = document.getElementById('missions-screen');
        if (misScr) misScr.style.display = 'flex';
    }
};

function executeOnboardingMission(missionId, heroId, rewardGold) {
    localStorage.setItem(`khamach_hero_busy_${heroId}`, 'true');
    localStorage.setItem(`khamach_mission_active_${missionId}`, 'true');
    localStorage.setItem(`khamach_mission_start_${missionId}`, Date.now().toString());
    localStorage.setItem('khamach_gold', rewardGold.toString()); // Выдаем золото за контракт
    
    localStorage.setItem('khamach_missions_tutorial_done', 'true');
    const misScr = document.getElementById('missions-screen');
    if (misScr) misScr.style.display = 'none';
    window.location.href = 'gate.html?t=' + Date.now();
}
