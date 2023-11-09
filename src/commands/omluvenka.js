import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB } from "../../src/functions/db.js";;

export const slash = new SlashCommandBuilder()
    .setName('omluvenka')
    .setDescription(`Zapíše omluvenku`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    if (!(await checkDB(i.user.id))) return i.reply({ content: "🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si <#1139284046388674610>", ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId('apologyModal')
        .setTitle('SAHP | Zápis omluvenky');

    const startInput = new TextInputBuilder()
        .setCustomId('start')
        .setLabel("Od kdy [31. 12. 2023]")
        .setStyle(TextInputStyle.Short);

    const endInput = new TextInputBuilder()
        .setCustomId('end')
        .setLabel("Do kdy [5. 1. 2024]")
        .setStyle(TextInputStyle.Short);

    const oocInput = new TextInputBuilder()
        .setCustomId('ooc')
        .setLabel("OOC důvod [Rodinná akce]")
        .setStyle(TextInputStyle.Paragraph);

    const icInput = new TextInputBuilder()
        .setCustomId('ic')
        .setLabel("IC důvod [Zlomená ruka]")
        .setStyle(TextInputStyle.Paragraph);

    const signInput = new TextInputBuilder()
        .setCustomId('signature')
        .setLabel("Podpis [Smith]")
        .setStyle(TextInputStyle.Short);

    const actionRow0 = new ActionRowBuilder().addComponents(startInput);
    const actionRow1 = new ActionRowBuilder().addComponents(endInput);
    const actionRow2 = new ActionRowBuilder().addComponents(oocInput);
    const actionRow3 = new ActionRowBuilder().addComponents(icInput);
    const actionRow4 = new ActionRowBuilder().addComponents(signInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    await i.showModal(modal);
};