import fs from "fs";
import path from "path";
import { bot } from "../../index.js";

export async function checkDB(id) {
    let exists;
    exists =
        await fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"))
        ||
        await fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"));

    return exists;
}

export async function getDB(id) {
    let r = { exists: false, data: {}, id: id, guild: undefined, guildName: undefined, guildEmoji: undefined, guildID: undefined };
    if (await fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + id + ".json"), "utf-8"));
        r.guild = 1;
        r.guildName = "LSPD";
        r.guildEmoji = "<:LSPD:1178108366514565181>";
        r.guildID = "1154446248934387828";
    } else if (await fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + id + ".json"), "utf-8"));
        r.guild = 2;
        r.guildName = "LSSD";
        r.guildEmoji = "<:LSSD:1178106303198011412>";
        r.guildID = "1139266097921675345";
    }

    return r;
}

export async function checkEVENT(id) {
    const exists = await fs.existsSync((path.resolve("./db/event") + "/" + id + ".json"));
    return exists;
}

export function getServer(guildID) {
    let r = {};

    if (bot.LEA.g.LSPD.includes(guildID)) {
        r.name = "LSPD"
        r.footer = { text: "LSPD | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
        r.id = 1;
    } else if (bot.LEA.g.LSSD.includes(guildID)) {
        r.name = "LSSD"
        r.footer = { text: "LSSD | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LSSD };
        r.color = bot.LEA.c.LSSD;
        r.id = 2;
    } else {
        r.name = "XXXX"
        r.footer = { text: "LEA Bot | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.LEAbot };
        r.color = bot.LEA.c.LEAbot;
        r.id = 0;
    }

    return r;
}