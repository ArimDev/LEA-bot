import { getDB } from "../../src/functions/db.js";
import { EmbedBuilder } from "discord.js";

export async function getProfile(bot, id) {
    const db = await getDB(id);
    const rep = await getRep(id);
    if (!db.exists) return false;
    const guild = await bot.guilds.fetch(db.guildID);
    if (!guild) return false;
    const member = await guild.members.fetch(id);
    if (!member) return false;
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

export async function getRep(id) {
    const db = await getDB(id);
    if (!db) return false;
    let r = { id: id, p: 0, n: 0 };
    if (!db.data.reputation) return r;
    for (const rep of db.data.reputation) {
        if (rep.positive) r.p++;
        else if (!rep.positive) r.n++;
    }
    return r;
}