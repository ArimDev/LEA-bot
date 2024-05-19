import { getDB } from "../../src/functions/db.js";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export async function getProfile(bot, id) {
    const db = await getDB(id);
    const rep = await getRep(id);
    if (!db.exists) return false;
    //IF LEFT CHECK
    /*const guild = await bot.guilds.fetch(db.guildID);
    if (!guild) return false;
    const member = await guild.members.fetch(id);
    if (!member) return false;*/
    const worker = db.data;
    let profileEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .setDescription(
            `> **App:** <@${id}>\n`
            + `> **Volačka:** \`${worker.radio}\`\n`
            + `> **Hodnost:** \`${worker.rank}\`\n`
            + `> **Odznak:** \`${worker.badge}\`\n`
            + (worker.folder ? `> **Složka:** <#${worker.folder}>\n` : "> **Složka:** `N/A`\n")
            + `> **Počet hodin:** \`${worker.hours}\``
            + (rep.p === 0 && rep.n === 0 ? "" : `> **Reputace:** \`${rep.p !== 0 ? `+${rep.p}` : ``} ${rep.n !== 0 ? `-${rep.n}` : ``}\``)
        )
        .setColor(bot.LEA.c[db.guildName])
        .setThumbnail(bot.LEA.i[db.guildName])
        .setFooter({ text: `${db.guildName} | Vytvořil b1ngo ✌️`, iconURL: bot.LEA.i[db.guildName] });
    return profileEmbed;
}

export async function findWorker(type, input) {
    let workers = [], result = false;
    const types = ["id", "radio", "badge", "name"];
    if (!types.includes(type)) return false;

    if (type === "id") return await getDB(input);

    workers = fs.readdirSync(path.resolve("./db/LSPD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
    workers = workers.concat(fs.readdirSync(path.resolve("./db/LSSD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json"));
    for (const log of workers) {
        const gotDB = await getDB(log.split(".")[0]);
        if (!gotDB.exists) continue;
        const worker = gotDB.data;
        if (type === "radio") {
            if (input.toLowerCase() === worker.radio.toLowerCase().replace(" ", "-")) {
                result = { data: gotDB, id: log.split(".")[0] };
                break;
            }
        } else if (type === "badge") {
            if (input === worker.badge) {
                result = { data: gotDB, id: log.split(".")[0] };
                break;
            }
        } else if (type === "name") {
            if (worker.name.toLowerCase().includes(input.toLowerCase())) {
                result = { data: gotDB, id: log.split(".")[0] };
                break;
            }
        }
    }

    return result;
}

export async function getRep(id) {
    const db = await getDB(id);
    if (!db) return false;
    let r = { id: id, p: 0, n: 0 };
    if (!db.data.reputations) return r;
    for (const rep of db.data.reputations) {
        if (rep.positive) r.p++;
        else if (!rep.positive) r.n++;
    }
    return r;
}