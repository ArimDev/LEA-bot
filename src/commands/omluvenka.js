import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB } from "../../src/functions/db.js";;

export const slash = new SlashCommandBuilder()
    .setName("omluvenka")
    .setDescription(`Zapíše omluvenku`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    if (!(await checkDB(i.user.id, i))) return i.reply({ content: "> 🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si vlastní složku a počkej na správce DB.", ephemeral: true });

    const folders = ["1188146028440997948", "1178098611733667880"];
    if (!i.channel.isThread()) return i.reply({ content: "> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#1188146028440997948>.**", ephemeral: true });
    if (!folders.includes(i.channel.parentId)) return i.reply({ content: "> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#1188146028440997948>.**", ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId("apologyModal")
        .setTitle("SAHP | Zápis omluvenky");

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
        .setRequired(true);

    const icInput = new TextInputBuilder()
        .setCustomId("ic")
        .setLabel("IC důvod")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Zlomená ruka")
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(eventIDInput);
    const actionRow1 = new ActionRowBuilder().addComponents(startInput);
    const actionRow2 = new ActionRowBuilder().addComponents(endInput);
    const actionRow3 = new ActionRowBuilder().addComponents(oocInput);
    const actionRow4 = new ActionRowBuilder().addComponents(icInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    await i.showModal(modal);
};