import fs from "fs";
import path from "path";
import { bot } from "../../index.js";

export function checkDB(id) {
    let exists;
    exists =
        fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"))
        ||
        fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"))
        ||
        fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"));

    return exists;
}

export function getDB(id) {
    let r = { exists: false, data: {}, id: id, guild: undefined, guildName: undefined, guildEmoji: undefined, guildID: undefined };
    if (fs.existsSync((path.resolve("./db/LSPD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + id + ".json"), "utf-8"));
        r.guild = 1;
        r.guildName = "LSPD";
        r.guildEmoji = bot.LEA.e.LSPD;
        r.guildID = bot.LEA.g.LSPD[0];
    } else if (fs.existsSync((path.resolve("./db/LSSD") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + id + ".json"), "utf-8"));
        r.guild = 2;
        r.guildName = "LSSD";
        r.guildEmoji = bot.LEA.e.LSSD;
        r.guildID = bot.LEA.g.LSSD[0];
    } else if (fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + id + ".json"), "utf-8"));
        r.guild = 3;
        r.guildName = "SAHP";
        r.guildEmoji = bot.LEA.e.SAHP;
        r.guildID = bot.LEA.g.SAHP[0];
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
        r.name = "LSPD";
        r.footer = { text: `LSPD | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
        r.id = 1;
    } else if (bot.LEA.g.LSSD.includes(guildID)) {
        r.name = "LSSD";
        r.footer = { text: `LSSD | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.LSSD };
        r.color = bot.LEA.c.LSSD;
        r.id = 2;
    } else if (bot.LEA.g.SAHP.includes(guildID)) {
        r.name = "SAHP";
        r.footer = { text: `SAHP | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.SAHP };
        r.color = bot.LEA.c.SAHP;
        r.id = 3;
    } else {
        r.name = "XXXX";
        r.footer = { text: `LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.LEAbot };
        r.color = bot.LEA.c.LEAbot;
        r.id = 0;
    }

    return r;
}