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
}