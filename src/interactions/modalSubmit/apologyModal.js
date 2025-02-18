import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";

export default async function run(bot, i) {
    let content, inFolder;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.user.id + ".json"), "utf-8"));
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    if (i.channel.id === content.folder) inFolder = true;
    else inFolder = false;

    const index = content.apologies.length + 1;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("summary_" + i.user.id)
                .setStyle(ButtonStyle.Success)
                .setEmoji("📑"),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("editButton_apology_" + i.user.id)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📝"),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("deleteButton_apology_" + i.user.id)
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🗑️"),
        );

    if (
        (i.fields.getTextInputValue("start").split(" ").length) !== 3
        || (i.fields.getTextInputValue("end").split(" ").length) !== 3
    ) {
        return await i.reply({
            content:
                "### Nalezena chyba - datum!"
                + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                + "\nZadal(a) jsi:\n"
                + (i.fields.getTextInputValue("eventID") ? `> **ID Události:** \`${i.fields.getTextInputValue("eventID")}\`\n` : "")
                + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``,
            ephemeral: true
        });
    }

    await i.deferReply({ ephemeral: inFolder ? false : true });

    const dutyEmbed = new EmbedBuilder()
        .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
        .setTitle("Omluvenka")
        .addFields([
            {
                name: `Omluvenka #` + index, inline: false,
                value:
                    `> **ID Události:** \`${i.fields.getTextInputValue("eventID") || "0"}\`\n`
                    + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                    + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                    + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                    + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``
            }
        ])
        .setThumbnail("https://i.imgur.com/YQb9mPm.png")
        .setColor(bot.LEA.c.apology)
        .setFooter(getServer(i.guild.id).footer);

    let msg;
    if (inFolder)
        msg = await i.editReply({ embeds: [dutyEmbed], components: [row] });
    else {
        const ch = await i.guild.channels.fetch(content.folder);
        if (ch.archived) await ch.setArchived(false, "otevření složky z neaktivity");
        msg = await ch.send({ embeds: [dutyEmbed], components: [row] });
        await i.editReply({ content: `> ✅ **Omluvenka byla zapsána: ${msg.url}**`, ephemeral: true });
    }

    const today = new Date();
    content.apologies.push({
        "id": msg.id,
        "removed": false,
        "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
        "eventID": parseInt(i.fields.getTextInputValue("eventID")) || 0,
        "start": i.fields.getTextInputValue("start"),
        "end": i.fields.getTextInputValue("end"),
        "ooc": i.fields.getTextInputValue("ooc"),
        "ic": i.fields.getTextInputValue("ic")
    });

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.user.id + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.user.id + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.user.id + ".json");

    fs.writeFileSync(
        workersPath,
        JSON.stringify(content, null, 4)
    );

    console.log(" < [DB/Apology] >  " + i.member.displayName + " zapsal(a) omluvenku trvající do " + i.fields.getTextInputValue("end"));
}