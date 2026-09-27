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
        fs.existsSync((path.resolve("./db/SAHP") + "/" + id + ".json"))
        ||
        fs.existsSync((path.resolve("./db/SAND") + "/" + id + ".json"));

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
    } else if (fs.existsSync((path.resolve("./db/SAND") + "/" + id + ".json"))) {
        r.exists = true;
        r.data = JSON.parse(fs.readFileSync((path.resolve("./db/SAND") + "/" + id + ".json"), "utf-8"));
        r.guild = 4;
        r.guildName = "SAND";
        r.guildEmoji = bot.LEA.e.SAND;
        r.guildID = bot.LEA.g.SAND[0];
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
        r.id = 1;
        r.name = "LSPD";
        r.footer = { text: `LSPD | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.LSPD };
        r.color = bot.LEA.c.LSPD;
        r.ranks = path.resolve("./db/LSPD.json");
    } else if (bot.LEA.g.LSSD.includes(guildID)) {
        r.id = 2;
        r.name = "LSSD";
        r.footer = { text: `LSSD | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.LSSD };
        r.color = bot.LEA.c.LSSD;
        r.ranks = path.resolve("./db/LSSD.json");
    } else if (bot.LEA.g.SAHP.includes(guildID)) {
        r.id = 3;
        r.name = "SAHP";
        r.footer = { text: `SAHP | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.SAHP };
        r.color = bot.LEA.c.SAHP;
        r.ranks = path.resolve("./db/SAHP.json");
    } else if (bot.LEA.g.SAND.includes(guildID)) {
        r.id = 4;
        r.name = "SAND";
        r.footer = { text: `SAND | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.SAND };
        r.color = bot.LEA.c.SAND;
        r.ranks = path.resolve("./db/SAND.json");
    } else {
        r.id = 0;
        r.name = "XXXX";
        r.footer = { text: `LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.LEAbot };
        r.color = bot.LEA.c.LEAbot;
        r.ranks = false;
    }

    return r;
}

export function getRank(rank, ranks) {
    if (!ranks) return undefined;

    if (Number.isInteger(rank)) return ranks[ranks.length - rank - 1];
    else return ranks.find(rankData => rankData.rank === rank);
}

export function checkPermission(member, target, guildID) {
    const rankLoc = getServer(guildID).ranks
    if (!rankLoc) return false;
    const ranks = JSON.parse(fs.readFileSync(rankLoc, "utf-8"));

    const targetRank = getRank(target, ranks);
    if (member.user.id === bot.LEA.o) return true;
    if (!targetRank) return false;

    const memberRankName = ranks
        .map(rankData => rankData.rank)
        .find(rank => member.roles.cache.has(getRank(rank, ranks).roles[0]));
    const memberRank = getRank(memberRankName, ranks);

    return memberRank && ranks.indexOf(memberRank) < ranks.indexOf(targetRank);
}