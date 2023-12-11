import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("duty")
    .setDescription(`Zapíše službu`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    if (!(await checkDB(i.user.id, i))) return i.reply({ content: "> 🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si vlastní složku a počkej na správce DB.", ephemeral: true });

    const folders = ["1139311793555116172", "1178098611733667880"];
    if (!i.channel.isThread()) return i.reply({ content: "> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#1139311793555116172>.**", ephemeral: true });
    if (!folders.includes(i.channel.parentId)) return i.reply({ content: "> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#1139311793555116172>.**", ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId("dutyModal")
        .setTitle("SAHP | Zápis služby");

    const today = new Date();

    const dateInput = new TextInputBuilder()
        .setCustomId("datum")
        .setLabel("Datum služby")
        .setStyle(TextInputStyle.Short)
        .setValue(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
        .setPlaceholder(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
        .setMinLength(10)
        .setMaxLength(12)
        .setRequired(true);

    const startInput = new TextInputBuilder()
        .setCustomId("start")
        .setLabel("Začátek služby")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("13:00")
        .setMinLength(5)
        .setMaxLength(5)
        .setRequired(true);

    const endInput = new TextInputBuilder()
        .setCustomId("end")
        .setLabel("Konec služby")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("17:00")
        .setMinLength(5)
        .setMaxLength(5)
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(dateInput);
    const actionRow1 = new ActionRowBuilder().addComponents(startInput);
    const actionRow2 = new ActionRowBuilder().addComponents(endInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2);

    await i.showModal(modal);
};