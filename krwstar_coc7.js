import { coc7 } from "./module/config.js";
import COC7ItemSheet from "./module/sheets/COC7ItemSheet.js";

Hooks.once("init", function () {
    console.log("CoC7 | Initializing krwstar's CoC7")

    CONFIG.coc7 = coc7;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("krwstar_CoC7", COC7ItemSheet, { makeDefault: true })

});