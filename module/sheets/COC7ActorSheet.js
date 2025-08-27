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
    }
}