import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName('kolega')
    .setDescription(`Aktuální informace o zaměstnanci z DB`)
    .addUserOption(option =>
        option.setName('worker')
            .setDescription('Vyber kolegu')
            .setRequired(true))
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    let worker = i.options.getUser('worker');

    if (!(await checkDB(worker.id))) return i.editReply({ content: "🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });

    const member = await i.guild.members.fetch(worker.id);

    const log = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + worker.id + ".json"), "utf-8"));

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
        .setColor(bot.SAHP.c.master)
        .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

    await i.reply({ embeds: [workerEmbed], ephemeral: true });
};