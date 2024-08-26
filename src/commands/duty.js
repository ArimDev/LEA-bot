import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB, getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("duty")
    .setDescription(`Zapíše službu`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    const folders = ["1213984576100241419", "1203743211000963082"];
    let folder;
    if (getServer(i.guild.id).id === 2) folder = folders[1];
    else if (getServer(i.guild.id).id === 1) folder = folders[0];
    else return i.reply({ content: "> 🛑 **Neznámý server!**", ephemeral: true });
    if (!i.channel.isThread()) return i.reply({ content: `> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, ve <#${folder}>.**`, ephemeral: true });
    if (!folders.includes(i.channel.parentId)) return i.reply({ content: `> 🛑 **Zápis __duties__ a __omluvenek__ je povolen pouze ve své složce, v <#${folder}>.**`, ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId("dutyModal")
        .setTitle("LEA | Zápis služby");

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

    i.showModal(modal);
};