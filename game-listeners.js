/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ОБРАБОТЧИКОВ И НАВИГАЦИОННОЙ UX-ПЕТЛИ (v6.1.3-STABLE)
   ========================================================================== */

window.closeModeDescriptionUnified = function() {
    // UX-ФИКС: Кнопка назад внутри описания здания теперь возвращает в Цитадель, а не в меню города!
    showScreen('squad-screen');
};

function safeBindElementClick(id, callback, checkLock = false) {
    const el = document.getElementById(id); if (!el) return;
    el.onclick = function(e) {
        e.preventDefault(); e.stopPropagation();
        if (checkLock && el.classList.contains('progression-locked')) return false;
        callback();
    };
}

function setupAllGameListeners() {
    document.onclick = null; document.body.onclick = null;

    document.addEventListener('click', function initAudioOnFirstClick() {
        if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
        document.removeEventListener('click', initAudioOnFirstClick);
    }, { once: true });

    safeBindElementClick('to-combat-btn', function() { showScreen('dragon-select-screen'); });
    safeBindElementClick('to-missions-btn', function() { showScreen('missions-screen'); });
    safeBindElementClick('to-squad-btn', function() { showScreen('squad-screen'); });
    safeBindElementClick('to-storage-btn', function() { showScreen('squad-heroes-spec-screen'); });
    safeBindElementClick('to-chronicle-btn', function() { showScreen('chronicle-screen'); });
    
    // ПРИВЯЗКА КНОПОК НОВОЙ ПОДПАНЕЛИ МЕНЮ
    safeBindElementClick('indicator-gold-btn', function() { showScreen('storage-screen'); });
    safeBindElementClick('to-settings-btn', function() {
        const musicSlider = document.getElementById('volume-music-slider'); const fxSlider = document.getElementById('volume-fx-slider');
        if (musicSlider) musicSlider.value = (parseFloat(localStorage.getItem('khamach_vol_music') || '0.5') * 100);
        if (fxSlider) fxSlider.value = (parseFloat(localStorage.getItem('khamach_vol_fx') || '0.7') * 100);
        showScreen('settings-screen');
    });

    safeBindElementClick('info-btn', function() {
        const textContainer = document.getElementById('info-screen-text');
        if (textContainer && typeof getTownText === 'function') textContainer.innerHTML = getTownText('mainInfo');
        showScreen('info-screen');
    });

    safeBindElementClick('to-clans-btn', function() { if (typeof window.openModeDescription === 'function') window.openModeDescription('clans'); });
    safeBindElementClick('from-select-to-menu-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('from-info-to-menu-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-settings-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-heroes-spec-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-storage-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-missions-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-chronicle-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-squad-btn', function() { showScreen('main-menu'); });

    safeBindElementClick('close-fatigue-screen-btn', function() { document.getElementById('squad-fatigue-screen').style.display = 'none'; });
    safeBindElementClick('team-fatigue-display', function() { document.getElementById('squad-fatigue-screen').style.display = 'flex'; });

    safeBindElementClick('clear-chronicle-btn', function() {
        if (confirm("Очистить все записи в Летописи Цитадели?")) {
            localStorage.setItem('khamach_chronicle_logs', JSON.stringify([])); if (typeof renderChronicleDOM === 'function') renderChronicleDOM();
        }
    });
}
