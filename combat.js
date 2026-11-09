/* ==========================================================================
   КХАМАЧ — ВЫЧИСЛИТЕЛЬНОЕ ЯДРО ПОШАГОВОГО БОЯ (ИСПРАВЛЕН - v6.0.0-STABLE)
   ========================================================================== */

let activeSessionLevel = 2; // Автостарт со 2 уровня

function startCombatSession(level) {
    if (typeof combatData === 'undefined' || !combatData) {
        window.combatData = { currentRound: 1, squad: new Array() };
    }

    activeSessionLevel = level || 2;
    combatData.currentRound = 1;
    
    const calculatedHP = 120 + (activeSessionLevel - 1) * 60;
    combatData.dragonMaxHP = calculatedHP; 
    combatData.dragonHP = calculatedHP;
    
    combatData.playerMaxAP = 3;
    combatData.playerAP = combatData.playerMaxAP;
    
    combatData.tankTaunting = false; 
    combatData.dragonBlinded = false;
    combatData.isActionPhase = false; 
    window.isBoardLocked = false;
    
    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl) {
        const elements = ["ОГНЯ", "ЛЬДА", "ТЬМЫ", "СВЕТА"];
        bossNameEl.innerText = `ДРАКОН ${elements[(activeSessionLevel - 1) % 4]} (ТИР ${activeSessionLevel})`;
    }
    
    const tankHpBonus = (typeof getBuildingLevel === 'function' ? getBuildingLevel('tank') : 0) * 20;

    combatData.squad = [
        { id: "tank", name: "Защитник", hp: 150, maxHP: 150, sp: 0, maxSP: 100, icon: "🛡️", color: "#4a90e2" },
        { id: "damage", name: "Воин", hp: 90, maxHP: 90, sp: 0, maxSP: 100, icon: "🔥", color: "#ff4500" },
        { id: "archer", name: "Стрелок", hp: 100, maxHP: 100, sp: 0, maxSP: 100, icon: "⚡", color: "#f1c40f" },
        { id: "mage", name: "Маг", hp: 80, maxHP: 80, sp: 0, maxSP: 100, icon: "💚", color: "#2ecc71" }
    ];
    
    combatData.squad.forEach(hero => {
        let base = (hero.id === "tank" ? 150 : hero.id === "damage" ? 90 : hero.id === "archer" ? 100 : 80);
        hero.maxHP = base + (hero.id === "tank" ? tankHpBonus : 0);
        
        // ЖЕСТКАЯ ПРОВЕРКА ЭКСПЕДИЦИИ: Если Танк на задании Ратуши — выключаем его намертво из боя
        if (localStorage.getItem(`khamach_hero_busy_${hero.id}`) === 'true') {
            hero.hp = 0;
            hero.sp = 0;
        } else {
            hero.hp = hero.maxHP; 
            hero.sp = 0; 
        }
    });
    
    if (typeof injectCombatInterfaceBaseDOM === 'function') injectCombatInterfaceBaseDOM();
    if (typeof buildDragonDOM === 'function') buildDragonDOM();
    if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    if (typeof initMatch3Board === 'function') initMatch3Board();
}

function chargeHeroSuperpowers(effects) {
    if (!combatData || !combatData.squad) return;
    combatData.squad.forEach(hero => {
        if (!hero || hero.hp <= 0) return; // Танк на задании энергию не копит
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
        // Танк не может провоцировать, если он на задании (hp = 0)
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
