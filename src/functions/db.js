import fs from "fs";
import path from "path";
import { bot } from "../../index.js";

export async function checkDB(id, i) {
    let exists;
    if (bot.LEA.g.SAHP.includes(i.guild.id)) exists = await fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"));
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) exists = await fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"));
    else exists = false;

    return exists;
}

export async function checkEVENT(id, i) {
    const exists = await fs.existsSync((path.resolve("./db/event") + "/" + id + ".json"));
    return exists;
}

export function getServer(i) {
    let r = {};

    if (bot.LEA.g.SAHP.includes(i.guild.id)) {
        r.footer = { text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP };
        r.color = bot.LEA.c.SAHP;
    } else if (bot.LEA.g.LSSD.includes(i.guild.id)) {
        r.footer = { text: "LSSD | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSSD };
        r.color = bot.LEA.c.LSSD;
    } else {
        r.footer = { text: "LEA Bot Test | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
    }

    return r;
}