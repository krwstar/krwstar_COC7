import { coc7 } from "./module/config.js";
import COC7Actor from "./module/actor/COC7Actor.js";
import COC7ActorSheet from "./module/sheets/COC7ActorSheet.js";
import COC7ItemSheet from "./module/sheets/COC7ItemSheet.js";

Hooks.once("init", function () {
    console.log("CoC7 | Initializing krwstar's CoC7")

    CONFIG.coc7 = coc7;
    CONFIG.Actor.documentClass = COC7Actor;

    // 기본 시트 해제 및 커스텀 시트 등록
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);
    
    Actors.registerSheet("krwstar_CoC7", COC7ActorSheet, { makeDefault: true })
    Items.registerSheet("krwstar_CoC7", COC7ItemSheet, { makeDefault: true })

});

// 토큰, 액터 이름 상시 동기화
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (!changes.name) return;

    await actor.update({ "prototypeToken.name": changes.name });
    for (const scene of game.scenes) {
            const tokens = scene.tokens.filter(t => t.actor?.id === actor.id);
            for (const token of tokens) {
            if (token.name !== changes.name) {
                await token.update({ name: changes.name });
            }
        }
    }
});

Hooks.on("updateToken", async (tokenDoc, changes, options, userId) => {
    if (!tokenDoc.actor) return;

    const actorName = tokenDoc.actor.name;
    if (changes.name && changes.name !== actorName) {
        await tokenDoc.update({ name: actorName });
    }
});

