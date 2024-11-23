import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";

export default async function run(bot, i) {
    if (!(checkDB(i.user.id))) return i.reply({ content: "> 🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si vlastní složku a počkej na správce DB.", ephemeral: true });

    if ((i.fields.getTextInputValue("datum").split(" ").length - 1) !== 2) {
        return await i.reply({
            content:
                "### Nalezena chyba - datum!"
                + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                + "\nZadal(a) jsi:\n"
                + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
            ephemeral: true
        });
    } else if (!i.fields.getTextInputValue("start").includes(":") || !i.fields.getTextInputValue("end").includes(":")) {
        return await i.reply({
            content:
                "### Nalezena chyba - čas!"
                + "\n- V některém z časů se neobjevila `:`."
                + "\nZadal(a) jsi:\n"
                + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
            ephemeral: true
        });
    }

    let content, inFolder;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.user.id + ".json"), "utf-8"));
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    if (i.channel.id === content.folder) inFolder = true;
    else inFolder = false;

    try { await i.deferReply({ ephemeral: inFolder ? false : true }); } catch { return; }

    const index = content.duties.length + 1;

    let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("summary_" + i.user.id)
                .setStyle(ButtonStyle.Success)
                .setEmoji("📑"),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("editButton_duty_" + i.user.id)
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📝"),
        ).addComponents(
            new ButtonBuilder()
                .setCustomId("deleteButton_duty_" + i.user.id)
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🗑️"),
        );

    let hours,
        h1 = parseInt(i.fields.getTextInputValue("start").split(":")[0]),
        h2 = parseInt(i.fields.getTextInputValue("end").split(":")[0]),
        m1 = parseInt(i.fields.getTextInputValue("start").split(":")[1]),
        m2 = parseInt(i.fields.getTextInputValue("end").split(":")[1]),
        min1 = h1 * 60 + m1,
        min2 = h2 * 60 + m2;
    hours = (min2 - min1) / 60;
    if (hours < 0) hours = hours + 24;
    hours = Math.round((hours + Number.EPSILON) * 100) / 100;

    const dutyEmbed = new EmbedBuilder()
        .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
        .setTitle("Záznam služby")
        .addFields([
            {
                name: `Služba #` + index, inline: false,
                value:
                    `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                    + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                    + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                    + `> **Hodin:**  \`${hours}\``
            }
        ])
        .setThumbnail("https://i.imgur.com/fhif3Xj.png")
        .setColor(bot.LEA.c.duty)
        .setFooter(getServer(i.guild.id).footer);

    if (i.fields.fields.has("kolega")) {
        const colleagues = i.fields.getTextInputValue("kolega");
        if (!!colleagues) {
            dutyEmbed.addFields([
                {
                    name: `Kolegové`, inline: false,
                    value: "> " + colleagues
                }
            ]);
        }
    }

    let msg;
    if (inFolder)
        msg = await i.editReply({ embeds: [dutyEmbed], components: [row] });
    else {
        const ch = await i.guild.channels.fetch(content.folder);
        if (ch.archived) await ch.setArchived(false, "otevření složky z neaktivity");
        msg = await ch.send({ embeds: [dutyEmbed], components: [row] });
        await i.editReply({ content: `> ✅ **Služba byla zapsána: ${msg.url}**`, ephemeral: true });
    }

    content.duties.push({
        "id": msg.id,
        "removed": false,
        "date": i.fields.getTextInputValue("datum"),
        "start": i.fields.getTextInputValue("start"),
        "end": i.fields.getTextInputValue("end"),
        "hours": hours
    });
    content.hours = (Math.round((parseFloat(content.hours) + Number.EPSILON) * 100) / 100) + hours;

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.user.id + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.user.id + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.user.id + ".json");

    fs.writeFileSync(
        workersPath,
        JSON.stringify(content, null, 4)
    );

    console.log(" < [DB/Duty] >  " + i.member.displayName + " zapsal(a) duty o délce " + hours.toString() + " hodin");
}