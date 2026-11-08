/* ==========================================================================
   КХАМАЧ — АВТОНОМНЫЙ МОДУЛЬ ОБРАБОТЧИКОВ ИНТЕРФЕЙСА (ОБНОВЛЕН - v5.7.71-FIX)
   ========================================================================== */

window.closeModeDescriptionUnified = function() {
    showScreen('main-menu');
};

function safeBindElementClick(id, callback, checkLock = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (checkLock && el.classList.contains('progression-locked')) {
            return false;
        }
        callback();
    };
}

function setupAllGameListeners() {
    document.onclick = null;
    document.body.onclick = null;

    document.addEventListener('click', function initAudioOnFirstClick() {
        if (typeof startBackgroundMusic === 'function') {
            startBackgroundMusic();
        }
        document.removeEventListener('click', initAudioOnFirstClick);
    }, { once: true });

    // Жесткая привязка кнопок основной сетки Хаба
    safeBindElementClick('to-combat-btn', function() {
        showScreen('dragon-select-screen');
    });

    safeBindElementClick('to-missions-btn', function() {
        showScreen('missions-screen');
        if (typeof renderMissionsDOM === 'function') renderMissionsDOM();
    });

    safeBindElementClick('to-squad-btn', function() {
        showScreen('squad-screen');
    });

    safeBindElementClick('to-storage-btn', function() {
        showScreen('squad-heroes-spec-screen');
        if (typeof window.updateSquadHeroesSpecScreenDOM === 'function') {
            window.updateSquadHeroesSpecScreenDOM();
        }
    });

    safeBindElementClick('to-chronicle-btn', function() {
        showScreen('chronicle-screen');
        if (typeof renderChronicleDOM === 'function') renderChronicleDOM();
    });

    safeBindElementClick('to-clans-btn', function() {
        if (typeof window.openModeDescription === 'function') {
            window.openModeDescription('clans');
        }
    });

    safeBindElementClick('to-settings-btn', function() {
        const musicSlider = document.getElementById('volume-music-slider');
        const fxSlider = document.getElementById('volume-fx-slider');
        if (musicSlider) musicSlider.value = (parseFloat(localStorage.getItem('khamach_vol_music') || '0.5') * 100);
        if (fxSlider) fxSlider.value = (parseFloat(localStorage.getItem('khamach_vol_fx') || '0.7') * 100);
        showScreen('settings-screen');
    });

    safeBindElementClick('info-btn', function() {
        const textContainer = document.getElementById('info-screen-text');
        if (textContainer && typeof getTownText === 'function') textContainer.innerHTML = getTownText('mainInfo');
        showScreen('info-screen');
    });

    // Обработчики возвратов на главный экран
    safeBindElementClick('from-select-to-menu-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('from-info-to-menu-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-settings-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-heroes-spec-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-storage-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-missions-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-chronicle-btn', function() { showScreen('main-menu'); });
    safeBindElementClick('close-squad-btn', function() { showScreen('main-menu'); });

    // КРИТИЧЕСКИЙ ФИКС СИНТАКСИСА: Передаем валидный пустой массив вместо пустоты во избежание сбоя ядра
    safeBindElementClick('clear-chronicle-btn', function() {
        if (confirm("Очистить все записи в Летописи Цитадели?")) {
            localStorage.setItem('khamach_chronicle_logs', JSON.stringify([]));
            if (typeof renderChronicleDOM === 'function') renderChronicleDOM();
        }
    });

    const goldDisplayLink = document.getElementById('main-gold-display');
    if (goldDisplayLink) {
        goldDisplayLink.onclick = function() {
            showScreen('storage-screen');
        };
    }
}
