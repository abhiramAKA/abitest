/* ==========================================================================
   КХАМАЧ — МОДУЛЬ ОБРАБОТЧИКОВ И ЗВУКОВОГО ОТКЛИКА НАСТРОЕК (v6.2.2)
   ========================================================================== */

window.closeModeDescriptionUnified = function() {
    showScreen('squad-screen');
};

function safeBindElementClick(id, callback, checkLock = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (checkLock && el.classList.contains('progression-locked')) return false;
        callback();
    };
}

function setupAllGameListeners() {
    document.onclick = null;
    document.body.onclick = null;

    document.addEventListener('click', function initAudioOnFirstClick() {
        if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
        document.removeEventListener('click', initAudioOnFirstClick);
    }, { once: true });

    safeBindElementClick('to-combat-btn', function() { showScreen('dragon-select-screen'); });
    safeBindElementClick('to-missions-btn', function() { showScreen('missions-screen'); });
    safeBindElementClick('to-squad-btn', function() { showScreen('squad-screen'); });
    safeBindElementClick('to-storage-btn', function() { showScreen('squad-heroes-spec-screen'); });
    safeBindElementClick('to-chronicle-btn', function() { showScreen('chronicle-screen'); });
    safeBindElementClick('indicator-gold-btn', function() { showScreen('storage-screen'); });

    safeBindElementClick('to-settings-btn', function() {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        const musicSlider = document.getElementById('volume-music-slider');
        const fxSlider = document.getElementById('volume-fx-slider');
        
        if (musicSlider) {
            musicSlider.value = Math.round(parseFloat(localStorage.getItem('khamach_vol_music') || '0.5') * 100);
            musicSlider.oninput = function() {
                const val = this.value / 100;
                localStorage.setItem('khamach_vol_music', val.toString());
                if (typeof setMusicVolume === 'function') setMusicVolume(val);
            };
        }
        if (fxSlider) {
            fxSlider.value = Math.round(parseFloat(localStorage.getItem('khamach_vol_fx') || '0.7') * 100);
            fxSlider.oninput = function() {
                const val = this.value / 100;
                localStorage.setItem('khamach_vol_fx', val.toString());
                if (typeof setEffectsVolume === 'function') setEffectsVolume(val);
            };
            // Проигрываем тестовый звук при отпускании ползунка эффектов
            fxSlider.onchange = function() {
                const val = this.value / 100;
                localStorage.setItem('khamach_vol_fx', val.toString());
                if (typeof setEffectsVolume === 'function') setEffectsVolume(val);
                if (typeof playMatch3Sound === 'function') playMatch3Sound('swap');
            };
        }
        showScreen('settings-screen');
        setupAllGameListeners();
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

    safeBindElementClick('team-fatigue-display', function() {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        const scr = document.getElementById('squad-fatigue-screen');
        if (scr) scr.style.display = 'flex';
        setupAllGameListeners();
    });
    safeBindElementClick('close-fatigue-screen-btn', function() {
        const scr = document.getElementById('squad-fatigue-screen');
        if (scr) scr.style.display = 'none';
    });

    safeBindElementClick('indicator-level-btn', function() {
        if (typeof injectTownScreensDOM === 'function') injectTownScreensDOM();
        const scr = document.getElementById('squad-level-info-screen');
        if (scr) scr.style.display = 'flex';
        setupAllGameListeners();
    });
    safeBindElementClick('close-level-info-btn', function() {
        const scr = document.getElementById('squad-level-info-screen');
        if (scr) scr.style.display = 'none';
    });

    safeBindElementClick('clear-chronicle-btn', function() {
        if (confirm("Очистить все записи в Летописи Цитадели?")) {
            localStorage.setItem('khamach_chronicle_logs', JSON.stringify(new Array()));
            if (typeof renderChronicleDOM === 'function') renderChronicleDOM();
        }
    });
}
