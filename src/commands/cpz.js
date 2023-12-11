import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName("cpz")
    .setDescription(`Zapíše CPZ`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    if (bot.LEA.g.LSSD.includes(i.guild.id)) return i.reply({ content: "> 🛑 **Zápis __CPZ__ se nepoužívá v LSSD " + bot.LEA.e.LSSD + ".**", ephemeral: true });

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron
    if (!passed) {
        const ch = ["1139268053213917235", "1139268119391645756"];
        if (!ch.includes(i.channel.id)) return i.reply({ content: "> 🛑 **Zápis __CPZ__ je povolen pouze v <#1139268053213917235>.**", ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId("cpzModal")
        .setTitle("SAHP | Zápis CPZ");

    const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Jméno občana")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Will Smith")
        .setRequired(true);

    const birthInput = new TextInputBuilder()
        .setCustomId("birth")
        .setLabel("Narození občana")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("12/31/1990")
        .setMinLength(10)
        .setMaxLength(10)
        .setRequired(true);

    const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Důvod zadržení")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Nelegální akce")
        .setRequired(true);

    const moneyInput = new TextInputBuilder()
        .setCustomId("money")
        .setLabel("Výpis trestu / pokut")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("15 000 $ + 1 rok odnětí svobody")
        .setRequired(true);

    const pdInput = new TextInputBuilder()
        .setCustomId("pd")
        .setLabel("Řešili")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Chris Evans, Addam Sandler")
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
    const actionRow1 = new ActionRowBuilder().addComponents(birthInput);
    const actionRow2 = new ActionRowBuilder().addComponents(reasonInput);
    const actionRow3 = new ActionRowBuilder().addComponents(moneyInput);
    const actionRow4 = new ActionRowBuilder().addComponents(pdInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    await i.showModal(modal);
};