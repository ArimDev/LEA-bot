import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getServer } from "../../src/functions/db.js";

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

    if (!(await checkDB(worker.id, i))) return i.reply({ content: "> 🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });

    const member = await i.guild.members.fetch(worker.id);

    let log;
    if (bot.LEA.g.SAHP.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + worker.id + ".json"), "utf-8"));
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + worker.id + ".json"), "utf-8"));
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    const workerEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .addFields([
            {
                name: `Informace o kolegovi`, inline: false,
                value:
                    `> **Discord:** <@${worker.id}>\n`
                    + `> **Volačka:** \`${log.radio}\`\n`
                    + `> **Hodnost:** \`${log.rank}\`\n`
                    + `> **Č. Odznaku:** \`${log.badge}\`\n`
                    + (log.folder ? `> **Složka:** <#${log.folder}>\n` : "> **Složka:** `N/A`\n")
                    + `> **Počet hodin:** \`${log.hours}\`\n`
            }
        ])
        .setColor(getServer(i).color)
        .setFooter(getServer(i).footer);

    console.log(" < [CMD/Kolega] >  " + i.member.displayName + ` zobrazil(a) kolegu / kolegyni [${log.radio}] ${log.name} (${worker.id}.json)`);

    await i.reply({ embeds: [workerEmbed], ephemeral: true });
};