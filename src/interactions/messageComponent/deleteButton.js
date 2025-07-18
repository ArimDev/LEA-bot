import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../../src/functions/db.js";

export default async function run(bot, i) {
    let authorID;
    if (i.customId.includes("_")) authorID = i.customId.split("_")[2];
    else authorID = i.message.interaction.user.id;

    let passed = false;
    if (i.user.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (i.user.id === authorID) passed = true;
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1391525298461347971")) passed = true; //Leadership
        if (admin.roles.cache.has("1391525331835420722")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    }

    if (!passed) return i.reply({ content: "> 🛑 **Tenhle zápis nemáš právo smazat.**", ephemeral: true });;

    await i.deferUpdate();

    const worker = getDB(authorID).data;
    const embed = i.message.embeds[0];
    const type = i.customId.split("_")[1];
    const recordID = parseInt(embed.fields[0].name.split("#")[1]);
    const record = type === "duty" ? worker.duties[recordID - 1] : worker.apologies[recordID - 1];

    if (record.removed) return i.editReply({ content: "> 🛑 **Zápis je již smazán!**", ephemeral: true });;
    record.removed = true;

    const deletedDutyEmbed = new EmbedBuilder(embed)
        .setFields([
            {
                name: `${type === "duty" ? "Služba" : "Omluvenka"} #` + recordID, inline: false,
                value:
                    `Smazal(a) <@${i.user.id}>.`
            }
        ])
        .setThumbnail("https://i.imgur.com/ZERRfb0.png")
        .setColor(bot.LEA.c.deleted);
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("summary_" + authorID)
                .setStyle(ButtonStyle.Success)
                .setEmoji("📑"),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("editButton_duty_" + authorID)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📝")
                .setDisabled(),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("deleteButton_duty_" + authorID)
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🗑️")
                .setDisabled(),
        );

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + authorID + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + authorID + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + authorID + ".json");
    fs.writeFileSync(
        workersPath,
        JSON.stringify(worker, null, 4)
    );

    await i.message.edit({ embeds: [deletedDutyEmbed], components: [row] });
}