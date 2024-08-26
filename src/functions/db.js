import fs from "fs";
import path from "path";
import { bot } from "../../index.js";
import { generateFooter } from "../../src/functions/other.js";

export function checkDB(id) {
    let exists;
    exists =
        fs.existsSync((path.resolve("./db/LSCSO") + "/" + id + ".json"))
        ||
        fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"));

    return exists;
}

export function getDB(id) {
    let r = { exists: false, data: {}, id: id, guild: undefined, guildName: undefined, guildEmoji: undefined, guildID: undefined };
    if (fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + id + ".json"), "utf-8"));
        r.guild = 1;
        r.guildName = "LSPD";
        r.guildEmoji = "<:LSPD:1178108366514565181>";
        r.guildID = "1154446248934387828";
    } else if (fs.existsSync((path.resolve("./db/LSCSO") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + id + ".json"), "utf-8"));
        r.guild = 2;
        r.guildName = "LSCSO";
        r.guildEmoji = "<:LSCSO:1178106303198011412>";
        r.guildID = "1139266097921675345";
    }

    return r;
}

export function checkEVENT(id) {
    const exists = fs.existsSync((path.resolve("./db/event") + "/" + id + ".json"));
    return exists;
}

export function getServer(guildID) {
    let r = {};

    if (bot.LEA.g.LSPD.includes(guildID)) {
        r.name = "LSPD"
        r.footer = { text: `LSPD | Vytvořil b1ngo 🚀`, iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
        r.id = 1;
    } else if (bot.LEA.g.LSCSO.includes(guildID)) {
        r.name = "LSCSO"
        r.footer = { text: `LSCSO | Vytvořil b1ngo 🚀`, iconURL: bot.LEA.i.LSCSO };
        r.color = bot.LEA.c.LSCSO;
        r.id = 2;
    } else {
        r.name = "XXXX"
        r.footer = { text: `LEA-Bot | Vytvořil b1ngo 🚀`, iconURL: bot.LEA.i.LEAbot };
        r.color = bot.LEA.c.LEAbot;
        r.id = 0;
    }

    return r;
}