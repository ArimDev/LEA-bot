import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName('cpz')
    .setDescription(`Zapíše CPZ`)
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
    if (!passed) {
        if (i.channelId !== "1139268053213917235") return i.reply({ content: "🛑 **Zápis CPZ je povolen pouze v <#1139268053213917235>.", ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId('cpzModal')
        .setTitle('SAHP | Zápis CPZ');

    const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel("Jméno občana [Will Smith]")
        .setStyle(TextInputStyle.Short);

    const birthInput = new TextInputBuilder()
        .setCustomId('birth')
        .setLabel("Narození občana [12/31/1990]")
        .setStyle(TextInputStyle.Short);

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel("Důvod zadržení [Nelegální akce]")
        .setStyle(TextInputStyle.Paragraph);

    const moneyInput = new TextInputBuilder()
        .setCustomId('money')
        .setLabel("Výpis trestu / pokut")
        .setStyle(TextInputStyle.Paragraph);

    const pdInput = new TextInputBuilder()
        .setCustomId('pd')
        .setLabel("Řešili [Chris Evans, Adam Sandler]")
        .setStyle(TextInputStyle.Short);

    const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
    const actionRow1 = new ActionRowBuilder().addComponents(birthInput);
    const actionRow2 = new ActionRowBuilder().addComponents(reasonInput);
    const actionRow3 = new ActionRowBuilder().addComponents(moneyInput);
    const actionRow4 = new ActionRowBuilder().addComponents(pdInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    await i.showModal(modal);
};