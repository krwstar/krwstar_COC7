export default class COC7Actor extends Actor {
    /** @override */

    // 피해보너스, 체구 계산기
    _getDamageBonusAndBuild(sum) {
        if (sum <= 64)  return { db: "-2",  build: -2 };
        if (sum <= 84)  return { db: "-1",  build: -1 };
        if (sum <= 124) return { db: "0",   build: 0  };
        if (sum <= 164) return { db: "1d4", build: 1  };
        if (sum <= 204) return { db: "1d6", build: 2  };

        // 205 이상부터는 80점마다 +1d6 / +1 build
        const offset = Math.floor((sum - 205) / 80); // 205~284 -> 0, 285~364 -> 1, ...
        const dice   = 2 + offset;                   // 2d6부터 시작
        const build  = 3 + offset;                   // build 3부터 시작
        return { db: `${dice}d6`, build };
    }

    // 민첩과 근력이 크기보다 작으면 7
    // 둘다 크기보다 크면 9
    // 하나가 크기 이상이거나 세 값이 같으면 8
    _getMove(str, dex, siz) {
        if (str < siz && dex < siz) return 7;
        if (str > siz && dex > siz) return 9;
        return 8;
    }

    prepareData() {
        super.prepareData();

        const system = this.system;

        // 스탯 기본값
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

        const str = Number(system.stat.STR?.base) || 0;
        const con = Number(system.stat.CON?.base) || 0;
        const siz = Number(system.stat.SIZ?.base) || 0;
        const dex = Number(system.stat.DEX?.base) || 0;
        const pow = Number(system.stat.POW?.base) || 0;
        const int = Number(system.stat.INT?.base) || 0;
        const edu = Number(system.stat.EDU?.base) || 0;

        
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
        for (let [key, skill] of Object.entries(defaultSkills)) {
            if (!system.skills[key]) {
                system.skills[key] = { base: skill.base, point: skill.point };
            }
            system.skills[key].isDefault = true;
        }
        
        system.skills["languageOwn"].base = edu;
        system.skills["dodge"].base = Math.floor(dex / 2);

        // 파생치 계산
        for (let [key, skill] of Object.entries(system.skills)) {
            const base = Number(skill.base) || 0;
            const point = Number(skill.point) || 0;
            const total = base + point;

            system.skills[key].total = total;
            system.skills[key].half = Math.floor(total / 2);
            system.skills[key].fifth = Math.floor(total / 5);

            if (system.skills[key].isDefault == null) {
                system.skills[key].isDefault = false;
                system.skills[key].label ??= "새 스킬";
            }
        }


        // 스테이터스 기본값
        system.status ??= {};
        const cthulhuMythos = Number(system.skills["cthulhuMythos"]?.total) || 0;

        // HP = (CON + SIZ) / 10
        const hpMax = Math.floor((con + siz) / 10);
        
        if (typeof system.status.HP !== "object") {
            system.status.HP = { value: hpMax, max: hpMax };
        }

        system.status.HP.max = hpMax;
        if (system.status.HP.value == null) {
            system.status.HP.value = hpMax;
        }

        // MP =  POW / 5
        const mpMax = Math.floor(pow / 5);

        if (typeof system.status.MP !== "object") {
            system.status.MP = { value: mpMax, max: mpMax };
        }

        system.status.MP.max = mpMax;
        if (system.status.MP.value == null) {
            system.status.MP.value = mpMax;
        }
        
        //SAN = POW
        const sanMax = pow;
        const sanLimit = 99 - cthulhuMythos;

        if (typeof system.status.SAN !== "object") {
            system.status.SAN = { value: sanMax, max: sanMax, limit: sanLimit };
        }

        system.status.SAN.max = sanMax;
        system.status.SAN.limit = sanLimit;
        if (system.status.SAN.value == null) {
            system.status.SAN.value = sanMax;
        }

        // 피해보너스, 체구
        const { db, build } = this._getDamageBonusAndBuild(str + siz);
        system.status.db = db;
        system.status.build = build;

        // 이동력
        system.status.move = this._getMove(str, dex, siz);


        // 스킬 포인트
        system.points ??= {};
        const jobSkillPoints = edu * 4;
        const hobbySkillPoints = int * 2;
        const skillGrowth = Number(system.points?.skillGrowth) || 0;
        
        let allocatedPoints = 0;
        for (let [key, skill] of Object.entries(system.skills)) {
            allocatedPoints += Number(skill.point) || 0;
        }

        const remainingPoints = jobSkillPoints + hobbySkillPoints + skillGrowth - allocatedPoints;

        system.points.jobSkillPoints = jobSkillPoints;
        system.points.hobbySkillPoints = hobbySkillPoints;
        system.points.remainingPoints = remainingPoints;
        system.points.skillGrowth = skillGrowth;
    }
}
