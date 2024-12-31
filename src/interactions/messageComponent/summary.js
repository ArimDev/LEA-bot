import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../../src/functions/db.js";

export default async function run(bot, i) {
    await i.deferReply({ ephemeral: true });
    let worker = {};
    if (i.customId.includes("_")) worker.id = i.customId.split("_")[1];
    else worker = i.message.interaction.user;

    if (!(checkDB(worker.id))) return await i.editReply({ content: "> 🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });

    let member;
    try { member = await i.guild.members.fetch(worker.id); }
    catch {
        await i.editReply({
            content: "*Tenhle officer už není členem Discord serveru!*",
            ephemeral: true
        });
    }

    let log;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + worker.id + ".json"), "utf-8"));
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + worker.id + ".json"), "utf-8"));
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + worker.id + ".json"), "utf-8"));
    else return i.editReply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    let moHours = 0;
    await log.duties.filter(d => !d.removed).forEach(function (e) {
        const dutyDateArr = e.date.split(". ");
        const dutyDate = new Date(dutyDateArr[1] + "/" + dutyDateArr[0] + "/" + dutyDateArr[2]).getTime();
        const todayDate = new Date().getTime();
        const ms30days = 1000 * 60 * 60 * 24 * 30;

        if (todayDate - dutyDate < ms30days) moHours = moHours + e.hours;
    });

    const summEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .setTitle("Souhrn zaměstnance")
        .addFields([
            {
                name: `Omluvenky`, inline: false,
                value:
                    `> **Počet omluvenek:** \`${log.apologies.filter(d => !d.removed).length}\`\n`
                //+ `> **Omluvenek za posledních 30 dnů:** \`${log.apologies.filter(a => !a.removed).length}\``
            },
            {
                name: `Služby`, inline: false,
                value:
                    `> **Počet vykonanných služeb:** \`${log.duties.filter(d => !d.removed).length}\`\n`
                    + `> **Hodin celkem:** \`${Math.round((log.hours + Number.EPSILON) * 100) / 100}\`\n` //TODO SOUČET NOT REMOVED DUTIES
                    + `> **Hodin od povýšení:** \`${Math.round(((log.hours - log.rankups.slice(-1)[0].hours) + Number.EPSILON) * 100) / 100}\`\n`
                    + `> **Hodin za posledních 30 dnů:** \`${Math.round(((await moHours) + Number.EPSILON) * 100) / 100}\``
            }
        ])
        .setThumbnail("https://i.imgur.com/wDab7i4.png")
        .setColor(bot.LEA.c.summary)
        .setFooter(getServer(i.guild.id).footer);

    console.log(" < [DB/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);

    await i.editReply({ embeds: [summEmbed], ephemeral: true });
}