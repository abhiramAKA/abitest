/* ==========================================================================
   КХАМАЧ — МОДУЛЬ УПРАВЛЕНИЯ И СТРОИТЕЛЬСТВА В ОКНЕ ЦИТАДЕЛИ (v6.1.0)
   ========================================================================== */

function setupSquadInterfaceListeners() {
    const ids = ['tank', 'damage', 'archer', 'mage'];
    ids.forEach(id => {
        const btn = document.getElementById(`upgrade-${id}-btn`);
        if (btn) btn.onclick = function() { if (typeof openModeDescription === 'function') openModeDescription(id); };
    });
    
    const closeBtn = document.getElementById('close-squad-btn');
    if (closeBtn) closeBtn.onclick = function() { showScreen('main-menu'); };

    const globalBuyBtn = document.getElementById('mode-buy-btn');
    if (globalBuyBtn) {
        globalBuyBtn.onclick = function() {
            executeUnifiedBuildingTransaction();
        };
    }

    const squadHelpBtn = document.getElementById('squad-help-btn');
    if (squadHelpBtn) {
        squadHelpBtn.onclick = function() {
            const container = document.getElementById('squad-help-popup-text');
            if (container && typeof TOWN_BUILDING_PRICES !== 'undefined') {
                let html = '<div style="display:flex; flex-direction:column; gap:3px;">';
                for(let i=2; i<=15; i++) {
                    html += `<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #3a3025; padding-bottom:1px;"><span>До уровня ${i}:</span><strong style="color:#ffd700;">🪙 ${TOWN_BUILDING_PRICES[i].toLocaleString('ru-RU')} монет</strong></div>`;
                }
                html += '</div>';
                container.innerHTML = html;
            }
            const popup = document.getElementById('squad-help-popup-screen');
            if (popup) popup.style.display = 'flex';
        };
    }

    const closePopupBtn = document.getElementById('close-squad-help-popup-btn');
    if (closePopupBtn) {
        closePopupBtn.onclick = function() {
            const popup = document.getElementById('squad-help-popup-screen');
            if (popup) popup.style.display = 'none';
        };
    }
}

function executeUnifiedBuildingTransaction() {
    if (!currentOpenedModeKey) return;
    
    const bldId = (['tank', 'damage', 'archer', 'mage'].includes(currentOpenedModeKey)) 
        ? currentOpenedModeKey 
        : null;
        
    if (!bldId) return;

    const currentBldLvl = parseInt(localStorage.getItem(`khamach_build_${bldId}`) || '1');
    if (currentBldLvl >= 15) return;

    const nextLvl = currentBldLvl + 1;
    const cost = TOWN_BUILDING_PRICES[nextLvl]; 
    const currentGold = typeof getPlayerGold === 'function' ? getPlayerGold() : 0;

    if (currentGold < cost) {
        // ТЕКСТ ВАЛИДАЦИИ МОНЕТ
        alert(`Недостаточно средств в казне! Требуется 🪙 ${cost.toLocaleString('ru-RU')} монет.`);
        return;
    }

    localStorage.setItem('khamach_gold', currentGold - cost);
    localStorage.setItem(`khamach_build_${bldId}`, nextLvl);

    if (typeof updateTownGoldDisplay === 'function') updateTownGoldDisplay();
    if (typeof injectSquadInterfaceDOM === 'function') injectSquadInterfaceDOM();
    
    alert(`Модернизация строения успешно завершена! Достигнут ${nextLvl} уровень.`);
    if (typeof openModeDescription === 'function') openModeDescription(currentOpenedModeKey);
}

function updateSquadVisualStyles() {}
