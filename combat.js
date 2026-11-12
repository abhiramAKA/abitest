/* ==========================================================================
   КХАМАЧ — ВЫЧИСЛИТЕЛЬНОЕ ЯДРО ПОШАГОВОГО БОЯ (24 ТИРА - v6.2.0-STABLE)
   ========================================================================== */

let activeSessionLevel = 2;

const BOSS_STATS_BY_TIER = {
    1:  { hp: 120,   dmg: 16,  freq: 3, aoeFreq: 0 },
    2:  { hp: 180,   dmg: 20,  freq: 3, aoeFreq: 0 },
    3:  { hp: 250,   dmg: 25,  freq: 3, aoeFreq: 0 },
    4:  { hp: 340,   dmg: 30,  freq: 3, aoeFreq: 0 },
    5:  { hp: 450,   dmg: 36,  freq: 3, aoeFreq: 0 },
    6:  { hp: 600,   dmg: 42,  freq: 3, aoeFreq: 0 },
    7:  { hp: 800,   dmg: 50,  freq: 3, aoeFreq: 4 },
    8:  { hp: 1050,  dmg: 58,  freq: 3, aoeFreq: 4 },
    9:  { hp: 1350,  dmg: 68,  freq: 3, aoeFreq: 4 },
    10: { hp: 1700,  dmg: 78,  freq: 3, aoeFreq: 4 },
    11: { hp: 2100,  dmg: 90,  freq: 3, aoeFreq: 4 },
    12: { hp: 2600,  dmg: 105, freq: 3, aoeFreq: 4 },
    13: { hp: 3200,  dmg: 115, freq: 2, aoeFreq: 4 },
    14: { hp: 3900,  dmg: 130, freq: 2, aoeFreq: 4 },
    15: { hp: 4700,  dmg: 145, freq: 2, aoeFreq: 4 },
    16: { hp: 5600,  dmg: 165, freq: 2, aoeFreq: 4 },
    17: { hp: 6600,  dmg: 185, freq: 2, aoeFreq: 4 },
    18: { hp: 7800,  dmg: 210, freq: 2, aoeFreq: 4 },
    19: { hp: 9500,  dmg: 240, freq: 2, aoeFreq: 3 },
    20: { hp: 11500, dmg: 275, freq: 2, aoeFreq: 3 },
    21: { hp: 14000, dmg: 315, freq: 2, aoeFreq: 3 },
    22: { hp: 17000, dmg: 360, freq: 2, aoeFreq: 3 },
    23: { hp: 21000, dmg: 410, freq: 2, aoeFreq: 3 },
    24: { hp: 26000, dmg: 480, freq: 2, aoeFreq: 3 }
};

function startCombatSession(level) {
    if (typeof combatData === 'undefined' || !combatData) {
        window.combatData = { currentRound: 1, squad: [] };
    }

    activeSessionLevel = level || 2;
    const bossCfg = BOSS_STATS_BY_TIER[activeSessionLevel] || { hp: 180, dmg: 20, freq: 3, aoeFreq: 0 };

    combatData.currentRound = 1;
    combatData.dragonMaxHP = bossCfg.hp;
    combatData.dragonHP = bossCfg.hp;
    
    combatData.playerMaxAP = bossCfg.freq;
    combatData.playerAP = combatData.playerMaxAP;
    
    combatData.tankTaunting = false;
    combatData.dragonBlinded = false;
    combatData.isActionPhase = false;
    window.isBoardLocked = false;
    
    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl) {
        let bossTitle = `БОСС ТИРА ${activeSessionLevel}`;
        if (window.ADVENTURE_CHAPTERS) {
            for (let ch of window.ADVENTURE_CHAPTERS) {
                let found = ch.bosses.find(b => b.tier === activeSessionLevel);
                if (found) { bossTitle = found.name.toUpperCase(); break; }
            }
        }
        bossNameEl.innerText = bossTitle;
    }
    
    const tankLvl = typeof getHeroLevel === 'function' ? Math.min(15, getHeroLevel('tank')) : 1;
    const tankHpBonus = (typeof HERO_POWER_TABLE !== 'undefined' && HERO_POWER_TABLE.tank)
        ? HERO_POWER_TABLE.tank[tankLvl - 1]
        : (tankLvl - 1) * 20;

    combatData.squad = [
        { id: "tank",   name: "Защитник", hp: 150, maxHP: 150, sp: 0, maxSP: 100, icon: "🛡️", color: "#4a90e2" },
        { id: "damage", name: "Воин",     hp: 90,  maxHP: 90,  sp: 0, maxSP: 100, icon: "🔥", color: "#ff4500" },
        { id: "archer", name: "Стрелок",  hp: 100, maxHP: 100, sp: 0, maxSP: 100, icon: "⚡", color: "#f1c40f" },
        { id: "mage",   name: "Маг",      hp: 80,  maxHP: 80,  sp: 0, maxSP: 100, icon: "💚", color: "#2ecc71" }
    ];
    
    combatData.squad.forEach(hero => {
        let base = (hero.id === "tank" ? 150 : hero.id === "damage" ? 90 : hero.id === "archer" ? 100 : 80);
        hero.maxHP = base + (hero.id === "tank" ? tankHpBonus : 0);
        
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
        if (!hero || hero.hp <= 0) return;
        if (effects && effects[hero.icon]) {
            const hLvl = typeof getHeroLevel === 'function' ? getHeroLevel(hero.id) : 1;
            // Бонус +10% к набору SP на 4, 7, 10 и 13 уровнях
            const spMilestones = (hLvl >= 4 ? 1 : 0) + (hLvl >= 7 ? 1 : 0) + (hLvl >= 10 ? 1 : 0) + (hLvl >= 13 ? 1 : 0);
            const spMult = 1 + spMilestones * 0.10;
            const gainedSP = effects[hero.icon] * 6 * spMult;
            hero.sp = Math.min(hero.maxSP, hero.sp + gainedSP);
        }
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
        if (apDisplay) apDisplay.innerText = "Ход врага...";
        setTimeout(executeDragonTurnAI, 600);
    }
}

function executeDragonTurnAI() {
    if (combatData.dragonHP <= 0) return;
    const dModel = document.getElementById('dragon-model');
    if (dModel) dModel.className = 'dragon-attacking';

    const bossCfg = BOSS_STATS_BY_TIER[activeSessionLevel] || { hp: 180, dmg: 20, freq: 3, aoeFreq: 0 };
    const isAoEPhase = (bossCfg.aoeFreq > 0) && (combatData.currentRound % bossCfg.aoeFreq === 0);
    let baseDamage = bossCfg.dmg;
    
    if (combatData.dragonBlinded) {
        baseDamage = Math.round(baseDamage * 0.5);
        combatData.dragonBlinded = false;
    }

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
    if (typeof checkBattleResolution === 'function') checkBattleResolution();
    
    setTimeout(() => {
        if (combatData.dragonHP <= 0) return;
        if (dModel) dModel.className = 'dragon-idle';
        
        combatData.currentRound++;
        combatData.playerAP = combatData.playerMaxAP;
        combatData.isActionPhase = false;
        window.isBoardLocked = false;
        window.selectedCell = null;
        
        const apDisplay = document.getElementById('combat-ap-display');
        if (apDisplay) apDisplay.innerText = "Сделайте ход на поле!";
        if (typeof updateCombatInterfaceDOM === 'function') updateCombatInterfaceDOM();
    }, 800);
}
