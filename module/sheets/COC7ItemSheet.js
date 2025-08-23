export default class COC7ItemSheet extends ItemSheet {
    get template() {
        return `systems/krwstar_CoC7/templates/sheets/${this.item.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        
        data.config = CONFIG.coc7;
        data.system = this.item.system;

        return data;
    }
}