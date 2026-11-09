/* ==========================================================================
   КХАМАЧ — МОДУЛЬ УПРАВЛЕНИЯ И ОТРИСОВКИ РЕЖИМА ПРИКЛЮЧЕНИЙ (v6.1.2-STABLE)
   ========================================================================== */

window.currentActiveChapterView = null;

function getMaxUnlockedTier() {
    const saved = localStorage.getItem('khamach_max_tier');
    return saved ? parseInt(saved) : 1;
}

function saveCompletedTier(tier) {
    const currentMax = getMaxUnlockedTier();
    if (tier >= currentMax && tier < 30) {
        localStorage.setItem('khamach_max_tier', tier + 1);
    }
}

function handleAdventureBackNavigation() {
    if (window.location.pathname.includes('gate.html')) {
        window.location.href = 'hub.html?t=' + Date.now();
    } else {
        if (typeof showScreen === 'function') showScreen('main-menu');
    }
}

function renderDragonSelectionGrid() {
    const gridContainer = document.getElementById('dragon-levels-grid');
    const backBtn = document.getElementById('from-select-to-menu-btn');
    if (!gridContainer || !window.ADVENTURE_CHAPTERS) return;
    
    gridContainer.innerHTML = '';
    const maxUnlocked = getMaxUnlockedTier();
    
    // ЭКРАН 1: Выбор художественной главы кампании
    if (window.currentActiveChapterView === null) {
        if (backBtn) {
            if (window.location.pathname.includes('gate.html')) {
                backBtn.style.display = 'none';
            } else {
                backBtn.style.display = 'block';
                backBtn.innerText = "Назад в меню";
                backBtn.onclick = handleAdventureBackNavigation;
            }
        }
        
        const scrTitle = document.getElementById('adventure-screen-title');
        const scrSubtitle = document.getElementById('adventure-screen-subtitle');
        if (scrTitle) scrTitle.innerText = "РЕЖИМ ПРИКЛЮЧЕНИЯ";
        if (scrSubtitle) scrSubtitle.innerText = "Выберите Пространство или Бестиарий";

        window.ADVENTURE_CHAPTERS.forEach((ch, idx) => {
            const card = document.createElement('div');
            card.className = "chapter-gothic-card";
            
            let isChapterLocked = true;
            if (ch.bosses && ch.bosses.length > 0) {
                const firstBossTier = ch.bosses[0].tier;
                isChapterLocked = firstBossTier > maxUnlocked;
            }
            
            if (isChapterLocked) {
                card.style.opacity = "0.4";
                card.style.filter = "grayscale(1)";
                card.style.cursor = "not-allowed";
                card.innerHTML = `
                    <div class="chapter-card-icon">🔒</div>
                    <div style="flex:1;">
                        <div style="color:#6a5335; font-weight:bold; font-size:14px; text-transform:uppercase;">${ch.title}</div>
                        <div style="color:#4a3f2c; font-size:11px; margin-top:4px;">Победите предыдущие тиры для открытия доступа.</div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="chapter-card-icon">${ch.icon}</div>
                    <div style="flex:1;">
                        <div style="color:#e6c280; font-weight:bold; font-size:15px; text-transform:uppercase; letter-spacing:1px;">${ch.title}</div>
                        <div style="color:#cdb38c; font-size:12px; line-height:1.4; margin-top:4px; text-align:justify;">${ch.description}</div>
                    </div>
                `;
                card.onclick = function() {
                    window.currentActiveChapterView = idx;
                    renderDragonSelectionGrid();
                };
            }
            gridContainer.appendChild(card);
        });
        return;
    }
    
    // ЭКРАН 2: Список конкретных боссов внутри выбранной главы
    const activeChapter = window.ADVENTURE_CHAPTERS[window.currentActiveChapterView];
    const isFirstChapter = activeChapter.id === "ch_1"; // Флаг Гнилых Топей
    
    if (backBtn) {
        backBtn.style.display = 'block';
        backBtn.innerText = "↩️ Назад к списку глав";
        backBtn.onclick = function() {
            window.currentActiveChapterView = null;
            renderDragonSelectionGrid();
        };
    }
    
    // ФИКС ЗАГОЛОВКА: Выводится только чистое лорное название главы
    const scrTitle = document.getElementById('adventure-screen-title');
    const scrSubtitle = document.getElementById('adventure-screen-subtitle');
    if (scrTitle) scrTitle.innerText = `${activeChapter.icon} ${activeChapter.title.toUpperCase()}`;
    if (scrSubtitle) scrSubtitle.innerText = isFirstChapter ? "Обычные монстры болот" : "Силы и стихии главы";

    const elements = ["Огонь", "Лед", "Тьма", "Свет"];
    
    activeChapter.bosses.forEach(boss => {
        const isLocked = boss.tier > maxUnlocked;
        
        const row = document.createElement('div');
        row.className = 'menu-row';
        row.style.margin = '4px 0';
        
        const btn = document.createElement('button');
        btn.className = 'menu-btn dragon-level-btn';
        btn.style.transition = 'all 0.15s ease';
        btn.style.padding = "12px 10px";
        btn.style.fontSize = "13px";
        
        if (isLocked) {
            btn.classList.add('disabled');
            btn.innerHTML = `🔒 Заблокировано текущим прогрессом`;
        } else {
            // ФИКС ВЫВОДА СТРОКИ БОССОВ ДЛЯ ГЛАВЫ 1
            if (isFirstChapter) {
                // Убираем приписки "Тир", "Стихия" и красим в классический серый готический цвет
                btn.innerHTML = `${boss.icon} ${boss.name.toUpperCase()} — ${boss.baseHP} HP`;
                btn.style.background = "linear-gradient(to bottom, #2d2621 0%, #171311 100%)";
                btn.style.borderColor = "#544432";
                btn.style.color = "#cdb38c";
            } else {
                // Для остальных глав сохраняем стихийную цветовую разметку
                const element = elements[(boss.tier - 1) % elements.length];
                btn.innerHTML = `${boss.icon} Тир ${boss.tier} : ${boss.name} [${element}] — ${boss.baseHP} HP`;
                btn.dataset.level = boss.tier;
                
                if (element === "Огонь") {
                    btn.style.background = "linear-gradient(to bottom, #3b1717, #1c0a0a)";
                    btn.style.borderColor = "#9c2a2a"; btn.style.color = "#ff8c8c";
                } else if (element === "Лед") {
                    btn.style.background = "linear-gradient(to bottom, #162436, #0b121c)";
                    btn.style.borderColor = "#2a629c"; btn.style.color = "#8cd1ff";
                } else if (element === "Тьма") {
                    btn.style.background = "linear-gradient(to bottom, #28173b, #130a1c)";
                    btn.style.borderColor = "#6d2a9c"; btn.style.color = "#e58cff";
                } else if (element === "Свет") {
                    btn.style.background = "linear-gradient(to bottom, #362e19, #1a160c)";
                    btn.style.borderColor = "#9c7f2a"; btn.style.color = "#ffe88c";
                }
            }
            
            btn.dataset.level = boss.tier;
            btn.addEventListener('click', (e) => {
                selectedDragonLevel = parseInt(e.currentTarget.dataset.level);
                if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
                showScreen('combat-screen');
                if (typeof startCombatSession === 'function') {
                    startCombatSession(selectedDragonLevel);
                }
            });
        }
        
        row.appendChild(btn);
        gridContainer.appendChild(row);
    });
}
