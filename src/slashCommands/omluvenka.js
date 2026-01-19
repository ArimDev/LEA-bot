import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB, getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("omluvenka")
    .setDescription(`Zapíše omluvenku`)
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    if (!(checkDB(i.user.id))) return i.reply({ content: "> 🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si vlastní složku a počkej na správce DB.", ephemeral: true });

    const folders = ["1417958785732972765", "1445823227250343967", "1460352184192602186"];
    let folder;
    if (getServer(i.guild.id).id === 1) folder = folders[0];
    else if (getServer(i.guild.id).id === 2) folder = folders[1];
    else if (getServer(i.guild.id).id === 3) return i.reply({ content: "> 🛑 **Neznámý server!** (js18)", ephemeral: true });
    else if (getServer(i.guild.id).id === 4) folder = folders[2];
    else return i.reply({ content: "> 🛑 **Neznámý server!** (js20)", ephemeral: true });
    if (!i.channel.isThread()) return i.reply({ content: `> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, ve <#${folder}>.**`, ephemeral: true });
    if (!folders.includes(i.channel.parentId)) return i.reply({ content: `> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#${folder}>.**`, ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId("apologyModal")
        .setTitle("LEA | Zápis omluvenky");

    const today = new Date();

    const eventIDInput = new TextInputBuilder()
        .setCustomId("eventID")
        .setLabel("ID Události (nepovinné)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("1")
        .setMaxLength(5)
        .setRequired(false);

    const startInput = new TextInputBuilder()
        .setCustomId("start")
        .setLabel("Od kdy")
        .setStyle(TextInputStyle.Short)
        .setValue(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
        .setPlaceholder(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
        .setMinLength(10)
        .setMaxLength(12)
        .setRequired(true);

    const endInput = new TextInputBuilder()
        .setCustomId("end")
        .setLabel("Do kdy")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("5. 1. 2024")
        .setMinLength(10)
        .setMaxLength(12)
        .setRequired(true);

    const oocInput = new TextInputBuilder()
        .setCustomId("ooc")
        .setLabel("OOC důvod")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Rodinna akce")
        .setMaxLength(100)
        .setRequired(true);

    const icInput = new TextInputBuilder()
        .setCustomId("ic")
        .setLabel("IC důvod")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Zlomená ruka")
        .setMaxLength(100)
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(eventIDInput);
    const actionRow1 = new ActionRowBuilder().addComponents(startInput);
    const actionRow2 = new ActionRowBuilder().addComponents(endInput);
    const actionRow3 = new ActionRowBuilder().addComponents(oocInput);
    const actionRow4 = new ActionRowBuilder().addComponents(icInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    i.showModal(modal);
};