export default class COC7ActorSheet extends ActorSheet {
    get template() {
        return `systems/krwstar_CoC7/templates/sheets/actor-sheet.html`
    }

    getData() {
        const data = super.getData();
        
        data.config = CONFIG.coc7;
        data.system = this.actor.system;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // 스테이터스 추가
        html.find(".status-add").click(async () => {
            const newKey = `custom_${foundry.utils.randomID()}`;
            const data = { value: 0, max: 0, label: "새 스테이터스", isDefault: false };

            const system = foundry.utils.duplicate(this.actor.system);

            const newStatus = {};
            for (let [key, value] of Object.entries(system.status || {})) {
                newStatus[key] = value;
            }
            newStatus[newKey] = data;

            system.status = newStatus;

            await this.actor.update({ system });
        });

        // 스테이터스 삭제
        html.find(".status-delete").click(async ev => {
            const key = ev.currentTarget.dataset.stat;
            const stat = this.actor.system.status?.[key];
            if (stat?.isDefault) {
                ui.notifications?.warn("기본 스테이터스는 삭제할 수 없습니다.");
                return;
            }
            await this.actor.update({ [`system.status.-=${key}`]: null });
        });

        // 스킬 추가
        html.find(".skill-add").click(async () => {
            const newKey = `custom_${foundry.utils.randomID()}`;
            const data = { base: 0, point: 0, label: "새 스킬", isDefault: false };
            await this.actor.update({ [`system.skills.${newKey}`]: data });
        });

        // 스킬 삭제
        html.find(".skill-delete").click(async (ev) => {
            const key = ev.currentTarget.dataset.skill;

            // 기본 스킬 가드
            const skill = this.actor.system.skills?.[key];
            if (skill?.isDefault) {
                ui.notifications?.warn("기본 스킬은 삭제할 수 없습니다.");
                return;
            }

            await this.actor.update({ [`system.skills.-=${key}`]: null });
        });

        
        // 코코포리아용 JSON 복붙
        html.find(".import-ccfolia").click(async ev => {
            const input = html.find("textarea.ccfolia-json").val();
            let parsed;
            try {
                parsed = JSON.parse(input);
            } catch (err) {
                ui.notifications.error("JSON 파싱 실패! 콘솔 로그 참고");
                console.log(err);
                return;
            }

            if (parsed.data.name) {
                await this.actor.update({ name: parsed.data.name });
            }

            const statMap = {
                "근력": "STR",
                "건강": "CON",
                "크기": "SIZ",
                "민첩": "DEX",
                "외모": "APP",
                "지능": "INT",
                "정신력": "POW",
                "교육": "EDU",
                "행운": "LUK",
            };

            const statusMap = {
                "HP": "HP",
                "MP": "MP",
                "SAN": "SAN",
                "체구": "build",
                "피해 보너스": "db",
                "이동력": "move"
            };

            const skillMap = {
                "감정": { key: "appraise", base: 5 },
                "고고학": { key: "archaeology", base: 1 },
                "관찰력": { key: "spotHidden", base: 25 },
                "근접전(격투)": { key: "fightingBrawl", base: 25 },
                "기계수리": { key: "mechanicalRepair", base: 10 },
                "도약": { key: "jump", base: 20 },
                "듣기": { key: "listen", base: 20 },
                "말재주": { key: "fastTalk", base: 5 },
                "매혹": { key: "charm", base: 15 },
                "법률": { key: "law", base: 5 },
                "변장": { key: "disguise", base: 5 },
                "사격(권총)": { key: "firearmsHandgun", base: 20 },
                "사격(라이플/산탄총)": { key: "firearmsRifleShotgun", base: 25 },
                "설득": { key: "persuade", base: 10 },
                "손놀림": { key: "sleightOfHand", base: 10 },
                "수영": { key: "swim", base: 20 },
                "승마": { key: "ride", base: 5 },
                "심리학": { key: "psychology", base: 10 },
                "모국어": { key: "languageOwn", base: (edu) => edu },
                "역사": { key: "history", base: 5 },
                "열쇠공": { key: "locksmith", base: 1 },
                "오르기": { key: "climb", base: 20 },
                "오컬트": { key: "occult", base: 5 },
                "위협": { key: "intimidate", base: 15 },
                "은밀행동": { key: "stealth", base: 20 },
                "응급처치": { key: "firstAid", base: 30 },
                "의료": { key: "medicine", base: 1 },
                "인류학": { key: "anthropology", base: 1 },
                "자동차운전": { key: "driveAuto", base: 20 },
                "자료조사": { key: "libraryUse", base: 20 },
                "자연": { key: "naturalWorld", base: 10 },
                "재력": { key: "creditRating", base: 0 },
                "전기수리": { key: "electricalRepair", base: 10 },
                "정신분석": { key: "psychoanalysis", base: 1 },
                "중장비조작": { key: "operateHeavyMachinery", base: 1 },
                "추적": { key: "track", base: 10 },
                "크툴루 신화": { key: "cthulhuMythos", base: 0 },
                "투척": { key: "throw", base: 20 },
                "항법": { key: "navigate", base: 10 },
                "회계": { key: "accounting", base: 5 },
                "회피": { key: "dodge", base: (dex) => Math.floor(dex/2) },
                "컴퓨터": { key: "computerUse", base: 5 },
            };

            
            const system = foundry.utils.duplicate(this.actor.system);

            for (let line of parsed.data.commands.split("\n")) {
                const m = line.match(/^cc<=([0-9]+) 【(.+)】/);
                if (!m) continue;
                const total = parseInt(m[1]);
                const label = m[2];

                if (statMap[label]) {
                    system.stat[statMap[label]].base = total;
                    continue;
                }

                if (skillMap[label]) {
                    const { key, base } = skillMap[label];

                    let baseValue;
                    if (typeof base === "function") {
                        // 함수인 경우 필요한 스탯만 넘겨주기
                        if (key === "languageOwn") {
                            baseValue = base(Number(system.stat.EDU?.base) || 0);
                        } else if (key === "dodge") {
                            baseValue = base(Number(system.stat.DEX?.base) || 0);
                        } else {
                            baseValue = 0;
                        }
                    } else {
                        baseValue = base;
                    }

                    system.skills[key].base = baseValue ?? 0;
                    system.skills[key].point = Math.max((total ?? 0) - (baseValue ?? 0), 0);

                    if (system.skills[key].point == null) system.skills[key].point = 0;

                    continue;
                }

                const newKey = `custom_${foundry.utils.randomID()}`;
                system.skills[newKey] = { base: 0, point: total, label, isDefault: false };
            }

            if (parsed.data.status) {
                for (let st of parsed.data.status) {
                    const label = st.label;
                    const value = st.value ?? 0;
                    const max   = st.max ?? 0;

                    if (statusMap[label]) {
                        const key = statusMap[label];

                        if (key === "SAN") {
                            system.status.SAN.value = value;
                            system.status.SAN._importMax = max; 
                        } else {
                            system.status[key].value = value;
                            if (system.status[key].max !== undefined) {
                                system.status[key].max = max;
                            }
                        }
                    } else {
                        const newKey = `custom_${foundry.utils.randomID()}`;
                        system.status[newKey] = {
                            value,
                            max,
                            label,
                            isDefault: false
                        };
                    }
                }
            }

            await this.actor.update({ system });
            ui.notifications.info("코코포리아 JSON 불러오기 완료");
        })

        
        // 아이템 생성
        html.find(".item-create").click(async ev => {
            const type = ev.currentTarget.dataset.type; // item or weapon
            const itemData = {
                name: type === "weapon" ? "새 무기" : "새 아이템",
                type,
                system: {}
            };
            await this.actor.createEmbeddedDocuments("Item", [itemData]);
        });

        // 아이템 편집
        html.find(".item-edit").click(ev => {
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // 아이템 삭제
        html.find(".item-delete").click(async ev => {
            const li = $(ev.currentTarget).closest(".item");
            const itemId = li.data("itemId");
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        });

    }
}