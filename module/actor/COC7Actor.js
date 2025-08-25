export default class COC7Actor extends Actor {
    /** @override */
    prepareData() {
        super.prepareData();

        const system = this.system;

        // 스탯 기본값 보정
        system.stat ??= {};
        system.stat.STR ??= 0;
        system.stat.CON ??= 0;
        system.stat.SIZ ??= 0;
        system.stat.DEX ??= 0;
        system.stat.APP ??= 0;
        system.stat.INT ??= 0;
        system.stat.POW ??= 0;
        system.stat.EDU ??= 0;
        system.stat.LUK ??= 0;

        // 스테이터스 기본값 보정
        system.status ??= {};
        system.status.HP ??= 0;
        system.status.MP ??= 0;
        system.status.SAN ??= 0;
        system.status.build ??= 0;
        system.status.db ??= "";
        system.status.move ??= 0;

        // 스킬 기본값 보정
        const defaultSkills = {
            appraise: 5,
            archaeology: 1,
            spotHidden: 25,
            fightingBrawl: 25,
            mechanicalRepair: 10,
            jump: 20,
            listen: 20,
            fastTalk: 5,
            charm: 15,
            law: 5,
            disguise: 5,
            firearmsHandgun: 20,
            firearmsRifleShotgun: 25,
            persuade: 10,
            sleightOfHand: 10,
            swim: 20,
            ride: 5,
            psychology: 10,
            languageOwn: 0,
            history: 5,
            locksmith: 1,
            climb: 20,
            occult: 5,
            intimidate: 15,
            stealth: 20,
            firstAid: 30,
            medicine: 1,
            anthropology: 1,
            driveAuto: 20,
            libraryUse: 20,
            naturalWorld: 10,
            creditRating: 0,
            electricalRepair: 10,
            psychoanalysis: 1,
            operateHeavyMachinery: 1,
            track: 10,
            cthulhuMythos: 0,
            throw: 20,
            navigate: 10,
            accounting: 5,
            dodge: 0,
            computerUse: 5
        };

        system.skills ??= {};
        for (let [key, val] of Object.entries(defaultSkills)) {
            if (system.skills[key] === undefined) {
                system.skills[key] = val;
            }
        }
    }
}
