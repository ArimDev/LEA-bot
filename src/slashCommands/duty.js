import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { checkDB, getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("duty")
    .setDescription(`Zapíše službu`)
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
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

    if (
        i.member.roles.cache.has("xxx" /* MISSING ID */) //LSPD cadet
        || i.member.roles.cache.has("1267589609378812129") //LSSD trainee
        || i.member.roles.cache.has("1301163398540689497") //SAHP trainee
    ) {
        const colleaguesInput = new TextInputBuilder()
            .setCustomId("kolega")
            .setLabel("Kolegové")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Tango- 1, Sam-9")
            .setRequired(false);

        const actionRow3 = new ActionRowBuilder().addComponents(colleaguesInput);
        modal.addComponents(actionRow3);
    }

    if (i) await i.showModal(modal); //! ERROR 10062 !
    else return;
};