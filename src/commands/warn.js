import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName('warn')
    .setDescription(`Zapíše varování zaměstnanci`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron
    if (!passed) return i.reply({ content: "🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (!passed) return i.reply({ content: "🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });
    return i.reply({ content: "> 🛑 **Tahle funkce ještě nebyla dokončena! (ID 2.1)**", ephemeral: true });
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