import fs from "fs";
import path from "path";
import { bot } from "../../index.js";

export async function checkDB(id) {
    let exists;
    exists =
        await fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"))
        ||
        await fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"));

    return exists;
}

export async function getDB(id) {
    let r = { exists: false, data: {}, id: id, guild: undefined, guildName: undefined, guildEmoji: undefined, guildID: undefined };
    if (await fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + id + ".json"), "utf-8"));
        r.guild = 1;
        r.guildName = "SAHP";
        r.guildEmoji = "<:SAHP:1174876044570931210>";
        r.guildID = "1139266097921675345";
    } else if (await fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + id + ".json"), "utf-8"));
        r.guild = 2;
        r.guildName = "LSSD";
        r.guildEmoji = "<:LSSD:1178106303198011412>";
        r.guildID = "1167182546853961860";
    }

    return r;
}

export async function checkEVENT(id) {
    const exists = await fs.existsSync((path.resolve("./db/event") + "/" + id + ".json"));
    return exists;
}

export function getServer(guildID) {
    let r = {};

    if (bot.LEA.g.SAHP.includes(guildID)) {
        r.footer = { text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP };
        r.color = bot.LEA.c.SAHP;
        r.id = 1;
    } else if (bot.LEA.g.LSSD.includes(guildID)) {
        r.footer = { text: "LSSD | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSSD };
        r.color = bot.LEA.c.LSSD;
        r.id = 2;
    } else {
        r.footer = { text: "LEA Bot | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
        r.id = 0;
    }

    return r;
}