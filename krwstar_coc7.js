import { coc7 } from "./module/config.js";
import COC7Actor from "./module/actor/COC7Actor.js";
import COC7ActorSheet from "./module/sheets/COC7ActorSheet.js";
import COC7ItemSheet from "./module/sheets/COC7ItemSheet.js";

Hooks.once("init", function () {
    console.log("CoC7 | Initializing krwstar's CoC7")

    CONFIG.coc7 = coc7;
    CONFIG.Actor.documentClass = COC7Actor;

    //기본 시트 해제 및 커스텀 시트 등록
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);
    
    Actors.registerSheet("krwstar_CoC7", COC7ActorSheet, { makeDefault: true })
    Items.registerSheet("krwstar_CoC7", COC7ItemSheet, { makeDefault: true })

});