/* ==========================================================================
   КХАМАЧ — КАМПАНИЯ ПРИКЛЮЧЕНИЙ (ЧИСТЫЕ ЗАГОЛОВКИ - v6.2.1-STABLE)
   ========================================================================== */

window.currentActiveChapterView = null;

const BOSS_REQUIRED_MO = {
    1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3,
    7: 4, 8: 4, 9: 5, 10: 5, 11: 6, 12: 6,
    13: 7, 14: 7, 15: 8, 16: 8, 17: 9, 18: 9,
    19: 10, 20: 11, 21: 12, 22: 13, 23: 14, 24: 15
};

function getMaxUnlockedTier() {
    const saved = localStorage.getItem('khamach_max_tier');
    return saved ? parseInt(saved) : 2;
}

function saveCompletedTier(tier) {
    const currentMax = getMaxUnlockedTier();
    if (tier >= currentMax && tier < 24) {
        localStorage.setItem('khamach_max_tier', tier + 1);
    }
}

function handleAdventureBackNavigation() {
    if (typeof showScreen === 'function') showScreen('main-menu');
}

function renderDragonSelectionGrid() {
    const gridContainer = document.getElementById('dragon-levels-grid');
    const backBtn = document.getElementById('from-select-to-menu-btn');
    if (!gridContainer || !window.ADVENTURE_CHAPTERS) return;
    
    gridContainer.innerHTML = '';
    const maxUnlocked = getMaxUnlockedTier();
    const currentMO = typeof window.getSquadPower === 'function' ? window.getSquadPower() : 1;
    
    if (window.currentActiveChapterView === null) {
        if (backBtn) {
            backBtn.style.display = 'block';
            backBtn.innerText = "Назад в меню";
            backBtn.onclick = handleAdventureBackNavigation;
        }
        
        const scrTitle = document.getElementById('adventure-screen-title');
        const scrSubtitle = document.getElementById('adventure-screen-subtitle');
        if (scrTitle) scrTitle.innerText = "РЕЖИМ ПРИКЛЮЧЕНИЯ";
        if (scrSubtitle) scrSubtitle.innerText = "Выберите пространство или бестиарий";

        window.ADVENTURE_CHAPTERS.forEach((ch, idx) => {
            const card = document.createElement('div');
            card.className = "chapter-gothic-card";
            
            const firstBoss = (ch.bosses && ch.bosses.length > 0) ? ch.bosses.at(0) : null;
            let firstBossTier = firstBoss ? firstBoss.tier : 1;
            let reqChapterMO = BOSS_REQUIRED_MO[firstBossTier] || 1;
            
            let isTierLocked = firstBossTier > maxUnlocked;
            let isPowerLocked = currentMO < reqChapterMO;
            
            if (isTierLocked || isPowerLocked) {
                card.style.opacity = "0.45";
                card.style.filter = "grayscale(1)";
                card.style.cursor = "not-allowed";
                const lockReason = isPowerLocked 
                    ? `Требуется уровень отряда: 👑 ${reqChapterMO}` 
                    : `Победите предыдущих боссов для открытия доступа.`;

                card.innerHTML = `
                    <div class="chapter-card-icon">🔒</div>
                    <div style="flex:1;">
                        <div style="color:#6a5335; font-weight:bold; font-size:14px; text-transform:uppercase;">${ch.title}</div>
                        <div style="color:#8a7350; font-size:11px; margin-top:4px;">${lockReason}</div>
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
    
    const activeChapter = window.ADVENTURE_CHAPTERS[window.currentActiveChapterView];
    const isFirstChapter = activeChapter.id === "ch_1";
    
    if (backBtn) {
        backBtn.style.display = 'block';
        backBtn.innerText = "↩️ Назад к списку глав";
        backBtn.onclick = function() {
            window.currentActiveChapterView = null;
            renderDragonSelectionGrid();
        };
    }
    
    const scrTitle = document.getElementById('adventure-screen-title');
    const scrSubtitle = document.getElementById('adventure-screen-subtitle');
    if (scrTitle) scrTitle.innerText = `${activeChapter.icon} ${activeChapter.title.toUpperCase()}`;
    if (scrSubtitle) scrSubtitle.innerText = isFirstChapter ? "Обычные монстры болот" : "Силы и стихии главы";

    const elements = ["Огонь", "Лед", "Тьма", "Свет"];
    
    activeChapter.bosses.forEach(boss => {
        const reqMO = BOSS_REQUIRED_MO[boss.tier] || 1;
        const isTierLocked = boss.tier > maxUnlocked;
        const isPowerLocked = currentMO < reqMO;
        
        const row = document.createElement('div');
        row.className = 'menu-row';
        row.style.margin = '4px 0';
        
        const btn = document.createElement('button');
        btn.className = 'menu-btn dragon-level-btn';
        btn.style.transition = 'all 0.15s ease';
        btn.style.padding = "12px 10px";
        btn.style.fontSize = "13px";
        
        if (isPowerLocked) {
            btn.classList.add('disabled');
            btn.innerHTML = `🔒 ${boss.name} (Требуется уровень: ${reqMO})`;
        } else if (isTierLocked) {
            btn.classList.add('disabled');
            btn.innerHTML = `🔒 Победите предыдущего врага`;
        } else {
            if (isFirstChapter) {
                btn.innerHTML = `${boss.icon} ${boss.name.toUpperCase()} — ${boss.baseHP} HP`;
                btn.style.background = "linear-gradient(to bottom, #2d2621 0%, #171311 100%)";
                btn.style.borderColor = "#544432";
                btn.style.color = "#cdb38c";
            } else {
                const element = elements[(boss.tier - 1) % elements.length];
                btn.innerHTML = `${boss.icon} ${boss.name} [${element}] — ${boss.baseHP} HP`;
                if (element === "Огонь") { btn.style.background = "linear-gradient(to bottom, #3b1717, #1c0a0a)"; btn.style.borderColor = "#9c2a2a"; btn.style.color = "#ff8c8c"; }
                else if (element === "Лед") { btn.style.background = "linear-gradient(to bottom, #162436, #0b121c)"; btn.style.borderColor = "#2a629c"; btn.style.color = "#8cd1ff"; }
                else if (element === "Тьма") { btn.style.background = "linear-gradient(to bottom, #28173b, #130a1c)"; btn.style.borderColor = "#6d2a9c"; btn.style.color = "#e58cff"; }
                else if (element === "Свет") { btn.style.background = "linear-gradient(to bottom, #362e19, #1a160c)"; btn.style.borderColor = "#9c7f2a"; btn.style.color = "#ffe88c"; }
            }
            
            btn.dataset.level = boss.tier;
            btn.addEventListener('click', (e) => {
                selectedDragonLevel = parseInt(e.currentTarget.dataset.level);
                if (typeof startBackgroundMusic === 'function') startBackgroundMusic();
                showScreen('combat-screen');
                if (typeof startCombatSession === 'function') startCombatSession(selectedDragonLevel);
            });
        }
        
        row.appendChild(btn);
        gridContainer.appendChild(row);
    });
}
