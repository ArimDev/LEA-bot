import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName('duty')
    .setDescription(`Zapíše službu`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    if (!(await checkDB(i.user.id))) return i.reply({ content: "🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si <#1139284046388674610>.", ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId('dutyModal')
        .setTitle('SAHP | Zápis služby');

    const dateInput = new TextInputBuilder()
        .setCustomId('datum')
        .setLabel("Datum služby [31. 12. 2023]")
        .setStyle(TextInputStyle.Short);

    const startInput = new TextInputBuilder()
        .setCustomId('start')
        .setLabel("Začátek služby [13:00]")
        .setStyle(TextInputStyle.Short);

    const endInput = new TextInputBuilder()
        .setCustomId('end')
        .setLabel("Konec služby [17:00]")
        .setStyle(TextInputStyle.Short);

    const signInput = new TextInputBuilder()
        .setCustomId('signature')
        .setLabel("Podpis [Smith]")
        .setStyle(TextInputStyle.Short);

    const actionRow0 = new ActionRowBuilder().addComponents(dateInput);
    const actionRow1 = new ActionRowBuilder().addComponents(startInput);
    const actionRow2 = new ActionRowBuilder().addComponents(endInput);
    const actionRow3 = new ActionRowBuilder().addComponents(signInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3);

    await i.showModal(modal);
};