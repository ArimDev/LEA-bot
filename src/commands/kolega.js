import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB, getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("kolega")
    .setDescription(`Aktuální informace o zaměstnanci z DB`)
    .addUserOption(option =>
        option.setName("worker")
            .setDescription("Vyber kolegu")
            .setRequired(true))
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    let worker = i.options.getUser("worker");

    if (!(await checkDB(worker.id))) return i.reply({ content: "> 🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });

    const gotDB = await getDB(worker.id);
    const guild = await bot.guilds.fetch(gotDB.guildID);
    const member = await guild.members.fetch(worker.id);
    if (!member) return i.reply({ content: "> 🛑 <@" + worker.id + "> **již není zaměstnaný.**", ephemeral: true });
    const log = gotDB.data;


    const workerEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .addFields([
            {
                name: `Informace o kolegovi`, inline: false,
                value:
                    `> **Sbor:** \`${gotDB.guildName}\` ${gotDB.guildEmoji}\n`
                    + `> **Appka:** <@${worker.id}>\n`
                    + `> **Volačka:** \`${log.radio}\`\n`
                    + `> **Hodnost:** \`${log.rank}\`\n`
                    + `> **Č. Odznaku:** \`${log.badge}\`\n`
                    + (log.folder ? `> **Složka:** <#${log.folder}>\n` : "> **Složka:** `N/A`\n")
                    + `> **Počet hodin:** \`${log.hours}\``
            }
        ])
        .setColor(getServer(gotDB.guildID).color)
        .setFooter(getServer(gotDB.guildID).footer);

    console.log(" < [CMD/Kolega] >  " + i.member.displayName + ` zobrazil(a) kolegu / kolegyni [${log.radio}] ${log.name} (${worker.id}.json)`);

    await i.reply({ embeds: [workerEmbed], ephemeral: true });
};