// 다이스봇
Hooks.on("chatMessage", async (chatLog, messageText, chatData) => {
    if (messageText.startsWith("cc")) {
        let rest = messageText.slice(2).trim();
        let modifier = 0;
        let skillName = rest;

        const match = rest.match(/^([+-]?\d+)(.+)$/);
        if (match) {
            modifier = parseInt(match[1], 10); // 보너스/페널티 다이스
            skillName = match[2].trim();
        }
        
        let actor = game.user.character;
        if (!actor) {
            const controlled = canvas.tokens.controlled[0];
            if (controlled) actor = controlled.actor;
        }

        if (!actor) {
            ui.notifications.warn("굴릴 캐릭터를 찾을 수 없습니다. 사용자 캐릭터를 지정하거나 토큰을 선택하세요");
            return false;
        }

        const labelMap = {
            // 능력치
            "근력": "stat.STR",
            "건강": "stat.CON",
            "크기": "stat.SIZ",
            "민첩": "stat.DEX",
            "외모": "stat.APP",
            "지능": "stat.INT",
            "정신력": "stat.POW",
            "교육": "stat.EDU",
            "행운": "stat.LUK",

            "산치": "status.SAN",
            "산치체크": "status.SAN",

            // 스킬
            "감정": "skills.appraise",
            "고고학": "skills.archaeology",
            "관찰력": "skills.spotHidden",
            "근접전(격투)": "skills.fightingBrawl",
            "기계수리": "skills.mechanicalRepair",
            "도약": "skills.jump",
            "듣기": "skills.listen",
            "말재주": "skills.fastTalk",
            "매혹": "skills.charm",
            "법률": "skills.law",
            "변장": "skills.disguise",
            "사격(권총)": "skills.firearmsHandgun",
            "사격(라이플/산탄총)": "skills.firearmsRifleShotgun",
            "설득": "skills.persuade",
            "손놀림": "skills.sleightOfHand",
            "수영": "skills.swim",
            "승마": "skills.ride",
            "심리학": "skills.psychology",
            "모국어": "skills.languageOwn",
            "역사": "skills.history",
            "열쇠공": "skills.locksmith",
            "오르기": "skills.climb",
            "오컬트": "skills.occult",
            "위협": "skills.intimidate",
            "은밀행동": "skills.stealth",
            "응급처치": "skills.firstAid",
            "의료": "skills.medicine",
            "인류학": "skills.anthropology",
            "자동차운전": "skills.driveAuto",
            "자료조사": "skills.libraryUse",
            "자연": "skills.naturalWorld",
            "재력": "skills.creditRating",
            "전기수리": "skills.electricalRepair",
            "정신분석": "skills.psychoanalysis",
            "중장비조작": "skills.operateHeavyMachinery",
            "추적": "skills.track",
            "크툴루 신화": "skills.cthulhuMythos",
            "투척": "skills.throw",
            "항법": "skills.navigate",
            "회계": "skills.accounting",
            "회피": "skills.dodge",
            "컴퓨터": "skills.computerUse"
        };

        const path = labelMap[skillName];
        let rollTarget;

        if (path?.startsWith("stat.")) {
            const key = path.split(".")[1];
            rollTarget = actor.system.stat[key]?.base;
        } else if (path?.startsWith("skills.")) {
            const key = path.split(".")[1];
            rollTarget = actor.system.skills[key]?.total;
        } else if (path === "status.SAN") {
            rollTarget = actor.system.status.SAN?.value;
        }

        if (rollTarget == null) {
            for (const [key, skill] of Object.entries(actor.system.skills)) {
                if (skill.label === skillName) {
                rollTarget = skill.total;
                break;
                }
            }
        }

        if (rollTarget != null) {
            const ones = (await new Roll("1d10").evaluate()).total % 10;

            // 십의 자리 주사위 여러 개
            const tensDice = [];
            const numTens = 1 + Math.abs(modifier);
            for (let i = 0; i < numTens; i++) {
                tensDice.push((await new Roll("1d10").evaluate()).total % 10);
            }

            // 후보 주사위 전체 값 계산
            function calcD100(tens, ones) {
                let val = tens * 10 + ones;
                if (tens === 0 && ones === 0) val = 100;
                return val;
            }

            const candidates = tensDice.map(t => calcD100(t, ones));

            let result;
            if (modifier > 0) {
                result = Math.min(...candidates);   // 보너스 → 최종값 최소
            } else if (modifier < 0) {
                result = Math.max(...candidates);   // 페널티 → 최종값 최대
            } else {
                result = candidates[0];             // 보정 없음
            }

            let outcome = "실패";
            if (result === 1) {
                outcome = "대성공";
            } else if (result === 100 || (rollTarget < 50 && result >= 96)) {
                outcome = "대실패";
            } else if (result <= Math.floor(rollTarget / 5)) {
                outcome = "대단한 성공";
            } else if (result <= Math.floor(rollTarget / 2)) {
                outcome = "어려운 성공";
            } else if (result <= rollTarget) {
                outcome = "성공";
            }

            // 표시 문자열
            let diceDetail = "";
            if (modifier !== 0) {
                diceDetail = ` (${candidates.join(", ")} → ${result})`;
            }

            const content = `
                <div>
                    <b>${outcome}</b>
                    (주사위: <b>${result}</b>${diceDetail})
                </div>
            `;

            const fakeFormula = `${tensDice.length}d10 + 1d10`;
            const fakeRoll = await new Roll(fakeFormula).evaluate();
            await fakeRoll.toMessage({
                speaker: ChatMessage.getSpeaker({actor}),
                flavor: `${skillName} 판정 (목표치 ${rollTarget}, 보너스/페널티: ${modifier})`,
                content: content
            });

            const effects = {
                "대성공": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/critical.mp3",
                    image: "systems/krwstar_CoC7/images/diceroll/critical.png",
                    duration: 70000   // 1분 10초
                },
                "대단한 성공": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/extreme.wav",
                    image: "systems/krwstar_CoC7/images/diceroll/critical.png",
                    duration: 3000
                },
                "어려운 성공": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/success.wav",
                    image: "systems/krwstar_CoC7/images/diceroll/success.png",
                    duration: 3000
                },
                "성공": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/success.wav",
                    image: "systems/krwstar_CoC7/images/diceroll/success.png",
                    duration: 3000
                },
                "실패": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/fail.wav",
                    image: "systems/krwstar_CoC7/images/diceroll/fail.png",
                    duration: 3000
                },
                "대실패": {
                    sound: "systems/krwstar_CoC7/sounds/diceroll/fumble.wav",
                    image: "systems/krwstar_CoC7/images/diceroll/fumble.png",
                    duration: 5000
                }
            };
        
            const effect = effects[outcome];
            if (effect) {
                showOverlay({ image: effect.image, duration: effect.duration, sound: effect.sound });
            }

        } else {
            ui.notifications.warn(`"${skillName}"에 해당하는 능력치/기능을 찾을 수 없습니다.`);
        }

        return false;
    }
});


let currentSound = null;

async function showOverlay({ image, duration = 5000, sound = null }) {
    // 기존 오버레이 제거
    const old = document.getElementById("dice-overlay");
    if (old) old.remove();

    // 풀스크린 DIV 생성
    const overlay = document.createElement("div");
    overlay.id = "dice-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = 10000;
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.cursor = "pointer";
    overlay.innerHTML = `<img src="${image}" style="max-width:100%; max-height:100%;">`;
    document.body.appendChild(overlay);

    // 사운드 재생
    if (sound) {
        currentSound = await foundry.audio.AudioHelper.play(
            { src: sound, volume: 0.8, autoplay: true, loop: false },
            true
        );
    }

    // 클릭 시 닫기 + 사운드 정지
    overlay.addEventListener("click", () => {
        overlay.remove();
        if (currentSound) {
            try { currentSound.stop(); } catch(e) {}
            currentSound = null;
        }
    });

    // duration 지나면 자동 닫기 + 사운드 정지
    setTimeout(() => {
        overlay.remove();
        if (currentSound) {
            try { currentSound.stop(); } catch(e) {}
            currentSound = null;
        }
    }, duration);
}
