export default class COC7Actor extends Actor {
    /** @override */
    prepareData() {
        super.prepareData();

        const system = this.system;

        // 스탯 기본값
        // system.stat ??= {};
        // system.stat.STR ??= 0;
        // system.stat.CON ??= 0;
        // system.stat.SIZ ??= 0;
        // system.stat.DEX ??= 0;
        // system.stat.APP ??= 0;
        // system.stat.INT ??= 0;
        // system.stat.POW ??= 0;
        // system.stat.EDU ??= 0;
        // system.stat.LUK ??= 0;

        const defaultStat = {
            STR: { base: 0 },
            CON: { base: 0 },
            SIZ: { base: 0 },
            DEX: { base: 0 },
            APP: { base: 0 },
            INT: { base: 0 },
            POW: { base: 0 },
            EDU: { base: 0 },
            LUK: { base: 0 },
        }

        system.stat ??= {};
        for (let [key, def] of Object.entries(defaultStat)) {
            if (!system.stat[key]) {
                system.stat[key] = { base: def.base };
            }
        }
        // 파생치 계산
        for (let [key, stat] of Object.entries(system.stat)) {
            const base = Number(stat.base) || 0;
            system.stat[key].half = Math.floor(base / 2);
            system.stat[key].fifth = Math.floor(base / 5);
        }

        // 스테이터스 기본값
        system.status ??= {};
        system.status.HP ??= 0;
        system.status.MP ??= 0;
        system.status.SAN ??= 0;
        system.status.build ??= 0;
        system.status.db ??= "0";
        system.status.move ??= 0;

        // 스킬 기본값
        const defaultSkills = {
            appraise: { base: 5, point: 0 },
            archaeology: { base: 1, point: 0 },
            spotHidden: { base: 25, point: 0 },
            fightingBrawl: { base: 25, point: 0 },
            mechanicalRepair: { base: 10, point: 0 },
            jump: { base: 20, point: 0 },
            listen: { base: 20, point: 0 },
            fastTalk: { base: 5, point: 0 },
            charm: { base: 15, point: 0 },
            law: { base: 5, point: 0 },
            disguise: { base: 5, point: 0 },
            firearmsHandgun: { base: 20, point: 0 },
            firearmsRifleShotgun: { base: 25, point: 0 },
            persuade: { base: 10, point: 0 },
            sleightOfHand: { base: 10, point: 0 },
            swim: { base: 20, point: 0 },
            ride: { base: 5, point: 0 },
            psychology: { base: 10, point: 0 },
            languageOwn: { base: 0, point: 0 },
            history: { base: 5, point: 0 },
            locksmith: { base: 1, point: 0 },
            climb: { base: 20, point: 0 },
            occult: { base: 5, point: 0 },
            intimidate: { base: 15, point: 0 },
            stealth: { base: 20, point: 0 },
            firstAid: { base: 30, point: 0 },
            medicine: { base: 1, point: 0 },
            anthropology: { base: 1, point: 0 },
            driveAuto: { base: 20, point: 0 },
            libraryUse: { base: 20, point: 0 },
            naturalWorld: { base: 10, point: 0 },
            creditRating: { base: 0, point: 0 },
            electricalRepair: { base: 10, point: 0 },
            psychoanalysis: { base: 1, point: 0 },
            operateHeavyMachinery: { base: 1, point: 0 },
            track: { base: 10, point: 0 },
            cthulhuMythos: { base: 0, point: 0 },
            throw: { base: 20, point: 0 },
            navigate: { base: 10, point: 0 },
            accounting: { base: 5, point: 0 },
            dodge: { base: 0, point: 0 },
            computerUse: { base: 5, point: 0 }
        };
        
        system.skills ??= {};
        for (let [key, def] of Object.entries(defaultSkills)) {
            if (!system.skills[key]) {
                system.skills[key] = { base: def.base, point: def.point };
            }
        }

        // 파생치 계산
        for (let [key, skill] of Object.entries(system.skills)) {
            const base = Number(skill.base) || 0;
            const point = Number(skill.point) || 0;
            const total = base + point;

            system.skills[key].total = total;
            system.skills[key].half = Math.floor(total / 2);
            system.skills[key].fifth = Math.floor(total / 5);
        }
    }
}
