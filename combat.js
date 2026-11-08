/* ==========================================================================
   КХАМАЧ — ВЫЧИСЛИТЕЛЬНОЕ ЯДРО ПОШАГОВОГО БОЯ (ИСПРАВЛЕН - v5.7.55-FIX)
   ========================================================================== */

let activeSessionLevel = 1;

function startCombatSession(level) {
    if (typeof combatData === 'undefined' || !combatData) {
        window.combatData = { currentRound: 1, squad: new Array() };
    }

    activeSessionLevel = level || 1;
    combatData.currentRound = 1;
    combatData.pendingComboTutorial = false;
    
    const calculatedHP = 120 + (activeSessionLevel - 1) * 60;
    combatData.dragonMaxHP = calculatedHP; 
    combatData.dragonHP = calculatedHP;
    
    combatData.playerMaxAP = 3;
    combatData.playerAP = combatData.playerMaxAP;
    
    const shieldPerk = typeof getMetaPerkValue === 'function' ? getMetaPerkValue('khamach_perk_shield') : 0;
    const spPerk = typeof getMetaPerkValue === 'function' ? getMetaPerkValue('khamach_perk_sp') : 0;
    
    combatData.tankTaunting = shieldPerk > 0; 
    combatData.dragonBlinded = false;
    combatData.isActionPhase = false; 
    window.isBoardLocked = false;
    
    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl) {
        const elements = ["ОГНЯ", "ЛЬДА", "ТЬМЫ", "СВЕТА"];
        bossNameEl.innerText = `ДРАКОН ${elements[(activeSessionLevel - 1) % 4]} (ТИР ${activeSessionLevel})`;
    }
    
    const tankHpBonus = (typeof getBuildingLevel === 'function' ? getBuildingLevel('tank') : 0) * 20;

    // ГЕНЕРАЦИЯ БАЗОВОГО ОТРЯДА
    combatData.squad = [
        { id: "tank", name: "Защитник", hp: 150, maxHP: 150, sp: 0, maxSP: 100, icon: "🛡️", color: "#4a90e2" },
        { id: "damage", name: "Воин", hp: 90, maxHP: 90, sp: 0, maxSP: 100, icon: "🔥", color: "#ff4500" },
        { id: "archer", name: "Стрелок", hp: 100, maxHP: 100, sp: 0, maxSP: 100, icon: "⚡", color: "#f1c40f" },
        { id: "mage", name: "Маг", hp: 80, maxHP: 80, sp: 0, maxSP: 100, icon: "💚", color: "#2ecc71" }
    ];
    
    combatData.squad.forEach(hero => {
        let base = (hero.id === "tank" ? 150 : hero.id === "damage" ? 90 : hero.id === "archer" ? 100 : 80);
        hero.maxHP = base + (hero.id === "tank" ? tankHpBonus : 0);
        
        // КРИТИЧЕСКИЙ ФИКС: Если в localStorage отмечено, что герой занят — выключаем его из боя (hp = 0)
        if (localStorage.getItem(`khamach_hero_busy_${hero.id}`) === 'true') {
            hero.hp = 0;
            hero.sp = 0;
        } else {
            hero.hp = hero.maxHP; 
            hero.sp = Math.min(hero.maxSP, spPerk * 5); 
        }
    });
    
    if (typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM();
    if (typeof buildDragonDOM === 'function') buildDragonDOM();
    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    if (typeof initMatch3Board === 'function') initMatch3Board();

    const tutorialDone = localStorage.getItem('khamach_combat_tutorial_done') === 'true';
    if (!tutorialDone) {
        window.isBoardLocked = true;
        const welcomeScr = document.getElementById('combat-welcome-tutorial-screen');
        if (welcomeScr) welcomeScr.style.display = 'flex';
    }
}

function chargeHeroSuperpowers(effects) {
    if (!combatData || !combatData.squad) return;
    combatData.squad.forEach(hero => {
        if (!hero || hero.hp <= 0) return;
        if (effects && effects[hero.icon]) hero.sp = Math.min(hero.maxSP, hero.sp + (effects[hero.icon] * 6));
    });
    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
}

function usePlayerActionPoint() {
    if (combatData.isActionPhase || combatData.playerAP <= 0) return; 
    
    combatData.playerAP--;
    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    
    if (combatData.playerAP <= 0) {
        combatData.isActionPhase = true; 
        window.isBoardLocked = true;
        
        const apDisplay = document.getElementById('combat-ap-display');
        if (apDisplay) apDisplay.innerText = "Ход Дракона...";
        setTimeout(executeDragonTurnAI, 600);
    }
}

function executeDragonTurnAI() {
    if (combatData.dragonHP <= 0) return;
    const dModel = document.getElementById('dragon-model');
    if (dModel) dModel.className = 'dragon-attacking';

    const isAoEPhase = (activeSessionLevel >= 5) && (combatData.currentRound % 4 === 0);
    let baseDamage = isAoEPhase ? (20 + activeSessionLevel * 6) : (12 + activeSessionLevel * 4);
    if (combatData.dragonBlinded) { baseDamage = Math.round(baseDamage * 0.5); combatData.dragonBlinded = false; }

    if (isAoEPhase) {
        combatData.squad.forEach(h => { if (h && h.hp > 0) h.hp = Math.max(0, h.hp - baseDamage); });
    } else {
        let target = combatData.squad.find(h => h && h.id === "tank" && h.hp > 0);
        if (!combatData.tankTaunting || !target) {
            let alive = combatData.squad.filter(h => h && h.hp > 0);
            target = alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
        }
        if (target) target.hp = Math.max(0, target.hp - baseDamage);
        combatData.tankTaunting = false; 
    }

    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    
    setTimeout(() => {
        if (dModel) dModel.className = 'dragon-idle';
        
        if (combatData.dragonHP <= 0) {
            combatData.dragonHP = combatData.dragonMaxHP;
        }
        if (combatData.squad.every(h => h.hp <= 0)) {
            combatData.squad.forEach(h => {
                if (localStorage.getItem(`khamach_hero_busy_${h.id}`) !== 'true') {
                    h.hp = h.maxHP;
                }
            });
        }

        combatData.currentRound++; 
        combatData.playerAP = combatData.playerMaxAP;
        
        combatData.isActionPhase = false;
        window.isBoardLocked = false;
        window.selectedCell = null;
        
        const apDisplay = document.getElementById('combat-ap-display');
        if (apDisplay) apDisplay.innerText = "Сделайте ход на поле!";
        if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
        if (typeof renderBoardDOM === 'function') renderBoardDOM(false); 
    }, 1000);
}
